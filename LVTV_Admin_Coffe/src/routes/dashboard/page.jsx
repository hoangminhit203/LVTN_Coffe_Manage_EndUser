import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useTheme } from "@/hooks/use-theme";

import { Footer } from "@/layouts/footer";

import { CreditCard, DollarSign, Package, ShoppingCart, TrendingUp, Users, Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";

import { statisticsService } from "@/service/statisticsService";

const DashboardPage = () => {
    const { theme } = useTheme();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await statisticsService.getDashboardStats();
            if (response.isSuccess) {
                setDashboardData(response.data);
            } else {
                setError(response.message || "Failed to fetch dashboard data");
            }
        } catch (err) {
            setError(err.message || "An error occurred while fetching data");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <XCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <p className="text-slate-900 dark:text-slate-50 font-semibold mb-2">Có lỗi xảy ra</p>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                    <button 
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const chartData = dashboardData.revenueChart?.map(item => ({
        name: formatDate(item.date),
        revenue: item.netRevenue,
        orders: item.orderCount,
    })) || [];

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Bảng Điều Khiển</h1>
            
            {/* Revenue Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-green-500/20 p-2 text-green-500 transition-colors dark:bg-green-600/20 dark:text-green-600">
                            <DollarSign size={26} />
                        </div>
                        <p className="card-title">Tổng Doanh Thu</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {formatCurrency(dashboardData.totalRevenue)}
                        </p>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Tất cả thời gian
                        </span>
                    </div>
                </div>
                
                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                            <TrendingUp size={26} />
                        </div>
                        <p className="card-title">Doanh Thu Tháng</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {formatCurrency(dashboardData.monthRevenue)}
                        </p>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Tháng này
                        </span>
                    </div>
                </div>
                
                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-purple-500/20 p-2 text-purple-500 transition-colors dark:bg-purple-600/20 dark:text-purple-600">
                            <ShoppingCart size={26} />
                        </div>
                        <p className="card-title">Tổng Đơn Hàng</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {dashboardData.totalOrders}
                        </p>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {dashboardData.monthOrders} đơn tháng này
                        </span>
                    </div>
                </div>
                
                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-orange-500/20 p-2 text-orange-500 transition-colors dark:bg-orange-600/20 dark:text-orange-600">
                            <Users size={26} />
                        </div>
                        <p className="card-title">Khách Hàng</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {dashboardData.totalCustomers}
                        </p>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {dashboardData.newCustomersThisMonth} mới tháng này
                        </span>
                    </div>
                </div>
            </div>

            {/* Order Status Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="card">
                    <div className="card-header">
                        <Clock size={20} className="text-yellow-500" />
                        <p className="card-title text-sm">Chờ Xử Lý</p>
                    </div>
                    <div className="card-body">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {dashboardData.pendingOrders}
                        </p>
                    </div>
                </div>
                
                <div className="card">
                    <div className="card-header">
                        <RotateCcw size={20} className="text-blue-500" />
                        <p className="card-title text-sm">Đang Xử Lý</p>
                    </div>
                    <div className="card-body">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {dashboardData.processingOrders}
                        </p>
                    </div>
                </div>
                
                <div className="card">
                    <div className="card-header">
                        <CheckCircle size={20} className="text-green-500" />
                        <p className="card-title text-sm">Hoàn Thành</p>
                    </div>
                    <div className="card-body">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {dashboardData.deliveredOrders}
                        </p>
                    </div>
                </div>
                
                <div className="card">
                    <div className="card-header">
                        <XCircle size={20} className="text-red-500" />
                        <p className="card-title text-sm">Đã Hủy</p>
                    </div>
                    <div className="card-body">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {dashboardData.cancelledOrders}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="card col-span-1 md:col-span-2 lg:col-span-4">
                    <div className="card-header">
                        <p className="card-title">Biểu Đồ Doanh Thu (7 ngày)</p>
                    </div>
                    <div className="card-body p-0">
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorRevenue"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#2563eb"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#2563eb"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    cursor={false}
                                    formatter={(value) => formatCurrency(value)}
                                />

                                <XAxis
                                    dataKey="name"
                                    strokeWidth={0}
                                    stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    tickMargin={6}
                                />
                                <YAxis
                                    dataKey="revenue"
                                    strokeWidth={0}
                                    stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                    tickMargin={6}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563eb"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="card col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="card-header">
                        <p className="card-title">Thống Kê</p>
                    </div>
                    <div className="card-body space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Giá trị TB đơn hàng</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-50">
                                {formatCurrency(dashboardData.averageOrderValue)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Tỷ lệ hoàn thành</span>
                            <span className="font-semibold text-green-600">
                                {dashboardData.completionRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Tỷ lệ hủy đơn</span>
                            <span className="font-semibold text-red-600">
                                {dashboardData.cancellationRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Yêu cầu trả hàng</span>
                            <span className="font-semibold text-orange-600">
                                {dashboardData.returnRequestedOrders}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Khách hàng hoạt động</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-50">
                                {dashboardData.activeCustomers}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Sản Phẩm Bán Chạy</p>
                </div>
                <div className="card-body p-0">
                    <div className="relative h-[400px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">#</th>
                                    <th className="table-head">Sản Phẩm</th>
                                    <th className="table-head">Biến Thể</th>
                                    <th className="table-head">Đã Bán</th>
                                    <th className="table-head">Doanh Thu</th>
                                    <th className="table-head">Số Đơn</th>
                                    <th className="table-head">Giá TB</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {dashboardData.topSellingProducts?.map((product, index) => (
                                    <tr
                                        key={product.productVariantId}
                                        className="table-row"
                                    >
                                        <td className="table-cell">{index + 1}</td>
                                        <td className="table-cell">
                                            <div className="flex w-max gap-x-4">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.productName}
                                                    className="size-14 rounded-lg object-cover"
                                                />
                                                <div className="flex flex-col justify-center">
                                                    <p className="font-semibold">{product.productName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">{product.variantName}</td>
                                        <td className="table-cell">{product.quantitySold}</td>
                                        <td className="table-cell font-semibold text-green-600">
                                            {formatCurrency(product.revenue)}
                                        </td>
                                        <td className="table-cell">{product.orderCount}</td>
                                        <td className="table-cell">{formatCurrency(product.averagePrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Top Customers */}
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Khách Hàng Thân Thiết</p>
                </div>
                <div className="card-body p-0">
                    <div className="relative h-[300px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">#</th>
                                    <th className="table-head">Khách Hàng</th>
                                    <th className="table-head">Số Điện Thoại</th>
                                    <th className="table-head">Tổng Đơn</th>
                                    <th className="table-head">Tổng Chi Tiêu</th>
                                    <th className="table-head">Đơn TB</th>
                                    <th className="table-head">Đơn Cuối</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {dashboardData.topCustomers?.map((customer, index) => (
                                    <tr
                                        key={customer.userId}
                                        className="table-row"
                                    >
                                        <td className="table-cell">{index + 1}</td>
                                        <td className="table-cell">
                                            <div className="flex flex-col">
                                                <p className="font-semibold">{customer.customerName}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{customer.email}</p>
                                            </div>
                                        </td>
                                        <td className="table-cell">{customer.phone}</td>
                                        <td className="table-cell">{customer.totalOrders}</td>
                                        <td className="table-cell font-semibold text-green-600">
                                            {formatCurrency(customer.totalSpent)}
                                        </td>
                                        <td className="table-cell">{formatCurrency(customer.averageOrderValue)}</td>
                                        <td className="table-cell">
                                            {new Date(customer.lastOrderDate).toLocaleDateString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default DashboardPage;