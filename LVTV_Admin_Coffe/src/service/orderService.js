import axiosClient from "../utils/axios";

// Lấy danh sách đơn hàng với phân trang
export const getOrder = async (page = 1, pageSize = 10) => {
    try {
        const response = await axiosClient.get(`/Order/all`, {
            params: {
                page,
                pageSize,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
};

// Lấy chi tiết đơn hàng theo id
export const getOrderById = async (orderId) => {
    try {
        const response = await axiosClient.get(`/Order/${orderId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        throw error;
    }
};

// Update trạng thái đơn hàng
export const updateOrderStatus = async (orderId, status) => {
    const url = `/Order/${orderId}/status`;
    const queryStatus = String(status || '').toUpperCase();

    try {
        console.debug(`PUT ${url}?status=${queryStatus}`);
        // Send status as a query parameter per backend (swagger example)
        const response = await axiosClient.put(`${url}?status=${encodeURIComponent(queryStatus)}`, null, {
            headers: { Accept: 'text/plain' },
        });
        console.debug('updateOrderStatus response:', response.data);
        return response.data;
    } catch (error) {
        const errData = error.response?.data;
        console.error(`Error updating order ${orderId} status with query param:`, errData || error);

        // Fallbacks: try body payloads (keeps older attempts for compatibility)
        try {
            console.debug("Fallback: trying JSON body { status }");
            const resp2 = await axiosClient.put(url, { status: queryStatus });
            console.debug('updateOrderStatus response (body):', resp2.data);
            return resp2.data;
        } catch (e2) {
            console.error('Fallback JSON body failed:', e2.response?.data || e2);
            try {
                console.debug("Fallback: trying form-urlencoded");
                const params = new URLSearchParams();
                params.append('status', queryStatus);
                const resp3 = await axiosClient.put(url, params.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });
                console.debug('updateOrderStatus response (form):', resp3.data);
                return resp3.data;
            } catch (e3) {
                console.error('Fallback form payload failed:', e3.response?.data || e3);
            }
        }

        throw error;
    }
};