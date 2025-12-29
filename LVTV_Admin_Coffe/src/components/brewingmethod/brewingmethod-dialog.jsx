import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

const BrewingMethodDialog = ({ open, onClose, onSubmit, editData }) => {
  // Khởi tạo state cho form
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  // State lưu trữ lỗi validation
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  // State kiểm tra xem người dùng đã chạm vào input chưa (để hiển thị lỗi)
  const [touched, setTouched] = useState({
    name: false,
    description: false,
  });

  // Effect: Load dữ liệu cũ vào form nếu đang ở chế độ chỉnh sửa (editData có giá trị)
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        description: editData.description || "",
        isActive: editData.isActive,
      });
    }
  }, [editData]);

  if (!open) return null;

  // Hàm validate tên phương pháp
  const validateName = (value) => {
    if (!value || value.trim() === "") {
      return "Tên phương pháp là bắt buộc";
    }
    if (value.trim().length < 2) {
      return "Tên phương pháp phải có ít nhất 2 ký tự";
    }
    if (value.length > 100) {
      return "Tên phương pháp không được vượt quá 100 ký tự";
    }
    return "";
  };

  // Hàm validate mô tả
  const validateDescription = (value) => {
    if (value && value.length > 500) {
      return "Mô tả không được vượt quá 500 ký tự";
    }
    return "";
  };

  // Xử lý khi input thay đổi
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setForm({
      ...form,
      [name]: newValue,
    });

    // Validate ngay lập tức nếu trường đó đã được người dùng chạm vào (touched)
    if (touched[name]) {
      if (name === "name") {
        setErrors(prev => ({ ...prev, name: validateName(newValue) }));
      } else if (name === "description") {
        setErrors(prev => ({ ...prev, description: validateDescription(newValue) }));
      }
    }
  };

  // Xử lý khi người dùng click ra ngoài input (blur)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate khi blur
    if (name === "name") {
      setErrors(prev => ({ ...prev, name: validateName(value) }));
    } else if (name === "description") {
      setErrors(prev => ({ ...prev, description: validateDescription(value) }));
    }
  };

  // Xử lý sự kiện submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate lại toàn bộ các trường trước khi submit
    const nameError = validateName(form.name);
    const descriptionError = validateDescription(form.description);

    setErrors({
      name: nameError,
      description: descriptionError,
    });

    // Đánh dấu tất cả là đã touch để hiện lỗi (nếu có)
    setTouched({
      name: true,
      description: true,
    });

    // Nếu không có lỗi thì gọi hàm onSubmit
    if (!nameError && !descriptionError) {
      onSubmit(form);
      // Reset form sau khi submit thành công
      setForm({ name: "", description: "", isActive: true });
      setErrors({ name: "", description: "" });
      setTouched({ name: false, description: false });
    }
  };

  // Xử lý đóng dialog và reset form
  const handleClose = () => {
    setForm({ name: "", description: "", isActive: true });
    setErrors({ name: "", description: "" });
    setTouched({ name: false, description: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6 m-4 shadow-xl transition-colors">
        {/* Header Dialog */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {editData ? "Chỉnh sửa phương pháp" : "Thêm phương pháp mới"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Tên phương pháp */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Tên phương pháp pha chế <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập tên phương pháp (VD: V60, Espresso...)"
              className={`w-full border ${
                errors.name && touched.name
                  ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                  : "border-slate-300 dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-600"
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500`}
            />
            {/* Hiển thị lỗi tên nếu có */}
            {errors.name && touched.name && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors.name}</span>
              </div>
            )}
            {/* Đếm ký tự */}
            {!errors.name && form.name && (
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {form.name.length}/100 ký tự
              </div>
            )}
          </div>

          {/* Input Mô tả */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Mô tả
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập mô tả chi tiết về cách pha chế..."
              rows={4}
              className={`w-full border ${
                errors.description && touched.description
                  ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                  : "border-slate-300 dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-600"
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none`}
            />
            {/* Hiển thị lỗi mô tả nếu có */}
            {errors.description && touched.description && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors.description}</span>
              </div>
            )}
            {!errors.description && (
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {form.description.length}/500 ký tự
              </div>
            )}
          </div>

          {/* Checkbox Kích hoạt */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 cursor-pointer"
            />
            <label 
              htmlFor="isActive" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Kích hoạt phương pháp này
            </label>
          </div>

          {/* Các nút hành động */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!form.name.trim()}
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrewingMethodDialog;