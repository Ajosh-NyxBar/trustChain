import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import apiService from '../services/api';

const VerificationResult = ({ transaction }) => {
  if (!transaction) return null;

  const isVerified = transaction.status === 'verified' || transaction.blockchainVerified;
  const isNotFound = transaction.status === 'not_found';
  
  if (isNotFound) {
    return (
      <div className="mt-6 p-6 rounded-xl border-2 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
          <div>
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300">
              Transaction Not Found
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              The transaction ID you entered was not found in our system
            </p>
          </div>
        </div>
        <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            <strong>Searched ID:</strong> {transaction.id}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`mt-6 p-6 rounded-xl border-2 ${
      isVerified 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' 
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
    }`}>
      <div className="flex items-center mb-4">
        {isVerified ? (
          <CheckCircleIcon className="h-8 w-8 text-emerald-500 mr-3" />
        ) : (
          <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
        )}
        <div>
          <h3 className={`text-lg font-bold ${
            isVerified ? 'text-emerald-800 dark:text-emerald-300' : 'text-yellow-800 dark:text-yellow-300'
          }`}>
            {isVerified ? 'Transaction Verified' : 'Transaction Pending Verification'}
          </h3>
          <p className={`text-sm ${
            isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {isVerified 
              ? 'This transaction has been verified on the blockchain'
              : 'This transaction exists but needs blockchain verification'
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
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">From</p>
            <p className="text-sm text-navy-500 dark:text-blue-400">
              {transaction.FromUser?.company_name || 
               `${transaction.FromUser?.first_name} ${transaction.FromUser?.last_name}` ||
               transaction.sender || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">To</p>
            <p className="text-sm text-navy-500 dark:text-blue-400">
              {transaction.ToUser?.company_name || 
               `${transaction.ToUser?.first_name} ${transaction.ToUser?.last_name}` ||
               transaction.receiver || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Product</p>
            <p className="text-sm text-navy-500 dark:text-blue-400">
              {transaction.Product?.name || 'Unknown Product'}
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
              {transaction.total_amount ? 
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(transaction.total_amount) : 
                transaction.amount || 'Unknown'
              }
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</p>
            <p className="text-sm text-navy-500 dark:text-blue-400">
              {transaction.quantity} {transaction.unit}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
            <p className="text-sm text-navy-500 dark:text-blue-400">
              {transaction.created_at ? 
                new Date(transaction.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 
                transaction.date || 'Unknown'
              }
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              transaction.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              transaction.status === 'verified' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {transaction.status}
            </div>
          </div>
        </div>
      </div>

      {transaction.transaction_hash && (
        <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-700">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blockchain Hash</p>
            <p className="text-sm text-navy-500 dark:text-blue-400 font-mono break-all">
              {transaction.transaction_hash}
            </p>
          </div>
        </div>
      )}

      {isVerified && transaction.blockchainVerified && (
        <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-500 mr-2" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Blockchain Confirmation: {transaction.confirmations || 12} blocks
              </span>
            </div>
            {transaction.blockHash && (
              <div className="text-sm text-emerald-600 dark:text-emerald-400">
                Block: {transaction.blockHash.slice(0, 10)}...
              </div>
            )}
          </div>
        </div>
      )}

      {transaction.notes && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.notes}</p>
        </div>
      )}
    </div>
  );
};

const Verify = () => {
  const [transactionId, setTransactionId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      error('Masukkan ID transaksi yang valid');
      return;
    }

    setIsLoading(true);
    
    try {
      // First try to get transaction from our database
      const data = await apiService.get(`/transactions/${transactionId}`);
      
      if (data) {
        const transaction = data;
        
        // If it has a blockchain hash, verify on blockchain
        if (transaction.transaction_hash) {
          try {
            const verifyData = await apiService.post('/blockchain/verify', {
              transactionHash: transaction.transaction_hash,
              transactionId: transaction.id
            });
            
            setVerificationResult({
              ...transaction,
              blockchainVerified: verifyData.verified || false,
              blockHash: verifyResponse.blockHash,
              confirmations: verifyResponse.confirmations || 0
            });
            
            if (verifyResponse.verified) {
              success('Transaksi berhasil diverifikasi di blockchain!');
            } else {
              error('Transaksi tidak dapat diverifikasi di blockchain');
            }
          } catch (blockchainError) {
            // Show transaction data even if blockchain verification fails
            setVerificationResult({
              ...transaction,
              blockchainVerified: false
            });
            error('Gagal verifikasi blockchain, menampilkan data transaksi');
          }
        } else {
          // Transaction exists but no blockchain hash
          setVerificationResult({
            ...transaction,
            blockchainVerified: false
          });
          error('Transaksi belum tercatat di blockchain');
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      
      // Fallback: try to search by different formats
      try {
        const searchData = await apiService.get(`/transactions/search?q=${transactionId}`);
        if (searchData && searchData.length > 0) {
          const transaction = searchData[0];
          setVerificationResult({
            ...transaction,
            blockchainVerified: false
          });
          error('Transaksi ditemukan tetapi belum terverifikasi di blockchain');
        } else {
          setVerificationResult({
            id: transactionId,
            status: 'not_found',
            error: 'Transaction not found'
          });
          error('Transaksi tidak ditemukan');
        }
      } catch (searchErr) {
        setVerificationResult({
          id: transactionId,
          status: 'not_found',
          error: 'Transaction not found'
        });
        error('Transaksi tidak ditemukan');
      }
    } finally {
      setIsLoading(false);
    }
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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Verify;
