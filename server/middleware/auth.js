const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for token verification
const supabaseUrl = process.env.SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZUI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  console.log('Auth middleware called');
  
  // Get token from header
  const token = req.header('x-auth-token');
  console.log('Token present:', !!token);

  // Check if no token
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Try to verify as Supabase token first
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Supabase token verification failed, trying JWT:', error?.message);
      
      // Fallback to JWT verification for backward compatibility
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        console.log('JWT token verified successfully, user ID:', decoded.user.id);
        req.user = decoded.user;
      } catch (jwtError) {
        console.error('Both Supabase and JWT verification failed:', jwtError.message);
        return res.status(401).json({ message: 'Token is not valid', error: jwtError.message });
      }
    } else {
      console.log('Supabase token verified successfully, user ID:', user.id);
      
      // Set user info in request (convert Supabase user format to expected format)
      req.user = {
        id: user.id,
        email: user.email,
        ...user.user_metadata
      };
    }
    
    // Check if user exists in the system
    if (!global.usingMongoDB) {
      // For in-memory mode, verify the user exists
      const userExists = global.inMemoryUsers && 
                         global.inMemoryUsers.some(u => u.id === req.user.id);
      
      console.log('In-memory mode, user exists:', userExists);
      console.log('Current in-memory users:', JSON.stringify(global.inMemoryUsers));
      
      // If user doesn't exist but we have a valid token, create a temporary user
      // This helps with development and testing
      if (!userExists && !global.inMemoryUsers.some(u => u.id === req.user.id)) {
        console.log('Creating temporary user for development');
        global.inMemoryUsers.push({
          id: req.user.id,
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
