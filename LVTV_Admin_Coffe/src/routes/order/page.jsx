import React, { useEffect, useState } from "react";
import { Eye, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrder, updateOrderStatus } from "../../service/orderService";
import Pagination from "../../components/pagination/Pagination";

const OrderManagement = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: "", message: "" });

    const [paging, setPaging] = useState({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalRecords: 0,
    });
    useEffect(() => {
        fetchOrders();
    }, [paging.pageNumber, paging.pageSize]);

    // Auto hide notification after 3 seconds (category-style)
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ show: false, type: "", message: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await getOrder(paging.pageNumber, paging.pageSize);
            console.debug("getOrder response:", response);
            const data = (response && (response.data ?? response)) ?? {};

            // If API returns array directly
            if (Array.isArray(data)) {
                console.debug("getOrder returned an array of orders", data.length);
                setOrders(data);
                setPaging((prev) => ({
                    ...prev,
                    totalRecords: data.length,
                    totalPages: Math.max(1, Math.ceil(data.length / prev.pageSize)),
                }));
                return;
            }

            // Try common container shapes
            const list = data.records || data.items || data.orders || data.data || data.result || [];
            console.debug("resolved orders list:", list);

            if (Array.isArray(list) && list.length > 0) {
                setOrders(list);
            } else {
                const altList = data.rows || data.results || [];
                setOrders(Array.isArray(altList) ? altList : []);
            }

            setPaging((prev) => ({
                ...prev,
                pageNumber: data.currentPage || data.pageNumber || prev.pageNumber,
                totalPages: data.totalPages || prev.totalPages,
                totalRecords: data.totalRecords ?? data.total ?? data.totalCount ?? (Array.isArray(list) ? list.length : 0),
                pageSize: data.pageSize || prev.pageSize,
            }));
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Không thể tải danh sách đơn hàng");
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            if (!orderId) {
                console.warn("handleUpdateStatus called without orderId", { orderId, newStatus });
                toast.error("Không có id đơn hàng");
                return;
            }
            if (!newStatus) {
                console.warn("handleUpdateStatus called without status", { orderId, newStatus });
                toast.error("Trạng thái không hợp lệ");
                return;
            }

            // Ensure status is string (backend expects a 'status' field)
            const payloadStatus = String(newStatus);
            console.debug("Calling updateOrderStatus", { orderId, status: payloadStatus });

            const resp = await updateOrderStatus(orderId, payloadStatus);
            console.debug("updateOrderStatus response:", resp);

            // Show success notification — prefer server message when available
            if (resp && typeof resp === 'string') {
                setNotification({ show: true, type: 'success', message: resp });
            } else if (resp && resp.message) {
                setNotification({ show: true, type: 'success', message: resp.message });
            } else {
                setNotification({ show: true, type: 'success', message: 'Cập nhật trạng thái thành công' });
            }

            // Update locally to avoid refetching; match by id OR orderId
            setOrders((prev) => prev.map(o => ((o.orderId == orderId || o.id == orderId) ? { ...o, status: payloadStatus } : o)));
        } catch (error) {
            console.error("Error updating order status:", error.response?.data || error);
            // Show backend validation if available
            const errData = error?.response?.data;
            if (errData?.errors && errData.errors.status) {
                setNotification({ show: true, type: 'error', message: errData.errors.status.join(', ') });
            } else if (errData?.message) {
                setNotification({ show: true, type: 'error', message: errData.message });
            } else {
                setNotification({ show: true, type: 'error', message: 'Cập nhật trạng thái thất bại' });
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "--";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    const formatCurrency = (value) => {
        if (value == null) return "--";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // You can adjust available statuses based on your backend
    const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Notification Toast (category-style) */}
                {notification.show && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
                                notification.type === "success"
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                            }`}
                        >
                            {notification.type === "success" ? (
                                <CheckCircle size={20} />
                            ) : (
                                <XCircle size={20} />
                            )}
                            <span className="font-medium">{notification.message}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Quản lý Đơn Hàng</h1>
                        <p className="text-sm text-gray-500 mt-1">Tổng đơn hàng: <span className="font-semibold text-gray-700 dark:text-gray-300">{paging.totalRecords}</span></p>
                    </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">#</th>
                                    <th className="px-6 py-4 font-semibold">Hình ảnh</th>
                                    <th className="px-6 py-4 font-semibold">Tên sản phẩm</th>
                                    <th className="px-6 py-4 font-semibold">Khách hàng</th>
                                    <th className="px-6 py-4 font-semibold">Số lượng</th>
                                    <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                    <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                                    <th className="px-6 py-4 font-semibold text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400 mb-2" />
                                                <span className="text-gray-400 dark:text-gray-500">Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-gray-900 dark:text-white font-medium">Không có đơn hàng nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order, index) => {
                                        const firstItem = (order.orderItems && order.orderItems[0]) || (order.items && order.items[0]);
                                        const imageUrl = firstItem?.imageUrl;
                                        const productName = firstItem?.productName || firstItem?.name || "--";
                                        const quantity = order.itemCount ?? (order.orderItems ? order.orderItems.reduce((s, i) => s + (i.quantity || 0), 0) : (order.items ? order.items.reduce((s, i) => s + (i.quantity || 0), 0) : "--"));
                                        const buyerName = order.receiverName || order.customerName || order.customer?.fullName || "--";
                                        const buyerPhone = order.receiverPhone || order.customer?.phone || "--";

                                        return (
                                        <tr key={order.orderId || order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{(paging.pageNumber - 1) * paging.pageSize + index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                    {imageUrl ? (
                                                        <img src={imageUrl} alt={productName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="text-gray-400">--</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white" title={productName}>{productName}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{buyerName}</div>
                                                <div className="text-xs text-gray-500">{buyerPhone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">{quantity}</td>
                                            <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-medium">{formatCurrency(order.finalAmount || order.totalAmount || order.totalPrice || order.amount)}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={(order.status || '').toLowerCase()}
                                                    onChange={(e) => handleUpdateStatus(order.id ?? order.orderId, e.target.value)}
                                                    className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
                                                >
                                                    {STATUSES.map(s => (
                                                        <option key={s} value={s.toLowerCase()}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/orders/${order.id ?? order.orderId}`)}
                                                        className="rounded p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!isLoading && orders.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
                            <Pagination paging={paging} setPaging={setPaging} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;
