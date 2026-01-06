import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { Package, Save, Plus, Trash2, X, CheckCircle, Loader2 } from "lucide-react";

// --- IMPORTS SERVICES ---
import { getProductById, uploadProductImages, updateProduct, updateImageInfo } from "../../service/productService";
import { getCategories } from "../../service/categoryService";
import { getFlavorNotes } from "../../service/flavorNoteService";
import { getBrewingMethods } from "../../service/brewingMethodsService";

// --- IMPORTS COMPONENTS & HOOKS ---
import ProductImages from "./ProductImages";
import { useFormFields } from "../../hooks/useFormFields";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy productId từ URL
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // 1. Setup Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      flavorNoteIds: [],
      brewingMethodIds: [],
      variants: [],
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

  // State lưu thông tin product hiện tại
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentVariantId, setCurrentVariantId] = useState(null);

  // 4. Lấy config từ hook
  const { formFields, variantFields, getFieldClassName, getFieldError } =
    useFormFields({
      control,
      errors,
      categories,
      flavorNotes,
      brewingMethods,
      isEditing: true,
    });

  // 5. Load Data Init
  useEffect(() => {
    loadInitData();
  }, []);

  // 6. Load Product Data
  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  const loadInitData = async () => {
    try {
      const [catRes, fnRes, bmRes] = await Promise.all([
        getCategories({ pageSize: 100 }),
        getFlavorNotes({ pageSize: 100 }),
        getBrewingMethods({ pageSize: 100 }),
      ]);

      const getItems = (res) => {
        if (!res) return [];
        if (res.data && res.data.records) return res.data.records;
        if (res.data && res.data.items) return res.data.items;
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

  const loadProductData = async () => {
  try {
    setIsLoadingData(true);
    const res = await getProductById(id);

    if (res.isSuccess && res.data) {
      const product = res.data;
      setCurrentProduct(product);

      reset({
        name: product.name || "",
        description: product.description || "",
        categoryId: product.category?.[0]?.categoryId?.toString() || "",
        flavorNoteIds: product.flavorNotes?.map(fn => fn.flavorNoteId) || [],
        brewingMethodIds: product.brewingMethods?.map(bm => bm.brewingMethodId) || [],

        variants: product.variants?.map(v => ({
          id: v.variantId,
          sku: v.sku || "",
          price: v.price || 0,
          stock: v.stock || 0,
          roastLevel: v.roastLevel || "Medium",
          beanType: v.beanType || "",
          origin: v.origin || "",
          acidity: v.acidity || 5,
          weight: v.weight || 0,
          certifications: v.certifications || "",
        })) || [],
      });

      // dùng id cho images
      if (product.variants?.length > 0) {
        setCurrentVariantId(product.variants[0].variantId);
      }
    }
  } catch (error) {
    console.error("Error loading product:", error);
    toast.error("Không thể tải thông tin sản phẩm");
    navigate("/products");
  } finally {
    setIsLoadingData(false);
  }
};


  // 7. Xử lý Submit
  const onSubmit = async (data) => {
  setIsLoading(true);
  try {
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
        id: v.id,                       // ✅ CHỈ DÙNG id
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

    const res = await updateProduct(id, payload);

    if (res.isSuccess) {
      if (images.length > 0 && currentVariantId) {
        const filesToUpload = images
          .filter((img) => img.file)
          .map((img) => img.file);

        if (filesToUpload.length > 0) {
          await updateImageInfo(id, currentVariantId, filesToUpload);
        }
      }

      setShowSuccessNotification(true);
      setTimeout(() => navigate("/products"), 2000);
    }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Cập nhật sản phẩm thất bại");
  } finally {
    setIsLoading(false);
  }
};


  // 8. Hàm Render Input
  const renderInput = (fieldConfig, fieldPath) => {
    const { type, options, optionKey, optionValue, inputType, rows, placeholder } = fieldConfig;
    const baseClass = getFieldClassName(fieldPath);

    if (type === "combobox-multi") {
        const selectedIds = watch(fieldPath) || [];

        const handleSelect = (e) => {
            const val = Number(e.target.value);
            if (!val) return;
            if (!selectedIds.includes(val)) {
                setValue(fieldPath, [...selectedIds, val]);
            }
            e.target.value = "";
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

    return <input type={inputType} {...register(fieldPath, fieldConfig.rules)} className={baseClass} placeholder={placeholder} />;
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      {/* Success Notification Toast */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg bg-green-500 text-white">
            <CheckCircle size={24} />
            <div>
              <p className="font-semibold text-lg">Thành công!</p>
              <p className="text-sm">Sản phẩm đã được cập nhật thành công</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
            <Package className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chỉnh sửa sản phẩm</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cập nhật thông tin sản phẩm</p>
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
                    onClick={() => append({ sku: "", price: 0, stock: 0, roastLevel: "Medium", beanType: "", origin: "", acidity: 5, weight: 0, certifications: "" })}
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
              productId={id}
              variantId={currentVariantId}
              images={images}
              setImages={setImages}
              imageErrors={imageErrors}
              setImageErrors={setImageErrors}
              watch={watch}
              isEditing={true}
            />
          </div>

          {/* --- SUBMIT --- */}
          <div className="flex justify-end gap-3 pt-4 pb-10">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 px-6 py-3 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium shadow-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Đang xử lý..." : <><Save className="h-5 w-5" /> Cập nhật sản phẩm</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProduct;
