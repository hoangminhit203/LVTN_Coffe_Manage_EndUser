import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/Coffe-Logo.jpg";
import {
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaBox, // Thêm icon hộp để đại diện cho đơn hàng
} from "react-icons/fa";
import { isAuthenticated, logout, getUserFromToken } from "../../utils/auth";
import { cartApi } from "../Api/products";
import { userApi } from "../Api/user";

const Menus = [
  { id: 1, name: "Trang chủ", link: "/" },
  { id: 2, name: "Sản phẩm", link: "/product-list" },
  { id: 3, name: "Tin tức", link: "/news" },
  { id: 4, name: "Giới thiệu", link: "/about" },
  { id: 5, name: "Liên hệ", link: "/contact" },
];

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm lấy chữ cái đầu của tên
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Hàm tạo màu nền từ tên
  const getAvatarColor = (name) => {
    if (!name) return "#6B7280";
    const colors = [
      "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
      "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#6366F1"
    ];
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[charCode % colors.length];
  };

  // Hàm lấy số lượng từ API
  const fetchCartCount = async () => {
    // Luôn cho phép fetch cart count, apiRequest sẽ tự xử lý Guest-Key hoặc Token
    try {
      const response = await cartApi.getCart();
      const data = response.data || response;
      const count = data.items?.reduce((total, item) => total + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (err) {
      console.error("Lỗi lấy số lượng giỏ hàng:", err);
      setCartCount(0);
    }
  };

  // Lắng nghe thay đổi URL (Chuyển trang)
  useEffect(() => {
    setIsAuth(isAuthenticated());
    setIsMobileMenuOpen(false);
    fetchCartCount();
    
    if (isAuthenticated()) {
      fetchUserName();
    } else {
      setUserName("");
    }
  }, [location]);

  // Hàm lấy username từ API
  const fetchUserName = async () => {
    try {
      const response = await userApi.me();
      const userData = response?.data?.data || response?.data || response;
      const displayName = userData?.firstName && userData?.lastName 
        ? `${userData.firstName} ${userData.lastName}` 
        : userData?.userName || userData?.email?.split('@')[0] || "User";
      setUserName(displayName);
    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
      const tokenData = getUserFromToken();
      const emailFromToken = tokenData?.email || tokenData?.unique_name;
      setUserName(emailFromToken?.split('@')[0] || "User");
    }
  };

  // Lắng nghe sự kiện "cartUpdated"
  useEffect(() => {
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
    };
  }, []);

  // Xử lý đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setUserName("");
    setIsDropdownOpen(false);
    setCartCount(0);
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-black"
            style={{ fontFamily: "Pacifico, cursive" }}
          >
            <img src={Logo} alt="Logo" className="w-9 h-9 object-contain" />
            <span className="hidden sm:inline">COFFEE E-COMMERCE</span>
          </Link>

          {/* MENU DESKTOP */}
          <ul className="hidden md:flex items-center gap-6">
            {Menus.map((m) => (
              <li key={m.id}>
                <Link
                  to={m.link}
                  className="text-gray-700 font-medium py-2 border-b-2 border-transparent hover:text-black hover:border-red-500 transition"
                >
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* ICON GIỎ HÀNG */}
            <Link
              to="/cart"
              className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            >
              <FaShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* USER DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors overflow-hidden"
                style={isAuth && userName ? {
                  backgroundColor: getAvatarColor(userName),
                  borderColor: getAvatarColor(userName)
                } : {}}
              >
                {isAuth && userName ? (
                  <span className="text-white font-bold text-sm">
                    {getInitials(userName)}
                  </span>
                ) : (
                  <FaUser />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-3 border border-gray-100 z-[60] overflow-hidden">
                  {!isAuth ? (
                    <>
                      {/* DÀNH CHO KHÁCH VÃNG LAI */}
                      <Link to="/login" className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 text-sm text-gray-700 transition-colors">
                        <FaSignInAlt className="text-blue-500" /> 
                        <span className="font-medium">Đăng nhập</span>
                      </Link>
                      <Link to="/register" className="flex items-center gap-3 px-5 py-3 hover:bg-green-50 text-sm text-gray-700 transition-colors">
                        <FaUserPlus className="text-green-500" /> 
                        <span className="font-medium">Đăng ký thành viên</span>
                      </Link>
                      
                      <div className="border-t border-gray-50 my-2"></div>
                      
                      <Link to="/order-history" className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-sm text-orange-600 transition-colors font-bold">
                        <FaBox className="text-orange-500" /> 
                        Tra cứu đơn hàng
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* DÀNH CHO THÀNH VIÊN */}
                      <div className="px-5 py-3 bg-gray-50 mb-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tài khoản</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{userName}</p>
                      </div>
                      
                      <Link to="/profile" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                        <FaUser className="text-gray-400" /> Thông tin cá nhân
                      </Link>
                      
                      <Link to="/dashboard" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                        <FaBox className="text-gray-400" /> Đơn hàng của tôi
                      </Link>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 text-sm flex items-center gap-3 font-bold transition-all"
                      >
                        <FaSignOutAlt /> Đăng xuất
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-xl p-2 text-gray-600"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-in slide-in-from-top duration-300">
            <ul className="flex flex-col gap-4">
              {Menus.map((m) => (
                <li key={m.id}>
                  <Link
                    to={m.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-red-500 block px-2 font-medium"
                  >
                    {m.name}
                  </Link>
                </li>
              ))}
              {/* Thêm link đơn hàng vào mobile menu */}
              <li>
                <Link
                  to={isAuth ? "/dashboard" : "/order-history"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-orange-600 block px-2 font-bold flex items-center gap-2"
                >
                  <FaBox /> {isAuth ? "Đơn hàng của tôi" : "Tra cứu đơn hàng"}
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;