// IPFS utility functions for TrustChain
// Using Pinata as IPFS provider for production readiness

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

// Upload JSON metadata to IPFS
export const uploadJSONToIPFS = async (jsonData) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.warn('⚠️ IPFS credentials not configured, using mock hash');
    return generateMockHash(jsonData);
  }

  try {
    const data = JSON.stringify(jsonData);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: `TrustChain-${jsonData.type || 'data'}-${Date.now()}`,
          keyvalues: {
            project: 'TrustChain',
            type: jsonData.type || 'unknown',
            timestamp: new Date().toISOString()
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      })
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ JSON uploaded to IPFS:', result.IpfsHash);
    
    return result.IpfsHash;
  } catch (error) {
    console.error('❌ Failed to upload JSON to IPFS:', error);
    // Fallback to mock hash
    return generateMockHash(jsonData);
  }
};

// Upload file to IPFS
export const uploadFileToIPFS = async (file) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.warn('⚠️ IPFS credentials not configured, using mock hash');
    return generateMockHash({ name: file.name, size: file.size });
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: `TrustChain-${file.name}`,
      keyvalues: {
        project: 'TrustChain',
        filename: file.name,
        type: file.type,
        size: file.size.toString(),
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', options);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`IPFS file upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ File uploaded to IPFS:', result.IpfsHash);
    
    return result.IpfsHash;
  } catch (error) {
    console.error('❌ Failed to upload file to IPFS:', error);
    return generateMockHash({ name: file.name, size: file.size });
  }
};

// Get data from IPFS
export const getFromIPFS = async (hash) => {
  if (hash.startsWith('QmMock') || hash.startsWith('mock-')) {
    return getMockData(hash);
  }

  try {
    const response = await fetch(`${PINATA_GATEWAY}${hash}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.blob();
    }
  } catch (error) {
    console.error('❌ Failed to get data from IPFS:', error);
    return null;
  }
};

// Create product metadata for IPFS
export const createProductMetadata = (productData) => {
  return {
    type: 'product',
    name: productData.name,
    description: productData.description,
    category: productData.category,
    manufacturer: productData.manufacturer,
    specifications: productData.specifications || {},
    images: productData.images || [],
    certifications: productData.certifications || [],
    createdAt: new Date().toISOString(),
    version: '1.0'
  };
};

// Create transaction metadata for IPFS
export const createTransactionMetadata = (transactionData) => {
  return {
    type: 'transaction',
    transactionId: transactionData.id,
    productId: transactionData.productId,
    sender: transactionData.sender,
    receiver: transactionData.receiver,
    quantity: transactionData.quantity,
    trackingNumber: transactionData.trackingNumber,
    documents: transactionData.documents || [],
    notes: transactionData.notes || '',
    location: transactionData.location || '',
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
};

// Create authenticity certificate metadata for IPFS
export const createAuthenticityMetadata = (authenticityData) => {
  return {
    type: 'authenticity_certificate',
    productId: authenticityData.productId,
    batchNumber: authenticityData.batchNumber,
    manufacturer: authenticityData.manufacturer,
    manufacturingDate: authenticityData.manufacturingDate,
    qualityScore: authenticityData.qualityScore,
    certificates: authenticityData.certificates || [],
    verificationHistory: authenticityData.verificationHistory || [],
    isAuthentic: authenticityData.isAuthentic,
    createdAt: new Date().toISOString(),
    version: '1.0'
  };
};

// Upload product data to IPFS
export const uploadProductToIPFS = async (productData) => {
  const metadata = createProductMetadata(productData);
  return await uploadJSONToIPFS(metadata);
};

// Upload transaction data to IPFS
export const uploadTransactionToIPFS = async (transactionData) => {
  const metadata = createTransactionMetadata(transactionData);
  return await uploadJSONToIPFS(metadata);
};

// Upload authenticity certificate to IPFS
export const uploadAuthenticityToIPFS = async (authenticityData) => {
  const metadata = createAuthenticityMetadata(authenticityData);
  return await uploadJSONToIPFS(metadata);
};

// Validate IPFS hash
export const isValidIPFSHash = (hash) => {
  // Basic validation for IPFS hash format
  const ipfsHashPattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const mockHashPattern = /^(QmMock|mock-)/;
  
  return ipfsHashPattern.test(hash) || mockHashPattern.test(hash);
};

// Get IPFS gateway URL
export const getIPFSUrl = (hash) => {
  if (!hash) return '';
  return `${PINATA_GATEWAY}${hash}`;
};

// Generate mock IPFS hash for development
const generateMockHash = (data) => {
  const mockId = Math.random().toString(36).substring(2, 15);
  const hash = `QmMock${mockId}${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 20)}`;
  
  // Store mock data in localStorage for development
  localStorage.setItem(`ipfs_mock_${hash}`, JSON.stringify(data));
  
  return hash;
};

// Get mock data for development
const getMockData = (hash) => {
  const mockData = localStorage.getItem(`ipfs_mock_${hash}`);
  return mockData ? JSON.parse(mockData) : null;
};

// Bulk upload multiple files
export const uploadMultipleFiles = async (files) => {
  const uploads = files.map(file => uploadFileToIPFS(file));
  return await Promise.all(uploads);
};

// Create QR code data for product verification
export const createQRCodeData = (productId, transactionId, ipfsHash) => {
  return {
    type: 'trustchain_verification',
    productId,
    transactionId,
    ipfsHash,
    verificationUrl: `${window.location.origin}/verify?tx=${transactionId}`,
    timestamp: Date.now()
  };
};

// Parse QR code data
export const parseQRCodeData = (qrData) => {
  try {
    const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    
    if (data.type !== 'trustchain_verification') {
      throw new Error('Invalid QR code format');
    }
    
    return {
      productId: data.productId,
      transactionId: data.transactionId,
      ipfsHash: data.ipfsHash,
      verificationUrl: data.verificationUrl,
      timestamp: data.timestamp
    };
  } catch (error) {
    throw new Error('Failed to parse QR code data');
  }
};

// Check IPFS node status
export const checkIPFSStatus = async () => {
  try {
    const response = await fetch(`${PINATA_GATEWAY}QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme`, {
      method: 'HEAD'
    });
    
    return response.ok;
  } catch (error) {
    console.error('IPFS status check failed:', error);
    return false;
  }
};

// Get file info from IPFS
export const getFileInfo = async (hash) => {
  try {
    const response = await fetch(`https://api.pinata.cloud/data/pinList?hashContains=${hash}`, {
      method: 'GET',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get file info');
    }

    const data = await response.json();
    return data.rows[0] || null;
  } catch (error) {
    console.error('Failed to get file info:', error);
    return null;
  }
};
