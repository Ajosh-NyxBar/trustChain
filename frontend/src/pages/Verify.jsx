import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

const VerificationResult = ({ transaction }) => {
  if (!transaction) return null;

  const isVerified = transaction.status === 'verified';
  
  return (
    <div className={`mt-6 p-6 rounded-xl border-2 ${
      isVerified 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' 
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
    }`}>
      <div className="flex items-center mb-4">
        {isVerified ? (
          <CheckCircleIcon className="h-8 w-8 text-emerald-500 mr-3" />
        ) : (
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
        )}
        <div>
          <h3 className={`text-lg font-bold ${
            isVerified ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'
          }`}>
            {isVerified ? 'Transaction Verified' : 'Invalid Transaction'}
          </h3>
          <p className={`text-sm ${
            isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isVerified 
              ? 'This transaction has been verified on the blockchain'
              : 'This transaction could not be verified or has issues'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID</p>
            <p className="text-sm text-navy-500 dark:text-blue-400 font-mono">{transaction.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sender</p>
            <p className="text-sm text-navy-500 dark:text-blue-400">{transaction.sender}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Receiver</p>
            <p className="text-sm text-navy-500 dark:text-blue-400">{transaction.receiver}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{transaction.amount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
            <p className="text-sm text-navy-500 dark:text-blue-400">{transaction.date}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Block Hash</p>
            <p className="text-sm text-navy-500 dark:text-blue-400 font-mono">{transaction.blockHash}</p>
          </div>
        </div>
      </div>

      {isVerified && (
        <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-500 mr-2" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Blockchain Confirmation: {transaction.confirmations || 12} blocks
              </span>
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400">
              Gas Fee: {transaction.gasFee || '0.002 ETH'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Verify = () => {
  const [transactionId, setTransactionId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock transaction data
  const mockTransactions = {
    '#TXN-0001': {
      id: '#TXN-0001',
      sender: 'Toko Elektronik Jaya',
      receiver: 'Budi Santoso',
      amount: 'Rp 1,250,000',
      status: 'verified',
      date: '10 Aug 2025',
      blockHash: '0x7a8b9c...def123',
      confirmations: 15,
      gasFee: '0.003 ETH'
    },
    '#TXN-0002': {
      id: '#TXN-0002',
      sender: 'CV Mandiri Sejahtera',
      receiver: 'Supplier ABC',
      amount: 'Rp 850,000',
      status: 'pending',
      date: '10 Aug 2025',
      blockHash: '0x4e5f6a...789bcd'
    },
    '#TXN-0404': {
      id: '#TXN-0404',
      sender: 'Unknown',
      receiver: 'Unknown',
      amount: 'Rp 0',
      status: 'failed',
      date: 'Invalid',
      blockHash: 'Invalid'
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) return;

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = mockTransactions[transactionId] || mockTransactions['#TXN-0404'];
      setVerificationResult(result);
      setIsLoading(false);
    }, 2000);
  };

  const recentVerifications = [
    {
      id: '#TXN-0001',
      timestamp: '2 menit yang lalu',
      status: 'verified',
      amount: 'Rp 1,250,000'
    },
    {
      id: '#TXN-0003',
      timestamp: '15 menit yang lalu',
      status: 'verified',
      amount: 'Rp 175,000'
    },
    {
      id: '#TXN-0005',
      timestamp: '1 jam yang lalu',
      status: 'verified',
      amount: 'Rp 500,000'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-sky-500 p-3 rounded-2xl w-fit mx-auto mb-4">
            <ShieldCheckIcon className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-navy-500 dark:text-white mb-2">
            Blockchain Transaction Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter transaction ID to verify authenticity and validity of transactions in the TrustChain blockchain
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-4 py-4 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                  placeholder="Example: #TXN-0001"
                  disabled={isLoading}
                />
                <MagnifyingGlassIcon className="h-6 w-6 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                ID Format: #TXN-XXXX (example: #TXN-0001, #TXN-0002)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !transactionId.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <ClockIcon className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Verify Transaction</span>
                </>
              )}
            </button>
          </form>

          {/* Verification Result */}
          <VerificationResult transaction={verificationResult} />
        </div>

        {/* Recent Verifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-navy-500 dark:text-white mb-4">
            Recent Verifications
          </h2>
          
          <div className="space-y-3">
            {recentVerifications.map((verification, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                  <div>
                    <p className="font-medium text-navy-500 dark:text-blue-400">{verification.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{verification.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">{verification.amount}</p>
                  <p className="text-sm text-emerald-500 dark:text-emerald-400">Verified</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-sky-50 dark:bg-sky-900/20 rounded-xl p-6 border border-sky-200 dark:border-sky-700">
          <h3 className="text-lg font-semibold text-sky-800 dark:text-sky-300 mb-2">
            💡 How Verification Works
          </h3>
          <ul className="text-sm text-sky-700 dark:text-sky-400 space-y-2">
            <li>• Each transaction has a unique hash stored in the blockchain</li>
            <li>• Verification is done by matching transaction data with blockchain records</li>
            <li>• Valid transactions will display all details and block confirmations</li>
            <li>• System automatically detects if transactions have been tampered with or are invalid</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Verify;
