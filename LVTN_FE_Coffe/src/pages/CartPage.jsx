import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../components/Api/products';
import { FaShoppingCart, FaTrash, FaBox, FaPlus, FaMinus, FaChevronLeft, FaShieldAlt } from 'react-icons/fa';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 1. Khởi tạo dữ liệu
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      // API tự động đính kèm Token hoặc GuestKey nhờ vào cấu hình apiRequest
      const data = await cartApi.getCart();
      setCart(data || { items: [], totalPrice: 0 });
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err);
      // Thay vì hiện lỗi chặn, ta set giỏ trống để khách vẫn dùng được web
      setCart({ items: [], totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  };

  const notifyCartChange = () => {
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // 2. Xử lý cập nhật số lượng (Optimistic Update)
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const previousCart = { ...cart };
    const updatedItems = cart.items.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          quantity: newQuantity, 
          subtotal: item.productPrice * newQuantity 
        };
      }
      return item;
    });

    const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    setCart({ ...cart, items: updatedItems, totalPrice: newTotal });

    try {
      await cartApi.updateQuantity(itemId, newQuantity);
      notifyCartChange();
    } catch (err) {
      setCart(previousCart); // Hoàn tác nếu API lỗi
      alert('Không thể cập nhật số lượng. Vui lòng thử lại.');
    }
  };

  // 3. Xử lý xóa sản phẩm
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Xóa sản phẩm này khỏi giỏ hàng?')) return;
    try {
      await cartApi.removeItem(itemId);
      await fetchCart();
      notifyCartChange();
    } catch (err) {
      alert('Lỗi khi xóa sản phẩm');
    }
  };

  // 4. Xóa sạch giỏ
  const handleClearCart = async () => {
    if (!window.confirm('Bạn muốn làm trống giỏ hàng?')) return;
    try {
      await cartApi.clearCart();
      setCart({ items: [], totalPrice: 0 });
      notifyCartChange();
    } catch (err) {
      alert('Lỗi khi làm sạch giỏ hàng');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  // 5. Điều hướng Thanh toán (Không check Auth)
  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasItems = cart?.items?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <button 
          onClick={() => navigate('/product-list')}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors text-sm font-semibold"
        >
          <FaChevronLeft size={12}/> TIẾP TỤC MUA SẮM
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex justify-between items-center border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <FaShoppingCart className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng</h1>
              <p className="text-sm text-gray-400">Có {cart?.items?.length || 0} sản phẩm trong danh sách</p>
            </div>
          </div>
          {hasItems && (
            <button onClick={handleClearCart} className="text-gray-400 hover:text-red-500 text-sm flex items-center gap-2 transition-colors">
              <FaTrash size={12} /> Xóa sạch giỏ hàng
            </button>
          )}
        </div>

        {!hasItems ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
            <FaBox className="text-6xl text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng đang trống</h2>
            <button
              onClick={() => navigate('/product-list')}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Quay lại cửa hàng
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-50 flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                    <img 
                      src={item.productImage || 'https://via.placeholder.com/150'} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{item.productName}</h3>
                    <p className="text-blue-600 font-semibold">{formatPrice(item.productPrice)}</p>
                  </div>

                  <div className="flex items-center bg-gray-50 rounded-xl p-1 border">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm disabled:opacity-30"
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>

                  <div className="text-right min-w-[120px]">
                    <p className="text-lg font-black text-gray-800">{formatPrice(item.subtotal)}</p>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-600 text-sm mt-1 underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cột Tổng kết */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-24 border border-blue-50">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Tổng đơn hàng</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500">
                    <span>Tạm tính</span>
                    <span className="font-bold text-gray-800">{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Giao hàng</span>
                    <span className="text-green-500 font-bold">Miễn phí</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                    <span className="text-2xl font-black text-red-600">{formatPrice(cart.totalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg active:scale-95"
                >
                  ĐẶT HÀNG NGAY
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold">
                  <FaShieldAlt className="text-green-500" /> Thanh toán an toàn 100%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;