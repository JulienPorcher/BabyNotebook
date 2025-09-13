import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('Testing...');
  const { user } = useAuth();

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        console.log('User:', user);
        
        if (!user) {
          setTestResult('No user authenticated');
          return;
        }

        // Test 1: Check if we can connect to Supabase
        const { data: testData, error: testError } = await supabase
          .from('babies')
          .select('count')
          .limit(1);

        if (testError) {
          setTestResult(`Connection error: ${testError.message}`);
          return;
        }

        // Test 2: Try to fetch babies for this user
        const { data: babies, error: babiesError } = await supabase
          .from('babies')
          .select('*')
          .eq('owner_id', user.id);

        if (babiesError) {
          setTestResult(`Babies fetch error: ${babiesError.message}`);
          return;
        }

        setTestResult(`Success! Found ${babies?.length || 0} babies for user ${user.id}`);
        console.log('Babies found:', babies);

      } catch (error) {
        setTestResult(`Error: ${error}`);
        console.error('Test error:', error);
      }
    };

    testConnection();
  }, [user]);

  return (
    <div className="bg-yellow-100 border border-yellow-400 rounded p-4 m-4">
      <h3 className="font-bold">Supabase Test</h3>
      <p>{testResult}</p>
    </div>
  );
}
