import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../components/Api/user';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP và password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await userApi.forgotPassword(email);
      
      if (response?.isSuccess || response?.data?.isSuccess) {
        setMessage('OTP đã được gửi đến email của bạn');
        setTimeout(() => {
          setStep(2);
          setMessage('');
        }, 1500);
      } else {
        setError(response?.message || 'Không thể gửi OTP');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      setLoading(false);
      return;
    }

    try {
      const response = await userApi.resetPassword({
        otp,
        newPassword,
        confirmPassword,
      });

      if (response?.isSuccess || response?.data?.isSuccess) {
        setMessage('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response?.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'OTP không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold mb-4 text-center">
          {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
        </h1>

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleSendOTP}>
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
              <p className="text-xs text-gray-500 mt-1">
                Nhập email đã đăng ký để nhận mã OTP
              </p>
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
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mã OTP từ email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ít nhất 8 ký tự"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lại mật khẩu mới"
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
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                  setMessage('');
                }}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Gửi lại mã OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
