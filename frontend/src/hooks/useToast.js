import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({
    message,
    type = 'success',
    title,
    duration = 5000,
    action
  }) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      title,
      duration,
      action
    };

    setToasts(prevToasts => [...prevToasts, toast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return addToast({
      message,
      type: 'success',
      title: '🎉 Berhasil!',
      ...options
    });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({
      message,
      type: 'error',
      title: '❌ Terjadi Kesalahan',
      duration: 7000,
      ...options
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({
      message,
      type: 'warning',
      title: '⚠️ Peringatan',
      ...options
    });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({
      message,
      type: 'info',
      title: 'ℹ️ Informasi',
      ...options
    });
  }, [addToast]);

  // Special notification for login success
  const loginSuccess = useCallback((username) => {
    return addToast({
      message: `Selamat datang kembali, ${username}! Dashboard Anda sudah siap.`,
      type: 'success',
      title: '🚀 Login Berhasil!',
      duration: 6000,
      action: {
        label: 'Lihat Dashboard',
        onClick: () => window.location.href = '/dashboard'
      }
    });
  }, [addToast]);

  // Special notification for registration success
  const registerSuccess = useCallback((email) => {
    return addToast({
      message: `Akun Anda telah dibuat! Silakan cek email ${email} untuk verifikasi.`,
      type: 'success',
      title: '🎊 Registrasi Berhasil!',
      duration: 8000,
      action: {
        label: 'Login Sekarang',
        onClick: () => window.location.href = '/login'
      }
    });
  }, [addToast]);

  // Special notification for blockchain transaction
  const blockchainSuccess = useCallback((transactionHash) => {
    return addToast({
      message: `Transaksi blockchain berhasil dicatat dengan hash: ${transactionHash.slice(0, 10)}...`,
      type: 'success',
      title: '⛓️ Blockchain Updated!',
      duration: 10000,
      action: {
        label: 'Lihat Transaksi',
        onClick: () => window.location.href = `/transactions/${transactionHash}`
      }
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    loginSuccess,
    registerSuccess,
    blockchainSuccess
  };
};

export default useToast;
