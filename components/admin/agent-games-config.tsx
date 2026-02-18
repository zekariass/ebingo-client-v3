"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AgentDto } from "@/lib/types"
import i18n from "@/i18n"

export function AgentGamesConfig() {
  const { toast } = useToast()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<AgentDto[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a search query",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setSearchResults([])

    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/agents/search?searchTerm=${encodeURIComponent(searchQuery)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to search agents")
      }

      setSearchResults(result.data || [])
      
      if (result.data.length === 0) {
        toast({
          title: "No Results",
          description: "No agents found matching your search query",
        })
      } else {
        toast({
          title: "Success",
          description: `Found ${result.data.length} agent(s)`,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to search agents"
      setSearchError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleConfigureGames = (agent: AgentDto) => {
    const lang = i18n.language || "en"
    router.push(`/${lang}/admin/agent-games-config/${agent.id}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Games Configuration</h1>
        <p className="text-muted-foreground">
          Search for agents and configure their game settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Agents</CardTitle>
          <CardDescription>
            Search by name, bot username, contact name, phone number, or code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="searchQuery">Search Query</Label>
              <Input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter agent name, code, phone, etc."
                disabled={isSearching}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
            <Search className={cn("mr-2 h-4 w-4", isSearching && "animate-pulse")} />
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </CardContent>
      </Card>

      {searchError && (
        <Alert variant="destructive">
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {searchResults.length} agent(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <Badge variant={agent.isActive ? "default" : "secondary"}>
                        {agent.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {agent.isMaster && (
                        <Badge variant="outline">Master</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Code: <span className="font-mono">{agent.code}</span></p>
                      <p>Contact: {agent.contactName}</p>
                      {agent.phoneNumber && <p>Phone: {agent.phoneNumber}</p>}
                      {agent.email && <p>Email: {agent.email}</p>}
                      {agent.botUsername && <p>Bot: @{agent.botUsername}</p>}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConfigureGames(agent)}
                    variant="default"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Games
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isSearching && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
