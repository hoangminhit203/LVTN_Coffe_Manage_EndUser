import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, paymentApi } from '../components/Api/products';
import orderApi from '../components/Api/order';
import shippingAddressApi from '../components/Api/ShippingAddress';
import { isAuthenticated } from '../utils/auth';
import { 
  FaTruck, FaMapMarkerAlt, FaCreditCard, 
  FaChevronLeft, FaShoppingBag, FaMoneyBillWave, FaPlus 
} from 'react-icons/fa';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shippingMethod: 'GHTK',
    voucherCode: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCart();
    fetchAddresses();
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
    } catch (err) {
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await shippingAddressApi.getAll();
      const addressList = response.data || [];
      setAddresses(addressList);
      
      // Tự động chọn địa chỉ mặc định
      const defaultAddr = addressList.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        calculateShippingFee(defaultAddr.fullAddress);
      }
    } catch (err) {
      console.error('Không thể tải địa chỉ:', err);
    }
  };

  const calculateShippingFee = (address) => {
    if (!address) {
      setShippingFee(30000);
      return;
    }
    
    const addressLower = address.toLowerCase();
    if (addressLower.includes('hồ chí minh') || addressLower.includes('hcm') || addressLower.includes('tp hcm') || addressLower.includes('sài gòn')) {
      setShippingFee(15000);
    } else if (addressLower.includes('hà nội') || addressLower.includes('hanoi')) {
      setShippingFee(25000);
    } else {
      setShippingFee(30000);
    }
  };

  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddr = addresses.find(a => a.id === addressId);
    if (selectedAddr) {
      calculateShippingFee(selectedAddr.fullAddress);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setError('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Chuẩn bị dữ liệu order items từ cart
      const orderItems = cart.items.map(item => ({
        productVariantId: item.productVariantId || item.id,
        quantity: item.quantity
      }));

      // Tạo đơn hàng
      const orderData = {
        shippingAddressId: selectedAddressId,
        shippingAddress: null,
        shippingMethod: formData.shippingMethod,
        voucherCode: formData.voucherCode || '',
        note: note || '',
        orderItems: orderItems
      };
      
      const orderRes = await orderApi.create(orderData);
      const orderId = orderRes?.data?.id || orderRes?.id;

      // Xử lý theo phương thức thanh toán
      if (paymentMethod === 'VNPAY') {
        const vnPayUrl = await paymentApi.createVnPayUrl(orderId);
        if (vnPayUrl) {
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

  const cartTotal = cart?.totalPrice || 0;
  const finalTotal = cartTotal + shippingFee;

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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                  <FaMapMarkerAlt /> Địa chỉ nhận hàng
                </h2>
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <FaPlus size={10} /> Thêm địa chỉ mới
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label 
                      key={addr.id}
                      className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedAddressId === addr.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input 
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => handleAddressChange(addr.id)}
                        className="hidden"
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-800">{addr.receiverName || 'Người nhận'}</p>
                          <p className="text-sm text-gray-600">{addr.phone}</p>
                          <p className="text-sm text-gray-500 mt-1">{addr.fullAddress}</p>
                        </div>
                        {addr.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Mặc định</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Ghi chú đơn hàng */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                📝 Ghi chú đơn hàng
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                rows="2"
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
              />
            </div>

            {/* 4. Phương thức thanh toán */}
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

          {/* 5. Tổng kết & Đặt hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Tổng kết chi phí</h2>
              
              {/* Thông tin vận chuyển */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                  <FaTruck /> Đơn vị vận chuyển
                </div>
                <p className="text-sm text-gray-700">{formData.shippingMethod}</p>
                <p className="text-xs text-gray-500 mt-1">Phí ship: {formatPrice(shippingFee)}</p>
              </div>

              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tiền hàng:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Phí ship:</span>
                  <span>{formatPrice(shippingFee)}</span>
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