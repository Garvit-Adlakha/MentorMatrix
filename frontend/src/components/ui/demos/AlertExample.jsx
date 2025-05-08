import React, { useState } from 'react';
import AlertBox from './AlertBox';

const AlertExample = () => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('info');
  const [alertConfig, setAlertConfig] = useState({
    title: 'Confirmation',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  });

  const handleConfirm = () => {
    console.log('Action confirmed!');
    // Perform your confirmed action here
  };

  const openAlert = (type) => {
    setAlertType(type);
    
    // Configure alert based on type
    switch(type) {
      case 'success':
        setAlertConfig({
          title: 'Success Confirmation',
          message: 'Are you sure you want to approve this project?',
          confirmText: 'Approve',
          cancelText: 'Cancel',
        });
        break;
      case 'warning':
        setAlertConfig({
          title: 'Warning',
          message: 'This action will cancel your current progress. Are you sure?',
          confirmText: 'Yes, Cancel',
          cancelText: 'No, Continue',
        });
        break;
      case 'error':
        setAlertConfig({
          title: 'Delete Confirmation',
          message: 'This action cannot be undone. Are you sure you want to delete?',
          confirmText: 'Delete',
          cancelText: 'Cancel',
        });
        break;
      default:
        setAlertConfig({
          title: 'Confirmation',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
        });
    }
    
    setIsAlertOpen(true);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Alert Examples</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => openAlert('info')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Info Alert
        </button>
        
        <button
          onClick={() => openAlert('success')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Success Alert
        </button>
        
        <button
          onClick={() => openAlert('warning')}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
        >
          Warning Alert
        </button>
        
        <button
          onClick={() => openAlert('error')}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Error Alert
        </button>
      </div>
      
      <AlertBox
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        type={alertType}
      />
    </div>
  );
};

export default AlertExample;