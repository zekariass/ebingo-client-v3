"use client"

import { useEffect, useState } from "react"
import { userStore } from "@/lib/stores/user-store"
import { useAgentStore, Agent } from "@/lib/stores/agent-store"
import { Shield, AlertCircle, Search, Edit, Save, Users, Mail, Phone, Code, DollarSign, Bot, MapPin, Eye, Calendar, Landmark, UserCog, Gamepad2, RefreshCw, Plus, Palette } from "lucide-react"
import { useRouter } from "next/navigation"
import i18n from "@/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateAgentDialog } from "@/components/admin/create-agent-dialog"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { AGENT_THEMES, DEFAULT_THEME_KEY } from "@/lib/themes"

function agentTheme(agent: Agent) {
  return AGENT_THEMES.find((t) => t.key === agent.themeKey)
    ?? AGENT_THEMES.find((t) => t.key === DEFAULT_THEME_KEY)!
}

export function AdminAgents() {
  const router = useRouter()
  const user = userStore((state) => state.user)
  const userRole = user?.role

  const {
    agents,
    agentsLoading,
    agentsError,
    currentPage,
    totalPages,
    totalElements,
    searchTerm,
    fetchAgents,
    searchAgents,
    updateAgent,
    setSearchTerm,
    setCurrentPage,
    resetAgents,
  } = useAgentStore()

  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  // Store search input value separately from the actual search term
  const [searchInputValue, setSearchInputValue] = useState(searchTerm)

  const pageSize = 10

  useEffect(() => {
    fetchAgents()
    return () => resetAgents()
  }, [fetchAgents, resetAgents])

  // Check if user has ADMIN role — after all hooks to keep hook order stable
  if (userRole !== "ADMIN") {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Access Denied</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          This page is restricted to users with ADMIN role only.
        </p>
      </div>
    )
  }

  const handleUpdateAgent = async (updatedAgent: Partial<Agent>) => {
    if (!editingAgent) return

    try {
      setUpdateLoading(true)
      await updateAgent(editingAgent.id, updatedAgent)
      setIsEditDialogOpen(false)
      setEditingAgent(null)
    } catch (err) {
      console.error("Error updating agent:", err)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value)
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Update the actual search term in the store
    setSearchTerm(searchInputValue)

    // If search term is empty, fetch regular paginated list
    if (!searchInputValue.trim()) {
      fetchAgents(0)
      return
    }

    // Otherwise use the dedicated search endpoint
    searchAgents(searchInputValue)
  }

  const handleRefresh = () => {
    if (searchTerm) {
      searchAgents(searchTerm)
    } else {
      fetchAgents(currentPage)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchAgents(page, searchTerm)
  }

  const openEditDialog = (agent: Agent) => {
    setEditingAgent(agent)
    setIsEditDialogOpen(true)
  }

  const openDetailDialog = (agent: Agent) => {
    setViewingAgent(agent)
    setIsDetailDialogOpen(true)
  }
  
  const openEditFromDetail = () => {
    if (viewingAgent) {
      setEditingAgent(viewingAgent)
      setIsDetailDialogOpen(false)
      setIsEditDialogOpen(true)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Agents Management</h1>
          <Badge variant="secondary" className="text-sm">
            {totalElements} total agents
          </Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={agentsLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", agentsLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, phone, etc..."
              value={searchInputValue}
              onChange={handleSearchInputChange}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={agentsLoading}>
            Search
          </Button>
          {searchTerm && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchInputValue('')
                setSearchTerm('')
                fetchAgents(0)
              }}
            >
              Clear
            </Button>
          )}
        </form>
        {searchTerm && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing results for &quot;{searchTerm}&quot;
          </p>
        )}
      </div>

      {/* Error */}
      {agentsError && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{agentsError}</p>
          </div>
        </div>
      )}

      {/* Agents List */}
      {agentsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Skeleton key={j} className="h-5 w-full max-w-[180px]" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{searchTerm ? `No agents matching "${searchTerm}"` : "No agents found"}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <Badge variant="outline" className="text-xs font-mono">
                    #{agent.id}
                  </Badge>
                  <Badge variant={agent.isActive ? "default" : "secondary"}>
                    {agent.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {agent.isMaster && (
                    <Badge variant="outline" className="text-xs">
                      Master
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: agentTheme(agent).swatch }}
                    />
                    {agentTheme(agent).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm">Code: {agent.code}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{agent.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm">{agent.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm">Commission: {agent.commissionRate}%</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">
                      {agent.botUsername ? `@${agent.botUsername}` : "No bot"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{agent.contactAddress || "No address"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetailDialog(agent)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(agent)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/${i18n.language}/admin/agent-games-config/${agent.id}`)}
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Games
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/${i18n.language}/admin/agent-config?agentId=${agent.id}`)}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Agent Config
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/${i18n.language}/admin/agent-deposit-config?agentId=${agent.id}`)}
                  >
                    <Landmark className="h-4 w-4 mr-2" />
                    Deposit Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages} · {totalElements} total agents
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Agent Details: {viewingAgent?.name}
              </div>
              <Badge variant={viewingAgent?.isActive ? "default" : "secondary"}>
                {viewingAgent?.isActive ? "Active" : "Inactive"}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {viewingAgent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Agent ID</h3>
                    <p className="font-medium">{viewingAgent.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Agent Name</h3>
                    <p className="font-medium">{viewingAgent.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Agent Code</h3>
                    <p className="font-medium">{viewingAgent.code}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                    <p className="font-medium">{viewingAgent.email || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
                    <p className="font-medium">{viewingAgent.phoneNumber}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Name</h3>
                    <p className="font-medium">{viewingAgent.contactName || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Address</h3>
                    <p className="font-medium">{viewingAgent.contactAddress || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Commission Rate</h3>
                    <p className="font-medium">{viewingAgent.commissionRate}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Bot Username</h3>
                    <p className="font-medium">@{viewingAgent.botUsername || "Not configured"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Master Agent</h3>
                    <p className="font-medium">{viewingAgent.isMaster ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Palette className="h-4 w-4" />
                      UI Theme
                    </h3>
                    <p className="font-medium flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-black/10"
                        style={{ backgroundColor: agentTheme(viewingAgent).swatch }}
                      />
                      {agentTheme(viewingAgent).label}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Created: {format(new Date(viewingAgent.createdAt), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Updated: {format(new Date(viewingAgent.updatedAt), "PPP")}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  onClick={openEditFromDetail}
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Agent
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Agent: {editingAgent?.name}</DialogTitle>
          </DialogHeader>
          {editingAgent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={editingAgent.name}
                    onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Agent Code</Label>
                  <Input
                    id="code"
                    value={editingAgent.code}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Agent code cannot be changed.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingAgent.email || ""}
                    onChange={(e) => setEditingAgent({ ...editingAgent, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={editingAgent.phoneNumber}
                    onChange={(e) => setEditingAgent({ ...editingAgent, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={editingAgent.contactName || ""}
                    onChange={(e) => setEditingAgent({ ...editingAgent, contactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactAddress">Contact Address</Label>
                  <Input
                    id="contactAddress"
                    value={editingAgent.contactAddress || ""}
                    onChange={(e) => setEditingAgent({ ...editingAgent, contactAddress: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editingAgent.commissionRate}
                    onChange={(e) => setEditingAgent({ ...editingAgent, commissionRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <Select
                    value={editingAgent.isActive.toString()}
                    onValueChange={(value) =>
                      setEditingAgent({ ...editingAgent, isActive: value === "true" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isMaster">Master Agent</Label>
                  <Select value={editingAgent.isMaster.toString()} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Master status cannot be changed here.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="themeKey" className="flex items-center gap-1.5">
                    <Palette className="h-4 w-4" />
                    UI Theme
                  </Label>
                  <Select
                    value={agentTheme(editingAgent).key}
                    onValueChange={(value) =>
                      setEditingAgent({ ...editingAgent, themeKey: value })
                    }
                  >
                    <SelectTrigger id="themeKey">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_THEMES.map((theme) => (
                        <SelectItem key={theme.key} value={theme.key}>
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block h-3 w-3 rounded-full border border-black/10"
                              style={{ backgroundColor: theme.swatch }}
                            />
                            {theme.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Player-facing color palette for this agent&apos;s link.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Bot Token</Label>
                  <Input
                    id="botToken"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={editingAgent.botToken || ""}
                    onChange={(e) => setEditingAgent({ ...editingAgent, botToken: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    The current token is hidden for security. Leave empty to keep it unchanged.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botUsername">Bot Username</Label>
                  <Input
                    id="botUsername"
                    value={editingAgent.botUsername || ""}
                    onChange={(e) => setEditingAgent({ ...editingAgent, botUsername: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateAgent(editingAgent)}
                  disabled={updateLoading}
                  className="w-full sm:w-auto"
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <CreateAgentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={handleRefresh}
      />
    </div>
  )
}
