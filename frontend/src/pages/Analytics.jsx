import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  CalendarDaysIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import apiService from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      error('Gagal memuat data analytics');
      // Use fallback data if API fails
      setAnalytics(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = () => ({
    summary: {
      totalVolume: 145000000,
      dailyTransactions: 67,
      averageTransaction: 322222,
      successRate: 98.7,
      growthRate: 18.5
    },
    monthlyData: [
      { month: 'Jan', transactions: 120, volume: 45000000, umkm: 95 },
      { month: 'Feb', transactions: 145, volume: 52000000, umkm: 108 },
      { month: 'Mar', transactions: 180, volume: 68000000, umkm: 125 },
      { month: 'Apr', transactions: 220, volume: 78000000, umkm: 140 },
      { month: 'May', transactions: 280, volume: 95000000, umkm: 165 },
      { month: 'Jun', transactions: 320, volume: 115000000, umkm: 190 },
      { month: 'Jul', transactions: 385, volume: 135000000, umkm: 220 },
      { month: 'Aug', transactions: 450, volume: 145000000, umkm: 245 }
    ],
    dailyData: [
      { day: 'Sen', transactions: 45 },
      { day: 'Sel', transactions: 52 },
      { day: 'Rab', transactions: 48 },
      { day: 'Kam', transactions: 61 },
      { day: 'Jum', transactions: 75 },
      { day: 'Sab', transactions: 38 },
      { day: 'Min', transactions: 28 }
    ],
    umkmTypeData: [
      { name: 'Makanan & Minuman', value: 35, count: 420 },
      { name: 'Fashion & Tekstil', value: 25, count: 300 },
      { name: 'Elektronik', value: 20, count: 240 },
      { name: 'Kerajinan', value: 12, count: 144 },
      { name: 'Jasa', value: 8, count: 96 }
    ]
  });

  const monthlyData = analytics?.monthlyData || [];
  const dailyData = analytics?.dailyData || [];
  const umkmTypeData = analytics?.umkmTypeData || [];
  const summary = analytics?.summary || {};

  const COLORS = ['#2ECC71', '#1ABC9C', '#0A2540', '#F39C12', '#E74C3C'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-500 dark:text-white mb-2">
            Analytics & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualization of blockchain transaction data and supply chain trends
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-navy-500 dark:text-white">
                  {formatCurrency(summary.totalVolume || 145000000)}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm font-medium text-emerald-500">
                    +{summary.growthRate || 18.5}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Daily Transactions</p>
                <p className="text-2xl font-bold text-navy-500 dark:text-white">
                  {summary.dailyTransactions || 67}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm font-medium text-emerald-500">+12.3%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600">
                <CalendarDaysIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Average Transaction</p>
                <p className="text-2xl font-bold text-navy-500 dark:text-white">
                  {formatCurrency(summary.averageTransaction || 322222)}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm font-medium text-red-500">-2.1%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-navy-500 to-navy-600">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-navy-500 dark:text-white">
                  {summary.successRate || 98.7}%
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm font-medium text-emerald-500">+0.3%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
                <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transaction Volume Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-navy-500 dark:text-white mb-4">
              Transaction Volume Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280" 
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  stroke="#6B7280" 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Volume']}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#2ECC71" 
                  fill="url(#colorVolume)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Transaction Count */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-navy-500 dark:text-white mb-4">
              Daily Transaction Count
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  stroke="#6B7280" 
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  stroke="#6B7280" 
                  tick={{ fill: '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [value, 'Transactions']}
                />
                <Bar 
                  dataKey="transactions" 
                  fill="#1ABC9C"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Transaction Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-navy-500 dark:text-white mb-4">
              Monthly Transaction Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280" 
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  stroke="#6B7280" 
                  tick={{ fill: '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#0A2540" 
                  strokeWidth={3}
                  dot={{ fill: '#0A2540', r: 6 }}
                  name="Transactions"
                />
                <Line 
                  type="monotone" 
                  dataKey="umkm" 
                  stroke="#F39C12" 
                  strokeWidth={3}
                  dot={{ fill: '#F39C12', r: 6 }}
                  name="UMKM Partners"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* UMKM Type Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-navy-500 dark:text-white mb-4">
              Business Type Distribution
            </h3>
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={umkmTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {umkmTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
                <div className="space-y-3">
                  {umkmTypeData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-navy-500 dark:text-white">
                          {item.value}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.count} partners
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-navy-500 dark:text-white mb-6">
            Quick Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {monthlyData.length > 0 ? monthlyData[monthlyData.length - 1]?.transactions || 450 : 450}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Transactions This Month
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
                {monthlyData.length > 0 ? monthlyData[monthlyData.length - 1]?.umkm || 245 : 245}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active UMKM Partners
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-navy-600 dark:text-navy-400 mb-2">
                {formatCurrency(monthlyData.length > 0 ? monthlyData[monthlyData.length - 1]?.volume || 145000000 : 145000000)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Monthly Volume
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Analytics;
