# Modular Server Structure

## Overview
The server code has been refactored from a monolithic file (`server-promise-jwt.js`) into a modular structure for better maintainability and scalability.

## Directory Structure

```
server/
├── config/            # Configuration files
│   └── db.js          # Database connection logic
├── middleware/        # Middleware functions
│   └── auth.js        # Authentication middleware
├── routes/            # API routes
│   └── api/           # API endpoints
│       ├── ai/        # AI-related endpoints
│       │   └── analyze.js      # AI analysis endpoint
│       ├── auth/      # Authentication endpoints
│       │   └── index.js        # Auth routes (login, register, etc.)
│       ├── user/      # User-related endpoints
│       │   └── style-preferences.js  # User style preferences
│       ├── wardrobe/  # Wardrobe-related endpoints
│       │   └── items.js        # Wardrobe items CRUD
│       └── outfits/   # Outfit-related endpoints (to be added)
├── utils/             # Utility functions
│   └── inMemoryStorage.js  # In-memory storage utilities
├── server-modular.js  # Main server file (new modular version)
└── server-promise-jwt.js   # Original monolithic server file (for reference)
```

## Key Components

### Main Server File (server-modular.js)
Bootstraps the application, connects to the database, initializes middleware, and sets up routes.

### Routes
All API endpoints are organized by feature area:
- **auth**: User authentication (register, login, etc.)
- **wardrobe**: Wardrobe item management
- **user**: User preferences and settings
- **ai**: AI-powered analysis features

### Middleware
Reusable middleware functions:
- **auth.js**: JWT authentication middleware

### Utilities
- **inMemoryStorage.js**: Utilities for in-memory data storage

## Usage

To start the server with the new modular structure:

```bash
node server-modular.js
```

## Benefits of Modular Structure

1. **Maintainability**: Easier to understand, update, and maintain smaller files
2. **Scalability**: Add new features without modifying existing code
3. **Organization**: Clear separation of concerns
4. **Collaboration**: Multiple developers can work on different parts of the application
5. **Testing**: Easier to test individual components
