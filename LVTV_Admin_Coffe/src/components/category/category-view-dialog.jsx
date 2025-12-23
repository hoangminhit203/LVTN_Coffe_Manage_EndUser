import { X } from "lucide-react";

const CategoryViewDialog = ({ open, onClose, category }) => {
  if (!open || !category) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl p-6 m-4 shadow-xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Category Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* ID */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              ID:
            </div>
            <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50 font-medium">
              {category.categoryId}
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Name:
            </div>
            <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50 font-medium">
              {category.name}
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Description:
            </div>
            <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50">
              {category.description || "No description"}
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Status:
            </div>
            <div className="col-span-2">
              {category.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Created Date */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Created Date:
            </div>
            <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50">
              {new Date(category.createdDate).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          </div>

          {/* Updated Date */}
          {category.updatedDate && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Updated Date:
              </div>
              <div className="col-span-2 text-sm text-slate-900 dark:text-slate-50">
                {new Date(category.updatedDate).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryViewDialog;
