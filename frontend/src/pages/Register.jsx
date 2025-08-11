import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  KeyIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import blockIcon from '../assets/block.png';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: '',
    email: '',
    phone: '',
    
    // Step 2: Business Info
    businessName: '',
    businessType: '',
    businessAddress: '',
    
    // Step 3: Account Security
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreePrivacy: false
  });

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const validatePassword = (password) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration process
    setTimeout(() => {
      console.log('Registration attempt:', formData);
      setIsLoading(false);
      // Redirect to success page or login
    }, 2000);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const businessTypes = [
    'Retail/Perdagangan',
    'Manufaktur',
    'Jasa',
    'Teknologi',
    'Makanan & Minuman',
    'Fashion',
    'Pertanian',
    'Lainnya'
  ];

  const features = [
    {
      icon: "🚀",
      title: "Setup Instan",
      description: "Mulai dalam hitungan menit, bukan hari"
    },
    {
      icon: "💎",
      title: "Gratis Selamanya",
      description: "Tidak ada biaya tersembunyi atau langganan"
    },
    {
      icon: blockIcon,
      title: "Keamanan Terjamin",
      description: "Enkripsi end-to-end untuk semua data"
    },
    {
      icon: "📈",
      title: "Skalabilitas",
      description: "Tumbuh bersama bisnis Anda"
    }
  ];

  const PasswordStrengthIndicator = ({ validation }) => {
    const requirements = [
      { key: 'length', text: 'Minimal 8 karakter', valid: validation.length },
      { key: 'uppercase', text: 'Huruf besar', valid: validation.uppercase },
      { key: 'lowercase', text: 'Huruf kecil', valid: validation.lowercase },
      { key: 'number', text: 'Angka', valid: validation.number },
      { key: 'special', text: 'Karakter khusus', valid: validation.special }
    ];

    return (
      <div className="mt-3 space-y-2">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center space-x-2 text-sm">
            {req.valid ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            )}
            <span className={req.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-3 mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            step === currentStep 
              ? 'bg-indigo-500 text-white' 
              : step < currentStep 
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
          }`}>
            {step < currentStep ? <CheckCircleIcon className="h-5 w-5" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-8 h-1 mx-2 ${
              step < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Informasi Personal
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Berikan informasi dasar tentang diri Anda
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <div className="relative group">
                <UserIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <EnvelopeIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nomor Telepon
              </label>
              <div className="relative group">
                <PhoneIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  placeholder="+62 812-3456-7890"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Informasi Bisnis
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ceritakan tentang bisnis UMKM Anda
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nama Bisnis
              </label>
              <div className="relative group">
                <BuildingOfficeIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  placeholder="PT. Contoh Bisnis Indonesia"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Jenis Bisnis
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Pilih jenis bisnis</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Alamat Bisnis
              </label>
              <textarea
                value={formData.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white resize-none"
                rows="2"
                placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Keamanan Akun
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Buat password yang kuat untuk akun Anda
              </p>
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
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  placeholder="Buat password yang kuat"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {Object.values(passwordValidation).map((valid, index) => (
                    <div key={index} className={`h-1 rounded ${valid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative group">
                <KeyIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  placeholder="Ulangi password Anda"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">Password tidak cocok</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-start cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500 focus:ring-2 w-4 h-4 mt-0.5" 
                  required
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Saya setuju dengan{' '}
                  <Link to="/terms" className="text-indigo-500 hover:text-indigo-600 font-medium">
                    Syarat dan Ketentuan
                  </Link>
                </span>
              </label>

              <label className="flex items-start cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.agreePrivacy}
                  onChange={(e) => handleInputChange('agreePrivacy', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500 focus:ring-2 w-4 h-4 mt-0.5" 
                  required
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Saya setuju dengan{' '}
                  <Link to="/privacy" className="text-indigo-500 hover:text-indigo-600 font-medium">
                    Kebijakan Privasi
                  </Link>
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-all duration-500">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 bg-opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-3 rounded-xl shadow-lg">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  TrustChain
                </h1>
                <p className="text-blue-200 text-base font-medium">Blockchain Supply Chain</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
              Bergabung dengan
              <span className="block text-blue-300">
                Revolusi Digital
              </span>
            </h2>
            <p className="text-lg text-gray-100 mb-8 leading-relaxed drop-shadow-sm">
              Daftarkan UMKM Anda dan rasakan keuntungan teknologi blockchain 
              untuk transparansi dan keamanan bisnis yang tak tertandingi.
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

          {/* Success Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-300 mb-1 drop-shadow-lg">2,500+</div>
              <div className="text-xs text-emerald-100 drop-shadow-lg">UMKM Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-300 mb-1 drop-shadow-lg">100%</div>
              <div className="text-xs text-emerald-100 drop-shadow-lg">Gratis Setup</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-xl">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  TrustChain
                </h1>
                <p className="text-blue-500 text-sm font-medium">Blockchain Supply Chain</p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl mb-4">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Daftar Sekarang
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Mulai perjalanan digital UMKM Anda
              </p>
            </div>

            {/* Step Indicator */}
            <StepIndicator />

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center justify-center px-4 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200 space-x-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Kembali</span>
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white font-bold py-2.5 px-6 rounded-lg hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Lanjutkan
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !formData.agreeTerms || !formData.agreePrivacy || formData.password !== formData.confirmPassword}
                    className="flex-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white font-bold py-2.5 px-6 rounded-lg hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <span>Buat Akun</span>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-5 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-indigo-500 hover:text-indigo-600 font-bold transition-colors">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>Dengan mendaftar, Anda setuju dengan ketentuan kami</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
