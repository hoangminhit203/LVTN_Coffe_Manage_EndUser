import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, orderApi } from '../components/Api/products';
import { isAuthenticated } from '../utils/auth';
import { FaShoppingCart, FaTruck, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Dữ liệu Form - Lưu ý: 'standard' sẽ được gửi đi
  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingMethod: 'Standard', // Để mặc định là Standard (viết hoa chữ đầu cho đẹp)
  });

  const shippingMethods = [
    { id: 'Standard', name: 'Giao hàng tiêu chuẩn', cost: 30000, days: '3-5 ngày' },
    { id: 'Express', name: 'Giao hàng nhanh', cost: 50000, days: '1-2 ngày' },
    { id: 'Overnight', name: 'Giao hàng trong ngày', cost: 80000, days: 'Trong ngày' },
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
      // Tùy vào API trả về response.data hay response trực tiếp
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
      // GIẢI PHÁP SỬA LỖI 400: Tạo URLSearchParams với tên biến viết HOA khớp với Backend
      const params = new URLSearchParams();
      params.append('ShippingMethod', formData.shippingMethod);
      params.append('ShippingAddress', formData.shippingAddress);
      
      // Nếu bạn có shippingAddressId trong DB, hãy thêm logic ở đây (như đã thảo luận trước đó)
      // params.append('ShippingAddressId', formData.shippingAddressId || '');

      // Gửi request với chuỗi params: ?ShippingMethod=...&ShippingAddress=...
      await orderApi.createOrder(params.toString());
      
      await cartApi.clearCart();
      alert('Đặt hàng thành công!');
      navigate('/dashboard');
    } catch (err) {
      // Lấy thông báo lỗi chi tiết từ server
      const serverMsg = err.response?.data?.errors?.ShippingMethod?.[0] || 
                        err.response?.data?.title || 
                        'Không thể đặt hàng. Vui lòng thử lại.';
      setError(serverMsg);
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaCreditCard className="text-blue-600" /> Thanh toán đơn hàng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                <FaMapMarkerAlt /> Địa chỉ nhận hàng
              </h2>
              <textarea
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                rows="3"
                placeholder="Nhập địa chỉ chi tiết của bạn..."
              />
            </div>

            {/* Shipping Method Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
                <FaTruck /> Đơn vị vận chuyển
              </h2>
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <label key={method.id} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.shippingMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shippingMethod" value={method.id} checked={formData.shippingMethod === method.id} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-gray-800">{method.name}</p>
                        <p className="text-xs text-gray-500 italic">Dự kiến: {method.days}</p>
                      </div>
                    </div>
                    <span className="font-bold text-blue-600">+{formatPrice(method.cost)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2">Tóm tắt chi phí</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tiền hàng:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(selectedShipping?.cost)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-800 border-t pt-3">
                  <span>Tổng tiền:</span>
                  <span className="text-red-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {error && <p className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 italic">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-gray-300 disabled:shadow-none"
              >
                {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;