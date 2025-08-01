import { NextRequest, NextResponse } from 'next/server'
import { 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction 
} from '@/actions/transactions'
import { testConnection, getConnection } from '@/actions/db'
import sql from 'mssql'

// GET /api/transactions/[id] - Get transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
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
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
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

    // Check if this is a full JSON update (from JSON view mode)
    const isFullJsonUpdate = body.orderLines !== undefined || body.customerName !== undefined || body.orderTotal !== undefined
    
    let updateData: {
      Integration?: string
      JSON?: string
    } = {}
    
    if (isFullJsonUpdate) {
      // For JSON view updates, we need to reconstruct the full JSON
      // and update the JSON field in the database
      const fullJsonData = {
        purchaseOrderReference: body.purchaseOrderReference,
        emailAddress: body.customerName, // Assuming customerName maps to emailAddress
        totalPriceWithGst: body.orderTotal,
        orderLines: body.orderLines,
        cardDetails: {
          responseText: body.status === 'completed' ? 'Approved' : 
                       body.status === 'processing' ? 'Processing' : 
                       body.status === 'failed' ? 'Failed' : ''
        },
        // Add other fields as needed
        ...body
      }
      
      updateData = {
        Integration: body.integrationService,
        JSON: JSON.stringify(fullJsonData)
      }
    } else {
      // For default view updates, only update specific fields
      if (body.integrationService !== undefined) {
        updateData.Integration = body.integrationService
      }
      if (body.status !== undefined) {
        // Update the status in the JSON field
        const currentTransaction = await getTransactionById(id)
        try {
          // Get the current JSON from the database
          const connection = await getConnection()
          const query = `SELECT JSON FROM Transactions WHERE TransactionId = @id`
          const result = await connection.request()
            .input('id', sql.Int, id)
            .query(query)
          
          if (result.recordset.length > 0) {
            const currentJson = JSON.parse(result.recordset[0].JSON)
            currentJson.cardDetails = {
              ...currentJson.cardDetails,
              responseText: body.status === 'completed' ? 'Approved' : 
                           body.status === 'processing' ? 'Processing' : 
                           body.status === 'failed' ? 'Failed' : ''
            }
            updateData.JSON = JSON.stringify(currentJson)
          }
        } catch (error) {
          console.error('Error updating JSON status:', error)
        }
      }
    }

    const updatedTransaction = await updateTransaction(id, updateData)
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
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
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