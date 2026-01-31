"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"
import { Transaction, TransactionStatus, TransactionType } from "@/lib/types"
import { getStatusColor } from "@/lib/constant"
import { useAgentStore } from "@/lib/stores/agent-store"

type EditFormData = { status: TransactionStatus }

type TransactionProps = {
    transactions: Transaction[],
    txnType: TransactionType
    // getTransactions: (filterStatus: TransactionStatus, type: TransactionType, page: number, size: number, sortBy: string) => Promise<void>
    // changeTransactionStatus: (txnRef: string, status: TransactionStatus) => Promise<void>
    // isLoading: boolean
}

export default function TransactionsTable({ transactions, txnType }: TransactionProps){

  const { activeAgentId } = useAgentStore();
  const { getTransactions, changeTransactionStatus, isLoading } = useAdminStore()


  const [page, setPage] = useState(0)
  const [size, setSize] = useState(2)
  const [sortBy, setSortBy] = useState<"createdat" | "txnamount">("createdat")
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>("PENDING")
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { control, handleSubmit, reset } = useForm<EditFormData>({
      defaultValues: { status: "PENDING" },
    })
  
    const statuses: TransactionStatus[] = ["PENDING", "COMPLETED", "CANCELLED", "REJECTED"]
  
    // Fetch Transactions whenever filters/pagination/sort change
    useEffect(() => {
      getTransactions(activeAgentId!, filterStatus, txnType, page, size, sortBy)
    }, [filterStatus, page, size, sortBy, getTransactions])
  
    const handleEdit = (txn: typeof transactions[0]) => {
      setEditingTxn(txn)
      reset({ status: txn.status })
      setIsDialogOpen(true)
    }
  
    const onSubmit = async (data: EditFormData) => {
      if (editingTxn) {
          await changeTransactionStatus(editingTxn.txnRef, data.status)
          setEditingTxn(null)
          setIsDialogOpen(false)
      }
    }
  
    const handleDelete = (txnId: number) => {
      if (confirm("Are you sure you want to delete this transaction?")) {
        // Optional: implement delete in store
      }
    }

    return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Filters + Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:w-auto">
            {/* Filter */}
            <div className="flex-1 sm:w-auto">
                <select
                    className="w-full px-2 py-1 border rounded bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as TransactionStatus)}
                    >
                    <option value="">All Statuses</option>
                    {statuses.map((s) => (
                        <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
                    ))}
                    </select>

            </div>

            {/* Sort */}
            <div className="flex-1 sm:w-auto max-w-[95vw]">
                <select
                    className="w-full px-2 py-1 border rounded bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100" 
                    value={sortBy}
                    onChange={(e) =>
                    setSortBy(e.target.value as "createdat" | "txnamount")
                    }
                >
                    <option value="createdat">Created At</option>
                    <option value="txnamount">Amount</option>
                </select>
                </div>

            </div>

        </CardHeader>

        <CardContent className="p-0 sm:p-6">
            {isLoading ? 
            (<h2 className="text-center">Loading transactions...</h2>):
            (<>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Player ID</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      No transaction found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{txn.id}</TableCell>
                      <TableCell>{txn.playerId}</TableCell>
                      <TableCell>{txn.paymentMethodId}</TableCell>
                      <TableCell>{txn.txnType}</TableCell>
                      <TableCell>${txn.txnAmount}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs px-2 py-1 rounded-full ${getStatusColor(txn.status)}`}>
                          {txn.status.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{txn.txnRef}</TableCell>
                      <TableCell>{new Date(txn.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(txn)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(txn.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 flex-wrap gap-2 px-3">
            <Button
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span>Page {page + 1}</span>
            <Button size="sm" onClick={() => setPage((p) => p + 1)} disabled={transactions.length == 0}>
              Next
            </Button>
          </div>
          </>
        
        )}
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Status</label>
                  <select {...field} className="w-full px-2 py-1 border rounded bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
                    ))}
                  </select>
                </div>
              )}
            />
            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              {!isLoading && <Button type="submit">Save</Button>}
              {isLoading && <Button type="submit" disabled>Saving...</Button>}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}