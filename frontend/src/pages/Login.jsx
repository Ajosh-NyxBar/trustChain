import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  KeyIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import blockIcon from '../assets/block.png';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toasts, removeToast, loginSuccess, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await login(formData);
      
      // Show success notification
      loginSuccess(response.user.first_name || response.user.email);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      error(err.message || 'Login gagal. Silakan periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: blockIcon,
      title: "Keamanan Blockchain",
      description: "Enkripsi tingkat militer dengan teknologi blockchain"
    },
    {
      icon: "📊",
      title: "Analytics Real-time",
      description: "Dashboard analytics untuk monitoring UMKM"
    },
    {
      icon: "⚡",
      title: "Verifikasi Instan",
      description: "Validasi transaksi dalam hitungan detik"
    },
    {
      icon: "🌐",
      title: "Transparansi Total",
      description: "Tracking end-to-end untuk setiap transaksi"
    }
  ];

  const stats = [
    { value: "2,500+", label: "UMKM Aktif", trend: "+15%" },
    { value: "99.9%", label: "Uptime", trend: "Reliable" },
    { value: "24/7", label: "Support", trend: "Always" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-all duration-500">
      {/* Left Panel - Modern Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-teal-600 p-8 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 bg-opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-3 rounded-xl shadow-lg">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  TrustChain
                </h1>
                <p className="text-emerald-200 text-base font-medium">Blockchain Supply Chain</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
              Revolusi Digital
              <span className="block text-emerald-300">
                untuk UMKM
              </span>
            </h2>
            <p className="text-lg text-gray-100 mb-8 leading-relaxed drop-shadow-sm">
              Platform terdepan yang mengintegrasikan blockchain untuk memberikan 
              transparansi, keamanan, dan kepercayaan dalam setiap transaksi bisnis.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white bg-opacity-90 backdrop-blur-lg p-4 rounded-xl border border-white border-opacity-50 hover:bg-opacity-95 transition-all duration-300 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {typeof feature.icon === 'string' && feature.icon.includes('.') ? (
                      <img src={feature.icon} alt={feature.title} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-2xl">{feature.icon}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-emerald-300 mb-1 drop-shadow-lg">{stat.value}</div>
                <div className="text-xs text-emerald-100 mb-1 drop-shadow-lg">{stat.label}</div>
                <div className="text-xs text-emerald-200 font-medium drop-shadow-lg">{stat.trend}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Modern Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  TrustChain
                </h1>
                <p className="text-emerald-500 text-sm font-medium">Blockchain Supply Chain</p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
            {/* Form Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-4">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Selamat Datang
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Masuk ke dashboard TrustChain Anda
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Email atau Username
                  </label>
                  <div className="relative group">
                    <UserIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white"
                      placeholder="demo@trustchain.id"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <KeyIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500 focus:ring-2 w-4 h-4" />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-medium">Ingat saya</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-600 font-bold transition-colors">
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 font-medium">atau</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                Belum punya akun?
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-2.5 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 space-x-2"
              >
                <span>Daftar Sekarang</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            {/* Demo Credentials */}
            <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-blue-200 dark:border-gray-600">
              <div className="flex items-center space-x-2 mb-2">
                <StarIcon className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Demo Credentials</h4>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="font-mono text-xs">demo@trustchain.id</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Password:</span>
                  <span className="font-mono text-xs">demo123</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>Dilindungi oleh teknologi blockchain</p>
            <div className="flex justify-center space-x-3 mt-1">
              <Link to="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-indigo-500 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Login;
