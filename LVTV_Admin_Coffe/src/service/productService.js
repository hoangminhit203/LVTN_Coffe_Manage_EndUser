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
        const response = await axiosClient.get(`/Product/search`, {
            params: {
                q: searchTerm,
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
        const formData = new FormData();

        // Thêm các file ảnh vào FormData
        if (Array.isArray(imageFiles)) {
            imageFiles.forEach((file, index) => {
                formData.append("images", file);
            });
        } else {
            formData.append("images", imageFiles);
        }

        const response = await axiosClient.post(`/Product/${productId}/variant/${variantId}/images`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
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
        const response = await axiosClient.get(`/Product/variant/${variantId}/images`);
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
        const response = await axiosClient.delete(`/Product/images/${imageId}`);
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
export const updateImageInfo = async (imageId, imageData) => {
    try {
        const response = await axiosClient.put(`/Product/images/${imageId}`, imageData);
        return response.data;
    } catch (error) {
        console.error(`Error updating image ${imageId}:`, error);
        throw error;
    }
};
