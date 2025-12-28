import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, orderApi, paymentApi } from '../components/Api/products';
import { isAuthenticated } from '../utils/auth';
import { 
  FaTruck, FaMapMarkerAlt, FaCreditCard, 
  FaChevronLeft, FaShoppingBag, FaMoneyBillWave 
} from 'react-icons/fa';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Mặc định là COD
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingMethod: 'Standard',
  });

  const shippingMethods = [
    { id: 'Standard', name: 'Giao hàng tiêu chuẩn', cost: 30000, days: '3-5 ngày' },
    { id: 'Express', name: 'Giao hàng nhanh', cost: 50000, days: '1-2 ngày' },
  ];

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      const data = response.data || response;
      
      if (!data || !data.items || data.items.length === 0) {
        setError('Giỏ hàng của bạn đang trống');
        setTimeout(() => navigate('/cart'), 2000);
        return;
      }
      setCart(data);
      
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      if (userInfo.address) {
        setFormData(prev => ({ ...prev, shippingAddress: userInfo.address }));
      }
    } catch (err) {
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Tạo đơn hàng (Lấy orderId từ Backend)
      const orderData = {
        shippingMethod: formData.shippingMethod,
        shippingAddress: formData.shippingAddress,
      };
      
      const orderRes = await orderApi.createOrder(orderData);
      const orderId = orderRes?.data?.orderId || orderRes?.orderId || orderRes?.id || orderRes;

      // 2. Xử lý theo phương thức thanh toán
      if (paymentMethod === 'VNPAY') {
        const vnPayUrl = await paymentApi.createVnPayUrl(orderId);
        if (vnPayUrl) {
          // Xóa giỏ hàng trước khi nhảy sang VNPay
          await cartApi.clearCart();
          window.location.href = vnPayUrl;
        } else {
          throw new Error("Không thể khởi tạo link thanh toán VNPay");
        }
      } else {
        // Thanh toán COD
        await cartApi.clearCart();
        alert('Đặt hàng thành công! Vui lòng kiểm tra email xác nhận.');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xử lý đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-blue-600 font-bold">Đang tải đơn hàng...</div>;

  const selectedShipping = shippingMethods.find(m => m.id === formData.shippingMethod);
  const cartTotal = cart?.totalPrice || 0;
  const finalTotal = cartTotal + (selectedShipping?.cost || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header & Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <FaChevronLeft /> Quay lại giỏ hàng
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCreditCard className="text-blue-600" /> Thanh toán
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Thông tin sản phẩm */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600">
                <FaShoppingBag /> Sản phẩm trong đơn hàng
              </h2>
              <div className="divide-y divide-gray-100">
                {cart?.items.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {item.productImage && (
                        <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        <p className="text-xs text-gray-500 italic">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-700">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Địa chỉ nhận hàng */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                <FaMapMarkerAlt /> Địa chỉ nhận hàng
              </h2>
              <textarea
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                rows="2"
                placeholder="Nhập địa chỉ chi tiết của bạn..."
              />
            </div>

            {/* 3. Phương thức thanh toán */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-600">
                <FaMoneyBillWave /> Phương thức thanh toán
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'COD'} 
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div>
                    <p className="font-bold text-gray-800">Tiền mặt (COD)</p>
                    <p className="text-xs text-gray-500">Thanh toán khi nhận hàng</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'VNPAY'} 
                    onChange={() => setPaymentMethod('VNPAY')}
                  />
                  <div>
                    <p className="font-bold text-red-600 text-lg italic">VN<span className="text-blue-600">PAY</span></p>
                    <p className="text-xs text-gray-500">Ví điện tử / Thẻ ATM</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Tổng kết & Đặt hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Tổng kết chi phí</h2>
              
              {/* Vận chuyển */}
              <div className="mb-6 space-y-4">
                <p className="text-sm font-semibold text-gray-700">Đơn vị vận chuyển:</p>
                {shippingMethods.map((method) => (
                  <label key={method.id} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer ${formData.shippingMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                    <input type="radio" name="shippingMethod" value={method.id} checked={formData.shippingMethod === method.id} onChange={handleChange} className="hidden" />
                    <span className="text-sm">{method.name}</span>
                    <span className="text-sm font-bold">+{formatPrice(method.cost)}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tiền hàng:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Phí ship:</span>
                  <span>{formatPrice(selectedShipping?.cost)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-800 border-t pt-3">
                  <span>Tổng:</span>
                  <span className="text-red-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {error && <p className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 italic">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                  paymentMethod === 'VNPAY' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                } disabled:bg-gray-300 disabled:shadow-none`}
              >
                {submitting ? 'ĐANG XỬ LÝ...' : (paymentMethod === 'VNPAY' ? 'THANH TOÁN VNPAY' : 'XÁC NHẬN ĐẶT HÀNG')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;