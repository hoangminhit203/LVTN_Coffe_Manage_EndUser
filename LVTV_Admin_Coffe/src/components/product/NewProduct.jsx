import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { Package, Save, Plus, Trash2, X } from "lucide-react"; // Nhớ cài: npm install lucide-react

// --- IMPORTS SERVICES ---
import { createProduct, uploadProductImages } from "../../service/productService";
import { getCategories } from "../../service/categoryService";
import { getFlavorNotes } from "../../service/flavorNoteService";
import { getBrewingMethods } from "../../service/brewingMethodsService";

// --- IMPORTS COMPONENTS & HOOKS ---
import ProductImages from "./ProductImages"; // Đảm bảo đường dẫn đúng
import { useFormFields } from "../../hooks/useFormFields"; // Đảm bảo đường dẫn đúng

const NewProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 1. Setup Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      flavorNoteIds: [],
      brewingMethodIds: [],
      variants: [
        {
          sku: "",
          price: 0,
          stock: 0,
          roastLevel: "Medium",
          beanType: "",
          origin: "",
          acidity: 5,
          weight: 0,
          certifications: "",
        },
      ],
    },
  });

  // 2. Setup Variants Array
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // 3. States dữ liệu
  const [categories, setCategories] = useState([]);
  const [flavorNotes, setFlavorNotes] = useState([]);
  const [brewingMethods, setBrewingMethods] = useState([]);

  // State Images
  const [images, setImages] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  // 4. Lấy config từ hook
  const { formFields, variantFields, getFieldClassName, getFieldError } =
    useFormFields({
      control,
      errors,
      categories,
      flavorNotes,
      brewingMethods,
      isEditing: false,
    });

  // 5. Load Data Init
  useEffect(() => {
    loadInitData();
  }, []);

  const loadInitData = async () => {
    try {
      const [catRes, fnRes, bmRes] = await Promise.all([
        getCategories({ pageSize: 100 }),
        getFlavorNotes({ pageSize: 100 }),
        getBrewingMethods({ pageSize: 100 }),
      ]);

      // Helper để lấy đúng mảng dữ liệu từ API (records hoặc items)
      const getItems = (res) => {
        if (!res) return [];
        if (res.data && res.data.records) return res.data.records; // Ưu tiên records
        if (res.data && res.data.items) return res.data.items;     // Fallback items
        if (Array.isArray(res.data)) return res.data;
        return [];
      };

      setCategories(getItems(catRes));
      setFlavorNotes(getItems(fnRes));
      setBrewingMethods(getItems(bmRes));
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu danh mục/hương vị");
    }
  };

  // 6. Xử lý Submit
  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 ảnh sản phẩm");
      return;
    }

    setIsLoading(true);
    try {
      // Hàm clean data để tránh lỗi .map
      const parseIds = (val) => {
         if (Array.isArray(val)) return val.map(Number);
         return [];
      };

      const payload = {
        name: data.name,
        description: data.description,
        categoryId: Number(data.categoryId),
        flavorNoteIds: parseIds(data.flavorNoteIds),
        brewingMethodIds: parseIds(data.brewingMethodIds),
        variants: data.variants.map((v) => ({
          sku: v.sku,
          price: Number(v.price),
          stock: Number(v.stock),
          roastLevel: v.roastLevel,
          beanType: v.beanType,
          origin: v.origin,
          acidity: Number(v.acidity),
          weight: Number(v.weight),
          certifications: v.certifications,
        })),
      };

      // console.log("Payload:", payload);

      const res = await createProduct(payload);

      if (res.isSuccess) {
        const newProductId = res.data.productId;
        // Lấy ID variant đầu tiên an toàn
        const firstVariantId = res.data.variants && res.data.variants.length > 0 
            ? res.data.variants[0].variantId 
            : null;

        if (firstVariantId) {
            const filesToUpload = images.filter((img) => img.file).map((img) => img.file);
            if (filesToUpload.length > 0) {
                await uploadProductImages(newProductId, firstVariantId, filesToUpload);
            }
        }
        toast.success("Tạo sản phẩm thành công!");
        navigate("/products");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Tạo sản phẩm thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Hàm Render Input (Quan trọng: Xử lý Combobox-Multi)
  const renderInput = (fieldConfig, fieldPath) => {
    const { type, options, optionKey, optionValue, inputType, rows, placeholder } = fieldConfig;
    const baseClass = getFieldClassName(fieldPath);

    // --- XỬ LÝ COMBOBOX MULTI (Dropdown + Tags) ---
    if (type === "combobox-multi") {
        const selectedIds = watch(fieldPath) || [];

        // Đăng ký field với form (để khi submit có dữ liệu)
        useEffect(() => {
            register(fieldPath);
        }, [register, fieldPath]);

        const handleSelect = (e) => {
            const val = Number(e.target.value);
            if (!val) return;
            if (!selectedIds.includes(val)) {
                setValue(fieldPath, [...selectedIds, val]);
            }
            e.target.value = ""; // Reset dropdown
        };

        const handleRemove = (idToRemove) => {
            setValue(fieldPath, selectedIds.filter(id => id !== idToRemove));
        };

        return (
            <div className="space-y-3">
                <select onChange={handleSelect} className={`${baseClass} appearance-auto cursor-pointer`} defaultValue="">
                    <option value="" disabled>{placeholder}</option>
                    {options && options.length > 0 ? (
                        options
                            .filter(opt => !selectedIds.includes(opt[optionValue]))
                            .map(opt => (
                                <option key={opt[optionValue]} value={opt[optionValue]}>
                                    {opt[optionKey]}
                                </option>
                            ))
                    ) : (
                        <option disabled>Đang tải...</option>
                    )}
                </select>

                <div className="flex flex-wrap gap-2">
                    {selectedIds.map(id => {
                        const item = options?.find(opt => opt[optionValue] === id);
                        return (
                            <span key={id} className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 border border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700">
                                {item ? item[optionKey] : id}
                                <button type="button" onClick={() => handleRemove(id)} className="ml-1 rounded-full p-0.5 hover:bg-indigo-200 text-indigo-500 hover:text-red-600 dark:hover:bg-indigo-700 transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- XỬ LÝ CÁC LOẠI INPUT KHÁC ---
    if (type === "textarea") {
        return <textarea {...register(fieldPath)} className={baseClass} rows={rows} placeholder={placeholder} />;
    }

    if (type === "select") {
        return (
            <select {...register(fieldPath, fieldConfig.rules)} className={baseClass}>
                <option value="">{placeholder}</option>
                {options?.map((opt) => (
                    <option key={opt[optionValue] || opt.id} value={opt[optionValue] || opt.id}>
                        {opt[optionKey] || opt.name}
                    </option>
                ))}
            </select>
        );
    }

    // Input thường (text, number)
    return <input type={inputType} {...register(fieldPath, fieldConfig.rules)} className={baseClass} placeholder={placeholder} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
            <Package className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tạo sản phẩm mới</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Điền thông tin chi tiết sản phẩm</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* --- INFO --- */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">Thông tin chung</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {formFields.map((field) => (
                <div key={field.name} className={field.name === "description" ? "md:col-span-2" : ""}>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                  </label>
                  {renderInput(field, field.name)}
                  <p className="mt-1 text-xs text-red-500">{getFieldError(field.name)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* --- VARIANTS --- */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Danh sách biến thể</h2>
                <button
                    type="button"
                    onClick={() => append({ sku: "", price: 0, stock: 0 })}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                    <Plus className="h-4 w-4" /> Thêm biến thể
                </button>
             </div>

             {fields.map((field, index) => (
                <div key={field.id} className="relative rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                    
                    <div className="mb-4 flex items-center gap-2">
                         <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                             {index + 1}
                         </span>
                         <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Biến thể #{index + 1}</h3>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        {variantFields.map((vField) => (
                            <div key={vField.name} className={vField.className || "col-span-12"}>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {vField.label}
                                </label>
                                {renderInput(vField, `variants.${index}.${vField.name}`)}
                                <p className="mt-1 text-xs text-red-500">
                                    {getFieldError(`variants.${index}.${vField.name}`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
             ))}
          </div>

          {/* --- IMAGES --- */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">Hình ảnh sản phẩm</h2>
            <ProductImages
              productId={null}
              variantId={null}
              images={images}
              setImages={setImages}
              imageErrors={imageErrors}
              setImageErrors={setImageErrors}
              watch={watch}
              isEditing={false}
            />
          </div>

          {/* --- SUBMIT --- */}
          <div className="flex justify-end pt-4 pb-10">
            <button
              type="submit"
              disabled={isLoading}
              className="flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium shadow-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Đang xử lý..." : <><Save className="h-5 w-5" /> Tạo sản phẩm</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewProduct;