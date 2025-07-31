"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Transaction } from "@/lib/statics/transactionData"
import { Eye, Edit } from "lucide-react"

interface TransactionDetailDrawerProps {
  transaction: Transaction | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: "view" | "edit"
  onSave?: (updatedTransaction: Transaction) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function TransactionDetailDrawer({ 
  transaction, 
  isOpen, 
  onOpenChange, 
  mode,
  onSave
}: TransactionDetailDrawerProps) {
  const [editData, setEditData] = useState<Partial<Transaction>>({})

  useEffect(() => {
    if (transaction) {
      setEditData({
        integrationService: transaction.integrationService,
        status: transaction.status
      })
    }
  }, [transaction])

  const handleSave = () => {
    if (transaction && onSave) {
      const updatedTransaction: Transaction = {
        ...transaction,
        ...editData
      }
      onSave(updatedTransaction)
      onOpenChange(false)
    }
  }

  if (!transaction) return null

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              {mode === "view" ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {mode === "view" ? "View Transaction" : "Edit Transaction"}
            </DrawerTitle>
            <DrawerDescription>
              Transaction details for {transaction.referenceId}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Reference ID</label>
              <p className="text-sm font-mono bg-muted p-2 rounded">{transaction.referenceId}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Integration Service</label>
              {mode === "view" ? (
                <p className="text-sm">{transaction.integrationService}</p>
              ) : (
                <input 
                  type="text" 
                  value={editData.integrationService || ""}
                  onChange={(e) => setEditData(prev => ({ ...prev, integrationService: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              {mode === "view" ? (
                <div>{getStatusBadge(transaction.status)}</div>
              ) : (
                <select 
                  className="w-full p-2 border rounded-md"
                  value={editData.status || transaction.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as Transaction["status"] }))}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Created On</label>
              <p className="text-sm">{formatDate(transaction.createdOn)}</p>
            </div>
            
            {mode === "view" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{transaction.id}</p>
              </div>
            )}
          </div>
          
          <DrawerFooter>
            {mode === "edit" && (
              <Button className="w-full" onClick={handleSave}>
                Save Changes
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 