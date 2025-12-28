import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Giả định đường dẫn import đúng, hãy chỉnh lại nếu file nằm chỗ khác
import { productApi, cartApi, wishlistApi } from '../components/Api/products';
import { isAuthenticated } from '../utils/auth';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null); // Biến thể đang chọn (size, loại hạt...)
  const [selectedImage, setSelectedImage] = useState(null);     // Ảnh đang hiển thị to

  // --- EFFECT: TẢI SẢN PHẨM KHI CÓ ID ---
  useEffect(() => {
    if (id) fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- HÀM GỌI API LẤY CHI TIẾT SẢN PHẨM ---
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productApi.getById(id);
      
      // Xử lý dữ liệu linh hoạt (đề phòng API trả về dạng { data: ... } hoặc trả trực tiếp)
      const productData = res?.data || res;
      setProduct(productData);
      
      // Logic chọn mặc định Variant đầu tiên và Ảnh đầu tiên khi mới vào trang
      if (productData?.variants?.length > 0) {
        const defaultVariant = productData.variants[0];
        setSelectedVariant(defaultVariant);
        
        if (defaultVariant?.images?.length > 0) {
          // Ưu tiên ảnh isMain, nếu không có thì lấy ảnh đầu tiên
          const mainImage = defaultVariant.images.find(img => img.isMain) || defaultVariant.images[0];
          setSelectedImage(mainImage);
        }
      }
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
      await wishlistApi.add(id);
      alert('Đã thêm sản phẩm vào danh sách yêu thích thành công! ♥');
    } catch (error) {
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
    
    // Lấy ID của biến thể đang chọn
    const variantId = selectedVariant?.variantId || selectedVariant?.id;
    
    if (!variantId) {
      alert('Vui lòng chọn phiên bản sản phẩm');
      return;
    }
    
    try {
      // Mặc định thêm số lượng là 1
      await cartApi.addItem(variantId, 1);
      alert('Đã thêm vào giỏ hàng thành công!');
    } catch (error) {
      alert(error.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  // --- CÁC HÀM HELPER HIỂN THỊ ---
  const formatPrice = (price) => Number(price).toLocaleString('vi-VN') + ' đ';

  const renderStockStatus = (stock) => {
    if (stock > 0) {
      return <span className="text-green-600 font-medium">Còn hàng ({stock} sản phẩm)</span>;
    }
    return <span className="text-red-600 font-medium">Hết hàng</span>;
  };

  const getRoastLevelDisplay = (level) => {
    const levels = { 'Light': 'Nhẹ', 'Medium': 'Vừa', 'Dark': 'Đậm' };
    return levels[level] || level;
  };

  const getBeanTypeDisplay = (type) => {
    const types = { 'Arabica': 'Arabica', 'Robusta': 'Robusta', 'Blend': 'Pha trộn' };
    return types[type] || type;
  };

  // --- RENDER KHI ĐANG TẢI HOẶC KHÔNG CÓ DỮ LIỆU ---
  if (loading) return <div className="py-20 text-center text-gray-400">Đang tải sản phẩm...</div>;
  if (!product) return <div className="py-20 text-center">Không tìm thấy sản phẩm</div>;

  // Lấy dữ liệu an toàn để tránh lỗi undefined
  const flavorNotes = product?.flavorNotes || [];
  const brewingMethods = product?.brewingMethods || [];
  const categories = product?.category || [];
  const currentStock = selectedVariant?.stock ?? 0;
  const variants = product?.variants || [];

  return (
    <div className="bg-gray-50 min-h-screen py-12 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Layout chính: Grid 2 cột (trên desktop) */}
        <div className="bg-white rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          
          {/* --- CỘT TRÁI: HÌNH ẢNH --- */}
          <div>
            {/* Ảnh chính to */}
            <div className="w-full aspect-square overflow-hidden rounded-lg mb-4 flex items-center justify-center bg-gray-50 border border-gray-100">
              <img
                src={selectedImage?.imageUrl || 'https://via.placeholder.com/500'}
                alt={product?.name}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
            
            {/* Danh sách thumbnail (ảnh nhỏ) */}
            {selectedVariant?.images && selectedVariant.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {selectedVariant.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage?.imageUrl === img.imageUrl 
                        ? 'border-red-500 ring-1 ring-red-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Thumbnail ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- CỘT PHẢI: THÔNG TIN SẢN PHẨM --- */}
          <div>
            {/* Tên sản phẩm */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product?.name}</h1>

            {/* Danh mục (Category) */}
            {categories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span key={cat.categoryId || Math.random()} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Mã SKU và Tình trạng kho */}
            <div className="text-sm text-gray-500 space-y-1 mb-6">
              <p>SKU: <span className="font-medium text-gray-700">{selectedVariant?.sku || 'N/A'}</span></p>
              <p>Trạng thái: {renderStockStatus(currentStock)}</p>
            </div>

            {/* Giá tiền */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100 flex items-center">
               <span className="text-3xl font-black text-red-600">
                 {formatPrice(selectedVariant?.price || 0)}
               </span>
            </div>

            {/* Mô tả ngắn */}
            {product?.description && (
              <div className="mb-6 text-gray-600 text-sm leading-relaxed">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Mô tả</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Chọn Variant (Size/Loại) */}
            {variants.length > 1 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">Chọn phiên bản</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.variantId}
                      onClick={() => {
                        setSelectedVariant(variant);
                        // Tự động đổi ảnh chính theo variant nếu có
                        if (variant.images?.length > 0) {
                          const mainImage = variant.images.find(img => img.isMain) || variant.images[0];
                          setSelectedImage(mainImage);
                        }
                      }}
                      className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all ${
                        selectedVariant?.variantId === variant.variantId
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {variant.weight}g - {getRoastLevelDisplay(variant.roastLevel)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Thông tin chi tiết Variant (Bảng grid nhỏ) */}
            {selectedVariant && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">Chi tiết kỹ thuật</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  {selectedVariant.roastLevel && (
                    <div><span className="text-gray-500">Độ rang:</span> <span className="font-medium">{getRoastLevelDisplay(selectedVariant.roastLevel)}</span></div>
                  )}
                  {selectedVariant.beanType && (
                    <div><span className="text-gray-500">Loại hạt:</span> <span className="font-medium">{getBeanTypeDisplay(selectedVariant.beanType)}</span></div>
                  )}
                  {selectedVariant.origin && (
                    <div><span className="text-gray-500">Xuất xứ:</span> <span className="font-medium">{selectedVariant.origin}</span></div>
                  )}
                  {selectedVariant.acidity != null && (
                    <div><span className="text-gray-500">Độ chua:</span> <span className="font-medium">{selectedVariant.acidity}/10</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Hương vị (Flavor Notes) */}
            {flavorNotes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">Hương vị</h3>
                <div className="flex flex-wrap gap-2">
                  {flavorNotes.map((note, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-100">
                      {/* Xử lý an toàn: nếu note là object thì lấy name, nếu là string thì hiển thị luôn */}
                      {typeof note === 'object' ? note.name : note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Phương pháp pha (Brewing Methods) */}
            {brewingMethods.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">Gợi ý pha chế</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {brewingMethods.map((method, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 mt-2"></span>
                      <div>
                        {typeof method === 'object' ? (
                            <>
                                <div className="font-medium text-gray-700">{method.name}</div>
                                {method.description && <div className="text-xs text-gray-500 mt-1">{method.description}</div>}
                            </>
                        ) : (
                            <span>{method}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nút thao tác (Add to cart / Wishlist) */}
            <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4">
              <button 
                type="button"
                onClick={handleAddToWishlist}
                title="Yêu thích"
                className="flex items-center justify-center w-14 h-14 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-all active:scale-95"
              >
                <span className="text-2xl">♥</span>
              </button>
              
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`flex-1 font-bold py-4 px-8 rounded-lg transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
                  currentStock > 0 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentStock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </button>
            </div>

          </div> {/* Kết thúc cột phải */}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;