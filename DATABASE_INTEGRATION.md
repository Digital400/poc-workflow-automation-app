# Database Integration

This application has been integrated with a SQL Server database to store and manage transaction data.

## Database Configuration

- **Server**: rla-test.database.windows.net
- **Database**: rla-test-dev-db
- **Username**: rlaAdmin
- **Password**: rla@test123

## Database Schema

### Transactions Table

| Column | Type | Description |
|--------|------|-------------|
| TransactionId | INT | Primary key, auto-increment |
| Integration | VARCHAR(255) | Integration service name |
| reference_key | VARCHAR(255) | Reference key for the transaction |
| reference_value | VARCHAR(255) | Reference value for the transaction |
| blob_path | VARCHAR(500) | Path to blob storage (optional) |
| created_on | DATETIME | Transaction creation timestamp |
| JSON | NVARCHAR(MAX) | JSON data containing status and other metadata |

## Setup Instructions

### 1. Test Database Connection

Run the database connection test:

```bash
npm run test-db
```

This will verify that:
- The database connection is working
- The Transactions table exists
- The table structure is correct
- Sample data is available

### 2. Database Setup (if needed)

If the Transactions table doesn't exist, you can run the setup script in your SQL Server Management Studio or Azure Data Studio:

```sql
-- Run the contents of scripts/setup-database.sql
```

This will:
- Create the Transactions table with the correct schema
- Insert sample data
- Create performance indexes

## API Endpoints

### GET /api/transactions
Get all transactions with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)
- `search` (optional): Search term for Integration, reference_key, or reference_value

**Response:**
```json
{
  "transactions": [...],
  "total": 100
}
```

### POST /api/transactions
Create a new transaction.

**Request Body:**
```json
{
  "Integration": "Stripe Payment",
  "reference_key": "STR-2024-001",
  "reference_value": "STR-2024-001",
  "blob_path": "/blobs/stripe-001.json",
  "JSON": "{\"status\": \"pending\", \"amount\": 100.00}"
}
```

### GET /api/transactions/[id]
Get a specific transaction by ID.

### PUT /api/transactions/[id]
Update a transaction.

### DELETE /api/transactions/[id]
Delete a transaction.

### GET /api/transactions/stats
Get transaction statistics.

**Response:**
```json
{
  "total": 100,
  "completed": 45,
  "processing": 20,
  "pending": 25,
  "failed": 10
}
```

## Frontend Integration

The application uses a custom hook `useTransactions` to manage database operations:

```typescript
const {
  transactions,
  loading,
  error,
  stats,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  // ... other methods
} = useTransactions()
```

## Features

### 1. Real-time Data
- All transaction data is fetched from the database
- Real-time statistics dashboard
- Automatic refresh capabilities

### 2. Search and Filtering
- Search by Integration, reference_key, or reference_value
- Pagination support
- Sortable columns

### 3. CRUD Operations
- Create new transactions
- View transaction details
- Edit transaction status and details
- Delete transactions

### 4. Error Handling
- Database connection error handling
- API error responses
- User-friendly error messages

### 5. Performance
- Database indexes for better query performance
- Connection pooling
- Pagination to handle large datasets

## Security Considerations

1. **Connection Security**: Uses encrypted connections to Azure SQL Database
2. **Parameterized Queries**: All database queries use parameterized statements to prevent SQL injection
3. **Error Handling**: Database errors are logged but not exposed to users
4. **Input Validation**: All API endpoints validate input data

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify the database credentials in `actions/db.ts`
   - Check if the Azure SQL Database is accessible
   - Ensure the firewall allows connections from your IP

2. **Table Not Found**
   - Run the setup script in `scripts/setup-database.sql`
   - Verify the table name is exactly "Transactions"

3. **Permission Errors**
   - Ensure the database user has appropriate permissions
   - Check if the user can read/write to the Transactions table

### Testing

Run the database test:
```bash
npm run test-db
```

This will provide detailed information about the database connection and table structure. 