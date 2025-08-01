import { NextResponse } from 'next/server'
import { getTransactionStats } from '@/actions/transactions'
import { testConnection } from '@/actions/db'

// GET /api/transactions/stats - Get transaction statistics
export async function GET() {
  try {
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const stats = await getTransactionStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in GET /api/transactions/stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction statistics' },
      { status: 500 }
    )
  }
} 