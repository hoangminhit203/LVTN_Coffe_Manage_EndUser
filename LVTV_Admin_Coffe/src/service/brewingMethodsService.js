import axiosClient from "../utils/axios";

// --- Lấy danh sách brewing methods (Get All) ---
export const getBrewingMethods = async (params) => {
    try {
        const res = await axiosClient.get("/BrewingMethods", {
            // Truyền tham số phân trang và tìm kiếm
            params: {
                PageNumber: params?.pageNumber || 1,
                PageSize: params?.pageSize || 10,
                Name: params?.searchTerm || undefined,
            },
        });

        return res.data;
    } catch (error) {
        // Log lỗi ra console để dev dễ debug
        console.error("Lỗi khi lấy danh sách BrewingMethod:", error);
        // Quan trọng: Ném lỗi ra ngoài để component (UI) biết là thất bại
        // và có thể hiển thị thông báo (Toast/Alert) cho người dùng.
        throw error;
    }
};

// --- Lấy chi tiết theo ID (Get by ID) ---
export const getBrewingMethodById = async (id) => {
    try {
        const res = await axiosClient.get(`/BrewingMethods/${id}`);
        // Lưu ý: Tùy vào API trả về mà có thể là res.data hoặc res.data.data
        return res.data.data;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết BrewingMethod ID ${id}:`, error);
        throw error;
    }
};

// --- Tạo mới (Create) ---
export const createBrewingMethod = async (data) => {
    try {
        const res = await axiosClient.post("/BrewingMethods", data);
        return res.data;
    } catch (error) {
        console.error("Lỗi khi tạo mới BrewingMethod:", error);
        throw error;
    }
};

// --- Cập nhật (Update) ---
export const updateBrewingMethod = async (id, data) => {
    try {
        const res = await axiosClient.put(`/BrewingMethods/${id}`, data);
        return res.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật BrewingMethod ID ${id}:`, error);
        throw error;
    }
};

// --- Xóa (Delete) ---
export const deleteBrewingMethod = async (id) => {
    try {
        const res = await axiosClient.delete(`/BrewingMethod/${id}`);
        return res.data;
    } catch (error) {
        console.error(`Lỗi khi xóa BrewingMethod ID ${id}:`, error);
        throw error;
    }
};
