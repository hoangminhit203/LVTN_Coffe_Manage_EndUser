import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Package, Save } from "lucide-react";

import { createProduct, uploadProductImages } from "../../service/productService";
import { getCategories } from "../../service/categoryService";
import { getFlavorNotes } from "../../service/flavorNoteService";
import { getBrewingMethods } from "../../service/brewingMethodsService";
import ProductImages from "./ProductImages";
import { useTheme } from "../../hooks/use-theme";

const NewProduct = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch } = useForm();
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [flavorNotes, setFlavorNotes] = useState([]);
  const [brewingMethods, setBrewingMethods] = useState([]);

  const [selectedFlavorNoteIds, setSelectedFlavorNoteIds] = useState([]);
  const [selectedBrewingMethodIds, setSelectedBrewingMethodIds] = useState([]);

  // 🔴 FE chỉ nhập 1 variant – NHƯNG gửi mảng variants
  const [variant, setVariant] = useState({
    sku: "",
    price: 0,
    stock: 0,
    roastLevel: "",
    beanType: "",
    origin: "",
    acidity: 0,
    weight: 0,
    certifications: "",
  });

  const [images, setImages] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

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

      setCategories(catRes.data.items || []);
      setFlavorNotes(fnRes.data.items || []);
      setBrewingMethods(bmRes.data.items || []);
    } catch {
      toast.error("Không thể tải dữ liệu");
    }
  };

  const updateVariant = (field, value) => {
    setVariant((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFlavorNote = (id) => {
    setSelectedFlavorNoteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleBrewingMethod = (id) => {
    setSelectedBrewingMethodIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 ảnh");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ PAYLOAD KHỚP 100% API
      const payload = {
        name: data.name,
        description: data.description,
        categoryId: Number(data.categoryId),
        flavorNoteIds: selectedFlavorNoteIds,
        brewingMethodIds: selectedBrewingMethodIds,
        variants: [
          {
            sku: variant.sku,
            price: Number(variant.price),
            stock: Number(variant.stock),
            roastLevel: variant.roastLevel,
            beanType: variant.beanType,
            origin: variant.origin,
            acidity: Number(variant.acidity),
            weight: Number(variant.weight),
            certifications: variant.certifications,
          },
        ],
      };

      const res = await createProduct(payload);

      if (res.isSuccess) {
        const productId = res.data.productId;
        const variantId = res.data.variants[0].variantId;

        const files = images.filter((i) => i.file).map((i) => i.file);
        if (files.length > 0) {
          await uploadProductImages(productId, variantId, files);
        }

        toast.success("Tạo sản phẩm thành công");
        navigate("/products");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Tạo sản phẩm thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <Package className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold">Tạo sản phẩm mới</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* BASIC INFO */}
          <div className="rounded bg-white p-6 shadow">
            <input {...register("name")} placeholder="Tên sản phẩm" className="mb-2 w-full border p-2" />
            <textarea {...register("description")} placeholder="Mô tả" className="mb-2 w-full border p-2" />

            <select {...register("categoryId")} className="w-full border p-2">
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* VARIANT */}
<div className="rounded bg-white dark:bg-gray-800 p-6 shadow">
  <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Variant</h2>

  <input
    placeholder="SKU"
    value={variant.sku}
    onChange={(e) => updateVariant("sku", e.target.value)}
    className="mb-2 w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />

  <input
    type="number"
    placeholder="Giá"
    value={variant.price}
    onChange={(e) => updateVariant("price", e.target.value)}
    className="mb-2 w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />

  <input
    type="number"
    placeholder="Tồn kho"
    value={variant.stock}
    onChange={(e) => updateVariant("stock", e.target.value)}
    className="mb-2 w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />

  <input
    placeholder="Roast level (Light / Medium / Dark)"
    value={variant.roastLevel}
    onChange={(e) => updateVariant("roastLevel", e.target.value)}
    className="mb-2 w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />

  <input
    placeholder="Loại hạt (Arabica / Robusta)"
    value={variant.beanType}
    onChange={(e) => updateVariant("beanType", e.target.value)}
    className="mb-2 w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />

  <input
    placeholder="Xuất xứ"
    value={variant.origin}
    onChange={(e) => updateVariant("origin", e.target.value)}
    className="mb-2 w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />

  <input
    type="number"
    placeholder="Độ chua (1–5)"
    value={variant.acidity}
    onChange={(e) => updateVariant("acidity", e.target.value)}
    className="mb-2 w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />

  <input
    type="number"
    placeholder="Khối lượng (gram)"
    value={variant.weight}
    onChange={(e) => updateVariant("weight", e.target.value)}
    className="mb-2 w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />

  <input
    placeholder="Chứng nhận (Organic, Fairtrade...)"
    value={variant.certifications}
    onChange={(e) => updateVariant("certifications", e.target.value)}
    className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />
</div>
          {/* IMAGES */}
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

          <button disabled={isLoading} className="flex items-center gap-2 rounded bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-6 py-3 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Save className="h-5 w-5" />
            {isLoading ? "Đang tạo..." : "Tạo sản phẩm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewProduct;
