import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../components/Api/products';
import { FaShoppingCart, FaTrash, FaBox } from 'react-icons/fa';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      setError(err?.message || 'Không thể tải giỏ hàng');
      console.error('Cart load error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) return;

    try {
      await cartApi.clearCart();
      setCart({ ...cart, items: [], totalPrice: 0 });
      alert('Đã xóa giỏ hàng thành công!');
      // Refresh cart để lấy trạng thái mới
      await fetchCart();
    } catch (err) {
      alert(err?.message || 'Không thể xóa giỏ hàng');
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải giỏ hàng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="text-center py-8">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Không thể tải giỏ hàng</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchCart}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaShoppingCart className="text-3xl text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng</h1>
                {cart && (
                  <p className="text-sm text-gray-600">
                    {cart.userName && `Khách hàng: ${cart.userName}`}
                    {cart.cartId > 0 && ` | Mã giỏ hàng: #${cart.cartId}`}
                  </p>
                )}
              </div>
            </div>
            {hasItems && (
              <button
                onClick={handleClearCart}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                <FaTrash /> Xóa giỏ hàng
              </button>
            )}
          </div>
        </div>

        {!hasItems ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <a
              href="/product-list"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Tiếp tục mua sắm
            </a>
          </div>
        ) : (
          <>
            {/* Cart Info */}
            {cart && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`ml-2 px-2 py-1 rounded ${
                      cart.status === 'active' || cart.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cart.status || 'Active'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tạo lúc:</span>
                    <span className="ml-2 text-gray-800">{formatDate(cart.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Số lượng sản phẩm:</span>
                    <span className="ml-2 font-semibold text-gray-800">{cart.items.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm trong giỏ hàng</h2>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {item.productName || 'Sản phẩm'}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Mã biến thể: <span className="font-medium">#{item.productVariantId}</span></p>
                          <p>Thêm vào: <span className="font-medium">{formatDate(item.addedAt)}</span></p>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        <div className="text-center md:text-right">
                          <p className="text-sm text-gray-600 mb-1">Giá</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {formatPrice(item.productPrice)}
                          </p>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-sm text-gray-600 mb-1">Số lượng</p>
                          <p className="text-xl font-bold text-blue-600">
                            {item.quantity}
                          </p>
                        </div>
                        <div className="text-center md:text-right border-l-0 md:border-l-2 md:pl-8">
                          <p className="text-sm text-gray-600 mb-1">Thành tiền</p>
                          <p className="text-xl font-bold text-red-600">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="max-w-md ml-auto">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Số lượng sản phẩm:</span>
                    <span className="font-semibold text-gray-800">{cart.items.length}</span>
                  </div>
                  <div className="flex justify-between text-xl border-t-2 pt-4">
                    <span className="font-semibold text-gray-800">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(cart.totalPrice)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#E40046] text-white py-3 rounded-lg font-bold hover:bg-[#c5003a] transition text-lg"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;

