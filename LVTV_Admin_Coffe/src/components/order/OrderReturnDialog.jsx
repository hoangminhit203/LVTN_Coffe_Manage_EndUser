import React, { useState } from "react";
import { X, CheckCircle, XCircle, ExternalLink, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { updateReturnStatus } from "../../service/orderService";

const OrderReturnDialog = ({ returnData, onClose, onUpdateSuccess }) => {
    const [updating, setUpdating] = useState(false);
    const [adminNote, setAdminNote] = useState(returnData.adminNote || "");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isEditing, setIsEditing] = useState(returnData.status === "pending");
    const [currentStatus, setCurrentStatus] = useState(returnData.status || "pending");

    const handleUpdateStatus = async (newStatus) => {
        if (!adminNote.trim() && newStatus !== "pending") {
            toast.error("Vui lòng nhập ghi chú admin");
            return;
        }

        // Chuyển status sang action cho backend (approved -> approve, rejected -> reject)
        let action = "";
        if (newStatus === "approved") {
            action = "approve";
        } else if (newStatus === "rejected") {
            action = "reject";
        } else {
            toast.error("Trạng thái không hợp lệ");
            return;
        }

        try {
            setUpdating(true);
            const response = await updateReturnStatus(returnData.id, action, adminNote);
            
            // Hiển thị message từ backend nếu có
            const successMsg = response?.message || 
                (action === "approve" 
                    ? "Đã chấp nhận yêu cầu hoàn trả" 
                    : "Đã từ chối yêu cầu hoàn trả");
            
            toast.success(successMsg);
            onUpdateSuccess();
        } catch (error) {
            console.error("Error updating return status:", error);
            
            // Ưu tiên hiển thị message từ backend
            let errorMsg = "Cập nhật trạng thái thất bại";
            
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Xử lý trường hợp validation errors
                const errors = error.response.data.errors;
                errorMsg = Object.values(errors).flat().join(", ");
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            toast.error(errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (value) => {
        if (value == null) return "--";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "--";
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusColor = (status) => {
        const statusMap = {
            pending: "text-yellow-600",
            approved: "text-green-600",
            rejected: "text-red-600",
        };
        return statusMap[status?.toLowerCase()] || "text-gray-600";
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            pending: "Chờ xử lý",
            approved: "Đã chấp nhận",
            rejected: "Đã từ chối",
        };
        return statusMap[status?.toLowerCase()] || status;
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-800">
                            Chi tiết yêu cầu hoàn trả #{returnData.id}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Thông tin chung */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã đơn hàng
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                                        {returnData.orderId}
                                    </span>
                                    <a
                                        href={`#/order/${returnData.orderId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Xem đơn hàng"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Khách hàng
                                </label>
                                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded">
                                    {returnData.customerName}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày tạo
                                </label>
                                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded">
                                    {formatDate(returnData.createdAt)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                {isEditing ? (
                                    <select
                                        value={currentStatus}
                                        onChange={(e) => setCurrentStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="pending">Chờ xử lý</option>
                                        <option value="approved">Đã chấp nhận</option>
                                        <option value="rejected">Đã từ chối</option>
                                    </select>
                                ) : (
                                    <p className={`font-medium bg-gray-50 px-3 py-2 rounded ${getStatusColor(returnData.status)}`}>
                                        {getStatusLabel(returnData.status)}
                                    </p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số tiền hoàn trả
                                </label>
                                <p className="text-2xl font-bold text-green-600 bg-gray-50 px-3 py-2 rounded">
                                    {formatCurrency(returnData.refundAmount)}
                                </p>
                            </div>
                        </div>

                        {/* Lý do hoàn trả */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lý do hoàn trả
                            </label>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-gray-900 whitespace-pre-wrap">{returnData.reason}</p>
                            </div>
                        </div>

                        {/* Ảnh chứng minh */}
                        {returnData.proofImages && returnData.proofImages.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ảnh chứng minh ({returnData.proofImages.length})
                                </label>
                                <div className="grid grid-cols-4 gap-4">
                                    {returnData.proofImages.map((imageUrl, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all"
                                            onClick={() => setSelectedImage(imageUrl)}
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={`Proof ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ghi chú admin */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ghi chú admin {!isEditing && "(hiện tại)"}
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Nhập ghi chú về quyết định của bạn..."
                                rows={4}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Footer - Actions */}
                    <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isEditing ? "Hủy" : "Đóng"}
                        </button>

                        {!isEditing && returnData.status !== "pending" && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Chỉnh sửa
                            </button>
                        )}

                        {isEditing && (
                            <button
                                onClick={() => handleUpdateStatus(currentStatus)}
                                disabled={updating}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {updating ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <>
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-75 z-[60]" 
                        onClick={() => setSelectedImage(null)}
                    ></div>
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative max-w-4xl max-h-[90vh]">
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="max-w-full max-h-[90vh] rounded-lg"
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default OrderReturnDialog;
