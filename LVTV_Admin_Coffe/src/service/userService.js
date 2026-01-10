import axiosClient from "../utils/axios";

// --- Lấy danh sách người dùng (Get All) ---
export const getUsers = async (params) => {
    try {
        const res = await axiosClient.get("/AspNetUsers", {
            params: {
                PageNumber: params?.pageNumber || 1,
                PageSize: params?.pageSize || 10,
                SearchTerm: params?.searchTerm || undefined,
            },
        });

        return res.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        throw error;
    }
};

// --- Lấy chi tiết người dùng theo ID (Get by ID) ---
export const getUserById = async (id) => {
    try {
        const res = await axiosClient.get(`/AspNetUsers/${id}`);
        return res.data.data;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết người dùng ID ${id}:`, error);
        throw error;
    }
};

// --- Tạo mới người dùng (Create) ---
export const createUser = async (data) => {
    try {
        const res = await axiosClient.post("/AspNetUsers", data);
        return res.data;
    } catch (error) {
        console.error("Lỗi khi tạo mới người dùng:", error);
        throw error;
    }
};

// --- Cập nhật người dùng (Update) ---
export const updateUser = async (id, data) => {
    try {
        const res = await axiosClient.put(`/AspNetUsers/${id}`, data);
        return res.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật người dùng ID ${id}:`, error);
        throw error;
    }
};

// --- Xóa người dùng (Delete) ---
export const deleteUser = async (id) => {
    try {
        const res = await axiosClient.delete(`/AspNetUsers/${id}`);
        return res.data;
    } catch (error) {
        console.error(`Lỗi khi xóa người dùng ID ${id}:`, error);
        throw error;
    }
};
