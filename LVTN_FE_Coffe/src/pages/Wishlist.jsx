import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../components/Api/products';
import { useToast } from '../components/Toast';
import { FaTrashAlt, FaEye, FaShoppingCart, FaSpinner } from 'react-icons/fa';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]); 
  const [processingId, setProcessingId] = useState(null); 
  const [isBulkProcessing, setIsBulkProcessing] = useState(false); // Trạng thái mua hàng loạt
  const toast = useToast();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistApi.getAll();
      const data = response?.value?.records || [];
      setItems(data);
    } catch (err) {
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleCheckItem = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(items.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 1. HÀM MUA LẺ (Mua ngay từng món)
  const handleAddToCart = async (wishlistId) => {
    try {
      setProcessingId(wishlistId);
      const res = await wishlistApi.addToCard(wishlistId);
      const result = res?.value;

      if (result?.isSuccess) {
        toast.success(result.message || 'Đã thêm vào giỏ hàng');
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result?.message || 'Thêm vào giỏ hàng thất bại');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setProcessingId(null);
    }
  };

  // 2. HÀM MUA HÀNG LOẠT (Sử dụng vòng lặp cho các món đã check)
  const handleBuySelected = async () => {
    if (selectedIds.length === 0) return;

    setIsBulkProcessing(true);
    let successCount = 0;

    try {
      // Chạy vòng lặp gọi API cho từng ID được chọn
      for (const id of selectedIds) {
        try {
          const res = await wishlistApi.addToCard(id);
          if (res?.value?.isSuccess) {
            successCount++;
          }
        } catch (e) {
          console.error(`Lỗi khi thêm món ${id}:`, e);
        }
      }

      if (successCount > 0) {
        toast.success(`Đã thêm thành công ${successCount}/${selectedIds.length} sản phẩm vào giỏ hàng`);
        window.dispatchEvent(new Event("cartUpdated"));
        setSelectedIds([]); // Xóa các lựa chọn sau khi mua thành công
      } else {
        toast.error("Không có sản phẩm nào được thêm thành công");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra trong quá trình mua hàng loạt");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Xóa sản phẩm này khỏi danh sách yêu thích?")) return;
    try {
      const res = await wishlistApi.remove(id);
      if (res?.value?.isSuccess !== false) {
        toast.success('Đã xóa khỏi danh sách');
        setSelectedIds(prev => prev.filter(item => item !== id));
        fetchWishlist();
      }
    } catch (err) {
      toast.error('Xóa thất bại');
    }
  };

  const formatPrice = (price) => {
    return price > 0 ? Number(price).toLocaleString('vi-VN') + ' đ' : 'Liên hệ';
  };

  return (
    <div className="bg-white min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <nav className="text-xs text-gray-400 mb-8 uppercase tracking-widest">
          Trang chủ &gt; <span className="text-gray-600 font-bold">Danh sách yêu thích</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b-2 border-gray-100 pb-4 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 uppercase">
            Sản phẩm yêu thích ({items.length})
          </h2>
          
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBuySelected}
              disabled={isBulkProcessing}
              className="bg-[#8B0000] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 disabled:bg-gray-400"
            >
              {isBulkProcessing ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaShoppingCart />
              )}
              Mua các món đã chọn ({selectedIds.length})
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Đang tải danh sách...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 mb-6 italic">Danh sách yêu thích của bạn đang trống.</p>
            <Link to="/product-list" className="inline-block bg-black text-white px-10 py-3 uppercase text-xs font-bold tracking-widest hover:bg-red-900 transition-all">
              Quay lại cửa hàng
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100 text-left">
                  <th className="py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-red-800 cursor-pointer"
                      onChange={handleCheckAll}
                      checked={selectedIds.length === items.length && items.length > 0}
                    />
                  </th>
                  <th className="py-4 font-bold text-xs uppercase tracking-widest text-gray-500">Sản phẩm</th>
                  <th className="py-4 font-bold text-xs uppercase tracking-widest text-gray-500 hidden md:table-cell">Giá</th>
                  <th className="py-4 font-bold text-xs uppercase tracking-widest text-gray-500 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 group hover:bg-gray-50 transition-colors">
                    <td className="py-6">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-red-800 cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleCheckItem(item.id)}
                      />
                    </td>
                    
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex-shrink-0 border border-gray-200 overflow-hidden bg-gray-50">
                          <img
                            src={item.productImageUrl || 'https://via.placeholder.com/100'}
                            alt={item.productName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div>
                          <Link to={`/product/${item.productId}`} className="text-sm font-bold text-gray-900 uppercase hover:text-red-800 transition-colors">
                            {item.productName}
                          </Link>
                          <p className="md:hidden text-red-700 font-bold mt-1 text-sm">{formatPrice(item.productPrice)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-6 hidden md:table-cell">
                      <span className="text-sm font-bold text-gray-700">
                        {formatPrice(item.productPrice)}
                      </span>
                    </td>

                    <td className="py-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* NÚT MUA LẺ TỪNG DÒNG */}
                        <button
                          onClick={() => handleAddToCart(item.id)}
                          disabled={processingId === item.id}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            processingId === item.id 
                            ? 'bg-gray-200 text-gray-400' 
                            : 'bg-black text-white hover:bg-[#8B0000]'
                          }`}
                        >
                          {processingId === item.id ? '...' : 'Mua ngay'}
                        </button>

                        <Link
                          to={`/product/${item.productId}`}
                          className="p-2 text-gray-400 hover:text-black transition-colors"
                          title="Xem chi tiết"
                        >
                          <FaEye size={16} />
                        </Link>
                        
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;