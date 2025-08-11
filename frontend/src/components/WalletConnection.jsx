import React, { useState } from 'react';
import { 
  WalletIcon, 
  ChevronDownIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LinkIcon,
  XMarkIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useWeb3 } from '../hooks/useWeb3';
import { formatAddress, getNetworkInfo } from '../utils/web3';
import MetaMaskGuide from './MetaMaskGuide';

const WalletConnection = ({ className = "" }) => {
  const {
    account,
    network,
    isConnecting,
    error,
    isCorrectNetwork,
    isMetaMaskInstalled,
    connect,
    disconnect,
    switchNetwork,
    clearError
  } = useWeb3();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleConnect = async () => {
    // Clear any existing errors before attempting connection
    clearError();
    await connect();
    setShowDropdown(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const handleSwitchNetwork = async () => {
    await switchNetwork();
    setShowDropdown(false);
  };

  const getNetworkDisplay = () => {
    if (!network) return 'No Network';
    const networkInfo = getNetworkInfo(network.chainId);
    return networkInfo ? networkInfo.name : `Chain ${network.chainId}`;
  };

  const getStatusColor = () => {
    if (!account) return 'bg-gray-500';
    if (!isCorrectNetwork) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!account) return 'Not Connected';
    if (!isCorrectNetwork) return 'Wrong Network';
    return 'Connected';
  };

  // Error Toast
  const ErrorToast = () => {
    if (!error) return null;

    const isConnectionError = error.includes('Connection canceled') || 
                             error.includes('Connection was canceled') ||
                             error.includes('User rejected') ||
                             error.includes('already pending') || 
                             error.includes('unlock');

    const isRetriableError = error.includes('Connection canceled') || 
                            error.includes('Connection was canceled') ||
                            error.includes('User rejected') ||
                            error.includes('unlock') ||
                            error.includes('Internal error');

    return (
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Wallet Connection Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
              {isRetriableError && !account && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      clearError();
                      handleConnect();
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                  {error.includes('already pending') && (
                    <button
                      onClick={() => {
                        clearError();
                        window.open('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/popup.html', '_blank');
                      }}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-700 transition-colors"
                    >
                      Open MetaMask
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={clearError}
              className="ml-3 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // MetaMask Not Installed
  if (!isMetaMaskInstalled) {
    return (
      <>
        <ErrorToast />
        <div className={`${className}`}>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  MetaMask Required
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Please install MetaMask to connect to TrustChain
                </p>
              </div>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
              >
                Install MetaMask
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ErrorToast />
      <div className={`relative ${className}`}>
        {/* Main Connection Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (!account) {
                handleConnect();
              } else {
                setShowDropdown(!showDropdown);
              }
            }}
            disabled={isConnecting}
            className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isConnecting ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <WalletIcon className="h-5 w-5" />
            )}
            
            <div className="flex items-center space-x-2">
              {account ? (
                <>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                  <span>{formatAddress(account)}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </>
              ) : (
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              )}
            </div>
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowGuide(true)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Connection Help"
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && account && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-4">
              {/* Account Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getStatusText()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getNetworkDisplay()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Account Address */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {account}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(account)}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Copy address"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Network Status */}
              <div className="mb-4">
                {isCorrectNetwork ? (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span className="text-sm">Connected to {getNetworkDisplay()}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span className="text-sm">Wrong network detected</span>
                    </div>
                    <button
                      onClick={handleSwitchNetwork}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Switch to Mumbai Testnet
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const networkInfo = getNetworkInfo(network?.chainId);
                    if (networkInfo?.blockExplorer) {
                      window.open(`${networkInfo.blockExplorer}/address/${account}`, '_blank');
                    }
                  }}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  View on Explorer
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* MetaMask Guide Modal */}
      <MetaMaskGuide 
        isVisible={showGuide} 
        onClose={() => setShowGuide(false)} 
      />
    </>
  );
};

export default WalletConnection;
