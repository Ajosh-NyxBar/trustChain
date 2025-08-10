import React from 'react';
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

const Analytics = () => {
  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', transactions: 120, volume: 45000000, umkm: 95 },
    { month: 'Feb', transactions: 145, volume: 52000000, umkm: 108 },
    { month: 'Mar', transactions: 180, volume: 68000000, umkm: 125 },
    { month: 'Apr', transactions: 220, volume: 78000000, umkm: 140 },
    { month: 'May', transactions: 280, volume: 95000000, umkm: 165 },
    { month: 'Jun', transactions: 320, volume: 115000000, umkm: 190 },
    { month: 'Jul', transactions: 385, volume: 135000000, umkm: 220 },
    { month: 'Aug', transactions: 450, volume: 145000000, umkm: 245 }
  ];

  const dailyData = [
    { day: 'Sen', transactions: 45 },
    { day: 'Sel', transactions: 52 },
    { day: 'Rab', transactions: 48 },
    { day: 'Kam', transactions: 61 },
    { day: 'Jum', transactions: 75 },
    { day: 'Sab', transactions: 38 },
    { day: 'Min', transactions: 28 }
  ];

  const umkmTypeData = [
    { name: 'Makanan & Minuman', value: 35, count: 420 },
    { name: 'Fashion & Tekstil', value: 25, count: 300 },
    { name: 'Elektronik', value: 20, count: 240 },
    { name: 'Kerajinan', value: 12, count: 144 },
    { name: 'Jasa', value: 8, count: 96 }
  ];

  const COLORS = ['#2ECC71', '#1ABC9C', '#0A2540', '#F39C12', '#E74C3C'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

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
                <p className="text-2xl font-bold text-navy-500 dark:text-white">{formatCurrency(145000000)}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm font-medium text-emerald-500">+18.5%</span>
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
                <p className="text-2xl font-bold text-navy-500 dark:text-white">67</p>
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
                <p className="text-2xl font-bold text-navy-500 dark:text-white">{formatCurrency(322222)}</p>
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
                <p className="text-2xl font-bold text-navy-500 dark:text-white">98.7%</p>
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
            <h2 className="text-xl font-bold text-navy-500 dark:text-white mb-4">Transaction Volume Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#2ECC71" 
                  fill="#2ECC71" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Count */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-navy-500 dark:text-white mb-4">Monthly Transaction Count</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#1ABC9C" 
                  strokeWidth={3}
                  dot={{ fill: '#1ABC9C', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-navy-500 dark:text-white mb-4">Daily Transactions (This Week)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="transactions" fill="#0A2540" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* UMKM by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-navy-500 dark:text-white mb-4">UMKM by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={umkmTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {umkmTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {umkmTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-navy-500 dark:text-white">{item.count} UMKM</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-navy-500 dark:text-white mb-4">Insights & Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">📈 Positive Growth</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Transaction volume increased by 18.5% compared to last month, showing good adoption
              </p>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg border border-sky-200 dark:border-sky-700">
              <h3 className="font-semibold text-sky-800 dark:text-sky-300 mb-2">🍽️ F&B Dominance</h3>
              <p className="text-sm text-sky-700 dark:text-sky-400">
                Food & beverage sector dominates 35% of total registered UMKMs
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
              <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">⚡ High Success Rate</h3>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                98.7% success rate shows blockchain system stability and reliability
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
