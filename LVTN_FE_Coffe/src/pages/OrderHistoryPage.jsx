import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../components/Api/order';
import { isAuthenticated } from '../utils/auth';
import { FaBox, FaClock, FaShoppingBag, FaSearch, FaUndo, FaTimes, FaUpload } from 'react-icons/fa';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // States cho tính năng hoàn trả
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnImages, setReturnImages] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState('');
  
  const navigate = useNavigate();

  // --- 1. Fetch Orders ---
  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        try {
          setLoading(true);
          const response = await orderApi.getHistory();
          console.log('🔔 order history raw response:', response);
          const data = response.data || response;
          
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

  // --- 2. Helper Functions ---
  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (s === 'completed' || s === 'success') return 'bg-green-100 text-green-700';
    if (s === 'delivered') return 'bg-blue-100 text-blue-700';
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

  // --- 3. Search Handlers ---
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
      setOrders([]);
    }
  };

  // --- 4. Return Dialog Handlers (Đã đưa ra khỏi handleResetSearch) ---
  const openReturnDialog = (orderId, e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra button cha (accordion)
    setSelectedOrderId(orderId);
    setReturnDialogOpen(true);
    setReturnReason('');
    setReturnImages([]);
    setReturnError('');
  };

  const closeReturnDialog = () => {
    setReturnDialogOpen(false);
    setSelectedOrderId(null);
    setReturnReason('');
    setReturnImages([]);
    setReturnError('');
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        setReturnImages(files);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    
    if (!returnReason.trim()) {
      setReturnError('Vui lòng nhập lý do hoàn trả');
      return;
    }

    try {
      setReturnLoading(true);
      setReturnError('');

      const formData = new FormData();
      formData.append('Reason', returnReason);
      
      returnImages.forEach((image) => {
        formData.append('Images', image);
      });

      await orderApi.requestReturn(selectedOrderId, formData);
      
      alert('Yêu cầu hoàn trả đã được gửi thành công!');
      closeReturnDialog();
      
      // Refresh orders list if logged in
      if (isLoggedIn) {
        const response = await orderApi.getHistory();
        const data = response.data || response;
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Lỗi gửi yêu cầu hoàn trả:", err);
      setReturnError('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setReturnLoading(false);
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

        {/* Orders List */}
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
              
              // Debug: kiểm tra trạng thái đơn hàng
              console.log(`Order ${order.id} - Status: "${order.status}" - Lowercase: "${order.status?.toLowerCase()}" - Can return: ${order.status?.toLowerCase() === 'delivered'}`);

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  {/* Header: click to expand */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(order.id)}
                    className="w-full text-left p-6 flex flex-col md:flex-row justify-between gap-4 items-center group"
                  >
                    <div className="flex gap-4 items-center w-full">
                      <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 font-bold shrink-0">
                        #{order.id.toString().slice(-4)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800">Mã đơn: {order.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <FaClock /> {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>

                        {/* Summary images */}
                        {items.length > 0 && (
                          <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex -space-x-2">
                              {items.slice(0, 3).map((it, i) => (
                                <img
                                  key={i}
                                  src={it.imageUrl || it.productImage || it.image || 'https://via.placeholder.com/48'}
                                  alt={it.productName}
                                  className="w-10 h-10 object-contain rounded border bg-white"
                                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48'; }}
                                />
                              ))}
                              {items.length > 3 && (
                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600 border">+{items.length - 3}</div>
                              )}
                            </div>
                            <div className="hidden sm:block">
                              <div className="font-medium text-gray-800 line-clamp-1">{items[0]?.productName}</div>
                              <div className="text-xs text-gray-400">{itemCount} sản phẩm • {items[0]?.quantity} x {formatPrice(items[0]?.priceAtPurchase || items[0]?.productPrice)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-4 md:mt-0 gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Tổng</p>
                        <p className="text-xl font-black text-red-600">{formatPrice(total)}</p>
                      </div>

                      {/* Nút yêu cầu hoàn trả - Chỉ hiển thị khi đơn hàng đã giao (Delivered) */}
                      {order.status?.toLowerCase() === 'delivered' && (
                         <button
                          onClick={(e) => openReturnDialog(order.id, e)}
                          className="mt-2 group flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                        >
                          <FaUndo className="text-[10px] group-hover:-rotate-45 transition-transform" /> 
                          <span>Hoàn trả</span>
                        </button>
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {String(expandedOrderId) === String(order.id) && (
                    <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                      {/* Thông tin đơn hàng */}
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Thông tin đơn hàng</h3>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                              <p className="font-bold text-gray-800">#{order.id.split('-')[0].toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Ngày đặt</p>
                              <p className="font-medium text-gray-800">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            {order.updatedAt && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
                                <p className="font-medium text-gray-800">{new Date(order.updatedAt).toLocaleString('vi-VN')}</p>
                              </div>
                            )}
                            {order.shippingMethod && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Phương thức vận chuyển</p>
                                <p className="font-medium text-blue-600">{order.shippingMethod}</p>
                              </div>
                            )}
                            {order.promotionCode && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Mã khuyến mãi</p>
                                <p className="font-medium text-green-600">{order.promotionCode}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Thông tin giao hàng */}
                      {(order.shippingAddress || order.receiverPhone || order.receiverName || order.receiverEmail) && (
                        <div className="p-6 border-b border-gray-200">
                          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Thông tin người nhận</h3>
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="grid md:grid-cols-2 gap-4">
                              {(order.receiverName || order.customerName) && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Người nhận</p>
                                  <p className="font-medium text-gray-800">{order.receiverName || order.customerName}</p>
                                </div>
                              )}
                              {(order.receiverPhone || order.phoneNumber) && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                                  <p className="font-medium text-gray-800">{order.receiverPhone || order.phoneNumber}</p>
                                </div>
                              )}
                              {(order.receiverEmail || order.email) && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Email</p>
                                  <p className="font-medium text-gray-800">{order.receiverEmail || order.email}</p>
                                </div>
                              )}
                              {order.shippingAddress && (
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-500 mb-1">Địa chỉ giao hàng</p>
                                  <p className="font-medium text-gray-800">{order.shippingAddress}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Danh sách sản phẩm */}
                      <div className="p-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Sản phẩm đã đặt</h3>
                        <div className="space-y-3">
                          {items && items.length > 0 ? (
                            items.map((it) => (
                              <div key={it.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
                                <div className="flex gap-4">
                                  {/* Hình ảnh sản phẩm */}
                                  <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                      src={it.imageUrl || it.productImage || it.image || 'https://via.placeholder.com/80'}
                                      alt={it.productName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80'; }}
                                    />
                                  </div>

                                  {/* Thông tin sản phẩm */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 mb-1 line-clamp-2">{it.productName}</h4>
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                      <span className="text-gray-600">
                                        Giá: <span className="font-semibold text-blue-600">{formatPrice(it.priceAtPurchase || it.productPrice)}</span>
                                      </span>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-gray-600">
                                        SL: <span className="font-semibold">{it.quantity}</span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Thành tiền */}
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-gray-500 mb-1">Thành tiền</p>
                                    <p className="text-lg font-black text-red-600">
                                      {formatPrice(it.subtotal || (it.priceAtPurchase || it.productPrice) * it.quantity)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                              Không có sản phẩm trong đơn hàng này.
                            </div>
                          )}
                        </div>

                        {/* Tổng kết đơn hàng */}
                        <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border-2 border-blue-100">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Tạm tính ({itemCount} sản phẩm)</span>
                              <span className="font-medium">{formatPrice(order.totalAmount || order.totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Phí vận chuyển</span>
                              <span className="font-medium">{formatPrice(order.shippingFee || 0)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Giảm giá</span>
                                <span className="font-medium">-{formatPrice(order.discountAmount)}</span>
                              </div>
                            )}
                            <div className="border-t-2 border-dashed border-gray-200 pt-3 flex justify-between items-center">
                              <span className="text-base font-bold text-gray-800">TỔNG THANH TOÁN</span>
                              <span className="text-2xl font-black text-red-600">
                                {formatPrice(order.finalAmount ?? order.totalAmount ?? order.totalPrice)}
                              </span>
                            </div>
                          </div>
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

      {/* Return Request Dialog - Đã được chuyển ra ngoài vòng lặp orders.map */}
      {returnDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Yêu cầu hoàn trả đơn hàng</h2>
              <button
                onClick={closeReturnDialog}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mã đơn hàng
                </label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-800 font-medium">
                  #{selectedOrderId}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Lý do hoàn trả <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={returnReason}
                  onChange={(e) => {
                    setReturnReason(e.target.value);
                    setReturnError('');
                  }}
                  placeholder="Vui lòng mô tả chi tiết lý do hoàn trả (VD: Sản phẩm bị hỏng, không đúng mô tả, ...)"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Hình ảnh minh chứng (tùy chọn)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="return-images"
                  />
                  <label
                    htmlFor="return-images"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FaUpload className="text-gray-400 text-3xl" />
                    <span className="text-sm text-gray-600">
                      Click để tải lên hình ảnh
                    </span>
                    <span className="text-xs text-gray-400">
                      Hỗ trợ: JPG, PNG, GIF
                    </span>
                  </label>
                </div>
                {returnImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {returnImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 cursor-pointer hover:bg-red-500 transition"
                          onClick={() => setReturnImages(returnImages.filter((_, i) => i !== idx))}
                        >
                          <FaTimes className="text-white text-xs" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {returnError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  {returnError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeReturnDialog}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={returnLoading}
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {returnLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;