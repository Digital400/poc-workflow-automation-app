import { NextRequest, NextResponse } from 'next/server'
import { 
  getTransactions, 
  createTransaction, 
  getTransactionStats 
} from '@/actions/transactions'
import { testConnection } from '@/actions/db'

// GET /api/transactions - Get all transactions with pagination and search
export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || undefined

    const result = await getTransactions(page, pageSize, search)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.Integration || !body.reference_key || !body.reference_value) {
      return NextResponse.json(
        { error: 'Missing required fields: Integration, reference_key, reference_value' },
        { status: 400 }
      )
    }

    // Create transaction data
    const transactionData = {
      Integration: body.Integration,
      reference_key: body.reference_key,
      reference_value: body.reference_value,
      blob_path: body.blob_path || '',
      JSON: body.JSON || JSON.stringify({ status: 'pending' })
    }

    const newTransaction = await createTransaction(transactionData)
    
    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/transactions:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
} 