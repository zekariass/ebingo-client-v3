"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminStore } from "@/lib/stores/admin-store"
import { SystemConfig } from "@/lib/types"
import { useAgentStore } from "@/lib/stores/agent-store"
import { userStore } from "@/lib/stores/user-store"
import { ADMIN_ONLY_SYSTEM_CONFIGS } from "@/lib/constant"

export default function AdminConfigs() {
  const { activeAgentId } = useAgentStore();
  const user = userStore((state) => state.user)
  const isAdmin = user?.role === "ADMIN"
  const systemConfigs = useAdminStore(state => state.systemConfigs)
  const sysConfigLoading = useAdminStore(state => state.sysConfigLoading)
  const error = useAdminStore(state => state.error)
  const getSystemConfigs = useAdminStore(state => state.getSystemConfigs)
  const updateSystemConfig = useAdminStore(state => state.updateSystemConfig)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null)
  const [newValue, setNewValue] = useState("")

  // Load system configs when the active agent is known
  useEffect(() => {
    if (activeAgentId) {
      getSystemConfigs(activeAgentId);
    }
  }, [getSystemConfigs, activeAgentId])

  const openUpdateDialog = (config: SystemConfig) => {
    setSelectedConfig(config)
    setNewValue(config.value)
    setDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedConfig) return
    await updateSystemConfig(selectedConfig.id, newValue)
    setDialogOpen(false)
  }

  const visibleConfigs = isAdmin
    ? systemConfigs
    : systemConfigs.filter((config) => !ADMIN_ONLY_SYSTEM_CONFIGS.has(config.name))

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">System Configs</h1>

      {sysConfigLoading && <p>Loading system configs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!sysConfigLoading && !error && visibleConfigs.length === 0 && (
        <p className="text-muted-foreground">No system configs found for this agent.</p>
      )}

      {!sysConfigLoading && visibleConfigs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-700">
            <thead>
              <tr className="bg-gray-900">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Value</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleConfigs.map(config => (
                <tr key={config.id} className="hover:bg-gray-800">
                  <td className="border px-4 py-2">{config.name}</td>
                  <td className="border px-4 py-2">{config.value}</td>
                  <td className="border px-4 py-2">
                    <Button size="sm" onClick={() => openUpdateDialog(config)}>
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Dialog */}
      {selectedConfig && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md w-full sm:w-[90%] p-4">
            <DialogHeader>
                <DialogTitle className="text-sm sm:text-base">{selectedConfig.name}</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
                {selectedConfig.possibleValues ? (
                <Select value={newValue} onValueChange={setNewValue}>
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a value" />
                    </SelectTrigger>
                    <SelectContent>
                    {selectedConfig.possibleValues.split(",").map(val => (
                        <SelectItem key={val.trim()} value={val.trim()}>
                        {val.trim()}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                ) : (
                <Input
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    placeholder="Enter new value"
                    className="w-full"
                />
                )}

                <div className="flex flex-col sm:flex-row justify-end sm:space-x-2 space-y-2 sm:space-y-0 mt-4">
                <Button
                    variant="secondary"
                    onClick={() => setDialogOpen(false)}
                    className="w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button onClick={handleUpdate} className="w-full sm:w-auto">
                    Update
                </Button>
                </div>
            </div>
            </DialogContent>
        </Dialog>
        )}

    </div>
  )
}
