import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../components/Api/products';
import { FaShoppingCart, FaTrash, FaBox, FaPlus, FaMinus, FaChevronLeft, FaExclamationTriangle } from 'react-icons/fa';
import { useToast } from '../components/Toast/ToastContext';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { confirmState, confirm, handleClose, handleConfirm } = useConfirm();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartApi.getCart();
      console.log('📦 Cart data từ backend:', data);
      console.log('📦 Cart items:', data?.items);
      // Log chi tiết từng item để xem có field stock không
      if (data?.items?.length > 0) {
        console.log('📦 Chi tiết item đầu tiên:', data.items[0]);
        console.log('📦 Tất cả keys của item:', Object.keys(data.items[0]));
      }
      setCart(data);
    } catch (err) {
      setError(err?.message || 'Không thể tải giỏ hàng');
      console.error('Cart load error', err);
    } finally {
      setLoading(false);
    }
  };

  const notifyCartChange = () => {
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const previousCart = { ...cart };
    
    // Optimistic Update
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
      console.error("Lỗi update cart:", err);
      setCart(previousCart); 
      
      let errorMessage = 'Lỗi khi cập nhật số lượng';
      if (err.response && err.response.data) {
        errorMessage = typeof err.response.data === 'string' 
            ? err.response.data 
            : err.response.data.message || JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleRemoveItem = async (itemId) => {
    confirm({
      title: 'Xóa sản phẩm',
      message: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      type: 'danger',
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          setLoading(true);
          await cartApi.removeItem(itemId); 
          await fetchCart(); 
          notifyCartChange();
          toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (err) {
          toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleClearCart = async () => {
    confirm({
      title: 'Xóa toàn bộ giỏ hàng',
      message: 'Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng? Hành động này không thể hoàn tác.',
      type: 'danger',
      confirmText: 'Xóa tất cả',
      onConfirm: async () => {
        try {
          setLoading(true);
          await cartApi.clearCart();
          setCart({ items: [], totalPrice: 0 });
          notifyCartChange();
          toast.success('Đã xóa toàn bộ giỏ hàng');
        } catch (err) {
          toast.error(err?.message || 'Không thể xóa giỏ hàng');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // --- HÀM MỚI: XỬ LÝ CHECKOUT ---
  const handleCheckout = async () => {
    if (!cart || !cart.items) return;

    console.log('🔍 Checking stock before checkout...');
    
    setLoading(true);
    try {
      // Gọi API checkStock từ Cart (Backend sẽ validate toàn bộ giỏ hàng)
      const stockResult = await cartApi.checkStock();
      console.log('Stock check result:', stockResult);
      
      // Backend trả về { isAvailable: true/false, message: "...", items: [...] }
      if (!stockResult.isAvailable) {
        // Có sản phẩm không đủ stock
        console.error('❌ Stock validation failed');
        
        // Tạo message chi tiết từ items
        let detailMessage = stockResult.message || 'Một số sản phẩm không đủ số lượng';
        
        if (stockResult.items && stockResult.items.length > 0) {
          const itemDetails = stockResult.items
            .filter(item => !item.isAvailable)
            .map(item => `• ${item.productName}: Bạn chọn ${item.requestedQuantity}, kho chỉ còn ${item.availableStock}`)
            .join('\n');
          
          detailMessage += '\n\n' + itemDetails + '\n\nVui lòng giảm số lượng hoặc xóa sản phẩm.';
        }
        
        toast.error(detailMessage, 5000);
        
        // Reload lại cart để cập nhật số lượng mới nhất
        await fetchCart();
        return;
      }
      
      // Nếu isAvailable = true → Chuyển trang
      console.log('✅ Stock check passed, navigating to checkout...');
      navigate('/checkout');
      
    } catch (err) {
      // Lỗi network hoặc lỗi khác
      console.error('❌ Error checking stock:', err);
      toast.error(err.message || 'Không thể kiểm tra tồn kho. Vui lòng thử lại.');
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
    <>
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <button 
          onClick={() => navigate('/product-list')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <FaChevronLeft size={14}/> Tiếp tục mua sắm
        </button>

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
            
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                // ⚠️ Backend không trả stock trong item, nên không thể hiển thị cảnh báo realtime
                // Chỉ kiểm tra khi checkout

                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm p-5 border transition-all flex flex-col sm:flex-row items-center gap-6 border-transparent hover:border-blue-100">
                    
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center border">
                      <img 
                        src={item.productImage || 'https://via.placeholder.com/80'} 
                        alt={item.productName} 
                        className="w-16 h-16 object-contain"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{item.productName}</h3>
                      <p className="text-sm text-gray-400 font-medium">{formatPrice(item.productPrice)}</p>
                      
                      {/* Backend không trả stock info, nên không thể hiển thị cảnh báo ở đây */}
                    </div>

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
                );
              })}
            </div>

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

                {/* SỬ DỤNG HÀM MỚI Ở ĐÂY */}
                <button
                  onClick={handleCheckout} 
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
    </>
  );
};

export default CartPage;