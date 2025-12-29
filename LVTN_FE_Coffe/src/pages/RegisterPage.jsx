import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../components/Api/user';

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Register, 2: OTP, 3: Success
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userName: '',
    firstName: '',
    lastName: '',
    sex: true,
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  // Step 1: Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      // Chuẩn bị data theo đúng thứ tự API yêu cầu
      const registerData = {
        email: formData.email,
        password: formData.password,
        userName: formData.userName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        sex: formData.sex,
        confirmPassword: formData.confirmPassword,
      };
      
      await userApi.register(registerData);
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email confirmation
    if (confirmEmailInput.trim().toLowerCase() !== formData.email.trim().toLowerCase()) {
      setError('Email xác nhận không khớp với email đã đăng ký');
      setLoading(false);
      return;
    }

    try {
      // Chuẩn bị data theo đúng thứ tự API yêu cầu
      const otpData = {
        otp: otp,
        email: confirmEmailInput.trim(),
      };
      
      await userApi.confirmEmail(otpData);
      setStep(3); // Move to success step
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      await userApi.resendOtp(formData.email);
      setResendMessage('Mã OTP mới đã được gửi đến email của bạn!');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Gửi lại OTP thất bại');
    } finally {
      setResendLoading(false);
    }
  };

  // Render Step 1: Registration Form
  const renderRegisterForm = () => (
    <form className="space-y-4" onSubmit={handleRegister}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="username"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nguyễn"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Văn A"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
        <select
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={true}>Nam</option>
          <option value={false}>Nữ</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu *</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </button>

      <div className="text-center text-sm">
        <span className="text-gray-600">Đã có tài khoản? </span>
        <Link to="/login" className="text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </div>
    </form>
  );

  // Render Step 2: OTP Verification Form
  const renderOtpForm = () => (
    <form className="space-y-4" onSubmit={handleVerifyOtp}>
      <div className="text-center mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Mã OTP đã được gửi đến email
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Vui lòng kiểm tra hộp thư và thư mục spam
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          value={confirmEmailInput}
          onChange={(e) => setConfirmEmailInput(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập lại email để xác nhận"
        />
        <p className="text-xs text-gray-500 mt-1">Nhập lại email bạn đã đăng ký để xác nhận</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP *</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="000000"
          maxLength="6"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {resendMessage && (
        <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
          {resendMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang xác thực...' : 'Xác thực'}
      </button>

      <div className="text-center text-sm space-y-2">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendLoading}
          className="text-blue-600 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
        </button>
        <div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-blue-600 hover:underline"
          >
            Quay lại
          </button>
        </div>
      </div>
    </form>
  );

  // Render Step 3: Success
  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="text-green-500 text-6xl mb-4">✓</div>
      <h2 className="text-2xl font-bold text-gray-800">Đăng ký thành công!</h2>
      <p className="text-gray-600">
        Tài khoản của bạn đã được kích hoạt thành công.
      </p>
      <button
        onClick={() => navigate('/login')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition mt-6"
      >
        Đăng nhập ngay
      </button>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-4 text-center">
          {step === 1 && 'Đăng ký tài khoản'}
          {step === 2 && 'Xác thực tài khoản'}
          {step === 3 && 'Hoàn tất'}
        </h1>

        {step === 1 && renderRegisterForm()}
        {step === 2 && renderOtpForm()}
        {step === 3 && renderSuccess()}
      </div>
    </div>
  );
};

export default RegisterPage;

