import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productApi, cartApi, wishlistApi } from "../components/Api/products";
import { getCategories } from "../components/Api/catelogry";
import { isAuthenticated } from "../utils/auth";
import { useToast } from "../components/Toast";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // State lưu giá trị trong ô nhập (chưa áp dụng)
  const [filters, setFilters] = useState({
    Name: "",
    Origin: "",
    MinPrice: "",
    MaxPrice: "",
  });

  const navigate = useNavigate();
  const toast = useToast();

  // --- HÀM FETCH CHÍNH ---
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Chuẩn bị params từ state filters và category hiện tại
      const queryParams = {
        ...filters,
        ...(selectedCategory && { CategoryId: selectedCategory }),
      };

      console.log("Thực hiện gọi API với bộ lọc:", queryParams);
      const res = await productApi.getAll(queryParams);

      const responseData = res.data || res;
      const list =
        responseData?.records ||
        responseData?.data?.records ||
        responseData?.data ||
        [];
      setProducts(list);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedCategory]);

  // 1. Fetch danh mục một lần duy nhất khi mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories({ pageSize: 100 });
        setCategories(res?.data?.records || []);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCats();
  }, []);

  // 2. Tự động load lại khi ĐỔI CATEGORY
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  // --- HANDLERS ---
  const handleApplyFilter = () => {
    fetchProducts(); // Chỉ gọi khi nhấn nút
  };

  const handleClearFilter = () => {
    setFilters({ Name: "", Origin: "", MinPrice: "", MaxPrice: "" });
    setSelectedCategory(null);
    // Để state kịp cập nhật, ta gọi trực tiếp với object rỗng
    setLoading(true);
    productApi.getAll({}).then((res) => {
      const data = res.data || res;
      setProducts(data?.records || data || []);
      setLoading(false);
    });
  };

  const handleAddToWishlist = async (product) => {
    if (!isAuthenticated()) {
      toast.warning("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      navigate("/login");
      return;
    }
    const variantId =
      product?.variants?.[0]?.variantId || product?.variants?.[0]?.id;
    if (!variantId) return toast.error("Sản phẩm không có phiên bản");
    try {
      const response = await wishlistApi.add(variantId);
      if (response?.value?.isSuccess) toast.success("Đã thêm vào yêu thích!");
      else toast.error(response?.value?.message || "Lỗi thêm yêu thích");
    } catch (err) {
      toast.error("Lỗi hệ thống");
    }
  };

  const handleBuyNow = async (product) => {
    const variantId =
      product?.variants?.[0]?.variantId || product?.variants?.[0]?.id;
    if (!variantId) return toast.error("Không có phiên bản để mua.");
    try {
      await cartApi.addItem(variantId, 1);
      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (err) {
      toast.error("Lỗi khi thêm vào giỏ");
    }
  };

  const formatPrice = (price) =>
    price > 0 ? Number(price).toLocaleString("vi-VN") + " đ" : "Liên hệ";

  return (
    <div className="bg-white min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <nav className="text-xs text-gray-400 mb-8 uppercase">
          Trang chủ &gt;{" "}
          <span className="text-gray-600 font-bold">Sản phẩm</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-1/4 space-y-10">
            {/* 1. LOẠI SẢN PHẨM (ĐƯA LÊN TRÊN) */}
            <div>
              <h2 className="text-lg font-bold mb-6 text-gray-800 border-b-2 border-red-800 inline-block pb-1 uppercase tracking-wider">
                Loại sản phẩm
              </h2>
              <div className="flex flex-col">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-left py-3 border-b border-gray-100 text-sm transition-colors cursor-pointer ${selectedCategory === null ? "text-red-800 font-bold" : "text-gray-500 hover:text-red-800"}`}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    onClick={() => setSelectedCategory(cat.categoryId)}
                    className={`text-left py-3 border-b border-gray-100 text-sm transition-colors cursor-pointer ${selectedCategory === cat.categoryId ? "text-red-800 font-bold" : "text-gray-500 hover:text-red-800"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. TÌM KIẾM & BỘ LỌC (ĐƯA XUỐNG DƯỚI) */}
            <div className="bg-gray-50 p-5 border border-gray-100">
              <h2 className="text-sm font-bold mb-4 text-gray-800 uppercase tracking-widest">
                Bộ lọc tìm kiếm
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase mb-1 block">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    placeholder="Tìm tên..."
                    className="w-full border border-gray-200 p-2 text-sm bg-white focus:outline-red-800"
                    value={filters.Name}
                    onChange={(e) =>
                      setFilters({ ...filters, Name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase mb-1 block">
                    Xuất xứ
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập nơi sản xuất..."
                    className="w-full border border-gray-200 p-2 text-sm bg-white focus:outline-red-800"
                    value={filters.Origin}
                    onChange={(e) =>
                      setFilters({ ...filters, Origin: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase mb-1 block">
                    Khoảng giá (VNĐ)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Từ"
                      className="w-full border border-gray-200 p-2 text-sm bg-white"
                      value={filters.MinPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, MinPrice: e.target.value })
                      }
                    />
                    <span className="text-gray-300">-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      className="w-full border border-gray-200 p-2 text-sm bg-white"
                      value={filters.MaxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, MaxPrice: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={handleApplyFilter}
                  className="w-full bg-black text-white py-3 mt-2 text-xs font-bold uppercase hover:bg-red-800 transition-all shadow-lg active:scale-95"
                >
                  Áp dụng bộ lọc
                </button>

                <button
                  onClick={handleClearFilter}
                  className="text-[10px] uppercase text-gray-400 hover:text-red-800 underline block text-center w-full mt-2"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <h2 className="text-2xl font-bold mb-10 text-gray-900 uppercase">
              Danh sách sản phẩm
              {selectedCategory && (
                <span className="text-red-800">
                  {" "}
                  :{" "}
                  {
                    categories.find((c) => c.categoryId === selectedCategory)
                      ?.name
                  }
                </span>
              )}
            </h2>

            {loading ? (
              <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
                Đang tải dữ liệu...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400 border border-dashed border-gray-200">
                Không tìm thấy sản phẩm nào phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  /* THÊM CLASS 'relative' VÀO ĐÂY */
                  <div
                    key={p.productId}
                    className="group relative bg-white border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
                  >
                    {/* NÚT TRÁI TIM */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Ngăn sự kiện click nhảy vào trang chi tiết
                        handleAddToWishlist(p);
                      }}
                      className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 shadow-sm transition-all active:scale-90"
                      title="Thêm vào yêu thích"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor" /* Đổi sang fill để trái tim đậm nét hơn khi hover */
                        className="w-5 h-5"
                      >
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3c1.54 0 2.93.651 3.91 1.696A5.969 5.969 0 0115.512 3c2.974 0 5.438 2.322 5.438 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    </button>

                    {/* ẢNH SẢN PHẨM */}
                    <Link
                      to={`/product/${p.productId}`}
                      className="block relative aspect-square bg-gray-50 overflow-hidden"
                    >
                      <img
                        src={
                          p?.imageUrl ||
                          p?.variants?.[0]?.images?.[0]?.imageUrl ||
                          "https://via.placeholder.com/400"
                        }
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>

                    <div className="p-5 flex flex-col min-h-[190px]">
                      <Link to={`/product/${p.productId}`}>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase leading-snug line-clamp-2 mb-2 group-hover:text-red-800 transition-colors">
                          {p.name}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-gray-400 mb-3 tracking-wide">
                        SKU: {p.sku || p?.variants?.[0]?.sku || "N/A"}
                      </p>
                      <div className="mt-auto">
                        <p className="text-xl font-bold text-[#8B0000] mb-4">
                          {formatPrice(p.price || p?.variants?.[0]?.price)}
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
