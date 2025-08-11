import { ethers } from 'ethers';

// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESSES = {
  TrustChainSupplyChain: import.meta.env.VITE_CONTRACT_ADDRESS_SUPPLY_CHAIN || '',
  TrustChainAuthenticityNFT: import.meta.env.VITE_CONTRACT_ADDRESS_AUTHENTICITY_NFT || ''
};

// Network configuration
const NETWORKS = {
  mumbai: {
    chainId: 80001,
    name: 'Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Contract ABIs (simplified for demo - in production, import from artifacts)
const CONTRACT_ABIS = {
  TrustChainSupplyChain: [
    "function createProduct(string memory _name, string memory _description, uint8 _category, uint256 _price, string memory _ipfsHash) external returns (uint256)",
    "function createTransaction(uint256 _productId, address _receiver, uint256 _quantity, string memory _trackingNumber, string memory _ipfsDocumentHash) external payable returns (uint256)",
    "function updateTransactionStatus(uint256 _transactionId, uint8 _status, string memory _location) external",
    "function verifyProduct(uint256 _transactionId, uint256 _qualityScore, string memory _notes) external",
    "function getTransactionByTrackingNumber(string memory _trackingNumber) external view returns (tuple)",
    "function getUserTransactions(address _user) external view returns (uint256[])",
    "function transactions(uint256) external view returns (uint256 id, uint256 productId, address sender, address receiver, uint256 quantity, uint256 amount, uint8 status, string trackingNumber, string location, uint256 createdAt, uint256 updatedAt, string ipfsDocumentHash, bool isCompliant, uint256 qualityScore)",
    "function products(uint256) external view returns (uint256 id, string name, string description, uint8 category, uint256 price, address manufacturer, string ipfsHash, bool isActive, uint256 createdAt)",
    "function getTotalProducts() external view returns (uint256)",
    "function getTotalTransactions() external view returns (uint256)",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function grantUserRole(bytes32 role, address user) external",
    "function SUPPLIER_ROLE() external view returns (bytes32)",
    "function DISTRIBUTOR_ROLE() external view returns (bytes32)",
    "function RETAILER_ROLE() external view returns (bytes32)",
    "function AUDITOR_ROLE() external view returns (bytes32)",
    "event TransactionCreated(uint256 indexed transactionId, uint256 indexed productId, address indexed sender, address receiver)",
    "event TransactionStatusUpdated(uint256 indexed transactionId, uint8 status, address updatedBy)",
    "event ProductCreated(uint256 indexed productId, string name, address indexed manufacturer)"
  ],
  TrustChainAuthenticityNFT: [
    "function mintAuthenticityNFT(address _to, uint256 _productId, uint256 _manufacturingDate, string memory _batchNumber, string memory _tokenURI) external returns (uint256)",
    "function verifyAuthenticity(uint256 _tokenId, bool _isAuthentic, uint256 _qualityScore, string memory _certificates) external",
    "function transferOwnershipWithTransaction(uint256 _tokenId, address _to, uint256 _transactionId) external",
    "function getAuthenticityByProductId(uint256 _productId) external view returns (tuple)",
    "function getAuthenticityByBatch(string memory _batchNumber) external view returns (tuple)",
    "function isProductAuthentic(uint256 _productId) external view returns (bool)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function tokenURI(uint256 tokenId) external view returns (string)",
    "function totalSupply() external view returns (uint256)",
    "event AuthenticityNFTMinted(uint256 indexed tokenId, uint256 indexed productId, address indexed manufacturer, string batchNumber)",
    "event AuthenticityVerified(uint256 indexed tokenId, address indexed verifier, bool isAuthentic, uint256 qualityScore)"
  ]
};

// Connect to MetaMask wallet
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const account = await signer.getAddress();
    const network = await provider.getNetwork();

    return {
      account,
      provider,
      signer,
      network: {
        chainId: Number(network.chainId),
        name: network.name
      }
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    
    // Handle specific MetaMask error codes
    if (error.code === 4001) {
      throw new Error('Connection canceled. Please try again and accept the MetaMask connection request.');
    }
    if (error.code === -32002) {
      throw new Error('A MetaMask request is already pending. Please check your MetaMask extension and complete the pending request.');
    }
    if (error.code === 4100) {
      throw new Error('Please unlock your MetaMask wallet and try again.');
    }
    if (error.code === -32603) {
      throw new Error('Internal error. Please try again or restart MetaMask.');
    }
    if (error.code === 4902) {
      throw new Error('The requested network is not configured in MetaMask.');
    }
    
    // Handle common error messages
    if (error.message && error.message.includes('User rejected')) {
      throw new Error('Connection canceled. Please try again and accept the MetaMask connection request.');
    }
    if (error.message && error.message.includes('already pending')) {
      throw new Error('A MetaMask request is already pending. Please check your MetaMask extension.');
    }
    
    throw new Error(`Failed to connect to wallet: ${error.message || 'Unknown error occurred'}`);
  }
};

// Switch to Polygon Mumbai testnet
export const switchToPolygonMumbai = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const mumbaiConfig = NETWORKS.mumbai;
  
  try {
    // Try to switch to Mumbai
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${mumbaiConfig.chainId.toString(16)}` }],
    });
  } catch (switchError) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${mumbaiConfig.chainId.toString(16)}`,
              chainName: mumbaiConfig.name,
              rpcUrls: [mumbaiConfig.rpcUrl],
              nativeCurrency: mumbaiConfig.nativeCurrency,
              blockExplorerUrls: [mumbaiConfig.blockExplorer],
            },
          ],
        });
      } catch (addError) {
        if (addError.code === 4001) {
          throw new Error('Network addition was canceled. Please try again and accept the request to add Mumbai network.');
        }
        throw new Error('Failed to add Mumbai network to MetaMask. Please add it manually.');
      }
    } else {
      if (switchError.code === 4001) {
        throw new Error('Network switch was canceled. Please try again and accept the request to switch to Mumbai network.');
      }
      throw new Error('Failed to switch to Mumbai network. Please switch manually in MetaMask.');
    }
  }
};

// Get contract instance
export const getContract = (contractName, signerOrProvider) => {
  const address = CONTRACT_ADDRESSES[contractName];
  const abi = CONTRACT_ABIS[contractName];

  if (!address) {
    throw new Error(`Contract address for ${contractName} not found. Please deploy the contract first.`);
  }

  if (!abi) {
    throw new Error(`ABI for ${contractName} not found`);
  }

  return new ethers.Contract(address, abi, signerOrProvider);
};

// Format transaction status
export const formatTransactionStatus = (status) => {
  const statuses = ['Pending', 'In Transit', 'Delivered', 'Verified', 'Cancelled'];
  return statuses[status] || 'Unknown';
};

// Format product category
export const formatProductCategory = (category) => {
  const categories = ['Electronics', 'Food', 'Textiles', 'Automotive', 'Pharmaceutical', 'Other'];
  return categories[category] || 'Unknown';
};

// Format address for display
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format date from timestamp
export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validate Ethereum address
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

// Get transaction receipt
export const getTransactionReceipt = async (provider, txHash) => {
  try {
    return await provider.getTransactionReceipt(txHash);
  } catch (error) {
    console.error('Failed to get transaction receipt:', error);
    return null;
  }
};

// Wait for transaction confirmation
export const waitForTransaction = async (tx, confirmations = 1) => {
  try {
    console.log('⏳ Waiting for transaction confirmation...', tx.hash);
    const receipt = await tx.wait(confirmations);
    console.log('✅ Transaction confirmed:', receipt.hash);
    return receipt;
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    throw error;
  }
};

// Estimate gas for transaction
export const estimateGas = async (contract, method, params = []) => {
  try {
    const gasEstimate = await contract[method].estimateGas(...params);
    // Add 20% buffer
    return gasEstimate * 120n / 100n;
  } catch (error) {
    console.error('Failed to estimate gas:', error);
    return 500000n; // Default gas limit
  }
};

// Get current gas price
export const getCurrentGasPrice = async (provider) => {
  try {
    const gasPrice = await provider.getFeeData();
    return gasPrice.gasPrice;
  } catch (error) {
    console.error('Failed to get gas price:', error);
    return ethers.parseUnits('35', 'gwei'); // Default gas price for Mumbai
  }
};

// Create transaction with proper gas settings
export const createTransaction = async (contract, method, params = [], value = 0) => {
  try {
    const gasLimit = await estimateGas(contract, method, params);
    const gasPrice = await getCurrentGasPrice(contract.provider);
    
    const txOptions = {
      gasLimit,
      gasPrice,
    };
    
    if (value > 0) {
      txOptions.value = value;
    }
    
    return await contract[method](...params, txOptions);
  } catch (error) {
    console.error('Failed to create transaction:', error);
    throw error;
  }
};

// Get network info
export const getNetworkInfo = (chainId) => {
  const networkEntries = Object.entries(NETWORKS);
  for (const [key, network] of networkEntries) {
    if (network.chainId === chainId) {
      return { key, ...network };
    }
  }
  return null;
};

// Check if on correct network
export const isCorrectNetwork = (chainId) => {
  const targetChainId = parseInt(import.meta.env.VITE_NETWORK_ID || '80001');
  return chainId === targetChainId;
};

// Error handling utility
export const handleContractError = (error) => {
  console.error('Contract error:', error);
  
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Transaction will likely fail. Please check your inputs and try again.';
  }
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds to complete the transaction.';
  }
  
  if (error.code === 'ACTION_REJECTED') {
    return 'Transaction was rejected by user.';
  }
  
  if (error.reason) {
    return error.reason;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred. Please try again.';
};
