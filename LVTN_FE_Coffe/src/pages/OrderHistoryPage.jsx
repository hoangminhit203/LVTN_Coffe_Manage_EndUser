import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../components/Api/order';
import { isAuthenticated } from '../utils/auth';
import { FaBox, FaClock, FaChevronRight, FaShoppingBag, FaSearch, FaUser } from 'react-icons/fa';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        // Chỉ fetch history nếu user đã đăng nhập
        try {
          setLoading(true);
          const response = await orderApi.getHistory();
          console.log('🔔 order history raw response:', response);
          const data = response.data || response;
          console.log('🔔 resolved orders array:', data);
          // Log image URLs to help debug missing images
          if (Array.isArray(data)) {
            data.forEach((o) => {
              const items = o.items || o.orderItems || [];
              items.forEach((it) => console.log(`Order ${o.id} item ${it.id} image:`, it.imageUrl || it.productImage || it.image));
            });
          }
          setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Lỗi lấy lịch sử đơn hàng:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkAuthAndFetchOrders();
  }, []);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (s === 'completed' || s === 'success') return 'bg-green-100 text-green-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const toggleExpand = (orderId) => {
    console.log('OrderHistory: toggleExpand called for', orderId, 'previous expanded:', expandedOrderId);
    setExpandedOrderId(prev => (String(prev) === String(orderId) ? null : orderId));
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('vi-VN') + 'đ';
  };

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    if (!searchOrderId.trim()) {
      setSearchError('Vui lòng nhập mã đơn hàng');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError('');
      const response = await orderApi.getById(searchOrderId);
      const data = response.data || response;
      
      if (data) {
        // Replace orders with just the searched order
        setOrders([data]);
        setExpandedOrderId(data.id);
      } else {
        setSearchError('Không tìm thấy đơn hàng');
        setOrders([]);
      }
    } catch (err) {
      console.error("Lỗi tra cứu đơn hàng:", err);
      setSearchError('Không tìm thấy đơn hàng hoặc có lỗi xảy ra');
      setOrders([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchOrderId('');
    setSearchError('');
    
    // Chỉ reload orders nếu user đã đăng nhập
    if (isLoggedIn) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const response = await orderApi.getHistory();
          const data = response.data || response;
          setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Lỗi lấy lịch sử đơn hàng:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    } else {
      // Nếu chưa đăng nhập, chỉ reset về trạng thái rỗng
      setOrders([]);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-600 animate-pulse">ĐANG TẢI LỊCH SỬ ĐƠN HÀNG...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <FaBox className="text-blue-600" /> 
          {isLoggedIn ? 'ĐƠN HÀNG CỦA TÔI' : 'TRA CỨU ĐƠN HÀNG'}
        </h1>

        {/* Thông báo nếu chưa đăng nhập */}
        {/* {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <FaUser className="text-blue-600 text-xl" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                Bạn chưa đăng nhập. Vui lòng nhập mã đơn hàng để tra cứu.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
            >
              Đăng nhập
            </button>
          </div>
        )} */}

        {/* Search Box */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <form onSubmit={handleSearchOrder} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tra cứu đơn hàng theo mã
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchOrderId}
                  onChange={(e) => {
                    setSearchOrderId(e.target.value);
                    setSearchError('');
                  }}
                  placeholder="Nhập mã đơn hàng..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {searchError && (
                <p className="text-red-500 text-sm mt-1">{searchError}</p>
              )}
            </div>
            <div className="flex gap-2 items-end">
              <button
                type="submit"
                disabled={searchLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
              {(searchOrderId || orders.length > 0) && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  {isLoggedIn ? 'Đặt lại' : 'Xóa'}
                </button>
              )}
            </div>
          </form>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="text-gray-300 text-3xl" />
            </div>
            <p className="text-gray-500 text-lg mb-6">
              {isLoggedIn 
                ? 'Bạn chưa có đơn hàng nào được thực hiện.' 
                : 'Nhập mã đơn hàng để tra cứu thông tin.'}
            </p>
            {isLoggedIn && (
              <button 
                onClick={() => navigate('/product-list')}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
              >
                MUA SẮM NGAY
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const items = order.items || order.orderItems || [];
              const itemCount = order.itemCount ?? items.length;
              const total = order.finalAmount ?? order.totalAmount ?? order.totalPrice;

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  {/* Header: click to expand */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(order.id)}
                    className="w-full text-left p-6 flex flex-col md:flex-row justify-between gap-4 items-center group"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                        #{order.id.toString().slice(-4)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800">Mã đơn: {order.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <FaClock /> {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>

                        {/* Summary: show up to 3 thumbnails and a small text */}
                        {items.length > 0 && (
                          <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex -space-x-2">
                              {items.slice(0, 3).map((it, i) => (
                                <img
                                  key={i}
                                  src={it.imageUrl || it.productImage || it.image || 'https://via.placeholder.com/48'}
                                  alt={it.productName}
                                  className="w-10 h-10 object-contain rounded border"
                                  onError={(e) => { console.error('OrderHistory image failed:', e.currentTarget.src); e.currentTarget.src = 'https://via.placeholder.com/48'; }}
                                />
                              ))}
                              {items.length > 3 && (
                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600 border">+{items.length - 3}</div>
                              )}
                            </div>

                            <div>
                              <div className="font-medium text-gray-800">{items[0]?.productName}</div>
                              <div className="text-xs text-gray-400">{itemCount} sản phẩm • {items[0]?.quantity} x {formatPrice(items[0]?.priceAtPurchase || items[0]?.productPrice)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Tổng</p>
                        <p className="text-xl font-black text-red-600">{formatPrice(total)}</p>
                      </div>
                      <div className={`text-gray-300 transition-transform ${String(expandedOrderId) === String(order.id) ? 'rotate-90 text-blue-600' : 'group-hover:text-blue-600'}`}>
                        <FaChevronRight />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {String(expandedOrderId) === String(order.id) && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                      <h3 className="text-lg font-bold mb-4">Chi tiết đơn hàng</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="text-sm text-gray-500 border-b">
                              <th className="py-3">Ảnh</th>
                              <th className="py-3">Sản phẩm</th>
                              <th className="py-3">Giá</th>
                              <th className="py-3">Số lượng</th>
                              <th className="py-3">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items && items.length > 0 ? (
                              items.map((it) => (
                                <tr key={it.id} className="text-sm text-gray-700 border-b">
                                  <td className="py-4 w-20">
                                    <img
                                    src={it.imageUrl || it.productImage || it.image || 'https://via.placeholder.com/60'}
                                    alt={it.productName}
                                    className="w-14 h-14 object-contain"
                                    onError={(e) => { console.error('OrderHistory detail image failed:', e.currentTarget.src); e.currentTarget.src = 'https://via.placeholder.com/60'; }}
                                  />
                                  </td>
                                  <td className="py-4 font-medium">{it.productName}</td>
                                  <td className="py-4">{formatPrice(it.priceAtPurchase || it.productPrice)}</td>
                                  <td className="py-4">{it.quantity}</td>
                                  <td className="py-4 font-black text-right">{formatPrice(it.subtotal || (it.priceAtPurchase || it.productPrice) * it.quantity)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-4 text-sm text-gray-500">Không có sản phẩm trong đơn hàng này.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex justify-end gap-8">
                        <div className="text-right text-sm text-gray-600">
                          <div>Phí vận chuyển: <span className="font-medium">{formatPrice(order.shippingFee)}</span></div>
                          <div>Giảm giá: <span className="font-medium">{formatPrice(order.discountAmount)}</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Tổng cuối</div>
                          <div className="text-xl font-black text-red-600">{formatPrice(order.finalAmount ?? order.totalAmount ?? order.totalPrice)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;