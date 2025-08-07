import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { SupabaseAuthProvider, useSupabaseAuth } from './context/SupabaseAuthContext';
import { WardrobeProvider } from './context/WardrobeContext';
import HomePage from './pages/HomePage';
import AIAssistantPage from './pages/AIAssistantPage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import WelcomePage from './pages/WelcomePage';
import TestImageUpload from './pages/TestImageUpload';
import StylePreferencesServiceTest from './components/tests/StylePreferencesServiceTest';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f9fafb;
    color: #1f2937;
  }
  
  * {
    box-sizing: border-box;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
`;

// Protected route component that checks authentication and onboarding status
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, user, loading } = useSupabaseAuth();
  
  // If auth state is still loading, show a loading placeholder to prevent UI flash
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#4f46e5'
        }}>
          Loading...
        </div>
      </div>
    );
  }
  
  // More robust check for authentication that looks at multiple sources
  const isUserAuthenticated = () => {
    // First check the isAuthenticated state from context
    if (isAuthenticated) return true;
    
    // Then check for token in localStorage as fallback
    const token = localStorage.getItem('token');
    if (token) return true;
    
    // Finally check if we have a user object which implies authentication
    return !!user;
  };
  
  // Check for onboarding completion flag in localStorage and user object
  const checkOnboardingCompleted = () => {
    // First check user object
    if (user?.onboardingCompleted) {
      return true;
    }
    
    // Then check localStorage as a fallback
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      return storedUser.onboardingCompleted === true;
    } catch (e) {
      return false;
    }
  };
  
  // If not authenticated by any method, redirect to welcome page
  if (!isUserAuthenticated()) {
    return <Navigate to="/welcome" replace />;
  }
  
  // If authenticated but onboarding not completed, redirect to onboarding
  if (!checkOnboardingCompleted()) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // If authenticated and onboarding completed, render the protected element
  return element;
};

// Redirect route for handling root and unknown routes
const RedirectRoute: React.FC = () => {
  const { isAuthenticated, user } = useSupabaseAuth();
  
  // Check for onboarding completion flag in localStorage
  const checkOnboardingCompleted = () => {
    // First check user object
    if (user?.onboardingCompleted) {
      return true;
    }
    
    // Then check localStorage as a fallback
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      return storedUser.onboardingCompleted === true;
    } catch (e) {
      return false;
    }
  };
  
  // If authenticated but onboarding not completed, go to onboarding
  if (isAuthenticated && !checkOnboardingCompleted()) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // If authenticated and onboarding completed, go to home page, otherwise go to welcome page
  return <Navigate to={isAuthenticated ? "/" : "/welcome"} replace />;
};

function App() {
  return (
    <Router>
      <SupabaseAuthProvider>
        <WardrobeProvider>
          <GlobalStyle />
          <AppContainer>
            {/* Navbar removed - now using shared Header component in each page */}
            
            <Main>
              <Routes>
                {/* Welcome page - initial landing page */}
                <Route path="/welcome" element={<WelcomePage />} />
                
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Onboarding route - requires auth but not onboarding */}
                <Route path="/onboarding" element={<OnboardingPage />} />
                
                {/* Protected routes - require auth and completed onboarding */}
                <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
                <Route path="/ai-assistant" element={<ProtectedRoute element={<AIAssistantPage />} />} />
                <Route path="/calendar" element={<ProtectedRoute element={<CalendarPage />} />} />
                <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
                
                {/* Test routes for debugging */}
                <Route path="/test-image" element={<TestImageUpload />} />
                <Route path="/test-style-preferences" element={<StylePreferencesServiceTest />} />
                
                {/* Redirect any unknown routes to welcome page if not authenticated, otherwise to home */}
                <Route path="*" element={<RedirectRoute />} />
              </Routes>
            </Main>
            
            
            {/* Footer removed - now using shared Footer component in each page */}
        </AppContainer>
        </WardrobeProvider>
      </SupabaseAuthProvider>
    </Router>
  );
}

export default App;
