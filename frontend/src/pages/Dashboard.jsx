import React from 'react';
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  TruckIcon, 
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';

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
  const stats = [
    {
      title: "Total Revenue",
      value: "$145.2M",
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
            Welcome to TrustChain Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Blockchain-powered supply chain management platform for transparency and trust
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-navy-500 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg">
              <CurrencyDollarIcon className="h-6 w-6 mx-auto mb-2" />
              Create New Transaction
            </button>
            <button className="bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-lg">
              <CheckCircleIcon className="h-6 w-6 mx-auto mb-2" />
              Verifikasi Transaksi
            </button>
            <button className="bg-gradient-to-r from-navy-500 to-navy-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-navy-600 hover:to-navy-700 transition-all duration-200 shadow-lg">
              <TruckIcon className="h-6 w-6 mx-auto mb-2" />
              Lihat Riwayat
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-navy-500 dark:text-white">Recent Transactions</h2>
            <button className="text-emerald-500 hover:text-emerald-600 font-medium">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, supplier: "Warung Bu Sari", amount: "Rp 250,000" },
                  { id: 2, supplier: "Warung Bu Sari", amount: "Rp 250,000" },
                  { id: 3, supplier: "Warung Bu Sari", amount: "Rp 250,000" },
                  { id: 4, supplier: "Warung Bu Sari", amount: "Rp 250,000" },
                  { id: 5, supplier: "Warung Bu Sari", amount: "Rp 250,000" }
                ].map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="py-3 px-4 text-navy-500 dark:text-emerald-400 font-medium">#TXN-{item.id.toString().padStart(4, '0')}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-200">{item.supplier}</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{item.amount}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                        Verified
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">10 Aug 2025</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
