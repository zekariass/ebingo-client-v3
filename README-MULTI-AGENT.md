# Multi-Agent Bingo Bot Architecture

## Overview

This system transforms a single Telegram bot into a multi-agent platform where each agent has their own bot, users, rooms, and data isolation.

## Key Features

### 1. Agent Isolation
- Each agent has a unique `agentId`
- Users register with a specific agent and cannot see other agents' data
- Rooms, games, wallets, and transactions are scoped per agent

### 2. Dynamic Bot Management
- Bots are created dynamically based on agent registration
- Each bot has its own token and webhook endpoint
- The `agent-bot-manager.ts` handles bot lifecycle

### 3. Webhook Routing
- Dynamic route: `/api/telegram/webhook/[agentId]`
- Each agent's bot has a unique webhook URL
- Webhooks fetch agent config from backend before processing

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Telegram Platform                    │
└──────────────────┬──────────────────┬───────────────────┘
                   │                  │
            Agent A Bot          Agent B Bot
                   │                  │
                   ▼                  ▼
         /webhook/agent-a    /webhook/agent-b
                   │                  │
                   └────────┬─────────┘
                            │
                   Agent Bot Manager
                            │
                   ┌────────┴────────┐
                   │                 │
            Middleware           Handlers
         (Agent Context)    (Agent Scoped)
                   │                 │
                   └────────┬────────┘
                            │
                      Backend API
                   (Agent Scoped Data)
```

## Database Schema Changes

### Agents Table
```sql
CREATE TABLE agents (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bot_token VARCHAR(255) NOT NULL UNIQUE,
  webhook_url VARCHAR(500),
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Updated User Table
```sql
ALTER TABLE users
ADD COLUMN agent_id VARCHAR(255) NOT NULL,
ADD FOREIGN KEY (agent_id) REFERENCES agents(id);

-- Unique constraint: user can only register once per agent
CREATE UNIQUE INDEX idx_user_agent ON users(telegram_id, agent_id);
```

### Updated Rooms Table
```sql
ALTER TABLE rooms
ADD COLUMN agent_id VARCHAR(255) NOT NULL,
ADD FOREIGN KEY (agent_id) REFERENCES agents(id);
```

### Updated Wallets Table
```sql
ALTER TABLE wallets
ADD COLUMN agent_id VARCHAR(255) NOT NULL,
ADD FOREIGN KEY (agent_id) REFERENCES agents(id);
```

### Updated Transactions Table
```sql
ALTER TABLE transactions
ADD COLUMN agent_id VARCHAR(255) NOT NULL,
ADD FOREIGN KEY (agent_id) REFERENCES agents(id);
```

## Backend API Changes

All API endpoints must accept and filter by `agentId`:

### Example: Get User Profile
```typescript
GET /api/v1/secured/user-profile/:telegramId?agentId=<agentId>
```

### Example: Get Rooms
```typescript
GET /api/v1/public/rooms?agentId=<agentId>
```

### Example: Get Wallet
```typescript
GET /api/v1/secured/wallet/by-telegram-id?telegramId=<id>&agentId=<agentId>
```

## Frontend Changes

All webview URLs must include `agentId` parameter:

```typescript
// Room URL
`${APP_URL}/${lang}/rooms/${roomId}?agentId=${agentId}`

// Transfer URL
`${APP_URL}/${lang}/transfer?agentId=${agentId}`

// Withdraw URL
`${APP_URL}/${lang}/withdraw?agentId=${agentId}`
```

Frontend should:
1. Extract `agentId` from URL params
2. Include it in all API requests
3. Store in session/context for the duration of the session

## Setup New Agent

### 1. Register Agent in Database
```sql
INSERT INTO agents (id, name, bot_token)
VALUES ('agent-123', 'Agent Name', 'BOT_TOKEN_FROM_BOTFATHER');
```

### 2. Setup Webhook
```bash
POST /api/agents/setup-webhook
{
  "agentId": "agent-123",
  "botToken": "BOT_TOKEN_FROM_BOTFATHER"
}
```

### 3. Bot is Ready
- Webhook URL: `https://your-domain.com/api/telegram/webhook/agent-123`
- Users can start interacting with the bot
- All data is isolated to this agent

## Environment Variables

```env
BACKEND_BASE_URL=https://your-backend.com
APP_URL=https://your-frontend.com
ADMIN_IDS=123456,789012
```

## Testing Multi-Agent Setup

1. Create two test agents in the database
2. Get bot tokens from BotFather for each
3. Setup webhooks for both agents
4. Start both bots
5. Register a user with each bot
6. Verify users cannot see each other's rooms/data

## Commission System

Agents earn commission on:
- User deposits
- Game entry fees
- Transaction fees

Commission is tracked in the `agent_commissions` table:

```sql
CREATE TABLE agent_commissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  transaction_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

## Security Considerations

1. **API Authentication**: All API requests must validate `agentId` exists
2. **Data Isolation**: Backend MUST enforce agent filtering on all queries
3. **Bot Token Security**: Store bot tokens securely, never expose in frontend
4. **Webhook Validation**: Verify webhook requests come from Telegram
5. **Rate Limiting**: Implement per-agent rate limiting

## Scaling Considerations

- Use Redis to cache bot instances
- Implement bot instance pooling for high traffic
- Consider separate worker processes per agent
- Monitor webhook response times per agent
- Implement circuit breakers for failing agents
