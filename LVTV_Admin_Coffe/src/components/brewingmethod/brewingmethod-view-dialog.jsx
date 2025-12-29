import { X } from "lucide-react";

const BrewingMethodViewDialog = ({ open, onClose, brewingMethod }) => {
  // Nếu dialog chưa mở hoặc không có dữ liệu brewingMethod thì không render gì cả
  if (!open || !brewingMethod) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl p-6 m-4 shadow-xl transition-colors">
        {/* === HEADER: Tiêu đề và nút đóng === */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Chi tiết phương pháp pha chế
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* === CONTENT: Nội dung chi tiết === */}
        <div className="space-y-4">
          {/* Hiển thị ID */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              ID:
            </div>
            <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50 font-medium">
              {brewingMethod.brewingMethodId}
            </div>
          </div>

          {/* Hiển thị Tên phương pháp */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Tên phương pháp:
            </div>
            <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50 font-medium">
              {brewingMethod.name}
            </div>
          </div>

          {/* Hiển thị Mô tả (xử lý trường hợp null) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Mô tả:
            </div>
            <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50">
              {brewingMethod.description || "Không có mô tả"}
            </div>
          </div>

          {/* Hiển thị Trạng thái */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Trạng thái:
            </div>
            <div className="col-span-2">
              {brewingMethod.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Hoạt động
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  Ngừng hoạt động
                </span>
              )}
            </div>
          </div>

          {/* Hiển thị Ngày tạo (Format tiếng Việt) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Ngày tạo:
            </div>
            <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50">
              {new Date(brewingMethod.createdDate).toLocaleString("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          </div>

          {/* Hiển thị Ngày cập nhật (Chỉ hiện nếu có dữ liệu) */}
          {brewingMethod.updatedDate && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Ngày cập nhật:
              </div>
              <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50">
                {new Date(brewingMethod.updatedDate).toLocaleString("vi-VN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
          )}
        </div>

        {/* === FOOTER: Nút đóng === */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrewingMethodViewDialog;