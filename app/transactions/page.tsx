"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/components/transactions-table"
import { TransactionDetailDrawer } from "@/components/transaction-detail-drawer"
import { mutableTransactionData, updateTransactionData, Transaction } from "@/lib/statics/transactionData"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mutableTransactionData)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Update local state when mutable data changes
  useEffect(() => {
    setTransactions(mutableTransactionData)
  }, [mutableTransactionData])

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

  const handleSaveTransaction = (updatedTransaction: Transaction) => {
    // Update the mutable data
    updateTransactionData(updatedTransaction)
    
    // Update local state
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => 
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your transaction history
          </p>
        </div>
        <Button>Export</Button>
      </div>
      
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
      />
    </div>
  );
} 