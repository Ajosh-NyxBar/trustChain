import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  KeyIcon 
} from '@heroicons/react/24/outline';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  const features = [
    "🔒 Keamanan Tingkat Tinggi dengan Blockchain",
    "📊 Analitik Real-time untuk UMKM", 
    "✅ Verifikasi Transaksi Instan",
    "🌐 Transparansi Total dalam Setiap Transaksi"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-100 via-sky-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-colors duration-300">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-navy-500 to-navy-600 dark:from-gray-800 dark:to-gray-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20 dark:bg-opacity-40"></div>
        <div className="relative z-10 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-sky-500 p-3 rounded-xl">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">TrustChain</h1>
                <p className="text-emerald-300 dark:text-emerald-400">Blockchain Supply Chain</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Digital Transformation with Blockchain Technology
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Platform inovatif yang memberikan keamanan, transparansi, dan kepercayaan 
              dalam setiap transaksi bisnis UMKM.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0"></div>
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-emerald-400">1,234+</div>
                <div className="text-sm text-gray-300">UMKM Terdaftar</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400">98.7%</div>
                <div className="text-sm text-gray-300">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400">24/7</div>
                <div className="text-sm text-gray-300">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-emerald-500 to-sky-500 p-3 rounded-xl">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy-500 dark:text-white">TrustChain</h1>
                <p className="text-emerald-500 dark:text-emerald-400 text-sm">Blockchain Supply Chain</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-navy-500 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-400">Sign in to your TrustChain dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="demo@trustchain.id"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <KeyIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                  <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-emerald-500 hover:text-emerald-600 font-medium">
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg transform hover:scale-[1.02]"
              >
                Masuk ke Dashboard
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <Link to="/register" className="text-emerald-500 hover:text-emerald-600 font-medium">
                  Daftar sekarang
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-sky-50 rounded-lg border border-sky-200">
              <h4 className="text-sm font-semibold text-sky-800 mb-2">Demo Credentials:</h4>
              <div className="text-xs text-sky-700 space-y-1">
                <p><strong>Email:</strong> demo@trustchain.id</p>
                <p><strong>Password:</strong> demo123</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Dilindungi oleh teknologi blockchain • Privacy Policy • Terms of Service
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
