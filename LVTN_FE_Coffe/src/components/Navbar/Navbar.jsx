import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from '../../assets/Coffe-Logo.jpg'
import { FaCoffee, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa'
import { isAuthenticated, logout } from '../../utils/auth'

const Menus = [
  {
    id: 1,
    name: 'Home',
    link: '/',
  },
  {
    id: 2,
    name: 'Products',
    link: '/product-list',
  },
  {
    id: 3,
    name: 'About',
    link: '#about',
  },
  {
    id: 4,
    name: 'Services',
    link: '#menu',
  },
]

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Check auth status on mount and when location changes
  useEffect(() => {
    setIsAuth(isAuthenticated())
  }, [location])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update auth status on storage changes (from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setIsAuth(isAuthenticated())
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Poll for auth changes (useful when login happens in same tab)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentAuth = isAuthenticated()
      if (currentAuth !== isAuth) {
        setIsAuth(currentAuth)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isAuth])

  const handleLogout = () => {
    logout()
    setIsAuth(false)
    setIsDropdownOpen(false)
    navigate('/')
  }

  return (
    <div className='bg-gradient-to-r from-secondary to-secondary/90 text-white'>
      <div className='container py-2'>
        <div className='flex justify-between items-center gap-4'>
          {/* logo section */}
          <div data-aos="fade-down" data-aos-once="true">
            <Link to='/' className='font-bold text-2xl sm:text-3xl flex justify-center items-center gap-2 tracking-wider' style={{fontFamily: 'Pacifico, cursive'}}>
              <img src={Logo} alt="Logo" className='w-14'/>
              Coffee E-Commerce</Link>
          </div>
          {/* Links section  */}
          <div data-aos="fade-down" data-aos-once="true" data-aos-delay="300"
            className='flex justify-between items-center gap-4'>
            <ul className='hidden sm:flex items-center gap-4'>
              
              {
                Menus.map((data, index) => (
                  <li key={index}>
                    <Link
                      to={data.link}
                      className='inline-block text-xl py-4 px-4 text-white/70 hover:text-white duration-200'
                    >
                      {data.name}
                    </Link>
                  </li>
                ))}
              
              {/* <Link to="/cart" className="bg-primary/70 px-4 py-2 rounded-full hover:scale-105 duration-200 flex items-center gap-3 ">Order
                <FaCoffee className='text-xl cursor-pointer'/></Link> */}
              
              {/* User Icon with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition duration-200 cursor-pointer"
                  aria-label="User menu"
                >
                  <FaUser className="text-xl" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    {!isAuth ? (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                        >
                          <FaSignInAlt /> Đăng nhập
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                        >
                          <FaUserPlus /> Đăng ký
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                        >
                          <FaUser /> Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 transition"
                        >
                          <FaSignOutAlt /> Đăng xuất
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar