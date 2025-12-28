import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../components/Api/products';
import { FaShoppingCart, FaTrash, FaBox, FaPlus, FaMinus, FaChevronLeft } from 'react-icons/fa';

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

  // Phát tín hiệu để Navbar cập nhật số lượng Badge
  const notifyCartChange = () => {
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Hàm cập nhật số lượng
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    // Lưu lại trạng thái cũ để hoàn tác nếu lỗi
    const previousCart = { ...cart };
    
    // Cập nhật giao diện ngay lập tức (Optimistic Update)
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
      notifyCartChange(); // Cập nhật số trên Navbar
    } catch (err) {
      setCart(previousCart); // Lỗi thì trả về dữ liệu cũ
      alert(err?.message || 'Lỗi khi cập nhật số lượng');
    }
  };

  // Hàm xóa 1 sản phẩm
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Bạn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    
    try {
      setLoading(true);
      await cartApi.removeItem(itemId); // Call DELETE API
      await fetchCart(); // Tải lại data mới từ DB
      notifyCartChange(); // Cập nhật số trên Navbar
    } catch (err) {
      alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa sạch giỏ hàng
  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) return;
    try {
      setLoading(true);
      await cartApi.clearCart();
      setCart({ items: [], totalPrice: 0 });
      notifyCartChange(); // Cập nhật số trên Navbar (về 0)
    } catch (err) {
      alert(err?.message || 'Không thể xóa giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium">Đang xử lý giỏ hàng...</p>
        </div>
      </div>
    );
  }

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Nút quay lại */}
        <button 
          onClick={() => navigate('/product-list')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <FaChevronLeft size={14}/> Tiếp tục mua sắm
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-100">
              <FaShoppingCart className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng</h1>
              <p className="text-sm text-gray-500">Bạn đang có {cart?.items?.length || 0} sản phẩm</p>
            </div>
          </div>
          {hasItems && (
            <button
              onClick={handleClearCart}
              className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition flex items-center gap-2 border border-red-50"
            >
              <FaTrash size={14} /> Xóa tất cả
            </button>
          )}
        </div>

        {!hasItems ? (
          <div className="bg-white rounded-3xl shadow-sm p-20 text-center border border-gray-100">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBox className="text-4xl text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống!</h2>
            <p className="text-gray-500 mb-8">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <button
              onClick={() => navigate('/product-list')}
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100"
            >
              Khám phá sản phẩm ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* List sản phẩm */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm p-5 border border-transparent hover:border-blue-100 transition-all flex flex-col sm:flex-row items-center gap-6">
                  
                  {/* Ảnh sản phẩm (Nếu có) */}
                  <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center border">
                    <img 
                      src={item.productImage || 'https://via.placeholder.com/80'} 
                      alt={item.productName} 
                      className="w-16 h-16 object-contain"
                    />
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{item.productName}</h3>
                    <p className="text-sm text-gray-400 font-medium">{formatPrice(item.productPrice)}</p>
                  </div>

                  {/* Bộ tăng giảm số lượng */}
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-30"
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-blue-600"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>

                  {/* Thành tiền & Xóa */}
                  <div className="flex items-center gap-6">
                    <div className="text-right min-w-[100px]">
                      <p className="text-lg font-black text-blue-600">{formatPrice(item.subtotal)}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="bg-red-50 text-red-400 hover:text-red-600 p-3 rounded-xl transition-colors"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar thanh toán */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-24 border border-blue-50">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                   Chi tiết thanh toán
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500">
                    <span>Tạm tính</span>
                    <span className="font-bold text-gray-800">{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Phí giao hàng</span>
                    <span className="text-green-500 font-bold">Miễn phí</span>
                  </div>
                  <div className="border-t border-dashed pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                    <span className="text-2xl font-black text-red-600">{formatPrice(cart.totalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-95"
                >
                  THANH TOÁN NGAY
                </button>

                <p className="text-center text-gray-400 text-xs mt-6 px-4">
                  Bằng cách nhấn thanh toán, bạn đồng ý với các điều khoản mua hàng của chúng tôi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;