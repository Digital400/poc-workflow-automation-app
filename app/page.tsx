"use client"

import { Button } from "@/components/ui/button"
import { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Eye, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"

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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function DashboardPage() {
  const [transactionStats, setTransactionStats] = useState({
    totalTransactions: 0,
    completedTransactions: 0,
    processingTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    successRate: 0,
    recentTransactions: [] as Transaction[]
  })
  const [loading, setLoading] = useState(true)

  // Fetch transaction statistics from API
  const fetchStats = async () => {
    try {
      const [statsResponse, transactionsResponse] = await Promise.all([
        fetch('/api/transactions/stats'),
        fetch('/api/transactions?page=1&pageSize=5')
      ])

      if (statsResponse.ok && transactionsResponse.ok) {
        const stats = await statsResponse.json()
        const transactionsData = await transactionsResponse.json()
        
        const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
        
        setTransactionStats({
          totalTransactions: stats.total,
          completedTransactions: stats.completed,
          processingTransactions: stats.processing,
          pendingTransactions: stats.pending,
          failedTransactions: stats.failed,
          successRate,
          recentTransactions: transactionsData.transactions
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchStats()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your payment processing system
          </p>
        </div>
        <Button>View All Transactions</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Completed</h3>
          </div>
          <p className="text-2xl font-bold">{transactionStats.completedTransactions}</p>
          <p className="text-sm text-muted-foreground">Successful transactions</p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Processing</h3>
          </div>
          <p className="text-2xl font-bold">{transactionStats.processingTransactions}</p>
          <p className="text-sm text-muted-foreground">Currently processing</p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Pending</h3>
          </div>
          <p className="text-2xl font-bold">{transactionStats.pendingTransactions}</p>
          <p className="text-sm text-muted-foreground">Awaiting processing</p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Success Rate</h3>
          </div>
          <p className="text-2xl font-bold">{transactionStats.successRate}%</p>
          <p className="text-sm text-muted-foreground">Overall success rate</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactionStats.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{transaction.integrationService}</span>
                    <span className="text-xs text-muted-foreground">{transaction.purchaseOrderReference || transaction.referenceValue}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(transaction.status)}
                  <span className="text-xs text-muted-foreground">{formatDate(transaction.createdOn)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Eye className="mr-2 h-4 w-4" />
              View All Transactions
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Transaction Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertCircle className="mr-2 h-4 w-4" />
              Failed Transactions
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Pending Transactions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
