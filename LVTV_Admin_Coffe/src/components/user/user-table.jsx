import { Pencil, Trash2, Eye } from "lucide-react";

const UserTable = ({ users, onEdit, onDelete, onView }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
      <table className="min-w-full">
        <thead className="bg-slate-100 dark:bg-slate-800 transition-colors">
          <tr>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              STT
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Tên đăng nhập
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Họ và tên
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Email
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Số điện thoại
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Vai trò
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Trạng thái
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-slate-900 transition-colors">
          {users && users.length > 0 ? (
            users.map((user, index) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-900 dark:text-slate-50">
                  {index + 1}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-50">
                  {user.userName}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "-"}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {user.email}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {user.phoneNumber || "-"}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm">
                  {user.roleName ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {user.roleName}
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">-</span>
                  )}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm">
                  {user.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Không hoạt động
                    </span>
                  )}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(user.id)}
                      className="p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Xem"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Sửa"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                className="border-b border-slate-200 dark:border-slate-700 px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Không có người dùng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
