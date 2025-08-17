import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Toast = ({ 
  message, 
  type = 'success', 
  duration = 5000, 
  onClose,
  title,
  action
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-gradient-to-r from-emerald-500 to-green-500',
          borderColor: 'border-emerald-200',
          textColor: 'text-white',
          iconBg: 'bg-white bg-opacity-20',
          progressBar: 'bg-emerald-200'
        };
      case 'error':
        return {
          icon: XCircleIcon,
          bgColor: 'bg-gradient-to-r from-red-500 to-pink-500',
          borderColor: 'border-red-200',
          textColor: 'text-white',
          iconBg: 'bg-white bg-opacity-20',
          progressBar: 'bg-red-200'
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
          borderColor: 'border-amber-200',
          textColor: 'text-white',
          iconBg: 'bg-white bg-opacity-20',
          progressBar: 'bg-amber-200'
        };
      case 'info':
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          borderColor: 'border-blue-200',
          textColor: 'text-white',
          iconBg: 'bg-white bg-opacity-20',
          progressBar: 'bg-blue-200'
        };
      default:
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-gradient-to-r from-emerald-500 to-green-500',
          borderColor: 'border-emerald-200',
          textColor: 'text-white',
          iconBg: 'bg-white bg-opacity-20',
          progressBar: 'bg-emerald-200'
        };
    }
  };

  if (!isVisible) return null;

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    }`}>
      <div className={`
        max-w-sm w-full ${config.bgColor} border ${config.borderColor} 
        rounded-xl shadow-lg backdrop-blur-sm relative overflow-hidden
        animate-bounce-in
      `}>
        {/* Sparkle Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <SparklesIcon className="absolute top-2 right-12 w-4 h-4 text-white opacity-50 animate-pulse" />
          <SparklesIcon className="absolute bottom-3 left-8 w-3 h-3 text-white opacity-30 animate-pulse delay-500" />
          <SparklesIcon className="absolute top-6 left-4 w-2 h-2 text-white opacity-40 animate-pulse delay-1000" />
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 w-full">
          <div 
            className={`h-full ${config.progressBar} animate-progress`}
            style={{
              animation: `progressBar ${duration}ms linear forwards`
            }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${config.iconBg} rounded-lg p-2 mr-3`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className={`text-sm font-bold ${config.textColor} mb-1`}>
                  {title}
                </h4>
              )}
              <p className={`text-sm ${config.textColor} leading-relaxed`}>
                {message}
              </p>
              
              {action && (
                <div className="mt-3">
                  <button
                    onClick={action.onClick}
                    className="text-sm font-medium text-white underline hover:no-underline transition-all"
                  >
                    {action.label}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes bounce-in {
          0% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(-10px) scale(1.05);
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-progress {
          animation: progressBar ${duration}ms linear forwards;
        }
      `}</style>
    </div>
  );
};

// Toast Container untuk mengelola multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;
