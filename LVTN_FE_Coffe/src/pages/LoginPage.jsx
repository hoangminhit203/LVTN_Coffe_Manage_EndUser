import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../components/Api/user';
import { saveToken, getUserIdFromToken } from '../utils/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Redirect to home after a short delay when login success message is set
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => navigate('/'), 700);
    return () => clearTimeout(timer);
  }, [message, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await userApi.login({ email, password });

      const token = res?.token || res?.data?.token || res?.accessToken;
      const user = res?.user || res?.data?.user;

      if (token) {
        saveToken(token);
        const userId = getUserIdFromToken();
        console.log('User ID from token:', userId);
      }
      
      // Lưu thông tin user vào localStorage
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Fetch thông tin user từ API /Auth/Me nếu chưa có user
      if (!user && token) {
        try {
          const meResponse = await userApi.me();
          // API trả về { isSuccess, message, data }
          const userData = meResponse?.data?.data || meResponse?.data || meResponse;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (meErr) {
          console.error('Error fetching user info:', meErr);
        }
      }

      setMessage('Đăng nhập thành công');
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold mb-4 text-center">Đăng nhập</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
          {message && (
            <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

