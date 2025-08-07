const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = (req, res, next) => {
  console.log('Auth middleware called');
  
  // Get token from header
  const token = req.header('x-auth-token');
  console.log('Token present:', !!token);

  // Check if no token
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Token verified successfully, user ID:', decoded.user.id);
    
    // Set user info in request
    req.user = decoded.user;
    
    // Check if user exists in the system
    if (!global.usingMongoDB) {
      // For in-memory mode, verify the user exists
      const userExists = global.inMemoryUsers && 
                         global.inMemoryUsers.some(u => u.id === decoded.user.id);
      
      console.log('In-memory mode, user exists:', userExists);
      console.log('Current in-memory users:', JSON.stringify(global.inMemoryUsers));
      
      // If user doesn't exist but we have a valid token, create a temporary user
      // This helps with development and testing
      if (!userExists && !global.inMemoryUsers.some(u => u.id === decoded.user.id)) {
        console.log('Creating temporary user for development');
        global.inMemoryUsers.push({
          id: decoded.user.id,
          name: 'Temporary User',
          email: 'temp@example.com',
          password: 'password123',
          profileCompleted: true,
          onboardingCompleted: true,
          dateCreated: new Date().toISOString()
        });
      }
    }
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
};

module.exports = auth;
