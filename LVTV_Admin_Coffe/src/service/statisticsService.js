import axiosInstance from "@/utils/axios";

const BASE_URL = "/Statistics";

export const statisticsService = {
    getDashboardStats: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/dashboard`);
            return response.data;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    },

    getRevenueAnalytics: async (params) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/revenue`, {
                params: {
                    FromDate: params?.fromDate,
                    ToDate: params?.toDate,
                    GroupBy: params?.groupBy,
                    Status: params?.status,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching revenue analytics:", error);
            throw error;
        }
    },

    getCustomerStats: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/customers`);
            return response.data;
        } catch (error) {
            console.error("Error fetching customer stats:", error);
            throw error;
        }
    },
};
