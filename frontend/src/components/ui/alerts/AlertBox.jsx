import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

/**
 * Enhanced AlertBox component for displaying various types of alerts
 * @param {boolean} isOpen - Controls visibility of the alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {function} onClose - Close handler
 * @param {function} onConfirm - Confirm action handler
 * @param {string} type - Alert type: 'info', 'success', 'warning', 'error'
 */
const AlertBox = ({ 
  isOpen, 
  title = 'Alert', 
  message = 'This is an alert message', 
  onClose, 
  onConfirm, 
  type = 'info' 
}) => {
  if (!isOpen) return null;
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          variant: 'success'
        };
      case 'warning':
        return {
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.93 2.93L2.93 10.93C1.68 12.18 1.68 14.18 2.93 15.43L10.93 23.43C12.18 24.68 14.18 24.68 15.43 23.43L23.43 15.43C24.68 14.18 24.68 12.18 23.43 10.93L15.43 2.93C14.18 1.68 12.18 1.68 10.93 2.93Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          variant: 'warning'
        };
      case 'error':
        return {
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.29 3.85999L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64149 19.6871 1.81442 19.9905C1.98735 20.2939 2.23672 20.5467 2.53773 20.7239C2.83875 20.9012 3.18058 20.9962 3.53 21H20.47C20.8194 20.9962 21.1613 20.9012 21.4623 20.7239C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.4471 18.6453 22.3546 18.3024 22.18 18L13.71 3.85999C13.5317 3.5661 13.2807 3.32311 12.9812 3.15447C12.6817 2.98584 12.3435 2.89725 12 2.89725C11.6565 2.89725 11.3183 2.98584 11.0188 3.15447C10.7193 3.32311 10.4683 3.5661 10.29 3.85999V3.85999Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          variant: 'error'
        };
      default:
        return {
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          variant: 'info'
        };
    }
  };

  const styles = getAlertStyles();
  
  return createPortal(
    <div
      className="alert-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-message"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`alert-box alert-box--${styles.variant}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Alert Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="alert-icon">
              {styles.icon}
            </div>
            <h3 
              id="alert-title"
              className="alert-title"
            >
              {title}
            </h3>
          </div>

          {/* Alert Message */}
          <div id="alert-message" className="alert-message">
            {message}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="alert-cancel">
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className={`alert-confirm alert-confirm--${styles.variant}`}
            >
              Confirm
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default AlertBox;