"use client"

import { act, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminStore } from "@/lib/stores/admin-store"
import { SystemConfig } from "@/lib/types"
import { useAgentStore } from "@/lib/stores/agent-store"

export default function AdminConfigs() {
  const { activeAgentId } = useAgentStore();
  const systemConfigs = useAdminStore(state => state.systemConfigs)
  const sysConfigLoading = useAdminStore(state => state.sysConfigLoading)
  const error = useAdminStore(state => state.error)
  const getSystemConfigs = useAdminStore(state => state.getSystemConfigs)
  const updateSystemConfig = useAdminStore(state => state.updateSystemConfig)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null)
  const [newValue, setNewValue] = useState("")

  // Load system configs on mount
  useEffect(() => {
    getSystemConfigs(activeAgentId!);
  }, [getSystemConfigs])

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">System Configs</h1>

      {sysConfigLoading && <p>Loading system configs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!sysConfigLoading && systemConfigs.length > 0 && (
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
              {systemConfigs.map(config => (
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
