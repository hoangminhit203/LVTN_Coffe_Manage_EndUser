
import { Pencil, Trash2, Eye } from "lucide-react";

const FlavorNoteTable = ({ flavorNotes, onEdit, onDelete, onView }) => {
  return (
    // Bảng hiển thị flavor notes
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
      <table className="min-w-full">
        <thead className="bg-slate-100 dark:bg-slate-800 transition-colors">
          <tr>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">STT</th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">Tên hương vị</th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">Trạng thái</th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">Ngày tạo</th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">Ngày cập nhật</th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">Thao tác</th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-slate-900 transition-colors">
          {flavorNotes && flavorNotes.length > 0 ? (
            flavorNotes.map((item, index) => (
              <tr key={item.flavorNoteId} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-900 dark:text-slate-50">{index + 1}</td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-50">{item.name}</td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm">
                  {item.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Không hoạt động</span>
                  )}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(item.createdDate).toLocaleDateString("vi-VN")}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {item.updatedDate ? new Date(item.updatedDate).toLocaleDateString("vi-VN") : "-"}
                </td>
                <td className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(item.flavorNoteId)}
                      className="p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Xem"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Sửa"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item.flavorNoteId)}
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
              <td colSpan="6" className="border-b border-slate-200 dark:border-slate-700 px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Không tìm thấy hương vị nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FlavorNoteTable;
