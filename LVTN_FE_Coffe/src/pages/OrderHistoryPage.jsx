import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../components/Api/order';
import { FaBox, FaClock, FaChevronRight, FaShoppingBag } from 'react-icons/fa';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Backend của bạn dùng X-Guest-Key để filter đơn hàng cho Guest
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
  }, []);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (s === 'completed' || s === 'success') return 'bg-green-100 text-green-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-600 animate-pulse">ĐANG TẢI LỊCH SỬ ĐƠN HÀNG...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <FaBox className="text-blue-600" /> ĐƠN HÀNG CỦA TÔI
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="text-gray-300 text-3xl" />
            </div>
            <p className="text-gray-500 text-lg mb-6">Bạn chưa có đơn hàng nào được thực hiện.</p>
            <button 
              onClick={() => navigate('/product-list')}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
            >
              MUA SẮM NGAY
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
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
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Tổng tiền</p>
                      <p className="text-xl font-black text-red-600">
                        {(order.totalAmount || order.totalPrice).toLocaleString()}đ
                      </p>
                    </div>
                    <FaChevronRight className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;