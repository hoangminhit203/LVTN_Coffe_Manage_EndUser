import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../components/Api/products';
import { orderApi } from '../components/Api/products';
import { isAuthenticated } from '../utils/auth';
import { FaShoppingCart, FaTruck, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingMethod: 'standard', // standard, express, overnight
  });

  // Shipping methods with costs
  const shippingMethods = [
    { id: 'standard', name: 'Giao hàng tiêu chuẩn', cost: 30000, days: '3-5 ngày' },
    { id: 'express', name: 'Giao hàng nhanh', cost: 50000, days: '1-2 ngày' },
    { id: 'overnight', name: 'Giao hàng trong ngày', cost: 80000, days: 'Trong ngày' },
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
      setError('');
      const data = await cartApi.getCart();
      
      if (!data || !data.items || data.items.length === 0) {
        setError('Giỏ hàng của bạn đang trống');
        setTimeout(() => navigate('/cart'), 2000);
        return;
      }

      setCart(data);
      // Pre-fill address if user has one
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      if (userInfo.address) {
        setFormData(prev => ({ ...prev, shippingAddress: userInfo.address }));
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải giỏ hàng');
      console.error('Cart load error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    if (!formData.shippingMethod) {
      setError('Vui lòng chọn phương thức vận chuyển');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const selectedShipping = shippingMethods.find(m => m.id === formData.shippingMethod);
      const shippingCost = selectedShipping?.cost || 0;
      
      // Calculate total amount (cart total + shipping cost)
      const totalAmount = (cart.totalPrice || 0) + shippingCost;
      
      // Map cart items to order items
      const orderItems = cart.items.map(item => ({
        productVariantId: item.productVariantId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtPurchase: item.productPrice,
        subtotal: item.subtotal,
      }));

      const orderData = {
        shippingMethod: formData.shippingMethod,
        shippingAddress: formData.shippingAddress,
        status: 'pending',
        totalAmount: totalAmount,
        finalAmount: totalAmount,
        itemCount: cart.items.length,
        orderItems: orderItems,
      };

      const result = await orderApi.createOrder(orderData);
      
      // Clear cart after successful order
      try {
        await cartApi.clearCart();
      } catch (clearErr) {
        console.error('Error clearing cart:', clearErr);
      }

      // Redirect to dashboard or order confirmation
      alert('Đặt hàng thành công!');
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Không thể đặt hàng. Vui lòng thử lại.');
      console.error('Order creation error', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const selectedShipping = shippingMethods.find(m => m.id === formData.shippingMethod);
  const shippingCost = selectedShipping?.cost || 0;
  const cartTotal = cart?.totalPrice || 0;
  const finalTotal = cartTotal + shippingCost;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto text-center">
            <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
            <button
              onClick={() => navigate('/cart')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaCreditCard className="text-blue-600" />
          Thanh toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-600" />
                Địa chỉ giao hàng
              </h2>
              <textarea
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                required
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập địa chỉ chi tiết (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
              />
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaTruck className="text-green-600" />
                Phương thức vận chuyển
              </h2>
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.shippingMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={formData.shippingMethod === method.id}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.days}</p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-600">{formatPrice(method.cost)}</p>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaShoppingCart className="text-blue-600" />
                Tóm tắt đơn hàng
              </h2>

              {/* Order Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      <p className="text-gray-600">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold">{formatPrice(shippingCost)}</span>
                </div>
                {selectedShipping && (
                  <div className="text-xs text-gray-500 mb-2">
                    ({selectedShipping.name})
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-2 mt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.shippingAddress.trim()}
                className="w-full mt-6 bg-[#E40046] text-white py-3 rounded-lg font-bold hover:bg-[#c5003a] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>

              <button
                onClick={() => navigate('/cart')}
                className="w-full mt-3 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

