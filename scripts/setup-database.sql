-- Create Transactions table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Transactions')
BEGIN
    CREATE TABLE Transactions (
        TransactionId INT IDENTITY(1,1) PRIMARY KEY,
        Integration VARCHAR(255) NOT NULL,
        reference_key VARCHAR(255) NOT NULL,
        reference_value VARCHAR(255) NOT NULL,
        blob_path VARCHAR(500),
        created_on DATETIME DEFAULT GETDATE(),
        JSON NVARCHAR(MAX)
    )
    
    PRINT 'Transactions table created successfully'
END
ELSE
BEGIN
    PRINT 'Transactions table already exists'
END

-- Insert some sample data if table is empty
IF NOT EXISTS (SELECT TOP 1 * FROM Transactions)
BEGIN
    INSERT INTO Transactions (Integration, reference_key, reference_value, blob_path, JSON) VALUES
    ('Stripe Payment', 'STR-2024-001', 'STR-2024-001', '/blobs/stripe-001.json', '{"status": "completed", "amount": 100.00, "currency": "USD"}'),
    ('PayPal Gateway', 'PP-2024-002', 'PP-2024-002', '/blobs/paypal-002.json', '{"status": "processing", "amount": 250.50, "currency": "USD"}'),
    ('Square POS', 'SQ-2024-003', 'SQ-2024-003', '/blobs/square-003.json', '{"status": "pending", "amount": 75.25, "currency": "USD"}'),
    ('Stripe Payment', 'STR-2024-004', 'STR-2024-004', '/blobs/stripe-004.json', '{"status": "failed", "amount": 300.00, "currency": "USD"}'),
    ('PayPal Gateway', 'PP-2024-005', 'PP-2024-005', '/blobs/paypal-005.json', '{"status": "completed", "amount": 150.75, "currency": "USD"}'),
    ('Square POS', 'SQ-2024-006', 'SQ-2024-006', '/blobs/square-006.json', '{"status": "processing", "amount": 89.99, "currency": "USD"}'),
    ('Stripe Payment', 'STR-2024-007', 'STR-2024-007', '/blobs/stripe-007.json', '{"status": "completed", "amount": 200.00, "currency": "USD"}'),
    ('PayPal Gateway', 'PP-2024-008', 'PP-2024-008', '/blobs/paypal-008.json', '{"status": "pending", "amount": 125.50, "currency": "USD"}'),
    ('Square POS', 'SQ-2024-009', 'SQ-2024-009', '/blobs/square-009.json', '{"status": "completed", "amount": 45.25, "currency": "USD"}'),
    ('Stripe Payment', 'STR-2024-010', 'STR-2024-010', '/blobs/stripe-010.json', '{"status": "processing", "amount": 175.00, "currency": "USD"}')
    
    PRINT 'Sample data inserted successfully'
END
ELSE
BEGIN
    PRINT 'Transactions table already contains data'
END

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_created_on')
BEGIN
    CREATE INDEX IX_Transactions_created_on ON Transactions (created_on DESC)
    PRINT 'Index on created_on created'
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_Integration')
BEGIN
    CREATE INDEX IX_Transactions_Integration ON Transactions (Integration)
    PRINT 'Index on Integration created'
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_reference_key')
BEGIN
    CREATE INDEX IX_Transactions_reference_key ON Transactions (reference_key)
    PRINT 'Index on reference_key created'
END

PRINT 'Database setup completed successfully' 