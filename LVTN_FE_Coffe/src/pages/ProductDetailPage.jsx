import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, cartApi, wishlistApi } from '../components/Api/products';
import { isAuthenticated } from '../utils/auth';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productApi.getById(id);
      // Xử lý dữ liệu linh hoạt tùy theo cấu trúc API trả về
      const productData = res?.data || res;
      setProduct(productData);
    } catch (err) {
      console.error('Lỗi tải chi tiết sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ THÊM VÀO WISHLIST ---
  const handleAddToWishlist = async () => {
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      navigate('/login');
      return;
    }

    try {
      // id từ useParams() là string, backend nhận int nên ta dùng Number(id)
      await wishlistApi.add(id);
      alert('Đã thêm sản phẩm vào danh sách yêu thích thành công! ♥');
    } catch (error) {
      // Lấy message lỗi từ hàm apiRequest (fetch) của bạn
      alert(error.message || 'Sản phẩm đã có trong danh sách yêu thích');
    }
  };

  // --- HÀM XỬ LÝ THÊM VÀO GIỎ HÀNG ---
  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    // Lấy variantId đầu tiên (hoặc logic chọn variant của bạn)
    const variantId = product?.variants?.[0]?.id || product?.variants?.[0]?.variantId;
    
    try {
      await cartApi.addItem(variantId, 1);
      alert('Đã thêm vào giỏ hàng thành công!');
    } catch (error) {
      alert(error.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  // Helper lấy ảnh sản phẩm
  const getImage = (p) => {
    const firstVariant = p?.variants?.[0];
    return firstVariant?.images?.[0]?.imageUrl || 'https://via.placeholder.com/500';
  };

  // Helper lấy giá sản phẩm
  const getPrice = (p) => p?.variants?.[0]?.price ?? 0;

  // Định dạng tiền tệ
  const formatPrice = (price) => Number(price).toLocaleString('vi-VN') + ' đ';

  // Logic hiển thị trạng thái kho hàng
  const renderStockStatus = (stock) => {
    if (stock > 0) {
      return <span className="text-green-600 font-medium">Còn hàng</span>;
    }
    return <span className="text-red-600 font-medium">Hết hàng</span>;
  };

  const getSku = (p) => {
    return p?.variants?.[0]?.sku ?? p?.sku ?? 'N/A';
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Đang tải sản phẩm...</div>;
  if (!product) return <div className="py-20 text-center">Không tìm thấy sản phẩm</div>;

  const flavorNotes = product?.flavorNotes || [];
  const brewingMethods = product?.brewingMethods || [];
  const currentStock = product?.variants?.[0]?.stock ?? product?.stock ?? 0;

  return (
    <div className="bg-gray-50 min-h-screen py-12 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-8 uppercase">
          Trang chủ &gt; Sản phẩm &gt; <span className="text-gray-600 font-bold">{product?.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          
          {/* CỘT TRÁI: ẢNH */}
          <div className="w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center shadow-sm">
            <div className="w-full aspect-square overflow-hidden rounded-md">
              <img
                src={getImage(product)}
                alt={product?.name}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-8 flex flex-col shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product?.name}
            </h1>
            
            <div className="text-sm text-gray-500 space-y-2 mb-6">
              <p>SKU: <span>{getSku(product)}</span></p>
              <p>Trạng thái: {renderStockStatus(currentStock)}</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-md mb-6 border border-gray-100">
               <div className="text-3xl font-black text-red-600">
                  {formatPrice(getPrice(product))}
               </div>
            </div>

            {product?.description && (
              <div className="mb-8 text-gray-600 text-sm leading-relaxed">
                {product.description}
              </div>
            )}

            {flavorNotes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Flavor Notes</h3>
                <div className="flex flex-wrap gap-2">
                  {flavorNotes.map((note, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[11px] font-bold border border-orange-100">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {brewingMethods.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Brewing Methods</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {brewingMethods.map((method, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3"></span>
                      {method}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nút thao tác */}
            <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4">
              <button 
                type="button"
                onClick={handleAddToWishlist}
                title="Yêu thích"
                className="flex items-center justify-center w-14 h-14 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:border-blue-500 transition-all active:scale-90"
              >
                <span className="text-2xl">♥</span>
              </button>
              
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`flex-1 font-bold py-4 px-8 rounded-md transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
                  currentStock > 0 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {currentStock > 0 ? 'Mua ngay' : 'Hết hàng'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;