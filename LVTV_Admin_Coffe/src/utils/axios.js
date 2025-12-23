import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const axiosClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClient;
