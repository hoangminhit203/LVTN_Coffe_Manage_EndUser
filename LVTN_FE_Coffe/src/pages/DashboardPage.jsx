import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUserFromToken } from "../utils/auth";

// Import các trang của bạn vào đây
import OrderPage from "./OrderPage"; 
import CartPage from "./CartPage"; 

import { 
  FaShoppingCart, FaHistory, FaSignOutAlt, 
  FaUserCircle, FaChevronRight 
} from "react-icons/fa";

const DashboardPage = () => {
  // Mặc định ban đầu sẽ hiện "orders" (Đơn hàng)
  const [activeTab, setActiveTab] = useState("orders"); 
  const navigate = useNavigate();
  const user = getUserFromToken();

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
        
        {/* --- BÊN TRÁI: SIDEBAR FILTER / MENU --- */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-8 bg-blue-600 text-white flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4 border-4 border-blue-400">
                <FaUserCircle size={50} />
              </div>
              <h3 className="font-bold text-lg">{user?.name || "Khách hàng"}</h3>
              <p className="text-xs opacity-70">Tài khoản cá nhân</p>
            </div>
            
            <nav className="p-4">
              {/* Filter: Đơn hàng */}
              <button 
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center justify-between p-4 rounded-2xl mb-2 transition-all cursor-pointer ${
                  activeTab === 'orders' 
                  ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-3"><FaHistory /> Đơn đặt hàng</span>
                <FaChevronRight size={10} />
              </button>

              {/* Filter: Giỏ hàng */}
              <button 
                onClick={() => setActiveTab("cart")}
                className={`w-full flex items-center justify-between p-4 rounded-2xl mb-2 transition-all cursor-pointer ${
                  activeTab === 'cart' 
                  ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-3"><FaShoppingCart /> Giỏ hàng</span>
                <FaChevronRight size={10} />
              </button>

              <div className="border-t my-4 border-gray-50"></div>
              
              <button 
                onClick={() => { logout(); navigate("/"); }}
                className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm"
              >
                <FaSignOutAlt /> Đăng xuất
              </button>
            </nav>
          </div>
        </div>

        {/* --- BÊN PHẢI: NỘI DUNG ĐƯỢC GỌI VÀO --- */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white rounded-3xl shadow-sm p-2 md:p-8 border border-gray-100 min-h-[700px]">
            
            {activeTab === "orders" ? (
              /* Gọi component OrderPage vào đây */
              <div className="animate-in fade-in duration-500">
                <OrderPage />
              </div>
            ) : (
              /* Gọi component CartPage vào đây */
              <div className="animate-in fade-in duration-500">
                <CartPage />
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;