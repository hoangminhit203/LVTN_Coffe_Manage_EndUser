import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận', 
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning' // warning, danger, info
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
    },
    danger: {
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      buttonColor: 'bg-red-500 hover:bg-red-600'
    },
    info: {
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`${config.bgColor} p-3 rounded-full flex-shrink-0`}>
              <FaExclamationTriangle className={`${config.iconColor} text-2xl`} />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 ${config.buttonColor} text-white rounded-xl font-medium transition-colors shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
