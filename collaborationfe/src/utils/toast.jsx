import toast from 'react-hot-toast';
import React from 'react';
import CustomToast from '../components/common/CustomToast';

/**
 * Modern iOS-style Toast Notification System
 * Frosted glass effect with smooth animations
 */

// Default durations
const DURATIONS = {
  short: 2500,
  medium: 3500,
  long: 5000,
};

// Modern web-style design - clean and minimal
const STYLES = {
  success: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  error: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  warning: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  info: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  loading: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  },
};

// Icons are now handled by CustomToast component

/**
 * Show success toast
 */
export const showSuccess = (message, options = {}) => {
  return toast.custom(
    (t) => <CustomToast message={message} type="success" />,
    {
      duration: options.duration || DURATIONS.short,
      style: STYLES.success,
      className: 'modern-toast',
      position: 'top-center',
      ...options,
    }
  );
};

/**
 * Show error toast
 */
export const showError = (message, options = {}) => {
  return toast.custom(
    (t) => <CustomToast message={message} type="error" />,
    {
      duration: options.duration || DURATIONS.medium,
      style: STYLES.error,
      className: 'modern-toast',
      position: 'top-center',
      ...options,
    }
  );
};

/**
 * Show warning toast
 */
export const showWarning = (message, options = {}) => {
  return toast.custom(
    (t) => <CustomToast message={message} type="warning" />,
    {
      duration: options.duration || DURATIONS.medium,
      style: STYLES.warning,
      className: 'modern-toast',
      position: 'top-center',
      ...options,
    }
  );
};

/**
 * Show info toast
 */
export const showInfo = (message, options = {}) => {
  return toast.custom(
    (t) => <CustomToast message={message} type="info" />,
    {
      duration: options.duration || DURATIONS.medium,
      style: STYLES.info,
      className: 'modern-toast',
      position: 'top-center',
      ...options,
    }
  );
};

/**
 * Show loading toast
 */
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    icon: null,
    style: STYLES.loading,
    className: 'modern-toast modern-toast-loading',
    position: 'top-center',
    ...options,
  });
};

/**
 * Dismiss a toast by ID
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Specific error types with pre-configured styling
 */
export const showAccountNotFound = (message = 'Tài khoản không tồn tại') => {
  return toast.custom(
    (t) => <CustomToast message={message} type="error" />,
    {
      duration: DURATIONS.medium,
      style: STYLES.error,
      className: 'modern-toast',
      position: 'top-center',
    }
  );
};

export const showAccountLocked = (message = 'Tài khoản đã bị khóa') => {
  return toast.custom(
    (t) => <CustomToast message={message} type="locked" />,
    {
      duration: DURATIONS.long,
      style: STYLES.warning,
      className: 'modern-toast',
      position: 'top-center',
    }
  );
};

export const showWrongPassword = (message = 'Mật khẩu không đúng') => {
  return toast.custom(
    (t) => <CustomToast message={message} type="error" />,
    {
      duration: DURATIONS.medium,
      style: STYLES.error,
      className: 'modern-toast',
      position: 'top-center',
    }
  );
};

export const showNetworkError = (
  message = 'Không thể kết nối đến máy chủ'
) => {
  return toast.custom(
    (t) => <CustomToast message={message} type="network" />,
    {
      duration: DURATIONS.long,
      style: STYLES.error,
      className: 'modern-toast',
      position: 'top-center',
    }
  );
};

export const showServerError = (
  message = 'Lỗi hệ thống. Vui lòng thử lại sau'
) => {
  return toast.custom(
    (t) => <CustomToast message={message} type="server" />,
    {
      duration: DURATIONS.long,
      style: STYLES.error,
      className: 'modern-toast',
      position: 'top-center',
    }
  );
};

export const showValidationError = (
  message = 'Thông tin không hợp lệ'
) => {
  return toast.custom(
    (t) => <CustomToast message={message} type="warning" />,
    {
      duration: DURATIONS.medium,
      style: STYLES.warning,
      className: 'modern-toast',
      position: 'top-center',
    }
  );
};

/**
 * Handle API errors with appropriate toast
 */
export const handleApiError = (error, defaultMessage = 'Có lỗi xảy ra') => {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  switch (status) {
    case 404:
      return showError(detail || 'Không tìm thấy dữ liệu');
    case 403:
      return showAccountLocked(detail || 'Bạn không có quyền truy cập');
    case 401:
      return showError(detail || 'Phiên đăng nhập hết hạn');
    case 422:
      return showValidationError(detail || 'Dữ liệu không hợp lệ');
    case 500:
    case 502:
    case 503:
      return showServerError(detail);
    default:
      if (!error.response) {
        return showNetworkError();
      }
      return showError(detail || defaultMessage);
  }
};

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  dismiss: dismissToast,
  handleApiError,
  // Specific errors
  accountNotFound: showAccountNotFound,
  accountLocked: showAccountLocked,
  wrongPassword: showWrongPassword,
  networkError: showNetworkError,
  serverError: showServerError,
  validationError: showValidationError,
};
