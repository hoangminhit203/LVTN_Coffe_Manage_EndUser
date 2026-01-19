import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productApi, cartApi, wishlistApi } from '../components/Api/products';
import { isAuthenticated } from '../utils/auth';
import { useToast } from '../components/Toast/ToastContext';
import Reviews from '../components/Review/Reviews';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const reviewsRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (id) fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Scroll đến phần Reviews nếu được yêu cầu từ trang OrderHistory
  useEffect(() => {
    if (location.state?.scrollToReview && reviewsRef.current && !loading) {
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [location.state, loading]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productApi.getById(id);
      const productData = res?.data || res;
      setProduct(productData);

      if (productData?.variants?.length > 0) {
        const defaultVariant = productData.variants[0];
        setSelectedVariant(defaultVariant);

        if (defaultVariant?.images?.length > 0) {
          const mainImage =
            defaultVariant.images.find(img => img.isMain) ||
            defaultVariant.images[0];
          setSelectedImage(mainImage);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const variantId = selectedVariant?.variantId || selectedVariant?.id;
    
    if (!variantId) {
      toast.error('Sản phẩm không có phiên bản để thêm vào yêu thích');
      return;
    }

    try {
      const result = await wishlistApi.add(variantId);
      if (result?.isSuccess === false) {
        toast.error(result.message || 'Không thể thêm vào yêu thích');
      } else {
        toast.success('Đã thêm vào yêu thích ♥');
      }
    } catch (error) {
      toast.error(error.message || 'Đã tồn tại trong wishlist');
    }
  };

  const handleAddToCart = async () => {
    const variantId = selectedVariant?.variantId || selectedVariant?.id;
    if (!variantId) {
      toast.warning('Vui lòng chọn phiên bản');
      return;
    }

    if (currentStock <= 0) {
      toast.warning('Hết hàng');
      return;
    }

    try {
      await cartApi.addItem(variantId, 1);
      toast.success('Đã thêm vào giỏ hàng');
      navigate('/cart');
    } catch (error) {
      toast.error(error.message || 'Không thể thêm giỏ hàng');
    }
  };

  const formatPrice = price =>
    Number(price).toLocaleString('vi-VN') + ' đ';

  const renderStockStatus = stock =>
    stock > 0 ? (
      <span className="font-semibold text-green-400">
        Còn hàng ({stock})
      </span>
    ) : (
      <span className="font-semibold text-red-400">Hết hàng</span>
    );

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">
        Đang tải sản phẩm...
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">
        Không tìm thấy sản phẩm
      </div>
    );

  const flavorNotes = product?.flavorNotes || [];
  const brewingMethods = product?.brewingMethods || [];
  const categories = product?.category || [];
  const variants = product?.variants || [];
  const currentStock = selectedVariant?.stock ?? 0;

  return (
    // NỀN TỔNG THỂ: Màu trắng sáng
    <div className="bg-white min-h-screen py-14 text-gray-800 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* MAIN CARD */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-10">

          {/* LEFT - IMAGE */}
          <div className="flex flex-col h-full">
            {/* Khung ảnh */}
            <div className="aspect-square w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center mb-4 shadow-lg overflow-hidden relative">
              <img
                src={selectedImage?.imageUrl || 'https://via.placeholder.com/500'}
                alt={product?.name}
                className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-500 drop-shadow-xl"
              />
            </div>

            {selectedVariant?.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {selectedVariant.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border transition-all overflow-hidden ${
                      selectedImage?.imageUrl === img.imageUrl
                        ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - INFO */}
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {categories.map(cat => (
                    <span
                      key={cat.categoryId}
                      className="text-rose-600 text-xs font-bold uppercase tracking-wider bg-rose-100 px-2 py-1 rounded"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
                {product?.name}
              </h1>

              {/* SKU & Stock */}
              <div className="flex items-center gap-4 text-sm mb-6 text-gray-600 border-b border-gray-200 pb-4">
                <p>
                  SKU: <span className="text-gray-900">{selectedVariant?.sku || 'N/A'}</span>
                </p>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <p>{renderStockStatus(currentStock)}</p>
              </div>

              {/* PRICE */}
              <div className="mb-6">
                 <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                    {formatPrice(selectedVariant?.price || 0)}
                 </span>
              </div>

              {/* DESCRIPTION */}
              {product?.description && (
                <div className="mb-8 text-base leading-relaxed text-gray-700 font-light">
                  {product.description}
                </div>
              )}

              {/* VARIANTS SELECTOR */}
              {variants.length > 1 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Chọn trọng lượng:</p>
                  <div className="flex flex-wrap gap-3">
                    {variants.map(variant => (
                      <button
                        key={variant.variantId}
                        onClick={() => {
                          setSelectedVariant(variant);
                          if (variant.images?.length > 0) {
                            const main = variant.images.find(i => i.isMain) || variant.images[0];
                            setSelectedImage(main);
                          }
                        }}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                          selectedVariant?.variantId === variant.variantId
                            ? 'bg-rose-600 border-rose-600 text-white shadow-lg'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {variant.weight}g
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TECH SPECS */}
              {selectedVariant && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-4 text-sm">
                  {selectedVariant.origin && (
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase">Xuất xứ</span>
                      <span className="text-gray-900 font-medium">{selectedVariant.origin}</span>
                    </div>
                  )}
                  {selectedVariant.beanType && (
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase">Loại hạt</span>
                      <span className="text-gray-900 font-medium">{selectedVariant.beanType}</span>
                    </div>
                  )}
                  {selectedVariant.roastLevel && (
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase">Độ rang</span>
                      <span className="text-gray-900 font-medium">{selectedVariant.roastLevel}</span>
                    </div>
                  )}
                  {selectedVariant.acidity != null && (
                    <div className="flex flex-col">
                       <span className="text-gray-500 text-xs uppercase">Độ chua</span>
                       <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                             <div className="h-full bg-rose-500" style={{width: `${selectedVariant.acidity * 10}%`}}></div>
                          </div>
                          <span className="text-gray-900 font-medium">{selectedVariant.acidity}/10</span>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAGS SECTION */}
              <div className="space-y-4 mb-8">
                {/* Flavor */}
                {flavorNotes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-rose-600 mr-2">Hương vị:</span>
                    {flavorNotes.map((n, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700 hover:bg-gray-200 transition-colors cursor-default">
                        {typeof n === 'object' ? n.name : n}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Brewing */}
                {brewingMethods.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-rose-600 mr-2">Pha chế:</span>
                    {brewingMethods.map((method, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700 hover:bg-gray-200 transition-colors cursor-default">
                        {typeof method === 'object' ? method.name : method}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 mt-auto">
              <button
                onClick={handleAddToWishlist}
                className="w-16 h-14 rounded-xl border border-gray-300 bg-white text-rose-500 text-2xl hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center active:scale-95"
              >
                ♥
              </button>

              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`flex-1 h-14 rounded-xl text-base font-bold uppercase tracking-wide transition-all shadow-lg ${
                  currentStock > 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200 hover:shadow-rose-300 active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                }`}
              >
                {currentStock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </button>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div ref={reviewsRef} className="mt-10 bg-white rounded-2xl border border-gray-200 shadow-xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">
            Đánh giá sản phẩm
          </h2>
          <Reviews
            variantId={selectedVariant?.variantId || selectedVariant?.id}
          />
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;