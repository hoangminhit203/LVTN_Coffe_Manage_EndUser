import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, cartApi, wishlistApi } from '../components/Api/products';
import { isAuthenticated } from '../utils/auth';
import { useToast } from '../components/Toast/ToastContext';
import Reviews from '../components/Review/Reviews';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (id) fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

    try {
      await wishlistApi.add(id);
      toast.success('Đã thêm vào yêu thích ♥');
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
      <span className="font-semibold text-green-700">
        Còn hàng ({stock})
      </span>
    ) : (
      <span className="font-semibold text-red-500">Hết hàng</span>
    );

  if (loading)
    return (
      <div className="py-20 text-center text-gray-400">
        Đang tải sản phẩm...
      </div>
    );

  if (!product)
    return (
      <div className="py-20 text-center">
        Không tìm thấy sản phẩm
      </div>
    );

  const flavorNotes = product?.flavorNotes || [];
  const brewingMethods = product?.brewingMethods || [];
  const categories = product?.category || [];
  const variants = product?.variants || [];
  const currentStock = selectedVariant?.stock ?? 0;

  return (
    <div className="bg-gradient-to-b from-rose-50 to-white min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* MAIN CARD */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-rose-300/60 grid grid-cols-1 md:grid-cols-2 gap-10 p-8">

          {/* LEFT - IMAGE */}
          <div>
            <div className="aspect-square rounded-lg border border-rose-300 bg-gradient-to-br from-rose-50/30 to-red-50/30 flex items-center justify-center mb-6 shadow-md">
              <img
                src={selectedImage?.imageUrl || 'https://via.placeholder.com/500'}
                alt={product?.name}
                className="w-full h-full object-contain p-4"
              />
            </div>

            {selectedVariant?.images?.length > 1 && (
              <div className="flex gap-3">
                {selectedVariant.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-md border transition-all ${
                      selectedImage?.imageUrl === img.imageUrl
                        ? 'border-rose-700 ring-2 ring-rose-400 shadow-md'
                        : 'border-rose-300 hover:border-rose-500'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-md"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - INFO */}
          <div className="flex flex-col">

            <h1 className="text-2xl font-bold text-amber-900 tracking-wide mb-3">
              {product?.name}
            </h1>

            {categories.length > 0 && (
              <div className="flex gap-2 mb-4">
                {categories.map(cat => (
                  <span
                    key={cat.categoryId}
                    className="bg-gradient-to-r from-rose-100 to-red-100 border border-rose-400 text-rose-900 px-3 py-1 text-xs font-semibold uppercase rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            <div className="text-sm mb-6 space-y-1 text-gray-700">
              <p>
                SKU:{' '}
                <span className="font-semibold text-rose-800">
                  {selectedVariant?.sku || 'N/A'}
                </span>
              </p>
              <p>Trạng thái: {renderStockStatus(currentStock)}</p>
            </div>

            {/* PRICE */}
            <div className="bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-400 rounded-lg p-5 mb-6 shadow-sm">
              <span className="text-3xl font-bold text-rose-900 tracking-wide">
                {formatPrice(selectedVariant?.price || 0)}
              </span>
            </div>

            {/* DESCRIPTION */}
            {product?.description && (
              <div className="mb-6 text-sm leading-relaxed text-gray-600">
                {product.description}
              </div>
            )}

            {/* VARIANTS */}
            {variants.length > 1 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {variants.map(variant => (
                    <button
                      key={variant.variantId}
                      onClick={() => {
                        setSelectedVariant(variant);
                        if (variant.images?.length > 0) {
                          const main =
                            variant.images.find(i => i.isMain) ||
                            variant.images[0];
                          setSelectedImage(main);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all ${
                        selectedVariant?.variantId === variant.variantId
                          ? 'bg-gradient-to-r from-rose-700 to-red-700 text-white border-rose-800 shadow-md'
                          : 'bg-white border-rose-300 text-rose-800 hover:border-rose-500 hover:bg-rose-50'
                      }`}
                    >
                      {variant.weight}g
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TECH */}
            {selectedVariant && (
              <div className="bg-gradient-to-br from-rose-50/50 to-red-50/50 border border-rose-300 rounded-lg p-5 mb-6 text-sm grid grid-cols-2 gap-y-3 text-gray-700">
                {selectedVariant.origin && (
                  <div>Xuất xứ: <b className="text-rose-900">{selectedVariant.origin}</b></div>
                )}
                {selectedVariant.beanType && (
                  <div>Loại hạt: <b className="text-rose-900">{selectedVariant.beanType}</b></div>
                )}
                {selectedVariant.roastLevel && (
                  <div>Độ rang: <b className="text-rose-900">{selectedVariant.roastLevel}</b></div>
                )}
                {selectedVariant.acidity != null && (
                  <div>Độ chua: <b className="text-rose-900">{selectedVariant.acidity}/10</b></div>
                )}
              </div>
            )}

            {/* FLAVOR NOTES */}
            {flavorNotes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-rose-900 mb-3 uppercase tracking-wide">
                  🌿 Hương Vị 
                </h3>
                <div className="flex flex-wrap gap-2">
                  {flavorNotes.map((n, i) => (
                    <span
                      key={i}
                      className="bg-white border border-rose-400 text-rose-800 px-3 py-1.5 text-xs font-semibold uppercase rounded-full shadow-sm"
                    >
                      {typeof n === 'object' ? n.name : n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* BREWING METHODS */}
            {brewingMethods.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-rose-900 mb-3 uppercase tracking-wide">
                  ☕ Phương Pháp Pha Chế
                </h3>
                <div className="flex flex-wrap gap-2">
                  {brewingMethods.map((method, i) => (
                    <span
                      key={i}
                      className="bg-gradient-to-r from-red-100 to-rose-100 border border-red-400 text-red-800 px-3 py-1.5 text-xs font-semibold uppercase rounded-full shadow-sm"
                    >
                      {typeof method === 'object' ? method.name : method}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION */}
            <div className="mt-auto pt-6 border-t border-rose-300 flex gap-4">
              <button
                onClick={handleAddToWishlist}
                className="w-14 h-14 rounded-lg border-2 border-rose-500 bg-white text-red-600 text-xl hover:bg-rose-50 hover:border-rose-600 transition-all shadow-sm"
              >
                ♥
              </button>

              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`flex-1 py-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all shadow-md ${
                  currentStock > 0
                    ? 'bg-gradient-to-r from-rose-700 to-red-700 text-white hover:from-rose-800 hover:to-red-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentStock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
              </button>
            </div>

          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-2">
          <Reviews
            variantId={selectedVariant?.variantId || selectedVariant?.id}
          />
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
