import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { productApi, cartApi } from '../components/Api/products';
import { isAuthenticated, getUserIdFromToken } from '../utils/auth';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll();
        if (!isMounted) return;

        if (res?.isSuccess === false) {
          throw new Error(res?.message || 'Không thể tải sản phẩm');
        }

        const list =
          res?.data?.records ||
          res?.records ||
          res?.items ||
          (Array.isArray(res) ? res : []);

        setProducts(list);
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Không thể tải sản phẩm');
          console.error('Product list load error', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const getName = (p) => p?.name || p?.productName || p?.title || 'Sản phẩm';
  const getSku = (p) => p?.sku || p?.code || p?.productCode || p?.variants?.[0]?.sku || 'N/A';
  const getImage = (p) => {
    if (p?.imageUrl || p?.image || p?.thumbnail || p?.photo) return p.imageUrl || p.image || p.thumbnail || p.photo;
    const firstVariant = p?.variants?.[0];
    if (firstVariant?.images?.length) {
      const img = firstVariant.images[0];
      return typeof img === 'string' ? img : img?.url || img?.path || img?.imageUrl || null;
    }
    return null;
  };

  const getSalePrice = (p) => p?.variants?.[0]?.price ?? p?.price ?? null;
  const getUnitPrice = (p) => p?.variants?.[0]?.unit_price ?? p?.unit_price ?? null;
  const getUnit = (p) => p?.unit;
  const getVariantId = (p) => p?.variants?.[0]?.variantId ?? null;
  const formatPrice = (price) => {
    if (price === null || price === undefined) return null;
    return Number(price).toLocaleString('vi-VN') + ' đ';
  };

  const handleBuyNow = async (product) => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để mua sản phẩm');
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

  const renderCard = (product, idx) => {
    const sku = getSku(product);
    const img = getImage(product);
    const productId = product?.productId || product?.id || product?._id;
    
    return (
      <div
        key={product?.id || product?._id || idx}
        className="rounded-lg overflow-hidden border border-[#EAEBED] bg-white h-full flex flex-col justify-between hover:shadow-md transition-shadow"
      >
        <Link to={`/product/${productId}`} className="block">
          <div className="relative w-full h-64 md:h-80 flex items-center justify-center">
            {img ? (
              <img
                src={img}
                alt={getName(product)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">No image</span>
            )}
          </div>
        </Link>

        <div className="flex flex-col py-2 px-2 flex-grow justify-start">
          <div className="text-left mb-auto">
            <Link to={`/product/${productId}`}>
              <div className="text-sm lg:text-base text-black font-medium line-clamp-2 min-h-[2.2rem] md:min-h-[2.6rem] hover:text-[#0672BA] cursor-pointer">
                {getName(product)}
              </div>
            </Link>
          </div>

          <div className="py-1.5 mt-1.5">
            <div className="text-xs text-gray-500 mb-1">SKU: {sku}</div>
            <div className="space-y-0.5 min-h-[2.4rem] flex flex-col justify-center">
              <p className="text-sm md:text-base leading-tight text-[#EC1C2D] font-bold">
                {formatPrice(getSalePrice(product) ?? getUnitPrice(product)) || '—'}
                {getUnit(product) ? ` / ${getUnit(product)}` : ''}
              </p>
            </div>

            <div className="flex justify-between items-center mt-3 gap-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="w-8 h-8 bg-[#0672BA] rounded-full flex justify-center items-center cursor-pointer hover:bg-opacity-90 transition-all text-white transition-transform active:scale-95"
                  aria-label="Thêm vào yêu thích"
                >
                  ♥
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleBuyNow(product)}
                className="bg-[#E40046] text-white px-3 py-2 rounded flex items-center justify-center gap-1 flex-1 md:flex-none transition-transform active:scale-95 text-xs font-bold uppercase whitespace-nowrap"
              >
                🛒 Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
  };

  const banners = [
    {
      id: 1,
      image: '/src/assets/Banner1.jpg',
      alt: 'Banner 1',
    },
    {
      id: 2,
      image: '/src/assets/Banner2.jpg',
      alt: 'Banner 2',
    },
    {
      id: 3,
      image: '/src/assets/Banner3.jpg',
      alt: 'Banner 3',
    },
  ];

  return (
    <div className="product-search-container">
      {/* Banner Carousel */}
      <div className="w-full mb-6">
        <Slider {...bannerSettings}>
          {banners.map((banner) => (
            <div key={banner.id} className="w-full">
              <div className="w-full h-[500px] md:h-[550px] lg:h-[650px]">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Product List */}
      <div className="container mx-auto px-2 md:px-4 lg:px-6 py-4">
        <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map(renderCard)}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
