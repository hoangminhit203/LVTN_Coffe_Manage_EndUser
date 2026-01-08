import axiosClient from "../utils/axios";

// Lấy danh sách tất cả mã khuyến mãi
export const getPromotions = async () => {
    try {
        const response = await axiosClient.get(`/Promotion`);
        return response.data;
    } catch (error) {
        console.error("Error fetching promotions:", error);
        throw error;
    }
};

// Tạo mã khuyến mãi mới
export const createPromotion = async (promotionData) => {
    try {
        const response = await axiosClient.post(`/Promotion`, promotionData);
        return response.data;
    } catch (error) {
        console.error("Error creating promotion:", error);
        throw error;
    }
};

// Lấy promotion theo id
export const getPromotionById = async (id) => {
    try {
        const response = await axiosClient.get(`/Promotion/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching promotion ${id}:`, error);
        throw error;
    }
};

// Cập nhật promotion
export const updatePromotion = async (id, promotionData) => {
    try {
        const response = await axiosClient.put(`/Promotion/${id}`, promotionData);
        return response.data;
    } catch (error) {
        console.error(`Error updating promotion ${id}:`, error);
        throw error;
    }
};

// Xóa promotion
export const deletePromotion = async (id) => {
    try {
        const response = await axiosClient.delete(`/Promotion/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting promotion ${id}:`, error);
        throw error;
    }
};
