import React, { useEffect, useState } from "react";
import orderApi from "../components/Api/order";
import { FaCalendarAlt, FaBox, FaChevronRight, FaFilter, FaInbox, FaSearch } from "react-icons/fa";

// 1. Định nghĩa OrderCard (Đã sửa để đảm bảo được sử dụng)
const OrderCard = ({ order, formatCurrency, formatDate, onDetail }) => {
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 hover:shadow-lg transition-all duration-300 group">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FaBox size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Mã đơn: #{order.id}</h4>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <FaCalendarAlt size={10} /> {formatDate(order.orderDate || order.createdAt)}
            </p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getStatusStyle(order.status)} uppercase tracking-wider`}>
          {order.status || 'N/A'}
        </span>
      </div>

      <div className="space-y-3 border-t border-dashed pt-4">
        {order.orderItems?.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm items-center">
            <span className="text-gray-600 truncate max-w-[200px]">
              {item.productName} <strong className="text-gray-400 ml-1 font-medium">x{item.quantity}</strong>
            </span>
            <span className="font-semibold text-gray-800">{formatCurrency(item.priceAtPurchase)}</span>
          </div>
        ))}
        {order.orderItems?.length > 2 && (
          <p className="text-xs text-blue-500 font-medium italic">...và {order.orderItems.length - 2} sản phẩm khác</p>
        )}
      </div>

      <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-50">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Tổng thanh toán</p>
          <p className="text-xl font-black text-red-600">{formatCurrency(order.finalAmount || order.totalAmount)}</p>
        </div>
        <button 
          onClick={() => onDetail(order.id)}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          Chi tiết <FaChevronRight size={10} />
        </button>
      </div>
    </div>
  );
};

// 2. Component chính OrderPage
const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getHistory();
      const list = Array.isArray(data) ? data : data?.data || [];
      const sortedList = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedList);
      setFilteredOrders(sortedList);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = orders;
    if (filter !== "all") {
      result = result.filter(o => o.status?.toLowerCase() === filter.toLowerCase());
    }
    if (searchTerm) {
      result = result.filter(o => o.id.toString().includes(searchTerm));
    }
    setFilteredOrders(result);
  }, [filter, searchTerm, orders]);

  const formatCurrency = (val) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-black text-gray-800 mb-6">Đơn đặt hàng</h2>
      
      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-full md:w-auto overflow-x-auto">
          {['all', 'pending', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === status ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {status === 'all' ? 'Tất cả' : status === 'pending' ? 'Chờ xử lý' : status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
          <input 
            type="text"
            placeholder="Tìm mã đơn hàng..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Render List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <FaInbox size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Không tìm thấy đơn hàng nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => (
            /* ĐÂY LÀ NƠI SỬ DỤNG ORDERCARD ĐỂ HẾT LỖI */
            <OrderCard 
              key={order.id}
              order={order}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onDetail={(id) => console.log("Chi tiết đơn:", id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage;