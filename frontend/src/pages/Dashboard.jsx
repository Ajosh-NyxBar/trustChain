import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  TruckIcon, 
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import apiService from '../services/api';
import ConnectionDebug from '../components/ConnectionDebug';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "emerald" }) => {
  const colorClasses = {
    emerald: "from-emerald-500 to-emerald-600",
    sky: "from-sky-500 to-sky-600", 
    navy: "from-navy-500 to-navy-600",
    orange: "from-orange-500 to-orange-600"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-navy-500 dark:text-white">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {trendValue}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await apiService.getDashboardStats();
      setDashboardData(statsResponse);

      // Fetch recent transactions
      const transactionsData = await apiService.getTransactions({ limit: 5 });
      setRecentTransactions(transactionsData.data || transactionsData.transactions || transactionsData || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = () => {
    // Navigate to create transaction page
    window.location.href = '/transactions?action=create';
  };

  const handleVerifyTransaction = () => {
    // Navigate to verify page
    window.location.href = '/verify';
  };

  const handleViewHistory = () => {
    // Navigate to transactions history
    window.location.href = '/transactions';
  };

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
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'confirmed': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
      'pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      'verified': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'delivered': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    };

    const statusLabels = {
      'confirmed': 'Dikonfirmasi',
      'pending': 'Menunggu',
      'verified': 'Terverifikasi',
      'delivered': 'Terkirim',
      'cancelled': 'Dibatalkan'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status] || statusClasses['pending']}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const stats = dashboardData ? [
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardData.totalRevenue || 0),
      icon: CurrencyDollarIcon,
      trend: dashboardData.revenueGrowth > 0 ? "up" : "down",
      trendValue: `${dashboardData.revenueGrowth || 0}%`,
      color: "emerald"
    },
    {
      title: "Active Suppliers", 
      value: (dashboardData.activeSuppliers || 0).toLocaleString(),
      icon: UsersIcon,
      trend: dashboardData.supplierGrowth > 0 ? "up" : "down",
      trendValue: `${dashboardData.supplierGrowth || 0}%`,
      color: "sky"
    },
    {
      title: "Products Tracked",
      value: (dashboardData.productsTracked || 0).toLocaleString(),
      icon: TruckIcon,
      trend: dashboardData.productGrowth > 0 ? "up" : "down", 
      trendValue: `${dashboardData.productGrowth || 0}%`,
      color: "navy"
    },
    {
      title: "Compliance Rate",
      value: `${dashboardData.complianceRate || 0}%`,
      icon: CheckCircleIcon,
      trend: dashboardData.complianceGrowth > 0 ? "up" : "down",
      trendValue: `${dashboardData.complianceGrowth || 0}%`, 
      color: "orange"
    }
  ] : [
    {
      title: "Total Revenue",
      value: "Rp 145.200.000",
      icon: CurrencyDollarIcon,
      trend: "up",
      trendValue: "+12.5%",
      color: "emerald"
    },
    {
      title: "Active Suppliers", 
      value: "1,234",
      icon: UsersIcon,
      trend: "up",
      trendValue: "+8.3%",
      color: "sky"
    },
    {
      title: "Products Tracked",
      value: "4,567",
      icon: TruckIcon,
      trend: "up", 
      trendValue: "+15.2%",
      color: "navy"
    },
    {
      title: "Compliance Rate",
      value: "98.7%",
      icon: CheckCircleIcon,
      trend: "up",
      trendValue: "+0.3%", 
      color: "orange"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-500 dark:text-white mb-2">
            Welcome back, {user?.first_name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Blockchain-powered supply chain management platform for transparency and trust
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        )}

        {/* Debug Component - Remove in production */}
        <div className="mb-8">
          <ConnectionDebug />
        </div>

        {/* Quick Actions */}
        {!loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-navy-500 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={handleCreateTransaction}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg flex flex-col items-center"
              >
                <PlusIcon className="h-6 w-6 mb-2" />
                Create New Transaction
              </button>
              <button 
                onClick={handleVerifyTransaction}
                className="bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-lg flex flex-col items-center"
              >
                <CheckCircleIcon className="h-6 w-6 mb-2" />
                Verifikasi Transaksi
              </button>
              <button 
                onClick={handleViewHistory}
                className="bg-gradient-to-r from-navy-500 to-navy-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-navy-600 hover:to-navy-700 transition-all duration-200 shadow-lg flex flex-col items-center"
              >
                <TruckIcon className="h-6 w-6 mb-2" />
                Lihat Riwayat
              </button>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {!loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-navy-500 dark:text-white">Recent Transactions</h2>
              <button 
                onClick={handleViewHistory}
                className="text-emerald-500 hover:text-emerald-600 font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Transaction ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="py-3 px-4 text-navy-500 dark:text-emerald-400 font-medium">
                        #{transaction.id.toString().slice(-8)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-200">
                        {transaction.Product?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatCurrency(transaction.total_amount)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {formatDate(transaction.created_at)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
                        Belum ada transaksi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Dashboard;
