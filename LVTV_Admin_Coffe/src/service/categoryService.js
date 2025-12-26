import axiosClient from "../utils/axios";

// --- Lấy danh sách danh mục (Get All) ---
export const getCategories = async (params) => {
    try {
        const res = await axiosClient.get("/Category", {
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
        console.error("Lỗi khi lấy danh sách Category:", error);
        // Quan trọng: Ném lỗi ra ngoài để component (UI) biết là thất bại
        // và có thể hiển thị thông báo (Toast/Alert) cho người dùng.
        throw error;
    }
};

// --- Lấy chi tiết theo ID (Get by ID) ---
export const getCategoryById = async (id) => {
    try {
        const res = await axiosClient.get(`/Category/${id}`);
        // Lưu ý: Tùy vào API trả về mà có thể là res.data hoặc res.data.data
        return res.data.data;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết Category ID ${id}:`, error);
        throw error;
    }
};

// --- Tạo mới (Create) ---
export const createdCategory = async (data) => {
    try {
        const res = await axiosClient.post("/Category", data);
        return res.data;
    } catch (error) {
        console.error("Lỗi khi tạo mới Category:", error);
        throw error;
    }
};

// --- Cập nhật (Update) ---
export const updateCategory = async (id, data) => {
    try {
        const res = await axiosClient.put(`/Category/${id}`, data);
        return res.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật Category ID ${id}:`, error);
        throw error;
    }
};

// --- Xóa (Delete) ---
export const deleteCategory = async (id) => {
    try {
        const res = await axiosClient.delete(`/Category/${id}`);
        return res.data;
    } catch (error) {
        console.error(`Lỗi khi xóa Category ID ${id}:`, error);
        throw error;
    }
};
