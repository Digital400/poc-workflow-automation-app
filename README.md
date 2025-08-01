# poc-workflow-automation-app

## Environment Variables

This application uses environment variables for sensitive configuration. Create a `.env` file in the root directory with the following variables:

### Database Configuration

Copy the `env.example` file to `.env` and update the values as needed:

```bash
cp env.example .env
```

Required environment variables:

- `DB_SERVER`: Database server hostname
- `DB_DATABASE`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_ENCRYPT`: Enable encryption (true/false)
- `DB_TRUST_SERVER_CERTIFICATE`: Trust server certificate (true/false)
- `DB_CONNECTION_TIMEOUT`: Connection timeout in milliseconds
- `DB_REQUEST_TIMEOUT`: Request timeout in milliseconds

### Security Notes

- Never commit the `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use different credentials for development, staging, and production environments