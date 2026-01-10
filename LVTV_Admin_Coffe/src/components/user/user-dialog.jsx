import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

const UserDialog = ({ open, onClose, onSubmit, editData }) => {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    sex: true,
    birthday: "",
    password: "",
    confirmPassword: "",
    roleName: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    roleName: "",
  });

  const [touched, setTouched] = useState({
    userName: false,
    email: false,
    phoneNumber: false,
    firstName: false,
    lastName: false,
    password: false,
    confirmPassword: false,
    roleName: false,
  });

  // Load edit data when dialog opens
  useEffect(() => {
    if (editData) {
      setForm({
        userName: editData.userName || "",
        email: editData.email || "",
        phoneNumber: editData.phoneNumber || "",
        firstName: editData.firstName || "",
        lastName: editData.lastName || "",
        sex: editData.sex !== undefined ? editData.sex : true,
        birthday: editData.birthday ? editData.birthday.split('T')[0] : "",
        password: "",
        confirmPassword: "",
        roleName: editData.roleName || "",
        isActive: editData.isActive,
      });
    } else {
      // Reset form for create mode
      setForm({
        userName: "",
        email: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        sex: true,
        birthday: "",
        password: "",
        confirmPassword: "",
        roleName: "",
        isActive: true,
      });
    }
    // Reset errors and touched when dialog opens/closes
    setErrors({
      userName: "",
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      roleName: "",
    });
    setTouched({
      userName: false,
      email: false,
      phoneNumber: false,
      firstName: false,
      lastName: false,
      password: false,
      confirmPassword: false,
      roleName: false,
    });
  }, [editData, open]);

  if (!open) return null;

  const validateUserName = (value) => {
    if (!value || value.trim() === "") {
      return "Tên đăng nhập là bắt buộc";
    }
    if (value.trim().length < 3) {
      return "Tên đăng nhập phải có ít nhất 3 ký tự";
    }
    if (value.length > 50) {
      return "Tên đăng nhập không được vượt quá 50 ký tự";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới";
    }
    return "";
  };

  const validateEmail = (value) => {
    if (!value || value.trim() === "") {
      return "Email là bắt buộc";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const validatePhoneNumber = (value) => {
    if (value && !/^[0-9]{10,11}$/.test(value)) {
      return "Số điện thoại phải có 10-11 chữ số";
    }
    return "";
  };

  const validateFirstName = (value) => {
    if (!value || value.trim() === "") {
      return "Họ là bắt buộc";
    }
    if (value.trim().length < 2) {
      return "Họ phải có ít nhất 2 ký tự";
    }
    if (value.length > 50) {
      return "Họ không được vượt quá 50 ký tự";
    }
    return "";
  };

  const validateLastName = (value) => {
    if (!value || value.trim() === "") {
      return "Tên là bắt buộc";
    }
    if (value.trim().length < 2) {
      return "Tên phải có ít nhất 2 ký tự";
    }
    if (value.length > 50) {
      return "Tên không được vượt quá 50 ký tự";
    }
    return "";
  };
  const validateRoleName = (value) => {
    if (!value || value.trim() === "") {
      return "Vai trò là bắt buộc";
    }
    return "";
  };
  const validatePassword = (value) => {
    // Password is required only when creating new user
    if (!editData) {
      if (!value || value.trim() === "") {
        return "Mật khẩu là bắt buộc";
      }
      if (value.length < 6) {
        return "Mật khẩu phải có ít nhất 6 ký tự";
      }
    } else if (value && value.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return "";
  };

  const validateConfirmPassword = (value, passwordValue) => {
    if (!editData || passwordValue) {
      if (value !== passwordValue) {
        return "Mật khẩu xác nhận không khớp";
      }
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setForm({
      ...form,
      [name]: newValue,
    });

    // Validate on change if field has been touched
    if (touched[name]) {
      if (name === "userName") {
        setErrors(prev => ({ ...prev, userName: validateUserName(newValue) }));
      } else if (name === "email") {
        setErrors(prev => ({ ...prev, email: validateEmail(newValue) }));
      } else if (name === "phoneNumber") {
        setErrors(prev => ({ ...prev, phoneNumber: validatePhoneNumber(newValue) }));
      } else if (name === "firstName") {
        setErrors(prev => ({ ...prev, firstName: validateFirstName(newValue) }));
      } else if (name === "lastName") {
        setErrors(prev => ({ ...prev, lastName: validateLastName(newValue) }));
      } else if (name === "roleName") {
        setErrors(prev => ({ ...prev, roleName: validateRoleName(newValue) }));
      } else if (name === "password") {
        setErrors(prev => ({ ...prev, password: validatePassword(newValue) }));
        // Also revalidate confirm password when password changes
        if (touched.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(form.confirmPassword, newValue) }));
        }
      } else if (name === "confirmPassword") {
        setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(newValue, form.password) }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur
    if (name === "userName") {
      setErrors(prev => ({ ...prev, userName: validateUserName(value) }));
    } else if (name === "email") {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (name === "phoneNumber") {
      setErrors(prev => ({ ...prev, phoneNumber: validatePhoneNumber(value) }));
    } else if (name === "firstName") {
      setErrors(prev => ({ ...prev, firstName: validateFirstName(value) }));
    } else if (name === "lastName") {
      setErrors(prev => ({ ...prev, lastName: validateLastName(value) }));
    } else if (name === "roleName") {
      setErrors(prev => ({ ...prev, roleName: validateRoleName(value) }));
    } else if (name === "password") {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    } else if (name === "confirmPassword") {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value, form.password) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      userName: true,
      email: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      password: true,
      confirmPassword: true,
      roleName: true,
    };
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {
      userName: validateUserName(form.userName),
      email: validateEmail(form.email),
      phoneNumber: validatePhoneNumber(form.phoneNumber),
      firstName: validateFirstName(form.firstName),
      lastName: validateLastName(form.lastName),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.confirmPassword, form.password),
      roleName: validateRoleName(form.roleName),
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      userName: form.userName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      sex: form.sex,
      birthday: form.birthday || null,
      roleName: form.roleName.trim(),
      isActive: form.isActive,
    };

    // Include password only if it's provided (for both create and update)
    if (form.password) {
      submitData.password = form.password;
    }

    onSubmit(submitData);
  };

  const handleClose = () => {
    setForm({
      userName: "",
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      sex: true,
      birthday: "",
      password: "",
      confirmPassword: "",
      roleName: "",
      isActive: true,
    });
    setErrors({
      userName: "",
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      roleName: "",
    });
    setTouched({
      userName: false,
      email: false,
      phoneNumber: false,
      firstName: false,
      lastName: false,
      password: false,
      confirmPassword: false,
      roleName: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {editData ? "Cập nhật người dùng" : "Thêm người dùng mới"}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={editData} // Disable username when editing
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.userName && touched.userName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                } ${editData ? "bg-slate-100 dark:bg-slate-700 cursor-not-allowed" : ""}`}
                placeholder="Nhập tên đăng nhập"
              />
              {errors.userName && touched.userName && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.userName}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.email && touched.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                }`}
                placeholder="Nhập email"
              />
              {errors.email && touched.email && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* First Name */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Họ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.firstName && touched.firstName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                }`}
                placeholder="Nhập họ"
              />
              {errors.firstName && touched.firstName && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.firstName}</span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.lastName && touched.lastName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                }`}
                placeholder="Nhập tên"
              />
              {errors.lastName && touched.lastName && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.lastName}</span>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.phoneNumber && touched.phoneNumber
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                }`}
                placeholder="Nhập số điện thoại"
              />
              {errors.phoneNumber && touched.phoneNumber && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.phoneNumber}</span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Mật khẩu {!editData && <span className="text-red-500">*</span>}
                {editData && <span className="text-sm text-slate-500"> (để trống nếu không đổi)</span>}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.password && touched.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                }`}
                placeholder="Nhập mật khẩu"
              />
              {errors.password && touched.password && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Xác nhận mật khẩu {!editData && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                }`}
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Sex */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Giới tính
              </label>
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value={true}>Nam</option>
                <option value={false}>Nữ</option>
              </select>
            </div>

            {/* Birthday */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ngày sinh
              </label>
              <input
                type="date"
                name="birthday"
                value={form.birthday}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Role Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                name="roleName"
                value={form.roleName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.roleName && touched.roleName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                }`}
              >
                <option value="">-- Chọn vai trò --</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
                <option value="User">User</option>
                <option value="Customer">Customer</option>
              </select>
              {errors.roleName && touched.roleName && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.roleName}</span>
                </div>
              )}
            </div>

            {/* IsActive */}
            <div className="col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tài khoản hoạt động
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editData ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDialog;
