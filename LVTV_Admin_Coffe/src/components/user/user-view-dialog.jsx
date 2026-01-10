import { X } from "lucide-react";

const UserViewDialog = ({ open, onClose, user }) => {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Chi tiết người dùng
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Tên đăng nhập
              </label>
              <p className="text-base text-slate-900 dark:text-slate-50">
                {user.userName}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Email
              </label>
              <p className="text-base text-slate-900 dark:text-slate-50">
                {user.email}
              </p>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Họ
              </label>
              <p className="text-base text-slate-900 dark:text-slate-50">
                {user.firstName || "-"}
              </p>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Tên
              </label>
              <p className="text-base text-slate-900 dark:text-slate-50">
                {user.lastName || "-"}
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Số điện thoại
              </label>
              <p className="text-base text-slate-900 dark:text-slate-50">
                {user.phoneNumber || "-"}
              </p>
            </div>

            {/* Sex */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Giới tính
              </label>
              <p className="text-base text-slate-900 dark:text-slate-50">
                {user.sex ? "Nam" : "Nữ"}
              </p>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Ngày sinh
              </label>
              <p className="text-base text-slate-900 dark:text-slate-50">
                {user.birthday ? new Date(user.birthday).toLocaleDateString("vi-VN") : "-"}
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Vai trò
              </label>
              <div>
                {user.roleName ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {user.roleName}
                  </span>
                ) : (
                  <p className="text-base text-slate-900 dark:text-slate-50">-</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Trạng thái
              </label>
              <div>
                {user.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Không hoạt động
                  </span>
                )}
              </div>
            </div>

            {/* Email Confirmed */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Email đã xác thực
              </label>
              <div>
                {user.emailConfirmed ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Đã xác thực
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Chưa xác thực
                  </span>
                )}
              </div>
            </div>

            {/* Phone Confirmed */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Số điện thoại đã xác thực
              </label>
              <div>
                {user.phoneNumberConfirmed ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Đã xác thực
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Chưa xác thực
                  </span>
                )}
              </div>
            </div>

            {/* Two Factor Enabled */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Xác thực 2 yếu tố
              </label>
              <div>
                {user.twoFactorEnabled ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Đã bật
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                    Chưa bật
                  </span>
                )}
              </div>
            </div>

            {/* Lockout Enabled */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Khóa tài khoản
              </label>
              <div>
                {user.lockoutEnabled ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Có thể khóa
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                    Không thể khóa
                  </span>
                )}
              </div>
            </div>

            {/* Access Failed Count */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Số lần đăng nhập thất bại
              </label>
              <p className="text-base text-slate-900 dark:text-slate-50">
                {user.accessFailedCount || 0}
              </p>
            </div>

            {/* Lockout End */}
            {user.lockoutEnd && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Khóa đến
                </label>
                <p className="text-base text-slate-900 dark:text-slate-50">
                  {new Date(user.lockoutEnd).toLocaleString("vi-VN")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserViewDialog;
