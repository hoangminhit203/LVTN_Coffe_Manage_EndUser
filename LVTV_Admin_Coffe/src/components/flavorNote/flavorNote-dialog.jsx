import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

const FlavorNoteDialog = ({ open, onClose, onSubmit, editData }) => {
  const [form, setForm] = useState({
    name: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  const [touched, setTouched] = useState({
    name: false,
  });

  // Load edit data when dialog opens
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        isActive: editData.isActive,
      });
    }
  }, [editData]);

  if (!open) return null;

  const validateName = (value) => {
    if (!value || value.trim() === "") {
      return "Flavor note name is required";
    }
    if (value.trim().length < 2) {
      return "Flavor note name must be at least 2 characters";
    }
    if (value.length > 100) {
      return "Flavor note name must not exceed 100 characters";
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
    if (touched[name] && name === "name") {
      setErrors(prev => ({ ...prev, name: validateName(newValue) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur
    if (name === "name") {
      setErrors(prev => ({ ...prev, name: validateName(value) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(form.name);

    setErrors({
      name: nameError,
    });

    setTouched({
      name: true,
    });

    // If no errors, submit
    if (!nameError) {
      onSubmit(form);
      // Reset form after submit
      setForm({ name: "", isActive: true });
      setErrors({ name: "" });
      setTouched({ name: false });
    }
  };

  const handleClose = () => {
    setForm({ name: "", isActive: true });
    setErrors({ name: "" });
    setTouched({ name: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6 m-4 shadow-xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {editData ? "Edit Flavor Note" : "Add Flavor Note"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Tên Ghi Chú Hương Vị <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter flavor note name (e.g., chocolate, citrus)"
              className={`w-full border ${
                errors.name && touched.name
                  ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                  : "border-slate-300 dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-600"
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500`}
            />
            {errors.name && touched.name && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors.name}</span>
              </div>
            )}
            {!errors.name && form.name && (
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {form.name.length}/100 characters
              </div>
            )}
          </div>

          {/* Active Checkbox */}
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
              Kích Hoạt Ghi Chú Hương Vị
            </label>
          </div>

          {/* Action Buttons */}
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

export default FlavorNoteDialog;

