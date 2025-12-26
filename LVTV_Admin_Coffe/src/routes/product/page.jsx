import React, { useState, useEffect } from "react";
import { Eye, PencilLine, Trash, Plus, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getProducts, deleteProduct } from "../../service/productService";

// Component hiển thị danh sách sản phẩm
const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        pageSize: 10,
    });
    const navigate = useNavigate();

    // Load products
    useEffect(() => {
        loadProducts();
    }, [pagination.currentPage]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const response = await getProducts(pagination.currentPage, pagination.pageSize);
            if (response.isSuccess) {
                setProducts(response.data.records || []);
                setPagination({
                    currentPage: response.data.currentPage,
                    totalPages: response.data.totalPages,
                    totalRecords: response.data.totalRecords,
                    pageSize: response.data.pageSize,
                });
            }
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xử lý xóa sản phẩm
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
            try {
                await deleteProduct(id);
                toast.success("Xóa sản phẩm thành công!");
                loadProducts(); // Reload danh sách
            } catch (error) {
                toast.error(`Lỗi khi xóa sản phẩm: ${error.message}`);
            }
        }
    };

    // Lấy ảnh chính từ variants
    const getMainImage = (product) => {
        if (product.variants && product.variants.length > 0) {
            const mainImage = product.variants[0].images?.find((img) => img.isMain);
            return mainImage?.imageUrl || product.variants[0].images?.[0]?.imageUrl;
        }
        return null;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "--";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Package className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản Phẩm</h1>
                            <p className="text-sm text-gray-600">Tổng cộng: {pagination.totalRecords} sản phẩm</p>
                        </div>
                    </div>
                    <button
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition-colors"
                        onClick={() => navigate("/products/new")}
                    >
                        <Plus className="h-5 w-5" />
                        Thêm Sản Phẩm
                    </button>
                </div>

                {/* Products Table */}
                <div className="rounded-xl bg-white shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-gray-500">Đang tải...</div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Package className="h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">Chưa có sản phẩm nào</p>
                                <button
                                    onClick={() => navigate("/products/new")}
                                    className="mt-4 text-indigo-600 hover:text-indigo-700"
                                >
                                    Tạo sản phẩm đầu tiên
                                </button>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ảnh
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tên Sản Phẩm
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Danh Mục
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Variants
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày Tạo
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao Tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product, index) => (
                                        <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getMainImage(product) ? (
                                                    <img
                                                        src={getMainImage(product)}
                                                        alt={product.name}
                                                        className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {product.category && product.category.length > 0 ? (
                                                    <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
                                                        {product.category[0].name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">--</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => navigate(`/products/${product.productId}/variants`)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    {product.variants?.length || 0}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(product.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => navigate(`/products/edit/${product.productId}`)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <PencilLine className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.productId)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Xóa"
                                                    >
                                                        <Trash className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {!isLoading && products.length > 0 && pagination.totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Trang {pagination.currentPage} / {pagination.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                    disabled={pagination.currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
