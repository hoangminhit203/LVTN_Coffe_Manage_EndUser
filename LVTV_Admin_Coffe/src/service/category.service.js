import axiosClient from "../utils/axios";
// get ALl
export const getCategories = async (params) => {
    const res = await axiosClient.get("/Category", {
        // truyền tham số vào
        params: {
            PageNumber: params?.pageNumber || 1,
            PageSize: params?.pageSize || 10,
            Name: params?.searchTerm || undefined,
        },
    });

    return res.data;
};
// get by id
export const getCategoryById = async (id) => {
    const res = await axiosClient.get(`/Category/${id}`);
    return res.data.data;
};
// Post
export const createdCategory = async (data) => {
    const res = await axiosClient.post("/Category", data);
    return res.data;
};
// Put
export const updateCategory = async (id, data) => {
    const res = await axiosClient.put(`/Category/${id}`, data);
    return res.data;
};
// Delete
export const deleteCategory = async (id) => {
    const res = await axiosClient.delete(`/Category/${id}`);
    return res.data;
};
