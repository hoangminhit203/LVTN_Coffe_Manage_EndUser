import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import { getOrderById, updateOrderStatus } from "../../service/orderService";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const Order = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: "", message: "" });

    useEffect(() => {
        if (id) fetchOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Auto-hide notification
    useEffect(() => {
        if (notification.show) {
            const t = setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
            return () => clearTimeout(t);
        }
    }, [notification.show]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await getOrderById(id);
            const data = response.data || response;
            setOrder(data);
        } catch (error) {
            console.error("Error fetching order:", error);
            setNotification({ show: true, type: 'error', message: 'Không thể tải đơn hàng' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        try {
            if (!status) return toast.error("Trạng thái không hợp lệ");
            setUpdating(true);

            // ensure backend-friendly format (lowercase)
            const payloadStatus = String(status).toLowerCase();
            console.debug("Order.handleUpdateStatus", { id, payloadStatus });

            const resp = await updateOrderStatus(id, payloadStatus);
            console.debug("updateOrderStatus resp:", resp);

            // If API returned updated order object, use it; else update status locally
            if (resp && (resp.id || resp.orderId)) {
                setOrder(resp);
                setNotification({ show: true, type: 'success', message: 'Cập nhật trạng thái thành công' });
            } else if (resp && resp.status) {
                setOrder((prev) => prev ? { ...prev, status: resp.status } : prev);
                setNotification({ show: true, type: 'success', message: 'Cập nhật trạng thái thành công' });
            } else {
                // fallback -- set status and refetch to be safe
                setOrder((prev) => prev ? { ...prev, status: payloadStatus } : prev);
                setNotification({ show: true, type: 'success', message: 'Cập nhật trạng thái thành công' });
                await fetchOrder();
            }
        } catch (error) {
            console.error("Error updating order status:", error.response?.data || error);
            const errData = error?.response?.data;
            if (errData?.errors?.status) {
                setNotification({ show: true, type: 'error', message: errData.errors.status.join(', ') });
            } else if (errData?.message) {
                setNotification({ show: true, type: 'error', message: errData.message });
            } else {
                setNotification({ show: true, type: 'error', message: 'Cập nhật trạng thái thất bại' });
            }
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (value) => {
        if (value == null) return "--";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const computeSubTotal = (o) => {
        if (!o) return 0;
        if (o.totalAmount != null) return Number(o.totalAmount);
        if (o.subTotal != null) return Number(o.subTotal);
        const items = o.items || o.orderItems || [];
        return items.reduce((s, i) => s + ((i.priceAtPurchase || i.price || 0) * (i.quantity || 0)), 0);
    };

    const getShipping = (o) => Number(o?.shippingFee ?? o?.shipping ?? 0);
    const getDiscount = (o) => Number(o?.discountAmount ?? 0);
    const getFinal = (o) => {
        if (!o) return 0;
        if (o.finalAmount != null) return Number(o.finalAmount);
        const sub = computeSubTotal(o);
        return Math.max(0, sub + getShipping(o) - getDiscount(o));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Notification Toast (category-style) */}
                {notification.show && (
                    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 duration-300 pointer-events-auto">
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

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chi tiết đơn hàng</h1>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                        </div>
                    ) : !order ? (
                        <div className="py-8 text-center text-gray-500">Không tìm thấy đơn hàng</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Mã đơn</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{order.id || order.orderCode || order.orderId}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</div>
                                    <div className="mt-1">
                                        <select
                                            value={(order.status || '').toLowerCase()}
                                            onChange={(e) => handleUpdateStatus(e.target.value)}
                                            disabled={updating}
                                            className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-white"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s.toLowerCase()}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Người nhận</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{order.receiverName || order.customerName || order.customer?.fullName || order.customer?.name || "--"}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{order.receiverPhone || order.customer?.phone || "--"}</div>
                                    {/* <div className="text-sm text-gray-500 dark:text-gray-400">{order.receiverEmail || order.customer?.email || "--"}</div> */}
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Ngày đặt</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                                </div>

                                <div className="col-span-2">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ giao hàng</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{order.shippingAddress || "--"}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Phương thức vận chuyển</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{order.shippingMethod || "--"}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Số lượng sản phẩm</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{order.itemCount || (order.orderItems?.length || 0)}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sản phẩm</h3>
                                <div className="mt-2 overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2">Hình ảnh</th>
                                                <th className="px-4 py-2">Tên sản phẩm</th>
                                                <th className="px-4 py-2 text-right">Số lượng</th>
                                                <th className="px-4 py-2 text-right">Giá</th>
                                                <th className="px-4 py-2 text-right">Tổng</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {((order.orderItems && order.orderItems.length > 0) || (order.items && order.items.length > 0)) ? (
                                            (order.orderItems || order.items).map((it, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-4 py-3">
                                                        {it.imageUrl ? (
                                                            <img src={it.imageUrl} alt={it.productName} className="w-12 h-12 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-400">N/A</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-900 dark:text-white">{it.productName || it.product?.name || it.name}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{it.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(it.priceAtPurchase || it.price)}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(it.subtotal || ((it.priceAtPurchase || it.price || 0) * (it.quantity || 0)))}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">Không có sản phẩm</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-full sm:w-1/3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Tạm tính</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(computeSubTotal(order))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Phí vận chuyển</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(getShipping(order))}</span>
                                    </div>
                                    {getDiscount(order) > 0 && (
                                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                            <span>Giảm giá</span>
                                            <span className="font-medium">-{formatCurrency(getDiscount(order))}</span>
                                        </div>
                                    )}
                                    {order.promotionCode && (
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>Mã khuyến mãi:</span>
                                            <span className="font-mono">{order.promotionCode}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                        <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white">
                                            <span>Tổng cộng</span>
                                            <span className="text-lg">{formatCurrency(getFinal(order))}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Order;
