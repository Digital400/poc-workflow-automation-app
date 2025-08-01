import sql from 'mssql'

// Database configuration
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

// Database connection pool
let pool: sql.ConnectionPool | null = null

// Get database connection
export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(dbConfig)
  }
  return pool
}

// Close database connection
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection()
    await connection.request().query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
} 