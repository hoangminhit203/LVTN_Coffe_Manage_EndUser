import React, { useState, useEffect } from "react";
import { Eye, PencilLine, Trash, Plus, Package, Search, RefreshCw } from "lucide-react"; // Thêm icon
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getProducts, deleteProduct, searchProducts } from "../../service/productService"; // Import searchProducts
import Pagination from "../../components/pagination/Pagination"; // Import Pagination component
import VariantViewDialog from "../../components/product/variant-view-dialog"; // Import VariantViewDialog

const ProductManagement = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // State cho tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // State cho variant dialog
    const [variantDialog, setVariantDialog] = useState({
        show: false,
        data: null,
    });

    const [paging, setPaging] = useState({
        pageNumber: 1,
        totalPages: 1,
        totalRecords: 0,
        pageSize: 10,
    });

    // Load products khi trang thay đổi hoặc component mount
    useEffect(() => {
        handleLoadData();
    }, [paging.pageNumber, paging.pageSize]);

    // Hàm xử lý load dữ liệu (chia logic tìm kiếm và load thường)
    const handleLoadData = async () => {
        try {
            setIsLoading(true);
            let response;

            if (searchTerm.trim()) {
                // Nếu có từ khóa -> Gọi API tìm kiếm
                response = await searchProducts(searchTerm, paging.pageNumber, paging.pageSize);
                setIsSearching(true);
            } else {
                // Load bình thường
                response = await getProducts(paging.pageNumber, paging.pageSize);
                setIsSearching(false);
            }

            // Kiểm tra response (cấu trúc tùy thuộc vào backend trả về, giả sử trả về .data)
            // Lưu ý: Cần đảm bảo backend trả về đúng cấu trúc records, currentPage...
            const data = response.data || response; // Fallback nếu API trả thẳng data
            
            if (data) {
                setProducts(data.records || []);
                setPaging({
                    pageNumber: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalRecords: data.totalRecords || 0,
                    pageSize: data.pageSize || 10,
                });
            }
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("Không thể tải danh sách sản phẩm");
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý khi bấm nút tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault();
        // Reset về trang 1 khi tìm kiếm mới
        setPaging(prev => ({ ...prev, pageNumber: 1 }));
        handleLoadData();
    };

    // Xử lý xóa
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
            try {
                await deleteProduct(id);
                toast.success("Xóa sản phẩm thành công!");
                handleLoadData(); // Reload lại data
            } catch (error) {
                toast.error(`Lỗi khi xóa sản phẩm: ${error.message}`);
            }
        }
    };

    // Helper: Lấy ảnh chính an toàn hơn
    const getMainImage = (product) => {
        if (!product?.variants || product.variants.length === 0) return null;
        
        const firstVariant = product.variants[0];
        if (!firstVariant?.images || firstVariant.images.length === 0) return null;

        // Tìm ảnh có isMain = true, nếu không có lấy ảnh đầu tiên
        const mainImage = firstVariant.images.find((img) => img.isMain);
        return mainImage?.imageUrl || firstVariant.images[0]?.imageUrl;
    };

    // Helper: Lấy giá tiền (Hiển thị khoảng giá hoặc giá variant đầu)
    const getPriceDisplay = (product) => {
        if (!product?.variants || product.variants.length === 0) return "---";
        const price = product.variants[0].price;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Helper: Format ngày
    const formatDate = (dateString) => {
        if (!dateString) return "--";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    // Handler: Mở dialog xem variant details
    const handleViewVariant = (variant) => {
        setVariantDialog({
            show: true,
            data: variant,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
            {/* Variant View Dialog */}
            <VariantViewDialog
                open={variantDialog.show}
                onClose={() => setVariantDialog({ show: false, data: null })}
                variant={variantDialog.data}
            />

            <div className="mx-auto max-w-7xl space-y-6">
                
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                            Quản lý Sản Phẩm
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Tổng cộng: <span className="font-semibold text-gray-700 dark:text-gray-300">{paging.totalRecords}</span> sản phẩm
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/products/new")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        Thêm Sản Phẩm
                    </button>
                </div>

                {/* --- TOOLBAR (SEARCH) --- */}
                <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 pl-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Tìm kiếm theo tên sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button 
                                type="button" 
                                onClick={() => { setSearchTerm(""); setPaging(p => ({...p, pageNumber: 1})); setIsSearching(false); setTimeout(handleLoadData, 0); }}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <span className="text-xs font-bold">Xóa</span>
                            </button>
                        )}
                    </form>
                    
                    {/* Nút Refresh */}
                    <button 
                        onClick={handleLoadData} 
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Tải lại dữ liệu"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* --- TABLE CONTENT --- */}
                <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">#</th>
                                    <th className="px-6 py-4 font-semibold">Hình ảnh</th>
                                    <th className="px-6 py-4 font-semibold">Tên sản phẩm</th>
                                    <th className="px-6 py-4 font-semibold">Giá (Variant đầu)</th>
                                    <th className="px-6 py-4 font-semibold">Danh mục</th>
                                    <th className="px-6 py-4 font-semibold text-center">Biến thể</th>
                                    <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                                    <th className="px-6 py-4 font-semibold text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {isLoading ? (
                                    // Loading State
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400 mb-2" />
                                                <span className="text-gray-400 dark:text-gray-500">Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    // Empty State
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-4 mb-3">
                                                    <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <p className="text-gray-900 dark:text-white font-medium">Không tìm thấy sản phẩm nào</p>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                    {isSearching ? "Thử tìm kiếm với từ khóa khác" : "Hãy tạo sản phẩm mới để bắt đầu"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    // Data Rows
                                    products.map((product, index) => {
                                        const imgUrl = getMainImage(product);
                                        return (
                                            <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {(paging.pageNumber - 1) * paging.pageSize + index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                                                        {imgUrl ? (
                                                            <img
                                                                src={imgUrl}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
                                                                <Package className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white line-clamp-2" title={product.name}>
                                                        {product.name}
                                                    </div>
                                                    {/* <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</div> */}
                                                </td>
                                                <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-medium">
                                                    {getPriceDisplay(product)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {product.category && product.category.length > 0 ? (
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30">
                                                            {product.category[0].name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500 italic">--</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {product.variants && product.variants.length > 0 ? (
                                                        <button
                                                            onClick={() => handleViewVariant(product.variants[0])}
                                                            className="inline-flex items-center rounded-md bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            {product.variants.length} variants
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500 italic text-xs">--</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                    {formatDate(product.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* Nút Xem chi tiết (Nếu cần) */}
                                                        {/* <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                                                            <Eye className="h-4 w-4" />
                                                        </button> */}
                                                        
                                                        <button
                                                            onClick={() => navigate(`/products/edit/${product.productId}`)}
                                                            className="rounded p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <PencilLine className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.productId)}
                                                            className="rounded p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PAGINATION --- */}
                    {!isLoading && products.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
                            <Pagination paging={paging} setPaging={setPaging} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;