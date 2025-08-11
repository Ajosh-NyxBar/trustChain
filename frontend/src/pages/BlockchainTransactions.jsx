import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  TruckIcon,
  ShieldCheckIcon,
  EyeIcon,
  LinkIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useWeb3, useSupplyChainContract, useUserTransactions } from '../hooks/useWeb3';
import { formatTransactionStatus, formatAddress, formatDate, handleContractError, createTransaction, waitForTransaction } from '../utils/web3';
import { uploadTransactionToIPFS } from '../utils/ipfs';

const BlockchainTransactions = () => {
  const { account, isCorrectNetwork } = useWeb3();
  const { contract, loading: contractLoading } = useSupplyChainContract();
  const { transactions, loading: transactionsLoading, refetch } = useUserTransactions(account);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  
  const statusIcons = {
    0: ClockIcon,      // Pending
    1: TruckIcon,      // InTransit
    2: CheckCircleIcon, // Delivered
    3: ShieldCheckIcon, // Verified
    4: XCircleIcon     // Cancelled
  };

  const statusColors = {
    0: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    2: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    3: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    4: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || transaction.status.toString() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <CubeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please connect your wallet to view blockchain transactions
          </p>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Wrong Network
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please switch to Mumbai testnet to interact with TrustChain
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-500 dark:text-white mb-2">
              Blockchain Transactions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and monitor all supply chain transactions on blockchain
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={!contract || contractLoading}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Transaction</span>
          </button>
        </div>

        {/* Contract Status */}
        {contractLoading && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-700 dark:text-blue-300">Loading blockchain contract...</p>
          </div>
        )}

        {!contract && !contractLoading && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">
              Failed to connect to smart contract. Please check your network connection.
            </p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by tracking number or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="0">Pending</option>
            <option value="1">In Transit</option>
            <option value="2">Delivered</option>
            <option value="3">Verified</option>
            <option value="4">Cancelled</option>
          </select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <CubeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactions.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactions.filter(t => t.status === 0).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactions.filter(t => t.status === 1).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactions.filter(t => t.status === 3).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Blockchain Transactions
            </h2>
          </div>
          
          {transactionsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading transactions from blockchain...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {transactions.length === 0 ? 'No transactions found. Create your first blockchain transaction!' : 'No transactions match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <TransactionCard 
                  key={transaction.id} 
                  transaction={transaction}
                  onView={setSelectedTransaction}
                  statusIcons={statusIcons}
                  statusColors={statusColors}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {showModal && (
          <NewTransactionModal 
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            contract={contract}
            account={account}
            onSuccess={() => {
              setShowModal(false);
              refetch();
            }}
          />
        )}

        {selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            contract={contract}
            onUpdate={refetch}
          />
        )}
      </div>
    </div>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction, onView, statusIcons, statusColors }) => {
  const StatusIcon = statusIcons[transaction.status];
  
  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                TX #{transaction.id}
              </h3>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status]}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {formatTransactionStatus(transaction.status)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Tracking Number</p>
              <p className="font-medium text-gray-900 dark:text-white">{transaction.trackingNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Amount</p>
              <p className="font-medium text-emerald-600 dark:text-emerald-400">{transaction.amount} MATIC</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Created</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="mt-3 text-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-1">
              From: <span className="font-mono">{formatAddress(transaction.sender)}</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              To: <span className="font-mono">{formatAddress(transaction.receiver)}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(transaction)}
            className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// New Transaction Modal Component
const NewTransactionModal = ({ isOpen, onClose, contract, account, onSuccess }) => {
  const [formData, setFormData] = useState({
    productId: '',
    receiver: '',
    quantity: '',
    amount: '',
    trackingNumber: '',
    documents: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Upload documents to IPFS if provided
      let ipfsHash = '';
      if (formData.documents) {
        // Upload document logic here
        ipfsHash = 'QmSampleDocumentHash';
      }

      const tx = await createTransaction(
        contract,
        'createTransaction',
        [
          parseInt(formData.productId),
          formData.receiver,
          parseInt(formData.quantity),
          formData.trackingNumber,
          ipfsHash
        ],
        ethers.parseEther(formData.amount)
      );

      await waitForTransaction(tx);
      onSuccess();
    } catch (err) {
      setError(handleContractError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Create New Transaction
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product ID
            </label>
            <input
              type="number"
              value={formData.productId}
              onChange={(e) => setFormData({...formData, productId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receiver Address
            </label>
            <input
              type="text"
              value={formData.receiver}
              onChange={(e) => setFormData({...formData, receiver: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0x..."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (MATIC)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracking Number
            </label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="TRK-..."
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transaction Detail Modal (simplified)
const TransactionDetailModal = ({ transaction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Transaction ID
            </label>
            <p className="text-gray-900 dark:text-white font-mono">#{transaction.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Status
            </label>
            <p className="text-gray-900 dark:text-white">{formatTransactionStatus(transaction.status)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Sender
              </label>
              <p className="text-gray-900 dark:text-white font-mono text-sm">{transaction.sender}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Receiver
              </label>
              <p className="text-gray-900 dark:text-white font-mono text-sm">{transaction.receiver}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Amount
              </label>
              <p className="text-gray-900 dark:text-white">{transaction.amount} MATIC</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Quantity
              </label>
              <p className="text-gray-900 dark:text-white">{transaction.quantity}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockchainTransactions;
