// ProductImages.jsx
import { Image, Plus, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { uploadProductImages, deleteProductImage, setMainImage, getImagesByProduct } from "../../service/productService";
import { useEffect, useState } from "react";

const ProductImages = ({ productId, variantId, images, setImages, imageErrors, setImageErrors, watch, isEditing }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Load images khi component mount (nếu đang edit)
    useEffect(() => {
        if (isEditing && productId) {
            loadImages();
        }
    }, [isEditing, productId]);

    // Load images từ API
    const loadImages = async () => {
        try {
            setIsLoading(true);
            const response = await getImagesByProduct(productId);
            if (response.totalRecords > 0) {
                const loadedImages = response.records.map((img) => ({
                    id: img.id,
                    preview: img.imageUrl,
                    alt: img.imageUrl,
                    isMain: img.isMain,
                    sortOrder: img.sortOrder,
                    file: null, // Không có file vì đã upload rồi
                }));
                setImages(loadedImages);
            }
        } catch (error) {
            console.error("Error loading images:", error);
            toast.error("Không thể tải hình ảnh");
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm định dạng số thứ tự thành chuỗi 3 chữ số (ví dụ: 1 -> "001")
    const formatSliderIndex = (index) => String(index + 1).padStart(3, "0");

    // Hàm kiểm tra trùng lặp alt text trong danh sách images
    const checkDuplicateAlt = (alt, currentIndex) => {
        return images.some((img, index) => index !== currentIndex && img.alt === alt);
    };

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages((prev) => {
                    const newImages = [...prev];
                    const productName = watch("name");
                    const defaultAlt = productName ? `${productName} ${formatSliderIndex(index)}` : `Image ${formatSliderIndex(index)}`;
                    const currentAlt = newImages[index].alt && newImages[index].alt !== `Image ${index + 1}` ? newImages[index].alt : defaultAlt;
                    newImages[index] = {
                        ...newImages[index],
                        file: file,
                        preview: reader.result,
                        alt: currentAlt,
                    };
                    return newImages;
                });
            };
            reader.readAsDataURL(file);
        }
        event.target.value = "";
    };

    const handleAddImageWithFile = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            // Nếu đang edit và có productId + variantId, upload ngay
            if (isEditing && productId && variantId) {
                try {
                    setIsLoading(true);
                    await uploadProductImages(productId, variantId, files);
                    toast.success("Upload hình ảnh thành công!");
                    await loadImages(); // Reload images sau khi upload
                } catch (error) {
                    console.error("Error uploading images:", error);
                    toast.error("Upload hình ảnh thất bại");
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Nếu đang tạo mới, chỉ preview
                const productName = watch("name");

                const processFile = (file, index) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            resolve({
                                file: file,
                                preview: reader.result,
                                alt: productName ? `${productName} ${formatSliderIndex(index)}` : `Image ${formatSliderIndex(index)}`,
                                displayOrder: index,
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                };

                Promise.all(
                    files.map((file, index) => {
                        const currentIndex = images.length + index;
                        return processFile(file, currentIndex);
                    }),
                ).then((newImages) => {
                    setImages((prev) => [...prev, ...newImages]);
                });
            }
        }
        event.target.value = "";
    };

    const handleAltChange = (index, value) => {
        if (value && checkDuplicateAlt(value, index)) {
            toast.error("Alt text must be unique");
            return;
        }
        setImages((prev) => {
            const newImages = [...prev];
            newImages[index] = { ...newImages[index], alt: value };
            return newImages;
        });
    };

    const removeImageField = async (index, imageId) => {
        if (imageId && isEditing) {
            try {
                setIsLoading(true);
                await deleteProductImage(imageId);
                toast.success("Đã xóa hình ảnh thành công!");
                setImages((prev) => prev.filter((_, i) => i !== index));
            } catch (error) {
                console.error("Error removing image:", error);
                toast.error("Xóa hình ảnh thất bại");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Nếu đang tạo mới, chỉ xóa khỏi state
            setImages((prev) => prev.filter((_, i) => i !== index));
        }
    };

    // Hàm set ảnh chính
    const handleSetMainImage = async (index, imageId) => {
        if (imageId && isEditing && productId && variantId) {
            try {
                setIsLoading(true);
                await setMainImage(productId, variantId, imageId);
                toast.success("Đã đặt làm ảnh chính!");
                await loadImages(); // Reload để cập nhật isMain
            } catch (error) {
                console.error("Error setting main image:", error);
                toast.error("Không thể đặt ảnh chính");
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Hàm validateImages
    const validateImages = () => {
        const newErrors = {};
        if (images.length === 0 || images.every((img) => !img.file && !img.preview)) {
            newErrors.images = "Vui lòng tải lên ít nhất một hình ảnh";
        }
        // Kiểm tra trùng lặp alt trong validateImages
        const altValues = images.map((img) => img.alt);
        const duplicateAlts = altValues.filter((alt, index) => alt && altValues.indexOf(alt) !== index);
        if (duplicateAlts.length > 0) {
            newErrors.images = "Alt texts must be unique";
        }
        setImageErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Phần JSX
    return (
        <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Hình Ảnh Sản Phẩm ({images.length})
                {isLoading && <span className="ml-2 text-sm text-gray-500">(Đang xử lý...)</span>}
            </h2>
            <div className="space-y-6">
                <div className="flex flex-wrap items-start gap-4">
                    {images.map((image, index) => (
                        <div
                            key={`image-${image.id || index}-${image.preview ? "with-preview" : "no-preview"}`}
                            className="relative w-32 flex-shrink-0"
                        >
                            <div className={`h-32 w-32 rounded-lg border-2 p-2 transition-colors ${image.isMain ? "border-indigo-500 border-solid" : "border-dashed border-gray-300 hover:border-indigo-400"
                                }`}>
                                {image.preview ? (
                                    <div className="relative h-full w-full">
                                        <img
                                            src={image.preview}
                                            alt={`Preview ${index + 1}`}
                                            className="h-full w-full rounded-md object-cover"
                                        />
                                    
                                        {/* Main image badge */}
                                        {image.isMain && (
                                            <div className="absolute top-1 left-1 rounded bg-indigo-500 px-2 py-0.5 text-xs text-white font-semibold">
                                                Chính
                                            </div>
                                        )}
                                    
                                        <div className="bg-opacity-40 absolute inset-0 flex items-center justify-center rounded-md bg-black opacity-0 transition-opacity hover:opacity-90">
                                            <div className="flex flex-col gap-2">
                                                {isEditing && !image.isMain && image.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetMainImage(index, image.id)}
                                                        className="bg-indigo-500 hover:bg-indigo-600 rounded px-2 py-1 text-xs font-medium text-white"
                                                        disabled={isLoading}
                                                    >
                                                        Đặt làm chính
                                                    </button>
                                                )}
                                                {!isEditing && (
                                                    <label className="bg-opacity-90 hover:bg-opacity-100 cursor-pointer rounded bg-white px-2 py-1 text-xs font-medium text-gray-700">
                                                        <Upload className="mr-1 inline h-3 w-3" />
                                                        Thay Thế
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleImageChange(index, e)}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-gray-500 transition-colors hover:text-indigo-600">
                                        <Image className="mb-1 h-6 w-6" />
                                        <span className="text-center text-xs font-medium">Chọn Hình Ảnh</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageChange(index, e)}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Alt text input - Hide in edit mode */}
                            {!isEditing && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={image.alt || ""}
                                        onChange={(e) => handleAltChange(index, e.target.value)}
                                        placeholder="Mô tả hình ảnh..."
                                        className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            )}

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => removeImageField(index, image.id)}
                                className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white shadow-md transition-colors hover:bg-red-600 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                <X className="h-3 w-3" />
                            </button>

                            {/* Image number */}
                            {!image.isMain && (
                                <div className="bg-opacity-50 absolute top-1 left-1 rounded bg-black px-1.5 py-0.5 text-xs text-white">
                                    {index + 1}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add image button */}
                    <div className="w-32 flex-shrink-0">
                        <label className={`flex h-32 w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                            }`}>
                            <Plus className="mb-1 h-6 w-6" />
                            <span className="text-xs font-medium">Thêm Hình Ảnh</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleAddImageWithFile}
                                disabled={isLoading}
                            />
                        </label>
                    </div>
                </div>

                {imageErrors.images && <p className="text-sm text-red-600">{imageErrors.images}</p>}

                {/* Image info */}
                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Image className="mt-0.5 h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-800">
                                <strong>Lưu ý:</strong> Hình ảnh đầu tiên sẽ là hình ảnh chính của sản phẩm. Nhấp vào nút "+" để thêm hình ảnh (bạn có
                                thể chọn nhiều hình ảnh cùng một lúc). Cuộn ngang để xem tất cả hình ảnh.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductImages;
