import { useState, useEffect, useCallback } from 'react'
import { Transaction } from '@/lib/types'

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
  sortBy: string
  sortOrder: 'asc' | 'desc'
  fetchTransactions: (page?: number, size?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => Promise<void>
  createTransaction: (data: Transaction) => Promise<void>
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  fetchStats: () => Promise<void>
  setSearchTerm: (term: string) => void
  setPageSize: (size: number) => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
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
  const [sortBy, setSortBy] = useState('createdOn')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchTransactions = useCallback(async (page = 1, size = 10, search = '', sortByParam = sortBy, sortOrderParam = sortOrder) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
        sortBy: sortByParam,
        sortOrder: sortOrderParam,
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
  }, []) // Only run on mount

  const setSorting = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    fetchTransactions(1, pageSize, searchTerm, newSortBy, newSortOrder)
  }, [pageSize, searchTerm, fetchTransactions])

  return {
    transactions,
    loading,
    error,
    stats,
    totalPages,
    currentPage,
    pageSize,
    searchTerm,
    sortBy,
    sortOrder,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchStats,
    setSearchTerm,
    setPageSize,
    setSorting,
  }
} 