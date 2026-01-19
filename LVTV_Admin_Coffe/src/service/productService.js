import axiosClient from "../utils/axios";

// Lấy danh sách sản phẩm với phân trang
export const getProducts = async (page = 1, pageSize = 10) => {
    try {
        const response = await axiosClient.get(`/Product`, {
            params: {
                page,
                pageSize,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

// Lấy chi tiết sản phẩm theo ID
export const getProductById = async (productId) => {
    try {
        const response = await axiosClient.get(`/Product/${productId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        throw error;
    }
};

// Tạo sản phẩm mới
export const createProduct = async (productData) => {
    try {
        const response = await axiosClient.post("/Product", productData);
        return response.data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

// Cập nhật sản phẩm
export const updateProduct = async (productId, productData) => {
    try {
        const response = await axiosClient.put(`/Product/${productId}`, productData);
        return response.data;
    } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
        throw error;
    }
};

// Xóa sản phẩm
export const deleteProduct = async (productId) => {
    try {
        const response = await axiosClient.delete(`/Product/${productId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
        throw error;
    }
};

// Tìm kiếm sản phẩm
export const searchProducts = async (searchTerm, page = 1, pageSize = 10) => {
    try {
        const response = await axiosClient.get(`/Product`, {
            params: {
                Name: searchTerm,
                page,
                pageSize,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error searching products:", error);
        throw error;
    }
};

// Lọc sản phẩm theo category
export const getProductsByCategory = async (categoryId, page = 1, pageSize = 10) => {
    try {
        const response = await axiosClient.get(`/Product/category/${categoryId}`, {
            params: {
                page,
                pageSize,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching products by category ${categoryId}:`, error);
        throw error;
    }
};

// ==================== IMAGE APIs ====================

// Upload hình ảnh cho product variant
export const uploadProductImages = async (productId, variantId, imageFiles) => {
    try {
        if (!imageFiles || (Array.isArray(imageFiles) && imageFiles.length === 0)) {
            return;
        }

        const filesArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

        // Tạo mảng Promise để upload nhiều ảnh song song
        const uploadPromises = filesArray.map((file, index) => {
            const formData = new FormData();

            // --- QUAN TRỌNG: Khớp tên biến với Model C# ---
            formData.append("File", file); // Backend: public IFormFile? File
            formData.append("ProductId", productId); // Backend: public int? ProductId

            if (variantId) {
                formData.append("ProductVariantId", variantId); // Backend: public int? ProductVariantId
            }

            formData.append("IsMain", index === 0);
            formData.append("SortOrder", index);

            // --- GỌI API ---
            // Lưu ý: Tuỳ vào setup axiosClient của bạn
            // Nếu axiosClient.baseURL = 'https://localhost:44384', thì dùng dòng dưới:
            return axiosClient.post("/Image/product-images", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // *Lưu ý*: Nếu axiosClient.baseURL đã có sẵn '/api' (VD: https://localhost:44384/api),
            // thì bạn chỉ cần truyền '/Image/product-images'
        });

        const responses = await Promise.all(uploadPromises);
        return responses.map((res) => res.data);
    } catch (error) {
        console.error("Error uploading product images:", error);
        throw error;
    }
};
// Lấy danh sách hình ảnh của product variant (trả về full response với totalRecords)
export const getProductImages = async (productId, variantId) => {
    try {
        const response = await axiosClient.get(`/Product/${productId}/variant/${variantId}/images`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product images:", error);
        throw error;
    }
};

// Lấy danh sách hình ảnh theo variant (trả về totalRecords và records)
export const getImagesByVariant = async (variantId) => {
    try {
        const response = await axiosClient.get(`/Image/by-variant/${variantId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching images by variant:", error);
        throw error;
    }
};

// Lấy danh sách hình ảnh theo productId
export const getImagesByProduct = async (productId) => {
    try {
        const response = await axiosClient.get(`/Image/by-product/${productId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching images by product ${productId}:`, error);
        throw error;
    }
};

// Xóa hình ảnh
export const deleteProductImage = async (imageId) => {
    try {
        const response = await axiosClient.delete(`/Image/${imageId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting image ${imageId}:`, error);
        throw error;
    }
};

// Đặt hình ảnh làm ảnh chính
export const setMainImage = async (productId, variantId, imageId) => {
    try {
        const response = await axiosClient.put(`/Product/${productId}/variant/${variantId}/images/${imageId}/set-main`);
        return response.data;
    } catch (error) {
        console.error(`Error setting main image ${imageId}:`, error);
        throw error;
    }
};

// Cập nhật thứ tự sắp xếp của hình ảnh
export const updateImageSortOrder = async (productId, variantId, imagesOrder) => {
    try {
        // imagesOrder là array của objects: [{ imageId: 1, sortOrder: 1 }, { imageId: 2, sortOrder: 2 }]
        const response = await axiosClient.put(`/Product/${productId}/variant/${variantId}/images/reorder`, imagesOrder);
        return response.data;
    } catch (error) {
        console.error("Error updating image sort order:", error);
        throw error;
    }
};

// Cập nhật thông tin hình ảnh
// Hỗ trợ 3 trường hợp:
// 1) JSON body (hiện tại behavior cũ)
// 2) FormData (caller đã tạo sẵn FormData với File/IsMain/...)
// 3) File object (tự tạo FormData từ File và các tuỳ chọn trong `extra`)
export const updateImageInfo = async (imageId, imageData, extra = {}) => {
    try {
        // Nếu caller truyền vào FormData -> gửi multipart/form-data
        if (typeof FormData !== "undefined" && imageData instanceof FormData) {
            const response = await axiosClient.put(`/Image/${imageId}`, imageData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        }

        // Nếu caller truyền vào File hoặc object dạng { file: File }
        if (
            (typeof File !== "undefined" && imageData instanceof File) ||
            (imageData && imageData.file && typeof File !== "undefined" && imageData.file instanceof File)
        ) {
            const file = imageData instanceof File ? imageData : imageData.file;
            const formData = new FormData();
            formData.append("File", file);
            if (extra.IsMain !== undefined) formData.append("IsMain", extra.IsMain);
            if (extra.SortOrder !== undefined) formData.append("SortOrder", extra.SortOrder);

            const response = await axiosClient.put(`/Image/${imageId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        }

        // Mặc định: gửi JSON như trước
        const response = await axiosClient.put(`/Image/${imageId}`, imageData);
        return response.data;
    } catch (error) {
        console.error(`Error updating image ${imageId}:`, error);
        throw error;
    }
};
