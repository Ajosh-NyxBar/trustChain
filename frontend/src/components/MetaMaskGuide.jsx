import React, { useState } from 'react';
import {
  InformationCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MetaMaskGuide = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <InformationCircleIcon className="h-8 w-8 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                MetaMask Connection Guide
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Common Issues */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Common Connection Issues
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      "User rejected the request"
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      This happens when you click "Cancel" or "Reject" in MetaMask. 
                      Simply click "Connect Wallet" again and approve the connection.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      "Request already pending"
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      MetaMask has a pending request. Check your MetaMask extension 
                      and complete any pending actions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      "Please unlock your MetaMask wallet"
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      MetaMask is locked. Click on the MetaMask extension and enter 
                      your password to unlock it.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step by Step Guide */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                How to Connect Successfully
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Make sure MetaMask is installed and unlocked
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      If you don't have MetaMask, download it from{" "}
                      <a 
                        href="https://metamask.io/download/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        metamask.io
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Click "Connect Wallet" in TrustChain
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      This will open a MetaMask popup asking for permission to connect.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Review and approve the connection in MetaMask
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Select the account you want to connect and click "Connect" or "Approve".
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Switch to Polygon Mumbai testnet (if prompted)
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      TrustChain uses Mumbai testnet for testing. Approve the network switch when requested.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Tips for Success
              </h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Always read MetaMask popup messages carefully before clicking
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    If you accidentally reject, just try connecting again
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Make sure you have some test MATIC tokens for Mumbai testnet
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Keep MetaMask extension pinned to your browser toolbar for easy access
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href="https://faucet.polygon.technology/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
              >
                Get test MATIC tokens →
              </a>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskGuide;
