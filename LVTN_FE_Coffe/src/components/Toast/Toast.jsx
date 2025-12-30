import { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const config = {
    success: {
      icon: FaCheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      iconColor: 'text-green-500',
      textColor: 'text-green-800',
    },
    error: {
      icon: FaExclamationCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
      textColor: 'text-red-800',
    },
    warning: {
      icon: FaExclamationTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-800',
    },
    info: {
      icon: FaInfoCircle,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-800',
    },
  };

  const currentConfig = config[type] || config.info;
  const Icon = currentConfig.icon;

  return (
    <div
      className={`
        ${currentConfig.bgColor} ${currentConfig.borderColor} 
        border-l-4 rounded-lg shadow-lg p-4 mb-2 
        flex items-start gap-3 min-w-[320px] max-w-md
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <Icon className={`${currentConfig.iconColor} text-xl flex-shrink-0 mt-0.5`} />
      
      <div className="flex-1">
        <p className={`${currentConfig.textColor} text-sm font-medium whitespace-pre-line leading-relaxed`}>
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className={`${currentConfig.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <FaTimes size={14} />
      </button>
    </div>
  );
};

export default Toast;
