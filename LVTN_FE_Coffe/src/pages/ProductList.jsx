import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// IMPORT THÊM wishlistApi Ở ĐÂY
import { productApi, cartApi, wishlistApi } from '../components/Api/products';
import { isAuthenticated } from '../utils/auth';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = 'https://localhost:44384/api';

  const handleAddToWishlist = async (productId) => {
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      navigate('/login');
      return;
    }

    try {
      // Gọi API wishlist dùng fetch đã cấu hình trong products.js
      await wishlistApi.add(productId);
      alert('Đã thêm vào danh sách yêu thích thành công! ♥');
    } catch (err) {
      // Hiển thị thông báo lỗi (ví dụ: "Sản phẩm đã tồn tại")
      alert(err.message || 'Không thể thêm vào yêu thích.');
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/Category`);
        const data = res.data?.data?.records || [];
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
          res = await axios.get(`${API_BASE}/Product/by-category/${selectedCategory}`);
        } else {
          res = await productApi.getAll();
        }
        const responseData = res.data || res;
        const list = responseData?.data?.records || responseData?.records || responseData?.data || [];
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

  const getName = (p) => p?.name || 'Sản phẩm';
  const getPrice = (p) => p?.variants?.[0]?.price || 0;
  const getSku = (p) => p?.variants?.[0]?.sku || 'N/A';
  const getImage = (p) => {
    const firstVariant = p?.variants?.[0];
    if (firstVariant?.images?.length > 0) return firstVariant.images[0].imageUrl;
    return 'https://via.placeholder.com/400';
  };
  const formatPrice = (price) => {
    return price > 0 ? Number(price).toLocaleString('vi-VN') + ' đ' : 'Liên hệ';
  };

  const handleBuyNow = async (product) => {
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để thực hiện mua hàng');
      navigate('/login');
      return;
    }
    const variantId = product?.variants?.[0]?.variantId || product?.variants?.[0]?.id;
    try {
      await cartApi.addItem(variantId, 1);
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.message || 'Lỗi hệ thống'));
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <nav className="text-xs text-gray-400 mb-8 uppercase">
           Trang chủ &gt; <span className="text-gray-600 font-bold">Sản phẩm</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* SIDEBAR */}
          <aside className="w-full lg:w-1/4">
            <h2 className="text-lg font-bold mb-6 text-gray-800 border-b-2 border-red-800 inline-block pb-1 uppercase">
              Loại sản phẩm
            </h2>
            <div className="flex flex-col">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-left py-3 border-b border-gray-100 text-sm transition-colors ${
                  selectedCategory === null ? 'text-red-800 font-bold' : 'text-gray-500 hover:text-red-800'
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => setSelectedCategory(cat.categoryId)}
                  className={`text-left py-3 border-b border-gray-100 text-sm transition-colors ${
                    selectedCategory === cat.categoryId ? 'text-red-800 font-bold' : 'text-gray-500 hover:text-red-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT */}
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
                  <div key={p.productId} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group">
                    
                    <Link 
                      to={`/product/${p.productId}`} 
                      className="block w-full aspect-square relative bg-white border-b border-gray-100 overflow-hidden"
                    >
                      <img 
                        src={getImage(p)} 
                        alt={getName(p)} 
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110" 
                      />
                    </Link>

                    <div className="p-5 flex flex-col flex-grow">
                      <Link to={`/product/${p.productId}`}>
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 h-10 leading-tight">
                          {getName(p)}
                        </h4>
                      </Link>
                      
                      <div className="mt-auto">
                        <div className="text-[11px] text-gray-400 mb-1 tracking-tight">SKU: {getSku(p)}</div>
                        <p className="text-lg font-extrabold text-red-600 mb-5">
                          {formatPrice(getPrice(p))}
                        </p>

                        <div className="flex items-center gap-2">
                          {/* NÚT YÊU THÍCH (WISHLIST) */}
                          <button
                            onClick={() => handleAddToWishlist(p.productId)}
                            type="button"
                            className="w-11 h-11 flex items-center justify-center rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-all active:scale-90"
                            title="Thêm vào yêu thích"
                          >
                            <span className="text-2xl leading-none">♥</span>
                          </button>

                          <button
                            onClick={() => handleBuyNow(p)}
                            className="flex-1 bg-[#E40046] text-white h-11 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
                          >
                            Mua ngay
                          </button>
                        </div>
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