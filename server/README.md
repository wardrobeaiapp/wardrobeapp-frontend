# Wardrobe App Server

## Server Files Organization

### Active Server
- **server-promise-jwt.js** - The current production server implementation. Uses promises and JWT authentication.
  - Features: Authentication with JWT, User preferences, Style analysis with Claude AI, Image processing
  - Usage: `npm start` or `node server-promise-jwt.js`

### Legacy/Alternative Server Implementations
- **server.js** - Original server implementation.
  - Usage: `npm run start:legacy` or `node server.js`

- **server-fixed.js** - Fixed version of the original server.
  - Usage: `node server-fixed.js`

- **server-jwt-fixed.js** - Fixed version with JWT authentication.
  - Usage: `node server-jwt-fixed.js`

- **server-promise.js** - Promise-based implementation without JWT.
  - Usage: `node server-promise.js`

### Minimal Servers
- **minimal-server.js** - Minimal implementation for testing.
  - Usage: `node minimal-server.js`

- **simple-server.js** - Simple implementation with basic features.
  - Usage: `node simple-server.js`

### Test Files
Various test files are included for testing specific functionality:
- **test-jwt.js** - Test JWT functionality
- **test-login-fetch.js** - Test login with fetch
- **test-register-*.js** files - Different test registration implementations
- **test-upload.js** - Test file upload functionality

## Server Configuration
- Configuration is managed through environment variables in the `.env` file
- Example configuration is provided in `.env.example`

## API Endpoints

Refer to the routes directory for detailed API endpoint implementations.

## Models

Database models are defined in the models directory.

## Authentication

Authentication is handled via JWT (JSON Web Tokens) in the current implementation.
