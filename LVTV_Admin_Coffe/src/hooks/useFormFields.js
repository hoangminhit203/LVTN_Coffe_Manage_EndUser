import { useMemo } from "react";

export const useFormFields = ({ control, errors, categories, flavorNotes, brewingMethods, isEditing }) => {
    // --- 1. Cấu hình các trường chính (Main Fields) ---
    const formFields = useMemo(
        () => [
            {
                name: "name",
                label: "Tên Sản Phẩm *",
                type: "input",
                inputType: "text",
                placeholder: "-- Nhập tên sản phẩm --",
                rules: { required: "Tên sản phẩm là bắt buộc" },
                required: true,
            },
            {
                name: "description",
                label: "Mô Tả Sản Phẩm",
                type: "textarea",
                placeholder: "-- Nhập mô tả chi tiết --",
                rows: 4,
                required: false,
            },
            {
                name: "categoryId",
                label: "Danh Mục *",
                type: "select",
                placeholder: "-- Chọn danh mục --",
                options: categories,
                optionKey: "name",
                optionValue: "categoryId", // Khớp với API
                rules: { required: "Danh mục là bắt buộc" },
                required: true,
            },
            {
                name: "flavorNoteIds",
                label: "Hương Vị (Flavor Notes)",
                type: "combobox-multi", // Loại input đặc biệt: Dropdown + Tags
                placeholder: "-- Chọn thêm hương vị --",
                options: flavorNotes,
                optionKey: "name",
                optionValue: "flavorNoteId", // QUAN TRỌNG: Khớp với API
                required: false,
            },
            {
                name: "brewingMethodIds",
                label: "Phương Pháp Pha Chế",
                type: "combobox-multi", // Loại input đặc biệt
                placeholder: "-- Chọn thêm phương pháp --",
                options: brewingMethods,
                optionKey: "name",
                optionValue: "brewingMethodId", // QUAN TRỌNG: Khớp với API
                required: false,
            },
        ],
        [categories, flavorNotes, brewingMethods],
    );

    // --- 2. Cấu hình các trường cho biến thể (Variant Fields) ---
    const variantFields = useMemo(
        () => [
            {
                name: "sku",
                label: "Mã SKU *",
                type: "input",
                inputType: "text",
                placeholder: "VD: VN-ROB-01",
                rules: { required: "SKU là bắt buộc" },
                className: "col-span-12 md:col-span-6",
            },
            {
                name: "price",
                label: "Giá Tiền (VND) *",
                type: "input",
                inputType: "number",
                placeholder: "0",
                rules: { required: "Giá là bắt buộc", min: 0 },
                className: "col-span-12 md:col-span-6",
            },
            {
                name: "stock",
                label: "Tồn Kho *",
                type: "input",
                inputType: "number",
                placeholder: "0",
                rules: { required: "Số lượng là bắt buộc", min: 0 },
                className: "col-span-12 md:col-span-6",
            },
            {
                name: "weight",
                label: "Trọng Lượng (g)",
                type: "input",
                inputType: "number",
                placeholder: "VD: 500",
                className: "col-span-12 md:col-span-6",
            },
            {
                name: "roastLevel",
                label: "Mức Độ Rang",
                type: "select",
                options: [
                    { id: "Light", name: "Light (Nhạt)" },
                    { id: "Medium", name: "Medium (Vừa)" },
                    { id: "Dark", name: "Dark (Đậm)" },
                ],
                optionKey: "name",
                optionValue: "id",
                className: "col-span-12 md:col-span-6",
            },
            {
                name: "beanType",
                label: "Loại Hạt",
                type: "input",
                inputType: "text",
                placeholder: "VD: Arabica",
                className: "col-span-12 md:col-span-6",
            },
            { name: "origin", label: "Xuất Xứ", type: "input", inputType: "text", placeholder: "VD: Lâm Đồng", className: "col-span-12" },
            {
                name: "acidity",
                label: "Độ Chua (1-10)",
                type: "input",
                inputType: "number",
                rules: { max: 10 },
                className: "col-span-12 md:col-span-6",
            },
            { name: "certifications", label: "Chứng Chỉ", type: "input", inputType: "text", placeholder: "VD: Organic", className: "col-span-12" },
        ],
        [],
    );

    const getFieldError = (fieldName) => {
        const path = fieldName.split(".");
        let currentError = errors;
        for (const key of path) {
            if (currentError && currentError[key]) {
                currentError = currentError[key];
            } else {
                return undefined;
            }
        }
        return currentError?.message;
    };

    const getFieldClassName = (fieldName) => {
        const error = getFieldError(fieldName);
        const errorClass = error ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 dark:border-gray-600";
        return `mt-1 block w-full rounded-md border bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all ${errorClass}`;
    };

    return {
        formFields,
        variantFields,
        getFieldError,
        getFieldClassName,
    };
};
