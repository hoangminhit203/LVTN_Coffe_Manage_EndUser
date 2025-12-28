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
} from "react-icons/fa";
import { isAuthenticated, logout } from "../../utils/auth";
import { cartApi } from "../Api/products";

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
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm lấy số lượng từ API
  const fetchCartCount = async () => {
    if (!isAuthenticated()) {
      setCartCount(0);
      return;
    }
    try {
      const response = await cartApi.getCart();
      const data = response.data || response;
      const count = data.items?.reduce((total, item) => total + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (err) {
      console.error("Lỗi lấy số lượng giỏ hàng:", err);
    }
  };

  // Lắng nghe thay đổi URL (Chuyển trang)
  useEffect(() => {
    setIsAuth(isAuthenticated());
    setIsMobileMenuOpen(false);
    fetchCartCount();
  }, [location]);

  // Lắng nghe sự kiện "cartUpdated" TỰ ĐỘNG (Không cần reload)
  useEffect(() => {
    window.addEventListener("cartUpdated", fetchCartCount);
    
    // Cleanup khi component bị hủy
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
    };
  }, []);

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
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FaUser />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-[60]">
                  {!isAuth ? (
                    <>
                      <Link to="/login" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                        <FaSignInAlt className="text-blue-500" /> Đăng nhập
                      </Link>
                      <Link to="/register" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                        <FaUserPlus className="text-green-500" /> Đăng ký
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard" className="px-4 py-2 block hover:bg-gray-50 text-sm text-gray-700 font-medium">
                        Đơn hàng của tôi
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm flex items-center gap-3 transition-colors"
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
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;