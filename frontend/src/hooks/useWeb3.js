import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getContract, connectWallet, switchToPolygonMumbai } from '../utils/web3';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Connect to wallet
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const { account, provider, signer, network } = await connectWallet();
      
      setAccount(account);
      setProvider(provider);
      setSigner(signer);
      setNetwork(network);
      
      // Check if on correct network (Mumbai testnet)
      const targetChainId = parseInt(import.meta.env.VITE_NETWORK_ID || '80001');
      setIsCorrectNetwork(network.chainId === targetChainId);
      
      // Store connection in localStorage
      localStorage.setItem('trustchain_wallet_connected', 'true');
      
      console.log('🔗 Connected to wallet:', account);
      console.log('🌐 Network:', network.name, `(${network.chainId})`);
      
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      
      // Handle specific error types
      let errorMessage = err.message || 'Failed to connect to wallet';
      
      // Clear any existing error first
      setError(null);
      
      // Categorize errors for better user experience
      if (err.message && (err.message.includes('Connection canceled') || err.message.includes('User rejected'))) {
        errorMessage = 'Connection was canceled. Click "Connect Wallet" again when you\'re ready to proceed.';
      } else if (err.message && err.message.includes('already pending')) {
        errorMessage = 'A MetaMask request is already pending. Please check your MetaMask extension and complete the pending request.';
      } else if (err.message && err.message.includes('unlock')) {
        errorMessage = 'Please unlock your MetaMask wallet and try connecting again.';
      } else if (err.message && err.message.includes('Internal error')) {
        errorMessage = 'Internal MetaMask error. Please try restarting MetaMask or refreshing the page.';
      } else if (err.message && err.message.includes('network')) {
        errorMessage = 'Network configuration error. Please check your MetaMask network settings.';
      }
      
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setNetwork(null);
    setIsCorrectNetwork(false);
    localStorage.removeItem('trustchain_wallet_connected');
    console.log('🔌 Disconnected from wallet');
  }, []);

  // Switch to correct network
  const switchNetwork = useCallback(async () => {
    try {
      await switchToPolygonMumbai();
      // The network change will trigger a page reload or account change event
    } catch (err) {
      console.error('Failed to switch network:', err);
      setError('Failed to switch to Mumbai testnet');
    }
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('trustchain_wallet_connected');
      if (wasConnected && isMetaMaskInstalled() && !account) {
        await connect();
      }
    };

    autoConnect();
  }, [connect, account]);

  // Clear error function with optional auto-clear timer
  const clearError = useCallback((autoReconnect = false) => {
    setError(null);
    if (autoReconnect && !account) {
      // Optionally auto-reconnect after clearing error
      setTimeout(() => {
        connect();
      }, 500);
    }
  }, [account, connect]);

  // Auto-clear errors after 10 seconds for connection errors
  useEffect(() => {
    if (error && (error.includes('Connection canceled') || error.includes('User rejected'))) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        connect();
      }
    };

    const handleChainChanged = (chainId) => {
      console.log('🔄 Chain changed to:', parseInt(chainId, 16));
      // Reload the page when chain changes to reset state
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [account, connect, disconnect]);

  return {
    account,
    provider,
    signer,
    network,
    isConnecting,
    error,
    isCorrectNetwork,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connect,
    disconnect,
    switchNetwork,
    clearError
  };
};

export const useContract = (contractName) => {
  const { signer, provider, isCorrectNetwork } = useWeb3();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      if (!provider || !isCorrectNetwork) {
        setContract(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const contractInstance = await getContract(contractName, signer || provider);
        setContract(contractInstance);
      } catch (err) {
        console.error(`Failed to initialize ${contractName} contract:`, err);
        setError(`Failed to connect to ${contractName} contract`);
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, [contractName, signer, provider, isCorrectNetwork]);

  return { contract, loading, error };
};

export const useSupplyChainContract = () => {
  return useContract('TrustChainSupplyChain');
};

export const useAuthenticityNFTContract = () => {
  return useContract('TrustChainAuthenticityNFT');
};

export const useTransactionStatus = (transactionId) => {
  const { contract } = useSupplyChainContract();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransaction = useCallback(async () => {
    if (!contract || !transactionId) return;

    setLoading(true);
    setError(null);

    try {
      const txn = await contract.transactions(transactionId);
      setTransaction({
        id: txn.id.toString(),
        productId: txn.productId.toString(),
        sender: txn.sender,
        receiver: txn.receiver,
        quantity: txn.quantity.toString(),
        amount: ethers.formatEther(txn.amount),
        status: txn.status,
        trackingNumber: txn.trackingNumber,
        location: txn.location,
        createdAt: new Date(Number(txn.createdAt) * 1000),
        updatedAt: new Date(Number(txn.updatedAt) * 1000),
        ipfsDocumentHash: txn.ipfsDocumentHash,
        isCompliant: txn.isCompliant,
        qualityScore: Number(txn.qualityScore)
      });
    } catch (err) {
      console.error('Failed to fetch transaction:', err);
      setError('Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  }, [contract, transactionId]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return { transaction, loading, error, refetch: fetchTransaction };
};

export const useUserTransactions = (userAddress) => {
  const { contract } = useSupplyChainContract();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserTransactions = useCallback(async () => {
    if (!contract || !userAddress) return;

    setLoading(true);
    setError(null);

    try {
      const transactionIds = await contract.getUserTransactions(userAddress);
      const transactionDetails = await Promise.all(
        transactionIds.map(async (id) => {
          const txn = await contract.transactions(id);
          return {
            id: txn.id.toString(),
            productId: txn.productId.toString(),
            sender: txn.sender,
            receiver: txn.receiver,
            quantity: txn.quantity.toString(),
            amount: ethers.formatEther(txn.amount),
            status: txn.status,
            trackingNumber: txn.trackingNumber,
            location: txn.location,
            createdAt: new Date(Number(txn.createdAt) * 1000),
            updatedAt: new Date(Number(txn.updatedAt) * 1000),
            isCompliant: txn.isCompliant,
            qualityScore: Number(txn.qualityScore)
          };
        })
      );

      setTransactions(transactionDetails);
    } catch (err) {
      console.error('Failed to fetch user transactions:', err);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [contract, userAddress]);

  useEffect(() => {
    fetchUserTransactions();
  }, [fetchUserTransactions]);

  return { transactions, loading, error, refetch: fetchUserTransactions };
};
