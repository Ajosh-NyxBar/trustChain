import React, { useState } from 'react';
import { 
  PlusIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';

const TransactionCard = ({ transaction }) => {
  const statusColors = {
    verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', 
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };

  const statusIcons = {
    verified: CheckCircleIcon,
    pending: ClockIcon,
    failed: ExclamationTriangleIcon
  };

  const StatusIcon = statusIcons[transaction.status];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-navy-500 dark:text-white mb-1">
            {transaction.id}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{transaction.description}</p>
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status]}`}>
          <StatusIcon className="h-4 w-4 mr-1" />
          {transaction.status === 'verified' ? 'Verified' : 
           transaction.status === 'pending' ? 'Pending' : 'Failed'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sender</p>
          <p className="text-sm font-medium text-navy-500 dark:text-white">{transaction.sender}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Receiver</p>
          <p className="text-sm font-medium text-navy-500 dark:text-white">{transaction.receiver}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{transaction.amount}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.date}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Block Hash:</p>
          <p className="text-xs text-navy-500 dark:text-emerald-400 font-mono">{transaction.blockHash}</p>
        </div>
      </div>
    </div>
  );
};

const NewTransactionModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    receiver: '',
    amount: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle transaction creation
    console.log('Creating transaction:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-navy-500 mb-4">Buat Transaksi Baru</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receiver Address
            </label>
            <input
              type="text"
              value={formData.receiver}
              onChange={(e) => setFormData({...formData, receiver: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="100000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows="3"
              placeholder="Payment for..."
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
            >
              Create Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const transactions = [
    {
      id: '#TXN-0001',
      description: 'Pembayaran produk elektronik',
      sender: 'Toko Elektronik Jaya',
      receiver: 'Budi Santoso',
      amount: 'Rp 1,250,000',
      status: 'verified',
      date: '10 Aug 2025',
      blockHash: '0x7a8b9c...def123'
    },
    {
      id: '#TXN-0002', 
      description: 'Pembelian bahan baku',
      sender: 'CV Mandiri Sejahtera',
      receiver: 'Supplier ABC',
      amount: 'Rp 850,000',
      status: 'pending',
      date: '10 Aug 2025',
      blockHash: '0x4e5f6a...789bcd'
    },
    {
      id: '#TXN-0003',
      description: 'Penjualan makanan',
      sender: 'Warung Bu Sari',
      receiver: 'Ahmad Wijaya', 
      amount: 'Rp 175,000',
      status: 'verified',
      date: '09 Aug 2025',
      blockHash: '0x1a2b3c...456def'
    },
    {
      id: '#TXN-0004',
      description: 'Pembayaran jasa konstruksi',
      sender: 'PT Bangun Nusantara',
      receiver: 'Tukang Bangunan',
      amount: 'Rp 2,500,000',
      status: 'failed',
      date: '09 Aug 2025',
      blockHash: '0x9d8e7f...321abc'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-500 dark:text-white mb-2">
              Transaction Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and monitor all blockchain supply chain transactions
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Transaction</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Gagal</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTransactions.map((transaction, index) => (
            <TransactionCard key={index} transaction={transaction} />
          ))}
        </div>

        {/* No Results */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada transaksi ditemukan
            </h3>
            <p className="text-gray-600">
              Coba ubah kriteria pencarian atau filter Anda
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <NewTransactionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
};

export default Transactions;
