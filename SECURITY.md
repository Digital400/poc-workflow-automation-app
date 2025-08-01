# Security Guidelines

## Environment Variables

This application uses environment variables to handle sensitive configuration data. All sensitive information has been moved from hardcoded values to environment variables.

### Database Configuration

The following environment variables are used for database configuration:

- `DB_SERVER`: Database server hostname
- `DB_DATABASE`: Database name  
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_ENCRYPT`: Enable encryption (true/false)
- `DB_TRUST_SERVER_CERTIFICATE`: Trust server certificate (true/false)
- `DB_CONNECTION_TIMEOUT`: Connection timeout in milliseconds
- `DB_REQUEST_TIMEOUT`: Request timeout in milliseconds

### Setup Instructions

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your actual database credentials

3. Never commit the `.env` file to version control

### Security Best Practices

1. **Environment Separation**
   - Use different credentials for development, staging, and production
   - Never use production credentials in development

2. **Credential Management**
   - Rotate database passwords regularly
   - Use strong, unique passwords for each environment
   - Consider using Azure Key Vault for production environments

3. **Access Control**
   - Limit database user permissions to only what's necessary
   - Use read-only accounts for reporting/analytics
   - Implement proper authentication and authorization

4. **Monitoring and Logging**
   - Monitor database access logs
   - Set up alerts for suspicious activity
   - Log database connection attempts (without sensitive data)

5. **Network Security**
   - Use encrypted connections (already configured)
   - Restrict database access to specific IP addresses
   - Use Azure SQL Database firewall rules

### Deployment Considerations

1. **Vercel Deployment**
   - Set environment variables in Vercel dashboard
   - Use Vercel's environment variable encryption
   - Never expose environment variables in client-side code

2. **Local Development**
   - Keep `.env` file in `.gitignore`
   - Use different credentials for local development
   - Consider using Docker for consistent environments

### Code Security

1. **SQL Injection Prevention**
   - All database queries use parameterized statements
   - Input validation on all API endpoints
   - Proper error handling without exposing sensitive data

2. **Error Handling**
   - Database errors are logged but not exposed to users
   - Generic error messages for production
   - Detailed logging for debugging in development

### Additional Security Measures

1. **HTTPS Only**
   - Ensure all API calls use HTTPS in production
   - Configure proper SSL certificates

2. **Rate Limiting**
   - Consider implementing rate limiting for API endpoints
   - Monitor for unusual traffic patterns

3. **Data Validation**
   - Validate all input data
   - Sanitize user inputs
   - Implement proper data type checking

### Emergency Procedures

1. **Credential Compromise**
   - Immediately rotate affected credentials
   - Review access logs for unauthorized access
   - Update all environment variables

2. **Database Security**
   - Monitor for unusual query patterns
   - Set up alerts for failed login attempts
   - Regular security audits

## Files Modified

The following files were updated to use environment variables:

- `actions/db.ts`: Database configuration now uses environment variables
- `scripts/test-db.js`: Test script updated to use environment variables
- `env.example`: Template file for environment variables
- `README.md`: Updated with environment variable documentation

## Testing

To verify the environment variable setup is working:

```bash
npm run test-db
```

This will test the database connection using the environment variables from your `.env` file. 