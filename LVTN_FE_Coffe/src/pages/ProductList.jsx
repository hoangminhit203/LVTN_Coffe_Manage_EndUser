import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productApi, cartApi, wishlistApi } from '../components/Api/products';
import { getCategories, getProductsByCategory } from '../components/Api/catelogry';
import { isAuthenticated } from '../utils/auth';
import { useToast } from '../components/Toast';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Yêu thích (Wishlist) thường gắn liền với Profile nên vẫn giữ yêu cầu đăng nhập
  const handleAddToWishlist = async (productId) => {
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      navigate('/login');
      return;
    }

    try {
      await wishlistApi.add(productId);
      toast.success('Đã thêm vào danh sách yêu thích thành công! ♥');
    } catch (err) {
      toast.error(err.message || 'Không thể thêm vào yêu thích.');
    }
  };

  // --- HÀM MUA NGAY ĐÃ SỬA ---
  const handleBuyNow = async (product) => {
    // Bước 1: Lấy ID của variant (ưu tiên variantId hoặc id tùy theo cấu trúc dữ liệu của bạn)
    const variantId = product?.variants?.[0]?.variantId || product?.variants?.[0]?.id;
    
    if (!variantId) {
      toast.error("Sản phẩm hiện tại không có phiên bản để mua.");
      return;
    }

    try {
      // Bước 2: Gọi API thêm vào giỏ hàng. 
      // Do file products.js đã có logic tự chèn X-Guest-Key nên không cần check auth ở đây.
      await cartApi.addItem(variantId, 1);
      
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
      
      // Tùy chọn: Chuyển hướng người dùng đến trang giỏ hàng để họ thấy sản phẩm vừa thêm
      navigate('/cart'); 
    } catch (err) {
      console.error('Lỗi khi thêm vào giỏ:', err);
      toast.error('Có lỗi xảy ra: ' + (err.message || 'Lỗi hệ thống'));
    }
  };

  // Fetch categories sử dụng API function
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories({ pageSize: 100 });
        const data = res?.data?.records || [];
        setCategories(data);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let res;
        if (selectedCategory) {
          // Lấy sản phẩm theo category với pagination
          res = await getProductsByCategory(selectedCategory, { 
            pageNumber: 1, 
            pageSize: 100 
          });
        } else {
          // Lấy tất cả sản phẩm
          res = await productApi.getAll();
        }
        const responseData = res.data || res;
        const list = responseData?.records || responseData?.data?.records || responseData?.data || [];
        setProducts(list);
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  // Helper functions - xử lý cả 2 cấu trúc dữ liệu
  const getName = (p) => p?.name || 'Sản phẩm';
  const getPrice = (p) => {
    // Ưu tiên lấy từ price trực tiếp (từ category API)
    if (p?.price) return p.price;
    // Fallback lấy từ variants (từ getAll API)
    return p?.variants?.[0]?.price || 0;
  };
  const getSku = (p) => {
    // Ưu tiên lấy SKU trực tiếp (từ category API)
    if (p?.sku) return p.sku;
    // Fallback lấy từ variants (từ getAll API)
    return p?.variants?.[0]?.sku || 'N/A';
  };
  const getImage = (p) => {
    // Ưu tiên lấy imageUrl trực tiếp (từ category API)
    if (p?.imageUrl) return p.imageUrl;
    // Fallback lấy từ variants (từ getAll API)
    const firstVariant = p?.variants?.[0];
    if (firstVariant?.images?.length > 0) return firstVariant.images[0].imageUrl;
    return 'https://via.placeholder.com/400';
  };
  const formatPrice = (price) => {
    return price > 0 ? Number(price).toLocaleString('vi-VN') + ' đ' : 'Liên hệ';
  };

  return (
    <div className="bg-white min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <nav className="text-xs text-gray-400 mb-8 uppercase">
           Trang chủ &gt; <span className="text-gray-600 font-bold">Sản phẩm</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-1/4">
            <h2 className="text-lg font-bold mb-6 text-gray-800 border-b-2 border-red-800 inline-block pb-1 uppercase">
              Loại sản phẩm
            </h2>
            <div className="flex flex-col">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-left py-3 border-b border-gray-100 text-sm transition-colors cursor-pointer ${
                  selectedCategory === null ? 'text-red-800 font-bold' : 'text-gray-500 hover:text-red-800'
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => setSelectedCategory(cat.categoryId)}
                  className={`text-left py-3 border-b border-gray-100 text-sm transition-colors cursor-pointer ${
                    selectedCategory === cat.categoryId ? 'text-red-800 font-bold' : 'text-gray-500 hover:text-red-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          <main className="flex-1">
            <h2 className="text-2xl font-bold mb-10 text-gray-900 uppercase">
              Danh sách sản phẩm
              {selectedCategory && (
                <span className="text-red-800"> : {categories.find(c => c.categoryId === selectedCategory)?.name}</span>
              )}
            </h2>

            {loading ? (
              <div className="text-center py-20 text-gray-400 font-medium">Đang tải...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p.productId}
                    className="group bg-white border border-gray-200 rounded-none overflow-hidden transition-all duration-300 hover:shadow-xl"
                  >
                    {/* IMAGE */}
                    <Link
                      to={`/product/${p.productId}`}
                      className="block relative aspect-square bg-gray-50 overflow-hidden"
                    >
                      <img
                        src={getImage(p)}
                        alt={getName(p)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Wishlist */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToWishlist(p.productId);
                        }}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 border border-gray-300 flex items-center justify-center text-gray-700 hover:text-red-600 hover:border-red-600 transition"
                        title="Yêu thích"
                      >
                        ♥
                      </button>
                    </Link>

                    {/* CONTENT */}
                    <div className="p-5 flex flex-col min-h-[190px]">
                      <Link to={`/product/${p.productId}`}>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase leading-snug line-clamp-2 mb-2">
                          {getName(p)}
                        </h3>
                      </Link>

                      <p className="text-[11px] text-gray-400 mb-3 tracking-wide">
                        SKU: {getSku(p)}
                      </p>

                      <div className="mt-auto">
                        <p className="text-xl font-bold text-[#8B0000] mb-4">
                          {formatPrice(getPrice(p))}
                        </p>

                        <button
                          onClick={() => handleBuyNow(p)}
                          className="w-full h-11 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-[#8B0000] transition-all"
                        >
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
