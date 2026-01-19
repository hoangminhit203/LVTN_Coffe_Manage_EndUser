import React, { useEffect, useState } from "react";
import { RefreshCw, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { getOrderReturns } from "../../service/orderService";
import OrderReturnDialog from "./OrderReturnDialog";

const OrderReturn = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const response = await getOrderReturns();
            const data = response.data || response;
            setReturns(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching returns:", error);
            toast.error("Không thể tải danh sách yêu cầu hoàn trả");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (returnItem) => {
        setSelectedReturn(returnItem);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedReturn(null);
    };

    const handleUpdateSuccess = () => {
        fetchReturns();
        handleCloseDialog();
    };

    const formatCurrency = (value) => {
        if (value == null) return "--";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "--";
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800", icon: Clock },
            approved: { label: "Đã chấp nhận", color: "bg-green-100 text-green-800", icon: CheckCircle },
            rejected: { label: "Đã từ chối", color: "bg-red-100 text-red-800", icon: XCircle },
        };

        const statusInfo = statusMap[status?.toLowerCase()] || statusMap.pending;
        const Icon = statusInfo.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                <Icon className="w-3 h-3" />
                {statusInfo.label}
            </span>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Yêu cầu hoàn trả đơn hàng</h1>
                {/* <button
                    onClick={fetchReturns}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button> */}
            </div>

            {loading && returns.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã đơn hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lý do
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số tiền hoàn
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {returns.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            Không có yêu cầu hoàn trả nào
                                        </td>
                                    </tr>
                                ) : (
                                    returns.map((returnItem) => (
                                        <tr key={returnItem.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                #{returnItem.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {returnItem.orderId?.substring(0, 8)}...
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {returnItem.customerName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {returnItem.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(returnItem.refundAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getStatusBadge(returnItem.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(returnItem.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleViewDetail(returnItem)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isDialogOpen && selectedReturn && (
                <OrderReturnDialog
                    returnData={selectedReturn}
                    onClose={handleCloseDialog}
                    onUpdateSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default OrderReturn;
