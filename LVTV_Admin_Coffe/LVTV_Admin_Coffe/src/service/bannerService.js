import axiosClient from "../utils/axios";

// Lấy danh sách banner (hỗ trợ phân trang)
export const getBanners = async (page = 1, pageSize = 20) => {
    try {
        const response = await axiosClient.get(`/Banner`, {
            params: { page, pageSize },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching banners:", error);
        throw error;
    }
};

// Lấy chi tiết banner theo ID
export const getBannerById = async (bannerId) => {
    try {
        const response = await axiosClient.get(`/Banner/${bannerId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching banner ${bannerId}:`, error);
        throw error;
    }
};

// Tạo banner mới (multipart/form-data)
export const createBanner = async (formData) => {
    try {
        // caller should pass FormData with keys matching backend model: File (IFormFile), IsActive, Position, CreatedDate
        const response = await axiosClient.post(`/Banner`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating banner:", error);
        throw error;
    }
};

// Cập nhật banner (multipart/form-data)
export const updateBanner = async (bannerId, formData) => {
    try {
        const response = await axiosClient.put(`/Banner/${bannerId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating banner ${bannerId}:`, error);
        throw error;
    }
};

// Xóa banner
export const deleteBanner = async (bannerId) => {
    try {
        const response = await axiosClient.delete(`/Banner/${bannerId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting banner ${bannerId}:`, error);
        throw error;
    }
};
