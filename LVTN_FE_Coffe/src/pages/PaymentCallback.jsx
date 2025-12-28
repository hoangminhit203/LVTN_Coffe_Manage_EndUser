import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentApi } from '../components/Api/products';

const PaymentCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, fail

  useEffect(() => {
    const handleVerify = async () => {
      try {
        // Gửi toàn bộ đoạn ?vnp_Amount=...&vnp_ResponseCode=... về cho Backend
        const result = await paymentApi.verifyCallback(location.search);
        
        // Backend của bạn nên trả về kết quả dựa trên vnp_ResponseCode
        // Giả sử 00 là thành công
        if (result.success || result.includes("00")) {
          setStatus('success');
        } else {
          setStatus('fail');
        }
      } catch (error) {
        console.error("Xác thực thanh toán thất bại", error);
        setStatus('fail');
      }
    };

    handleVerify();
  }, [location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Đang xác thực giao dịch...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-6">Đơn hàng của bạn đã được xác nhận và đang được xử lý.</p>
            <button onClick={() => navigate('/dashboard')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
              Xem đơn hàng của tôi
            </button>
          </>
        )}

        {status === 'fail' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-6">Giao dịch bị hủy hoặc có lỗi xảy ra. Vui lòng thử lại.</p>
            <div className="flex gap-4">
              <button onClick={() => navigate('/cart')} className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-bold">
                Về giỏ hàng
              </button>
              <button onClick={() => navigate('/checkout')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">
                Thử lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;