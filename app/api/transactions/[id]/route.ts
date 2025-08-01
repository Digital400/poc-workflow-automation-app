import { NextRequest, NextResponse } from 'next/server'
import { 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction 
} from '@/actions/transactions'
import { testConnection } from '@/actions/db'

// GET /api/transactions/[id] - Get transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      )
    }

    const transaction = await getTransactionById(id)
    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error in GET /api/transactions/[id]:', error)
    if (error instanceof Error && error.message === 'Transaction not found') {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate that at least one field is provided
    const hasUpdates = Object.keys(body).length > 0
    if (!hasUpdates) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const updatedTransaction = await updateTransaction(id, body)
    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error in PUT /api/transactions/[id]:', error)
    if (error instanceof Error && error.message === 'Transaction not found') {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      )
    }

    const deleted = await deleteTransaction(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/transactions/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
} 