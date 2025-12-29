import { Pencil, Trash2, Eye } from "lucide-react";

const BrewingMethodTable = ({ brewingMethods, onEdit, onDelete, onView }) => {
  return (
    // Container bao quanh bảng: Xử lý cuộn ngang (overflow-x-auto) cho mobile
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
      <table className="min-w-full">
        {/* === PHẦN TIÊU ĐỀ BẢNG (HEADER) === */}
        <thead className="bg-slate-100 dark:bg-slate-800 transition-colors">
          <tr>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              ID
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Tên phương pháp
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Mô tả
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Trạng thái
            </th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Ngày tạo
            </th>
             <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
              Hành động
            </th>
          </tr>
        </thead>

        {/* === PHẦN THÂN BẢNG (BODY) === */}
        <tbody className="bg-white dark:bg-slate-900 transition-colors">
          {/* Lặp qua danh sách dữ liệu để render từng dòng */}
          {brewingMethods.map((item) => (
            <tr key={item.brewingMethodId} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              
              {/* Cột ID */}
              <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-900 dark:text-slate-50">
                {item.brewingMethodId}
              </td>

              {/* Cột Tên */}
              <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-50">
                {item.name}
              </td>

              {/* Cột Mô tả */}
              <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {item.description}
              </td>

              {/* Cột Trạng thái (Hiển thị badge màu tùy theo Active/Inactive) */}
              <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm">
                {item.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Ngừng hoạt động
                  </span>
                )}
              </td>

              {/* Cột Ngày tạo: Chuyển đổi format sang kiểu Việt Nam (dd/mm/yyyy) */}
              <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {new Date(item.createdDate).toLocaleDateString("vi-VN")}
              </td>

              {/* Cột Các nút hành động */}
              <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  {/* Nút Xem chi tiết */}
                  <button
                    onClick={() => onView(item.brewingMethodId)}
                    className="p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </button>

                  {/* Nút Chỉnh sửa */}
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={16} />
                  </button>

                  {/* Nút Xóa */}
                  <button
                    onClick={() => onDelete(item.brewingMethodId)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BrewingMethodTable;