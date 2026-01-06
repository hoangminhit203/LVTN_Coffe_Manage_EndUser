
import { Image, Plus, Upload, X, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { 
    uploadProductImages, 
    deleteProductImage, 
    setMainImage, 
    getImagesByProduct,
    getImagesByVariant,
    updateImageInfo,
} from "../../service/productService";

const ProductImages = ({ 
    productId, 
    variantId, 
    images, 
    setImages, 
    imageErrors,  
    watch, 
    isEditing 
}) => {
    const [isLoading, setIsLoading] = useState(false);

    // 1. Load images khi component mount (Chế độ Edit)
    useEffect(() => {
        if (isEditing && productId) {
            loadImages();
        }
    }, [isEditing, productId, variantId]); // Thêm variantId vào dependency

    // Hàm load ảnh từ API
    const loadImages = async () => {
        try {
            setIsLoading(true);
            let response;
            
            // Nếu có VariantId thì ưu tiên load theo Variant, nếu không thì load theo Product
            if (variantId) {
                response = await getImagesByVariant(variantId);
            } else {
                response = await getImagesByProduct(productId);
            }

            // 👇 QUAN TRỌNG: API C# trả về List [], không phải object { totalRecords }
            if (Array.isArray(response) && response.length > 0) {
                const loadedImages = response.map((img) => ({
                    id: img.id,
                    preview: img.imageUrl,
                    alt: "Product Image", // Backend không trả về Alt thì để mặc định
                    isMain: img.isMain,
                    sortOrder: img.sortOrder,
                    file: null, // Đánh dấu là ảnh từ server
                }));
                
                // Sắp xếp theo sortOrder hoặc đưa ảnh Main lên đầu
                loadedImages.sort((a, b) => (b.isMain === true) - (a.isMain === true));
                setImages(loadedImages);
            } else {
                setImages([]); // Nếu không có ảnh hoặc lỗi
            }
        } catch (error) {
            console.error("Error loading images:", error);
            // toast.error("Không thể tải hình ảnh"); // Có thể ẩn toast này để đỡ phiền
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm format số index
    const formatSliderIndex = (index) => String(index + 1).padStart(3, "0");

    // 2. Xử lý Thêm ảnh (Hỗ trợ cả Create và Edit)
    const handleAddImageWithFile = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // --- TRƯỜNG HỢP 1: ĐANG EDIT (Upload thẳng lên Server) ---
        if (isEditing && productId && variantId) {
            try {
                setIsLoading(true);
                // Gọi API upload
                await uploadProductImages(productId, variantId, files);
                toast.success("Upload hình ảnh thành công!");
                await loadImages(); // Reload lại danh sách từ server
            } catch (error) {
                console.error("Error uploading images:", error);
                toast.error("Upload hình ảnh thất bại");
            } finally {
                setIsLoading(false);
            }
        } 
        // --- TRƯỜNG HỢP 2: ĐANG TẠO MỚI (Chỉ lưu vào State để Preview) ---
        else {
            const productName = watch ? watch("name") : "";
            
            const processFile = (file, index) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            file: file, // Giữ file gốc để submit form
                            preview: reader.result,
                            alt: productName ? `${productName} ${formatSliderIndex(index)}` : `Image ${formatSliderIndex(index)}`,
                            isMain: index === 0 && images.length === 0, // Ảnh đầu tiên tự động là Main
                        });
                    };
                    reader.readAsDataURL(file);
                });
            };

            const newImagesPromises = files.map((file, index) => {
                const currentIndex = images.length + index;
                return processFile(file, currentIndex);
            });

            const newImages = await Promise.all(newImagesPromises);
            setImages((prev) => [...prev, ...newImages]);
        }
        
        // Reset input file
        event.target.value = "";
    };

    // 3. Xử lý Xóa ảnh
    const removeImageField = async (index, imageId) => {
        // Nếu đang Edit và ảnh đã có ID (ảnh từ server) -> Gọi API xóa
        if (isEditing && imageId) {
            try {
                setIsLoading(true);
                await deleteProductImage(imageId);
                toast.success("Đã xóa hình ảnh!");
                setImages((prev) => prev.filter((_, i) => i !== index));
            } catch (error) {
                console.error("Error removing image:", error);
                toast.error("Xóa hình ảnh thất bại");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Nếu đang Tạo mới hoặc ảnh chưa lưu -> Chỉ xóa khỏi state
            setImages((prev) => prev.filter((_, i) => i !== index));
        }
    };

    // 4. Xử lý Đặt ảnh chính (Set Main)
    const handleSetMainImage = async (index, imageId) => {
        // --- EDIT MODE: Gọi API ---
        if (isEditing && imageId && productId && variantId) {
            try {
                setIsLoading(true);
                await setMainImage(productId, variantId, imageId);
                toast.success("Đã cập nhật ảnh đại diện!");
                await loadImages();
            } catch (error) {
                console.error("Error setting main image:", error);
                toast.error("Lỗi cập nhật ảnh chính");
            } finally {
                setIsLoading(false);
            }
        } 
        // --- CREATE MODE: Đảo vị trí mảng ---
        else if (!isEditing) {
            // Logic: Đưa ảnh được chọn lên vị trí đầu tiên (index 0)
            setImages(prev => {
                const newImages = [...prev];
                const selectedImage = newImages[index];
                
                // Xóa ảnh ở vị trí cũ
                newImages.splice(index, 1);
                // Chèn vào đầu
                newImages.unshift(selectedImage);
                
                // Cập nhật lại flag isMain (chỉ để hiển thị UI)
                return newImages.map((img, i) => ({
                    ...img,
                    isMain: i === 0
                }));
            });
        }
    };

    // 4.b Thay ảnh hiện có (Replace) - chọn file và PUT multipart FormData
    const handleReplaceImage = async (index, imageId, file) => {
        if (!file || !imageId) return;
        try {
            setIsLoading(true);
            // updateImageInfo hỗ trợ truyền File và tự tạo FormData bên service
            await updateImageInfo(imageId, file);
            toast.success("Đã thay ảnh thành công!");
            await loadImages();
        } catch (error) {
            console.error("Error replacing image:", error);
            toast.error("Thay ảnh thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">
                Hình Ảnh Sản Phẩm ({images.length})
                {isLoading && <span className="ml-2 text-sm text-indigo-500 animate-pulse">Running...</span>}
            </h2>
            
            <div className="space-y-6">
                <div className="flex flex-wrap items-start gap-4">
                    {/* Render List Images */}
                    {images.map((image, index) => (
                        <div
                            key={image.id ? `server-${image.id}` : `local-${index}`}
                            className="relative group w-32 flex-shrink-0"
                        >
                            <div className={`h-32 w-32 rounded-lg border-2 p-1 transition-all ${
                                image.isMain || index === 0 
                                ? "border-indigo-500 border-solid ring-2 ring-indigo-200" 
                                : "border-dashed border-gray-300 hover:border-indigo-400"
                            }`}>
                                <div className="relative h-full w-full overflow-hidden rounded-md">
                                    <img
                                        src={image.preview}
                                        alt={`Product ${index}`}
                                        className="h-full w-full object-cover"
                                    />

                                    {/* Badge Ảnh Chính */}
                                    {(image.isMain || (!isEditing && index === 0)) && (
                                        <div className="absolute top-1 left-1 rounded bg-indigo-600 px-2 py-0.5 text-[10px] text-white font-bold shadow-sm z-10">
                                            CHÍNH
                                        </div>
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        {/* Nút Replace (Thay ảnh) */}
                                        <label title="Thay ảnh" className="bg-white/90 hover:bg-white text-indigo-600 rounded px-2 py-1 text-xs font-semibold shadow-sm flex items-center gap-1 cursor-pointer">
                                            <Upload className="w-3 h-3" /> Thay
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleReplaceImage(index, image.id, file); e.target.value = ""; }} />
                                        </label>

                                        {/* Nút Set Main (Hiện nếu chưa phải là ảnh chính) */}
                                        {(!image.isMain && (isEditing || index !== 0)) && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetMainImage(index, image.id)}
                                                className="bg-white/90 hover:bg-white text-indigo-600 rounded px-2 py-1 text-xs font-semibold shadow-sm flex items-center gap-1"
                                                title="Đặt làm ảnh đại diện"
                                            >
                                                <Star className="w-3 h-3 fill-indigo-600" /> Chính
                                            </button>
                                        )}
                                        
                                        {/* Nút Xóa (Nằm góc trên) */}
                                        <button
                                            type="button"
                                            onClick={() => removeImageField(index, image.id)}
                                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-sm"
                                            title="Xóa ảnh này"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Số thứ tự */}
                            <div className="mt-1 text-center text-xs text-gray-500">
                                #{index + 1}
                            </div>
                        </div>
                    ))}

                    {/* Nút Thêm Ảnh */}
                    <div className="w-32 flex-shrink-0">
                        <label className={`flex h-32 w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 text-gray-500 transition-colors hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
                            <Plus className="mb-1 h-8 w-8" />
                            <span className="text-xs font-semibold">Thêm Ảnh</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple // Cho phép chọn nhiều ảnh
                                className="hidden"
                                onChange={handleAddImageWithFile}
                                disabled={isLoading}
                            />
                        </label>
                    </div>
                </div>

                {/* Error Message */}
                {imageErrors?.images && (
                    <p className="text-sm text-red-500 font-medium flex items-center gap-1">
                        <X className="w-4 h-4" /> {imageErrors.images}
                    </p>
                )}

                {/* Info Box */}
                <div className="rounded-lg bg-blue-50 p-3 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex gap-2">
                        <Image className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Lưu ý:</strong> Ảnh đầu tiên sẽ là <strong>ảnh đại diện</strong>. Bạn có thể chọn nhiều ảnh cùng lúc. Di chuột vào ảnh để xóa hoặc đặt làm ảnh chính.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductImages;