import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../components/Api/user';
import { isAuthenticated, logout } from '../utils/auth';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSignOutAlt } from 'react-icons/fa';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userApi.me();
      // API trả về { isSuccess, message, data }
      const userData = response?.data?.data || response?.data || response;
      setUser(userData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || user?.userName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.userName || 'Người dùng'}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h2>
            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <FaEdit />
              <span className="hidden sm:inline">Chỉnh sửa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <FaUser className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Tên đăng nhập</p>
                <p className="text-gray-800 font-medium">
                  {user?.userName || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaEnvelope className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800 font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaUser className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Họ</p>
                <p className="text-gray-800 font-medium">
                  {user?.lastName || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaUser className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Tên</p>
                <p className="text-gray-800 font-medium">
                  {user?.firstName || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="text-gray-800 font-medium">
                  {user?.address || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaUser className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Giới tính</p>
                <p className="text-gray-800 font-medium">
                  {user?.sex || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-3xl mb-2">📦</div>
            <h3 className="font-semibold text-gray-800">Đơn hàng của tôi</h3>
            <p className="text-sm text-gray-600 mt-1">Xem lịch sử đơn hàng</p>
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-3xl mb-2">🛒</div>
            <h3 className="font-semibold text-gray-800">Giỏ hàng</h3>
            <p className="text-sm text-gray-600 mt-1">Xem giỏ hàng của bạn</p>
          </button>

          <button
            onClick={() => navigate('/product-list')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-3xl mb-2">☕</div>
            <h3 className="font-semibold text-gray-800">Sản phẩm</h3>
            <p className="text-sm text-gray-600 mt-1">Khám phá sản phẩm</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
