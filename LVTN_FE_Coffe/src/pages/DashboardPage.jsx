import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../components/Api/user';
import { cartApi } from '../components/Api/products';
import { isAuthenticated, logout, getUserFromToken } from '../utils/auth';
import { FaBox, FaCalendarAlt, FaDollarSign, FaSignOutAlt, FaShoppingCart, FaTrash, FaArrowRight } from 'react-icons/fa';

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchOrders();
    fetchCart();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await userApi.getOrders();
      // Handle different response formats
      const ordersList = Array.isArray(data) ? data : data?.data || data?.orders || [];
      setOrders(ordersList);
    } catch (err) {
      setError(err?.message || 'Không thể tải lịch sử đơn hàng');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      // Cart error is not critical, just set to null
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) return;

    try {
      await cartApi.clearCart();
      await fetchCart();
      alert('Đã xóa giỏ hàng thành công!');
    } catch (err) {
      alert(err?.message || 'Không thể xóa giỏ hàng');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const color = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
        {status || 'Chưa xác định'}
      </span>
    );
  };

  const user = getUserFromToken();
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
              <p className="text-gray-600">
                Chào mừng, {userInfo?.fullName || userInfo?.name || user?.name || 'Người dùng'}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{orders.length}</p>
              </div>
              <FaBox className="text-3xl text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(
                    orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0)
                  )}
                </p>
              </div>
              <FaDollarSign className="text-3xl text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đơn hàng gần nhất</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {orders.length > 0 ? formatDate(orders[0]?.orderDate || orders[0]?.createdAt) : 'Chưa có'}
                </p>
              </div>
              <FaCalendarAlt className="text-3xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Current Cart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaShoppingCart className="text-blue-600" />
              Giỏ hàng hiện tại
            </h2>
            {cart && cart.items && cart.items.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleClearCart}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  <FaTrash /> Xóa giỏ hàng
                </button>
                <Link
                  to="/cart"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  Xem chi tiết <FaArrowRight />
                </Link>
              </div>
            )}
          </div>

          {cartLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Đang tải giỏ hàng...</p>
            </div>
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FaShoppingCart className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
              <Link
                to="/product-list"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div>
              {/* Cart Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Số lượng sản phẩm</p>
                  <p className="text-lg font-bold text-gray-800">{cart.items.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng tiền</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(cart.totalPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    cart.status === 'active' || cart.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {cart.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-3">
                {cart.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.productName || 'Sản phẩm'}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>Giá: {formatCurrency(item.productPrice)}</span>
                          <span className="mx-2">•</span>
                          <span>Số lượng: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                      Và {cart.items.length - 3} sản phẩm khác...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch sử mua hàng</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Thử lại
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <FaBox className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id || order.orderId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Đơn hàng #{order.id || order.orderId || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <FaCalendarAlt className="inline mr-1" />
                        {formatDate(order.orderDate || order.createdAt || order.date)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="mb-3">
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.productName || item.name} x {item.quantity || 1}
                            </span>
                            <span className="text-gray-600">
                              {formatCurrency(item.price || item.unitPrice || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Không có thông tin sản phẩm</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div>
                      {order.shippingAddress && (
                        <p className="text-xs text-gray-500">
                          Địa chỉ: {order.shippingAddress}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tổng cộng:</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(order.totalAmount || order.total || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

