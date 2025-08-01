"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/components/transactions-table"
import { TransactionDetailDrawer } from "@/components/transaction-detail-drawer"
import { Transaction } from "@/lib/statics/transactionData"
import { useTransactions } from "@/hooks/use-transactions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function TransactionsPage() {
  const {
    transactions,
    loading,
    error,
    stats,
    currentPage,
    pageSize,
    searchTerm,
    fetchTransactions,
    updateTransaction,
    deleteTransaction,
    fetchStats,
  } = useTransactions()

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDrawerMode("view")
    setIsDrawerOpen(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDrawerMode("edit")
    setIsDrawerOpen(true)
  }

  const handleSaveTransaction = async (updatedTransaction: Transaction) => {
    try {
      // For now, we'll only update the status in the JSON
      // In a real application, you might want to update more fields
      const currentTransaction = transactions.find(t => t.id === updatedTransaction.id)
      if (!currentTransaction) return
      
      // This is a simplified update - in practice you'd want to preserve all existing JSON data
      // You would typically merge with existing JSON data here
      
      await updateTransaction(updatedTransaction.id, { status: updatedTransaction.status })
      setIsDrawerOpen(false)
    } catch (error) {
      console.error('Failed to update transaction:', error)
    }
  }



  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id)
      if (selectedTransaction?.id === id) {
        setIsDrawerOpen(false)
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  const handleRefresh = () => {
    fetchTransactions(currentPage, pageSize, searchTerm)
    fetchStats()
  }

  useEffect(() => {
    console.log(transactions)
  }, [transactions])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your transaction history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>Export</Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Transactions</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <div className="text-sm text-muted-foreground">Processing</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <TransactionsTable 
        data={transactions}
        onViewTransaction={handleViewTransaction}
        onEditTransaction={handleEditTransaction}
      />

      <TransactionDetailDrawer
        transaction={selectedTransaction}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        mode={drawerMode}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
} 