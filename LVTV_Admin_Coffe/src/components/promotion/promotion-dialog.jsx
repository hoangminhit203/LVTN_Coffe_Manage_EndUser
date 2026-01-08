import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

const PromotionDialog = ({ open, onClose, onSubmit, editData }) => {
    const [form, setForm] = useState({
        code: "",
        description: "",
        discountType: 0,
        discountValue: 0,
        maxDiscountAmount: 0,
        minOrderValue: 0,
        startDate: "",
        endDate: "",
        usageLimit: 2147483647,
        isEnabled: true,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editData) {
            setForm({
                ...form,
                ...editData,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editData]);

    if (!open) return null;

    const validate = () => {
        const e = {};
        if (!form.code || !form.code.trim()) e.code = "Code is required";
        if (!form.startDate) e.startDate = "Start date is required";
        if (!form.endDate) e.endDate = "End date is required";
        if (form.discountValue < 0) e.discountValue = "Discount must be >= 0";
        return e;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === "checkbox" ? checked : value;
        if (type === "number") val = value === "" ? "" : Number(value);
        setForm((prev) => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const eObj = validate();
        setErrors(eObj);
        if (Object.keys(eObj).length === 0) {
            // prepare payload similar to API contract
            const payload = {
                code: form.code,
                description: form.description,
                discountType: Number(form.discountType),
                discountValue: Number(form.discountValue),
                maxDiscountAmount: Number(form.maxDiscountAmount),
                minOrderValue: Number(form.minOrderValue),
                startDate: form.startDate,
                endDate: form.endDate,
                usageLimit: Number(form.usageLimit),
                isEnabled: form.isEnabled,
            };
            onSubmit(payload);
            setForm({
                code: "",
                description: "",
                discountType: 0,
                discountValue: 0,
                maxDiscountAmount: 0,
                minOrderValue: 0,
                startDate: "",
                endDate: "",
                usageLimit: 2147483647,
                isEnabled: true,
            });
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl p-6 m-4 shadow-xl transition-colors">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{editData ? "Edit Promotion" : "Add Promotion"}</h2>
                    <button onClick={handleClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <X size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Code <span className="text-red-500">*</span></label>
                        <input name="code" value={form.code} onChange={handleChange} className={`w-full border ${errors.code ? "border-red-500" : "border-slate-300"} px-3 py-2 rounded-lg`} />
                        {errors.code && <div className="mt-1 text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} />{errors.code}</div>}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                        <input name="description" value={form.description} onChange={handleChange} className="w-full border border-slate-300 px-3 py-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Discount Type</label>
                        <select name="discountType" value={form.discountType} onChange={handleChange} className="w-full border border-slate-300 px-3 py-2 rounded-lg">
                            <option value={0}>Percent (%)</option>
                            <option value={1}>Fixed (đ)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Discount Value</label>
                        <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange} className={`w-full border ${errors.discountValue ? "border-red-500" : "border-slate-300"} px-3 py-2 rounded-lg`} />
                        {errors.discountValue && <div className="mt-1 text-red-500 text-sm">{errors.discountValue}</div>}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Max Discount Amount</label>
                        <input type="number" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange} className="w-full border border-slate-300 px-3 py-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Min Order Value</label>
                        <input type="number" name="minOrderValue" value={form.minOrderValue} onChange={handleChange} className="w-full border border-slate-300 px-3 py-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Start Date <span className="text-red-500">*</span></label>
                        <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} className={`w-full border ${errors.startDate ? "border-red-500" : "border-slate-300"} px-3 py-2 rounded-lg`} />
                        {errors.startDate && <div className="mt-1 text-red-500 text-sm">{errors.startDate}</div>}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">End Date <span className="text-red-500">*</span></label>
                        <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} className={`w-full border ${errors.endDate ? "border-red-500" : "border-slate-300"} px-3 py-2 rounded-lg`} />
                        {errors.endDate && <div className="mt-1 text-red-500 text-sm">{errors.endDate}</div>}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Usage Limit</label>
                        <input type="number" name="usageLimit" value={form.usageLimit} onChange={handleChange} className="w-full border border-slate-300 px-3 py-2 rounded-lg" />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <input type="checkbox" name="isEnabled" checked={form.isEnabled} onChange={handleChange} className="w-4 h-4" />
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enabled</label>
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={handleClose} className="px-4 py-2 border border-slate-300 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromotionDialog;
