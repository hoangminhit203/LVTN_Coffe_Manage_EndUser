import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, cartApi } from '../components/Api/products';
import { isAuthenticated, getUserIdFromToken } from '../utils/auth';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productApi.getById(id);
      
      if (res?.isSuccess === false) {
        throw new Error(res?.message || 'Không thể tải sản phẩm');
      }

      const productData = res?.data || res;
      setProduct(productData);
    } catch (err) {
      setError(err?.message || 'Không thể tải sản phẩm');
      console.error('Product detail load error', err);
    } finally {
      setLoading(false);
    }
  };

  const getImage = (p) => {
    if (p?.imageUrl || p?.image || p?.thumbnail || p?.photo) 
      return p.imageUrl || p.image || p.thumbnail || p.photo;
    const firstVariant = p?.variants?.[0];
    if (firstVariant?.images?.length) {
      const img = firstVariant.images[0];
      return typeof img === 'string' ? img : img?.url || img?.path || img?.imageUrl || null;
    }
    return null;
  };

  const getPrice = (p) => {
    return p?.variants?.[0]?.price ?? p?.price ?? null;
  };

  const getVariantId = (p) => {
    return p?.variants?.[0]?.variantId ?? null;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0 đ';
    return Number(price).toLocaleString('vi-VN') + ' đ';
  };

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }

    const userId = getUserIdFromToken();
    console.log('User ID:', userId);

    const variantId = getVariantId(product);
    if (!variantId) {
      alert('Sản phẩm không có variant');
      return;
    }

    try {
      await cartApi.addItem(variantId, 1);
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      alert(error?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          {error || 'Không tìm thấy sản phẩm'}
        </div>
        <button
          onClick={() => navigate('/product-list')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const image = getImage(product);
  const price = getPrice(product);
  const flavorNotes = product?.flavorNotes || [];
  const brewingMethods = product?.brewingMethods || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Section - Product Image */}
        <div className="w-full">
          <div className="w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400">No image</span>
            )}
          </div>
        </div>

        {/* Right Section - Product Information */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {product.name}
          </h1>

          <div className="mb-6">
            <p className="text-2xl md:text-3xl font-bold text-orange-500">
              {formatPrice(price)}
            </p>
          </div>

          {product.description && (
            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Flavor Notes */}
          {flavorNotes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Flavor Notes
              </h3>
              <div className="flex flex-wrap gap-2">
                {flavorNotes.map((note, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Brewing Methods */}
          {brewingMethods.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Brewing Methods
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {brewingMethods.map((method, index) => (
                  <li key={index}>{method}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

