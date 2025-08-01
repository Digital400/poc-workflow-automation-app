import { useState, useEffect, useCallback } from 'react'
import { Transaction } from '@/lib/statics/transactionData'

interface TransactionStats {
  total: number
  completed: number
  processing: number
  pending: number
  failed: number
}

interface UseTransactionsReturn {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  stats: TransactionStats | null
  totalPages: number
  currentPage: number
  pageSize: number
  searchTerm: string
  fetchTransactions: (page?: number, size?: number, search?: string) => Promise<void>
  createTransaction: (data: Transaction) => Promise<void>
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  fetchStats: () => Promise<void>
  setSearchTerm: (term: string) => void
  setPageSize: (size: number) => void
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchTransactions = useCallback(async (page = 1, size = 10, search = '') => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
        ...(search && { search })
      })
      
      const response = await fetch(`/api/transactions?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await response.json()
      console.log(data)
      setTransactions(data.transactions)
      setTotalPages(Math.ceil(data.total / size))
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const createTransaction = useCallback(async (data: Transaction) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }
      
      // Refresh the current page to show the new transaction
      await fetchTransactions(currentPage, pageSize, searchTerm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, fetchTransactions])

  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update transaction')
      }
      
      // Refresh the current page to show the updated transaction
      await fetchTransactions(currentPage, pageSize, searchTerm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, fetchTransactions])

  const deleteTransaction = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete transaction')
      }
      
      // Refresh the current page to reflect the deletion
      await fetchTransactions(currentPage, pageSize, searchTerm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, fetchTransactions])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchTransactions(currentPage, pageSize, searchTerm)
    fetchStats()
  }, [fetchTransactions, fetchStats, currentPage, pageSize, searchTerm])

  return {
    transactions,
    loading,
    error,
    stats,
    totalPages,
    currentPage,
    pageSize,
    searchTerm,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchStats,
    setSearchTerm,
    setPageSize,
  }
} 