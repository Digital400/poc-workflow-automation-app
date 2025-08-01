import sql from 'mssql'
import { getConnection } from './db'
import { Transaction } from '@/lib/types'

// Database Transaction type matching the SQL Server table structure
export interface DBTransaction {
  TransactionId: number
  Integration: string
  reference_key: string
  reference_value: string
  blob_path: string
  created_on: Date
  JSON: string
}

// Convert DB transaction to frontend Transaction type
export function mapDBTransactionToFrontend(dbTransaction: DBTransaction) {
  try {
    const jsonData = JSON.parse(dbTransaction.JSON)
    
    // Extract status from the JSON data
    let status: "pending" | "processing" | "completed" | "failed" = "pending"
    
    // Check for various status indicators in the JSON
    if (jsonData.cardDetails?.responseText === "Approved") {
      status = "completed"
    } else if (jsonData.cardDetails?.responseText === "Processing") {
      status = "processing"
    } else if (jsonData.cardDetails?.responseText === "Failed") {
      status = "failed"
    }
    
    return {
      id: dbTransaction.TransactionId.toString(),
      integrationService: dbTransaction.Integration,
      referenceKey: dbTransaction.reference_key,
      referenceValue: dbTransaction.reference_value,
      purchaseOrderReference: jsonData.purchaseOrderReference,
      status: status,
      createdOn: dbTransaction.created_on.toISOString(),
      // Add additional data for display
      customerName: jsonData.shippingAddress?.firstName && jsonData.shippingAddress?.lastName 
        ? `${jsonData.shippingAddress.firstName} ${jsonData.shippingAddress.lastName}`
        : jsonData.emailAddress,
      orderTotal: jsonData.totalPriceWithGst || 0,
      orderLines: jsonData.orderLines || [],
      blobPath: dbTransaction.blob_path,
      
      // Include all additional fields from the JSON
      emailAddress: jsonData.emailAddress,
      accountNumber: jsonData.accountNumber,
      deliverySequence: jsonData.deliverySequence,
      customerId: jsonData.customerId,
      orderId: jsonData.orderId,
      isPickup: jsonData.isPickup,
      isDelivery: jsonData.isDelivery,
      orderPickupDetails: jsonData.orderPickupDetails,
      orderNote: jsonData.orderNote,
      deliveryInstructions: jsonData.deliveryInstructions,
      date: jsonData.date,
      paymentType: jsonData.paymentType,
      shippingAddress: jsonData.shippingAddress,
      invoiceAddress: jsonData.invoiceAddress,
      cardDetails: jsonData.cardDetails,
      freightCharge: jsonData.freightCharge,
      freightChargeWithGst: jsonData.freightChargeWithGst,
      gst: jsonData.gst,
      subTotal: jsonData.subTotal,
      totalPriceWithGst: jsonData.totalPriceWithGst
    }
  } catch (error) {
    console.error('Error parsing JSON for transaction:', error)
    return {
      id: '',
      integrationService: '',
      referenceKey: '',
      referenceValue: '',
      purchaseOrderReference: '',
      status: "pending" as const,
      createdOn: '',
      customerName: "Unknown",
      orderTotal: 0,
      orderLines: [],
      blobPath: ''
    }
  }
}

// Get all transactions with pagination
export async function getTransactions(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  sortBy: string = 'createdOn',
  sortOrder: string = 'desc'
): Promise<{ transactions: Transaction[], total: number }> {
  try {
    const connection = await getConnection()
    
    let whereClause = ''
    let searchParam: string | null = null
    
    if (search) {
      whereClause = 'WHERE Integration LIKE @search OR reference_key LIKE @search OR reference_value LIKE @search'
      searchParam = `%${search}%`
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM Transactions 
      ${whereClause}
    `
    const countRequest = connection.request()
    if (searchParam) {
      countRequest.input('search', sql.VarChar, searchParam)
    }
    const countResult = await countRequest.query(countQuery)
    
    const total = countResult.recordset[0].total
    
    // Get paginated data
    const offset = (page - 1) * pageSize
    
    // Map frontend column names to database column names
    const sortColumnMap: { [key: string]: string } = {
      'id': 'TransactionId',
      'purchaseOrderReference': 'JSON',
      'referenceValue': 'reference_value',
      'orderTotal': 'JSON',
      'status': 'JSON',
      'createdOn': 'created_on',
      'integrationService': 'Integration'
    }
    
    const sortColumn = sortColumnMap[sortBy] || 'created_on'
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    
    let orderByClause = `ORDER BY ${sortColumn} ${orderDirection}`
    
    // Special handling for JSON fields that need to be extracted
    if (sortBy === 'purchaseOrderReference') {
      orderByClause = `ORDER BY JSON_VALUE(JSON, '$.purchaseOrderReference') ${orderDirection}`
    } else if (sortBy === 'orderTotal') {
      orderByClause = `ORDER BY CAST(JSON_VALUE(JSON, '$.totalPriceWithGst') AS FLOAT) ${orderDirection}`
    } else if (sortBy === 'status') {
      orderByClause = `ORDER BY JSON_VALUE(JSON, '$.cardDetails.responseText') ${orderDirection}`
    }
    
    const query = `
      SELECT TransactionId, Integration, reference_key, reference_value, 
             blob_path, created_on, JSON
      FROM Transactions 
      ${whereClause}
      ${orderByClause}
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `
    
    const result = connection.request()
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize)
    
    if (searchParam) {
      result.input('search', sql.VarChar, searchParam)
    }
    
    const dataResult = await result.query(query)
    
    const transactions = dataResult.recordset.map(mapDBTransactionToFrontend)
    
    return { transactions, total }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw new Error('Failed to fetch transactions')
  }
}

// Get transaction by ID
export async function getTransactionById(id: number): Promise<Transaction> {
  try {
    const connection = await getConnection()
    
    const query = `
      SELECT TransactionId, Integration, reference_key, reference_value, 
             blob_path, created_on, JSON
      FROM Transactions 
      WHERE TransactionId = @id
    `
    
    const result = await connection.request()
      .input('id', sql.Int, id)
      .query(query)
    
    if (result.recordset.length === 0) {
      throw new Error('Transaction not found')
    }
    
    return mapDBTransactionToFrontend(result.recordset[0])
  } catch (error) {
    console.error('Error fetching transaction:', error)
    throw new Error('Failed to fetch transaction')
  }
}

// Create new transaction
export async function createTransaction(transactionData: {
  Integration: string
  reference_key: string
  reference_value: string
  blob_path: string
  JSON: string
}): Promise<Transaction> {
  try {
    const connection = await getConnection()
    
    const query = `
      INSERT INTO Transactions (Integration, reference_key, reference_value, blob_path, created_on, JSON)
      VALUES (@Integration, @reference_key, @reference_value, @blob_path, GETDATE(), @JSON);
      SELECT SCOPE_IDENTITY() as TransactionId;
    `
    
    const result = await connection.request()
      .input('Integration', sql.VarChar, transactionData.Integration)
      .input('reference_key', sql.VarChar, transactionData.reference_key)
      .input('reference_value', sql.VarChar, transactionData.reference_value)
      .input('blob_path', sql.VarChar, transactionData.blob_path)
      .input('JSON', sql.NVarChar(sql.MAX), transactionData.JSON)
      .query(query)
    
    const newId = result.recordset[0].TransactionId
    return await getTransactionById(newId)
  } catch (error) {
    console.error('Error creating transaction:', error)
    throw new Error('Failed to create transaction')
  }
}

// Update transaction
export async function updateTransaction(
  id: number,
  transactionData: Partial<{
    Integration: string
    reference_key: string
    reference_value: string
    blob_path: string
    JSON: string
  }>
): Promise<Transaction> {
  try {
    const connection = await getConnection()
    
    const updateFields = []
    
    if (transactionData.Integration !== undefined) {
      updateFields.push('Integration = @Integration')
    }
    if (transactionData.reference_key !== undefined) {
      updateFields.push('reference_key = @reference_key')
    }
    if (transactionData.reference_value !== undefined) {
      updateFields.push('reference_value = @reference_value')
    }
    if (transactionData.blob_path !== undefined) {
      updateFields.push('blob_path = @blob_path')
    }
    if (transactionData.JSON !== undefined) {
      updateFields.push('JSON = @JSON')
    }
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }
    
    const query = `
      UPDATE Transactions 
      SET ${updateFields.join(', ')}
      WHERE TransactionId = @id
    `
    
    const request = connection.request()
      .input('id', sql.Int, id)
    
    if (transactionData.Integration !== undefined) {
      request.input('Integration', sql.VarChar, transactionData.Integration)
    }
    if (transactionData.reference_key !== undefined) {
      request.input('reference_key', sql.VarChar, transactionData.reference_key)
    }
    if (transactionData.reference_value !== undefined) {
      request.input('reference_value', sql.VarChar, transactionData.reference_value)
    }
    if (transactionData.blob_path !== undefined) {
      request.input('blob_path', sql.VarChar, transactionData.blob_path)
    }
    if (transactionData.JSON !== undefined) {
      request.input('JSON', sql.NVarChar(sql.MAX), transactionData.JSON)
    }
    
    await request.query(query)
    
    return await getTransactionById(id)
  } catch (error) {
    console.error('Error updating transaction:', error)
    throw new Error('Failed to update transaction')
  }
}

// Delete transaction
export async function deleteTransaction(id: number): Promise<boolean> {
  try {
    const connection = await getConnection()
    
    const query = `
      DELETE FROM Transactions 
      WHERE TransactionId = @id
    `
    
    const result = await connection.request()
      .input('id', sql.Int, id)
      .query(query)
    
    return result.rowsAffected[0] > 0
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw new Error('Failed to delete transaction')
  }
}

// Get transaction statistics
export async function getTransactionStats(): Promise<{
  total: number
  completed: number
  processing: number
  pending: number
  failed: number
}> {
  try {
    const connection = await getConnection()
    
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN JSON_VALUE(JSON, '$.cardDetails.responseText') = 'Approved' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN JSON_VALUE(JSON, '$.cardDetails.responseText') = 'Processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN JSON_VALUE(JSON, '$.cardDetails.responseText') IS NULL OR JSON_VALUE(JSON, '$.cardDetails.responseText') = '' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN JSON_VALUE(JSON, '$.cardDetails.responseText') = 'Failed' THEN 1 ELSE 0 END) as failed
      FROM Transactions
    `
    
    const result = await connection.request().query(query)
    const stats = result.recordset[0]
    
    return {
      total: stats.total || 0,
      completed: stats.completed || 0,
      processing: stats.processing || 0,
      pending: stats.pending || 0,
      failed: stats.failed || 0,
    }
  } catch (error) {
    console.error('Error fetching transaction stats:', error)
    throw new Error('Failed to fetch transaction statistics')
  }
} 