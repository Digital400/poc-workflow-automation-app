const sql = require('mssql')

const dbConfig = {
  server: 'rla-test.database.windows.net',
  database: 'rla-test-dev-db',
  user: 'rlaAdmin',
  password: 'rla@test123',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
}

async function testConnection() {
  try {
    console.log('Testing database connection...')
    const pool = await sql.connect(dbConfig)
    
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const result = await pool.request().query('SELECT 1 as test')
    console.log('✅ Query test successful:', result.recordset[0])
    
    // Test if Transactions table exists
    const tableResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'Transactions'
    `)
    
    if (tableResult.recordset[0].count > 0) {
      console.log('✅ Transactions table exists')
      
      // Get table structure
      const structureResult = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Transactions'
        ORDER BY ORDINAL_POSITION
      `)
      
      console.log('📋 Table structure:')
      structureResult.recordset.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`)
      })
      
      // Get row count
      const countResult = await pool.request().query('SELECT COUNT(*) as count FROM Transactions')
      console.log(`📊 Total rows in Transactions table: ${countResult.recordset[0].count}`)
      
    } else {
      console.log('❌ Transactions table does not exist')
    }
    
    await pool.close()
    console.log('✅ Database connection closed')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

testConnection() 