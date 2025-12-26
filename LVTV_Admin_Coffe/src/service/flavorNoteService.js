import axiosClient from "../utils/axios";

// --- Lấy danh sách flavor notes (Get All) ---
export const getFlavorNotes = async (params) => {
    try {
        const res = await axiosClient.get("/FlavorNote", {
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
        console.error("Lỗi khi lấy danh sách FlavorNote:", error);
        // Quan trọng: Ném lỗi ra ngoài để component (UI) biết là thất bại
        // và có thể hiển thị thông báo (Toast/Alert) cho người dùng.
        throw error;
    }
};

// --- Lấy chi tiết theo ID (Get by ID) ---
export const getFlavorNoteById = async (id) => {
    try {
        const res = await axiosClient.get(`/FlavorNote/${id}`);
        // Lưu ý: Tùy vào API trả về mà có thể là res.data hoặc res.data.data
        return res.data.data;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết FlavorNote ID ${id}:`, error);
        throw error;
    }
};

// --- Tạo mới (Create) ---
export const createdFlavorNote = async (data) => {
    try {
        const res = await axiosClient.post("/FlavorNote", data);
        return res.data;
    } catch (error) {
        console.error("Lỗi khi tạo mới FlavorNote:", error);
        throw error;
    }
};

// --- Cập nhật (Update) ---
export const updateFlavorNote = async (id, data) => {
    try {
        const res = await axiosClient.put(`/FlavorNote/${id}`, data);
        return res.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật FlavorNote ID ${id}:`, error);
        throw error;
    }
};

// --- Xóa (Delete) ---
export const deleteFlavorNote = async (id) => {
    try {
        const res = await axiosClient.delete(`/FlavorNote/${id}`);
        return res.data;
    } catch (error) {
        console.error(`Lỗi khi xóa FlavorNote ID ${id}:`, error);
        throw error;
    }
};
