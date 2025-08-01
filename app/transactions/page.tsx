"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/components/transactions-table"
import { TransactionDetailDrawer } from "@/components/transaction-detail-drawer"
import { Transaction } from "@/lib/types"
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
    totalPages,
    sortBy,
    sortOrder,
    setPageSize,
    setSearchTerm,
    setSorting,
    fetchTransactions,
    updateTransaction,
    deleteTransaction,
    fetchStats,
  } = useTransactions()

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

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
      // Check if this is a JSON view update (has all the original JSON data)
      const currentTransaction = transactions.find(t => t.id === updatedTransaction.id)
      if (!currentTransaction) return
      
      // If the updated transaction has more fields than just the basic ones,
      // it's likely a JSON view update
      const isJsonUpdate = Object.keys(updatedTransaction).length > 10 // Basic fields + JSON data
      
      if (isJsonUpdate) {
        // For JSON view updates, we need to update the entire JSON in the database
        // The updatedTransaction should contain the full JSON data
        await updateTransaction(updatedTransaction.id, updatedTransaction)
      } else {
        // For default view updates, only update specific fields
        const updateData: Partial<Transaction> = {}
        
        if (updatedTransaction.integrationService !== currentTransaction.integrationService) {
          updateData.integrationService = updatedTransaction.integrationService
        }
        
        if (updatedTransaction.status !== currentTransaction.status) {
          updateData.status = updatedTransaction.status
        }
        
        if (Object.keys(updateData).length > 0) {
          await updateTransaction(updatedTransaction.id, updateData)
        }
      }
      
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

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(1, pageSize, debouncedSearchTerm)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [debouncedSearchTerm, pageSize, fetchTransactions])

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
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalRecords={stats?.total || 0}
        searchTerm={searchTerm}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={(page) => fetchTransactions(page, pageSize, searchTerm, sortBy, sortOrder)}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize)
          fetchTransactions(1, newPageSize, searchTerm, sortBy, sortOrder)
        }}
        onSearchChange={(search) => {
          setSearchTerm(search)
          setDebouncedSearchTerm(search)
        }}
        onSortChange={setSorting}
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