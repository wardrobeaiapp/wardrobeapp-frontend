import { useEffect, useState } from 'react';
import { supabase } from '../../services/core/supabase';

export const DatabaseTest = () => {
  const [status, setStatus] = useState('Checking...');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          setStatus('⚠️ Not authenticated');
          return;
        }

        setUser(session.user);
        setStatus('🔐 Authenticated');

        // Test basic query
        const { data, error: queryError } = await supabase
          .from('scenario_coverage')
          .select('*')
          .limit(1);

        if (queryError) {
          throw queryError;
        }

        console.log('✅ Database query successful:', data);
        setStatus('✅ Connection successful');
      } catch (err: any) {
        console.error('❌ Database test failed:', err);
        setError(err.message);
        setStatus('❌ Connection failed');
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ 
      padding: '1rem', 
      margin: '1rem', 
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>Database Connection Test</h3>
      <p><strong>Status:</strong> {status}</p>
      {user && (
        <div>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}
      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;
