import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { apiClient } from '../lib/api';

export const DebugApiClient = () => {
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  
  const [debugInfo, setDebugInfo] = React.useState<any>({});
  
  React.useEffect(() => {
    const updateDebugInfo = async () => {
      let token = null;
      if (getToken) {
        try {
          token = await getToken();
        } catch (err) {
          console.error('Error getting token:', err);
        }
      }
      
      setDebugInfo({
        authLoaded,
        userLoaded,
        hasUser: !!user,
        hasGetToken: !!getToken,
        tokenLength: token?.length || 0,
        apiClientMethods: {
          hasGetPreferences: typeof apiClient.getPreferences === 'function',
          hasSetAuthProvider: typeof apiClient.setAuthProvider === 'function'
        }
      });
    };
    
    updateDebugInfo();
  }, [authLoaded, userLoaded, user, getToken]);
  
  const testApiCall = async () => {
    try {
      console.log('Setting auth provider...');
      if (getToken) {
        apiClient.setAuthProvider(getToken);
      }
      
      console.log('Making API call...');
      const result = await apiClient.getPreferences();
      console.log('API call result:', result);
    } catch (error) {
      console.error('API call failed:', error);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">API Debug Info</h3>
      <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
      
      <button 
        onClick={testApiCall}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
        disabled={!authLoaded || !userLoaded || !user}
      >
        Test API Call
      </button>
    </div>
  );
};
