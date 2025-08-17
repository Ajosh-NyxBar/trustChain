import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TruckIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import apiService from '../services/api';

const TransactionCard = ({ transaction, onRefresh }) => {
  const statusColors = {
    confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', 
    verified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  };

  const statusIcons = {
    confirmed: CheckCircleIcon,
    pending: ClockIcon,
    verified: CheckCircleIcon,
    delivered: TruckIcon,
    cancelled: ExclamationTriangleIcon,
    in_transit: TruckIcon
  };

  const statusLabels = {
    confirmed: 'Dikonfirmasi',
    pending: 'Pending',
    verified: 'Terverifikasi',
    delivered: 'Terkirim',
    cancelled: 'Dibatalkan',
    in_transit: 'Dalam Perjalanan'
  };

  const StatusIcon = statusIcons[transaction.status] || ClockIcon;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-navy-500 dark:text-white mb-1">
            #{transaction.id.toString().slice(-8)}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {transaction.Product?.name || 'Unknown Product'}
          </p>
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status]}`}>
          <StatusIcon className="h-4 w-4 mr-1" />
          {statusLabels[transaction.status] || transaction.status}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From</p>
          <p className="text-sm font-medium text-navy-500 dark:text-white">
            {transaction.FromUser?.company_name || `${transaction.FromUser?.first_name} ${transaction.FromUser?.last_name}`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">To</p>
          <p className="text-sm font-medium text-navy-500 dark:text-white">
            {transaction.ToUser?.company_name || `${transaction.ToUser?.first_name} ${transaction.ToUser?.last_name}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantity</p>
          <p className="text-sm font-medium text-navy-500 dark:text-white">
            {transaction.quantity} {transaction.unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(transaction.total_amount)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
          <p className="text-sm font-medium text-navy-500 dark:text-white capitalize">
            {transaction.transaction_type}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {formatDate(transaction.created_at)}
          </p>
        </div>
      </div>

      {transaction.transaction_hash && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Blockchain Hash:</p>
            <p className="text-xs text-navy-500 dark:text-emerald-400 font-mono">
              {transaction.transaction_hash.slice(0, 16)}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const NewTransactionModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    to_user_id: '',
    product_id: '',
    quantity: '',
    unit_price: '',
    notes: ''
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const users = await apiService.getUsers();
      setUsers(users.data || users.users || users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const products = await apiService.getProducts();
      setProducts(products.data || products.products || products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedProduct = products.find(p => p.id === formData.product_id);
      const transactionData = {
        ...formData,
        total_amount: parseFloat(formData.quantity) * parseFloat(formData.unit_price),
        unit: selectedProduct?.unit || 'pcs',
        transaction_type: 'transfer'
      };

      await apiService.createTransaction(transactionData);
      success('Transaksi berhasil dibuat!');
      onRefresh();
      onClose();
      setFormData({
        to_user_id: '',
        product_id: '',
        quantity: '',
        unit_price: '',
        notes: ''
      });
    } catch (err) {
      error(err.message || 'Gagal membuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-navy-500 dark:text-white">Buat Transaksi Baru</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Penerima
            </label>
            <select
              value={formData.to_user_id}
              onChange={(e) => setFormData({...formData, to_user_id: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Pilih penerima</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.company_name || `${user.first_name} ${user.last_name}`} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Produk
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({...formData, product_id: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Pilih produk</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.sku}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harga per Unit
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              rows="3"
              placeholder="Tambahkan catatan untuk transaksi ini..."
            />
          </div>

          {formData.quantity && formData.unit_price && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(parseFloat(formData.quantity) * parseFloat(formData.unit_price))}
              </p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Buat Transaksi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Transactions = () => {
  const { user } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const transactionData = await apiService.getTransactions();
      setTransactions(transactionData.data || transactionData.transactions || transactionData || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      error('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.id.toString().includes(searchTerm.toLowerCase()) ||
        transaction.Product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.FromUser?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.ToUser?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-500 dark:text-white mb-2">
              Transactions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage your blockchain transactions
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Buat Transaksi</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {/* Filters */}
        {!loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari transaksi..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="confirmed">Dikonfirmasi</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Terverifikasi</option>
                    <option value="delivered">Terkirim</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTransactions.map((transaction) => (
              <TransactionCard 
                key={transaction.id} 
                transaction={transaction} 
                onRefresh={fetchTransactions}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Tidak ada transaksi ditemukan
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {transactions.length === 0 
                ? 'Belum ada transaksi yang dibuat' 
                : 'Coba ubah kriteria pencarian atau filter Anda'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <NewTransactionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onRefresh={fetchTransactions}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Transactions;
