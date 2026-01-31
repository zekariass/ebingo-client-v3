// WebSocketManager.ts
import { EventEmitter } from "events"

export type WSMessage = {
  type: string
  payload?: any
}

export interface WebSocketManagerOptions {
  url: string
  enabled?: boolean
  heartbeatInterval?: number        // ms between pings
  pongTimeout?: number              // ms to wait for a pong after ping
  initialBackoff?: number           // base backoff in ms
  maxBackoff?: number               // max backoff in ms
  maxReconnectAttempts?: number | null // null = infinite
  autoConnect?: boolean
}

type InternalTimers = {
  heartbeatTimer: ReturnType<typeof setInterval> | null
  pongTimer: ReturnType<typeof setTimeout> | null
  reconnectTimer: ReturnType<typeof setTimeout> | null
}

export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null
  private url: string
  private enabled: boolean
  private heartbeatInterval: number
  private pongTimeout: number
  private initialBackoff: number
  private maxBackoff: number
  private maxReconnectAttempts: number | null

  private timers: InternalTimers = {
    heartbeatTimer: null,
    pongTimer: null,
    reconnectTimer: null,
  }

  private manuallyClosed = false
  private pendingQueue: WSMessage[] = []

  // runtime state
  public connected = false
  public connecting = false
  public reconnectAttempts = 0
  public latencyMs = 0
  private lastPingAt = 0

  constructor({
    url,
    enabled = true,
    heartbeatInterval = 30_000,
    pongTimeout = 10_000,
    initialBackoff = 1000,
    maxBackoff = 10_000,
    maxReconnectAttempts = null, // null = infinite
    autoConnect = true,
  }: WebSocketManagerOptions) {
    super()
    this.url = url
    this.enabled = enabled
    this.heartbeatInterval = heartbeatInterval
    this.pongTimeout = pongTimeout
    this.initialBackoff = initialBackoff
    this.maxBackoff = maxBackoff
    this.maxReconnectAttempts = maxReconnectAttempts

    if (autoConnect && enabled) {
      // allow userland to call connect; but we auto-connect if requested
      setTimeout(() => this.connect(), 0)
    }
  }

  // ---------- Public API ----------
  public connect() {
    if (!this.enabled) return
    if (this.connected || this.connecting) return

    this.connecting = true
    this.emit("connecting")
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.connecting = false
        this.connected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.flushQueue()
        this.emit("open")
      }

      this.ws.onmessage = (ev) => this.handleMessage(ev)

      this.ws.onerror = (ev) => {
        // forward - consumers may want to log
        this.emit("error", ev)
      }

      this.ws.onclose = (ev) => {
        // mark disconnected
        this.connected = false
        this.connecting = false
        this.stopHeartbeat()
        this.emit("close", ev)

        // only schedule reconnect when not manually closed and still enabled
        if (!this.manuallyClosed && this.enabled) {
          // if server intentionally closed with 1000 we still often want to reconnect
          // (server restarts, deployments, load balancer). We'll reconnect unless
          // maxReconnectAttempts reached.
          if (this.maxReconnectAttempts === null || this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts += 1
            const delay = this.computeBackoff(this.reconnectAttempts)
            this.emit("reconnecting", { attempt: this.reconnectAttempts, delay })
            this.timers.reconnectTimer = setTimeout(() => {
              this.connect()
            }, delay)
          } else {
            // Reached limit — emit an error so UI can show permanent failure
            this.emit("error", new Error("Max reconnect attempts reached"))
          }
        }
      }
    } catch (err) {
      this.connecting = false
      this.emit("error", err)
    }
  }

  public disconnect(manual = true) {
    // manual = true means user requested it (do not auto-reconnect)
    if (manual) this.manuallyClosed = true

    this.enabled = !manual ? this.enabled : this.enabled // keep enabled same unless manual true? we keep semantics: enabled unaffected
    // clear timers
    this.clearTimers()

    try {
      if (this.ws) {
        // normal close
        this.ws.close(1000, "Manual disconnect")
      }
    } catch (e) {
      // ignore
    } finally {
      this.ws = null
      this.connected = false
      this.connecting = false
    }
  }

  /**
   * Force a reconnect attempt immediately (clears manual close flag).
   */
  public reconnect() {
    this.manuallyClosed = false
    // clear pending reconnect timer if any and attempt immediately
    if (this.timers.reconnectTimer) {
      clearTimeout(this.timers.reconnectTimer)
      this.timers.reconnectTimer = null
    }
    this.connect()
  }

  /**
   * Send a message. If not connected, queue for send when socket opens.
   * Returns true if sent immediately, false if queued.
   */
  public send(message: WSMessage): boolean {
    const canQueue = message.type !== "game.playerJoinRequest" // example: do not queue certain messages
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message))
        return true
      } catch (err) {
        this.emit("error", err)
        // fallthrough to queue
      }
    }

    // queue for send on open
    if (canQueue) {
      this.pendingQueue.push(message)
      return false
    }

    // cannot queue: message is dropped
    return false
  }

  // getters for UI / hook usage
  public getReconnectAttempts() {
    return this.reconnectAttempts
  }
  public getLatencyMs() {
    return this.latencyMs
  }
  public isConnected() {
    return this.connected
  }
  public isConnecting() {
    return this.connecting
  }

  // ---------- Internal helpers ----------
  private handleMessage(ev: MessageEvent) {
    try {
      const parsed: WSMessage = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data

      if (parsed && parsed.type === "pong") {
        // update latency and emit
        this.latencyMs = Date.now() - this.lastPingAt
        this.emit("latency", this.latencyMs)
        // clear pong timeout timer
        if (this.timers.pongTimer) {
          clearTimeout(this.timers.pongTimer)
          this.timers.pongTimer = null
        }
        return
      }

      // emit generic message event with typed payload
      this.emit("message", parsed)
      // also emit event keyed by message type so consumers can `on("game.started", ...)`
      if (parsed && parsed.type) {
        this.emit(parsed.type, parsed.payload)
      }
    } catch (err) {
      this.emit("error", err)
      // do not throw
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    // ping more frequently than default for responsiveness in dev; keep default configurable
    this.timers.heartbeatTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
      try {
        this.lastPingAt = Date.now()
        this.ws.send(JSON.stringify({ type: "ping" }))
        // schedule pong timeout: if we don't receive pong in X ms, force a reconnect
        if (this.timers.pongTimer) clearTimeout(this.timers.pongTimer)
        this.timers.pongTimer = setTimeout(() => {
          // did not receive pong in time -> consider connection unhealthy
          this.emit("error", new Error("pong timeout"))
          try {
            this.ws?.close()
          } catch (e) {}
        }, this.pongTimeout)
      } catch (err) {
        this.emit("error", err)
      }
    }, this.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.timers.heartbeatTimer) {
      clearInterval(this.timers.heartbeatTimer)
      this.timers.heartbeatTimer = null
    }
    if (this.timers.pongTimer) {
      clearTimeout(this.timers.pongTimer)
      this.timers.pongTimer = null
    }
  }

  private flushQueue() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    while (this.pendingQueue.length > 0) {
      const msg = this.pendingQueue.shift()
      if (msg) {
        try {
          this.ws.send(JSON.stringify(msg))
        } catch (err) {
          this.emit("error", err)
          // push back and break to avoid infinite loop if send keeps failing
          if (msg) this.pendingQueue.unshift(msg)
          break
        }
      }
    }
  }

  private computeBackoff(attempt: number) {
    // exponential backoff with jitter: min(maxBackoff, initialBackoff * 2^(attempt-1))
    const base = Math.min(this.maxBackoff, this.initialBackoff * 2 ** Math.max(0, attempt - 1))
    // jitter up to 30% of base
    const jitter = Math.floor(Math.random() * base * 0.3)
    return base + jitter
  }

  private clearTimers() {
    if (this.timers.heartbeatTimer) {
      clearInterval(this.timers.heartbeatTimer)
      this.timers.heartbeatTimer = null
    }
    if (this.timers.pongTimer) {
      clearTimeout(this.timers.pongTimer)
      this.timers.pongTimer = null
    }
    if (this.timers.reconnectTimer) {
      clearTimeout(this.timers.reconnectTimer)
      this.timers.reconnectTimer = null
    }
  }

  // Clean up everything
  public destroy() {
    this.manuallyClosed = true
    this.clearTimers()
    try {
      this.ws?.close()
    } catch (_) {}
    this.ws = null
    this.pendingQueue = []
    this.connected = false
    this.connecting = false
  }
}
