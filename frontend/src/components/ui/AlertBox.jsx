import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

const AlertBox = ({ 
  isOpen = false, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "info" // Can be info, success, warning, error
}) => {
  
  // Close on Escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Prevent scrolling when alert is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Get alert type colors
  const getTypeStyles = () => {
    switch(type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          icon: (
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ),
          confirmBtn: 'bg-green-600 hover:bg-green-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          icon: (
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          ),
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          icon: (
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ),
          confirmBtn: 'bg-red-600 hover:bg-red-700'
        };
      default: // info
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          icon: (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
          confirmBtn: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const typeStyles = getTypeStyles();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-lg shadow-3xl bg-opacity-50 transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Alert Dialog */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`relative transform overflow-hidden rounded-lg ${typeStyles.bg} border ${typeStyles.border} shadow-xl transition-all sm:w-full sm:max-w-lg`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              {typeStyles.icon}
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            
            {/* Message */}
            <div className="mt-2">
              <p className="text-sm text-gray-700">{message}</p>
            </div>
            
            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={onClose}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`inline-flex justify-center rounded-md border border-transparent ${typeStyles.confirmBtn} px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('portal-root') 
  )
}

export default AlertBox