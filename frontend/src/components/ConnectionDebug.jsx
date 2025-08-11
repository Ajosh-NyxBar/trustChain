import React from 'react';
import { useWeb3 } from '../hooks/useWeb3';

const ConnectionDebug = () => {
  const { 
    account, 
    network, 
    error, 
    isConnecting, 
    isCorrectNetwork,
    isMetaMaskInstalled,
    connect,
    clearError 
  } = useWeb3();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border">
      <h3 className="text-lg font-bold mb-4">Connection Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>MetaMask Installed:</strong> {isMetaMaskInstalled ? 'Yes' : 'No'}</div>
        <div><strong>Account:</strong> {account || 'Not connected'}</div>
        <div><strong>Network:</strong> {network ? `${network.name} (${network.chainId})` : 'None'}</div>
        <div><strong>Correct Network:</strong> {isCorrectNetwork ? 'Yes' : 'No'}</div>
        <div><strong>Connecting:</strong> {isConnecting ? 'Yes' : 'No'}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={connect}
          disabled={isConnecting}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Test Connect'}
        </button>
        
        <button
          onClick={clearError}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
        >
          Clear Error
        </button>
        
        <button
          onClick={() => {
            // Simulate a connection error for testing
            console.log('Testing error handling...');
            if (window.ethereum) {
              // This should trigger a user rejection if they cancel
              window.ethereum.request({ method: 'eth_requestAccounts' });
            }
          }}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Test Error
        </button>
      </div>
    </div>
  );
};

export default ConnectionDebug;
