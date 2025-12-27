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
} from "react-icons/fa";
import { isAuthenticated, logout } from "../../utils/auth";

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
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setIsMobileMenuOpen(false);
  }, [location]);

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
            COFFEE E-COMMERCE
          </Link>

          {/* MENU DESKTOP */}
          <ul className="hidden md:flex items-center gap-6">
            {Menus.map((m) => (
              <li key={m.id}>
                <Link
                  to={m.link}
                  className="
                    text-gray-700 font-medium
                    py-2 border-b-2 border-transparent
                    hover:text-black hover:border-red-500
                    transition
                  "
                >
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* USER */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100"
              >
                <FaUser />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg py-2">
                  {!isAuth ? (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                      >
                        <FaSignInAlt /> Đăng nhập
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                      >
                        <FaUserPlus /> Đăng ký
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        className="px-4 py-2 block hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        <FaSignOutAlt /> Đăng xuất
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-xl"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <ul className="flex flex-col gap-4">
              {Menus.map((m) => (
                <li key={m.id}>
                  <Link
                    to={m.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-red-500"
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
