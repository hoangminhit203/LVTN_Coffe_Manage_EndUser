import { useEffect, useState } from "react";
import { 
    Area, 
    AreaChart, 
    Bar, 
    BarChart, 
    Cell,
    Legend,
    Pie, 
    PieChart, 
    ResponsiveContainer, 
    Tooltip, 
    XAxis, 
    YAxis 
} from "recharts";

import { useTheme } from "@/hooks/use-theme";
import { statisticsService } from "@/service/statisticsService";
import { Footer } from "@/layouts/footer";

import { 
    DollarSign, 
    TrendingUp, 
    ShoppingCart, 
    Package, 
    Filter,
    Calendar,
    Download,
    RefreshCw
} from "lucide-react";

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' },
    { value: 'returned', label: 'Đã trả' },
    { value: 'return_requested', label: 'Yêu cầu trả' },
];

const GROUP_BY_OPTIONS = [
    { value: 'day', label: 'Theo ngày' },
    { value: 'week', label: 'Theo tuần' },
    { value: 'month', label: 'Theo tháng' },
];

const AnalyticsPage = () => {
    const { theme } = useTheme();
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        fromDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        groupBy: 'day',
        status: '',
    });

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await statisticsService.getRevenueAnalytics(filters);
            if (response.isSuccess) {
                setAnalyticsData(response.data);
            } else {
                setError(response.message || "Failed to fetch analytics data");
            }
        } catch (err) {
            setError(err.message || "An error occurred while fetching data");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilter = () => {
        fetchAnalyticsData();
    };

    const handleResetFilter = () => {
        setFilters({
            fromDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0],
            groupBy: 'day',
            status: '',
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getStatusLabel = (status) => {
        const option = STATUS_OPTIONS.find(opt => opt.value.toLowerCase() === status.toLowerCase());
        return option ? option.label : status;
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Đang tải dữ liệu phân tích...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-900 dark:text-slate-50 font-semibold mb-2">Có lỗi xảy ra</p>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                    <button 
                        onClick={fetchAnalyticsData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    const chartData = analyticsData?.revenueByDate?.map(item => ({
        date: formatDate(item.date),
        revenue: item.revenue,
        netRevenue: item.netRevenue,
        shippingFee: item.shippingFee,
        orderCount: item.orderCount,
    })) || [];

    const statusChartData = analyticsData?.revenueByStatus?.map(item => ({
        name: getStatusLabel(item.status),
        value: item.revenue,
        count: item.orderCount,
        percentage: item.percentage,
    })) || [];

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <h1 className="title">Phân Tích Doanh Thu</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchAnalyticsData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <RefreshCw size={18} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-header">
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-blue-500" />
                        <p className="card-title">Bộ lọc</p>
                    </div>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                <Calendar size={16} className="inline mr-1" />
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                value={filters.fromDate}
                                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                <Calendar size={16} className="inline mr-1" />
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={filters.toDate}
                                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Nhóm theo
                            </label>
                            <select
                                value={filters.groupBy}
                                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                            >
                                {GROUP_BY_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                            >
                                {STATUS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleApplyFilter}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Áp dụng
                        </button>
                        <button
                            onClick={handleResetFilter}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            Đặt lại
                        </button>
                    </div>
                </div>
            </div>

            {analyticsData && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="card">
                            <div className="card-header">
                                <div className="w-fit rounded-lg bg-green-500/20 p-2 text-green-500">
                                    <DollarSign size={24} />
                                </div>
                                <p className="card-title">Doanh Thu Ròng</p>
                            </div>
                            <div className="card-body bg-slate-100 dark:bg-slate-950">
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                    {formatCurrency(analyticsData.netRevenue)}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Tổng: {formatCurrency(analyticsData.totalRevenue)}
                                </p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500">
                                    <ShoppingCart size={24} />
                                </div>
                                <p className="card-title">Tổng Đơn Hàng</p>
                            </div>
                            <div className="card-body bg-slate-100 dark:bg-slate-950">
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                    {analyticsData.totalOrders}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Đơn hàng trong kỳ
                                </p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div className="w-fit rounded-lg bg-purple-500/20 p-2 text-purple-500">
                                    <TrendingUp size={24} />
                                </div>
                                <p className="card-title">Giá Trị TB</p>
                            </div>
                            <div className="card-body bg-slate-100 dark:bg-slate-950">
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                    {formatCurrency(analyticsData.averageOrderValue)}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Trung bình / đơn
                                </p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div className="w-fit rounded-lg bg-orange-500/20 p-2 text-orange-500">
                                    <Package size={24} />
                                </div>
                                <p className="card-title">Phí Vận Chuyển</p>
                            </div>
                            <div className="card-body bg-slate-100 dark:bg-slate-950">
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                    {formatCurrency(analyticsData.totalShippingFee)}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Giảm giá: {formatCurrency(analyticsData.totalDiscount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Range Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="card">
                            <div className="card-header">
                                <p className="card-title">Đơn Hàng Cao Nhất</p>
                            </div>
                            <div className="card-body">
                                <p className="text-3xl font-bold text-green-600">
                                    {formatCurrency(analyticsData.highestOrderValue)}
                                </p>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <p className="card-title">Đơn Hàng Thấp Nhất</p>
                            </div>
                            <div className="card-body">
                                <p className="text-3xl font-bold text-orange-600">
                                    {formatCurrency(analyticsData.lowestOrderValue)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Revenue Over Time Chart */}
                        <div className="card">
                            <div className="card-header">
                                <p className="card-title">Biểu Đồ Doanh Thu Theo Thời Gian</p>
                            </div>
                            <div className="card-body p-0">
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis 
                                            dataKey="date" 
                                            strokeWidth={0}
                                            stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                        />
                                        <YAxis 
                                            strokeWidth={0}
                                            stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                        />
                                        <Tooltip 
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: theme === "light" ? "#fff" : "#1e293b",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: "8px"
                                            }}
                                        />
                                        <Legend />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#2563eb" 
                                            fillOpacity={1} 
                                            fill="url(#colorRevenue)"
                                            name="Doanh thu"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="netRevenue" 
                                            stroke="#10b981" 
                                            fillOpacity={1} 
                                            fill="url(#colorNet)"
                                            name="Doanh thu ròng"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Revenue by Status Pie Chart */}
                        <div className="card">
                            <div className="card-header">
                                <p className="card-title">Doanh Thu Theo Trạng Thái</p>
                            </div>
                            <div className="card-body p-0">
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={statusChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statusChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: theme === "light" ? "#fff" : "#1e293b",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: "8px"
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Order Count Bar Chart */}
                    <div className="card">
                        <div className="card-header">
                            <p className="card-title">Số Lượng Đơn Hàng Theo Ngày</p>
                        </div>
                        <div className="card-body p-0">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <XAxis 
                                        dataKey="date" 
                                        strokeWidth={0}
                                        stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    />
                                    <YAxis 
                                        strokeWidth={0}
                                        stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: theme === "light" ? "#fff" : "#1e293b",
                                            border: "1px solid #cbd5e1",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <Bar dataKey="orderCount" fill="#2563eb" name="Số đơn hàng" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue by Date Table */}
                    <div className="card">
                        <div className="card-header">
                            <p className="card-title">Chi Tiết Doanh Thu Theo Ngày</p>
                        </div>
                        <div className="card-body p-0">
                            <div className="relative w-full overflow-auto">
                                <table className="table">
                                    <thead className="table-header">
                                        <tr className="table-row">
                                            <th className="table-head">Ngày</th>
                                            <th className="table-head">Doanh Thu</th>
                                            <th className="table-head">Phí Ship</th>
                                            <th className="table-head">Giảm Giá</th>
                                            <th className="table-head">Doanh Thu Ròng</th>
                                            <th className="table-head">Số Đơn</th>
                                            <th className="table-head">Giá TB</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-body">
                                        {analyticsData.revenueByDate?.map((item, index) => (
                                            <tr key={index} className="table-row">
                                                <td className="table-cell font-medium">
                                                    {formatDate(item.date)}
                                                </td>
                                                <td className="table-cell text-blue-600 font-semibold">
                                                    {formatCurrency(item.revenue)}
                                                </td>
                                                <td className="table-cell">
                                                    {formatCurrency(item.shippingFee)}
                                                </td>
                                                <td className="table-cell">
                                                    {formatCurrency(item.discount)}
                                                </td>
                                                <td className="table-cell text-green-600 font-semibold">
                                                    {formatCurrency(item.netRevenue)}
                                                </td>
                                                <td className="table-cell">{item.orderCount}</td>
                                                <td className="table-cell">
                                                    {formatCurrency(item.averageOrderValue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Revenue by Status Table */}
                    <div className="card">
                        <div className="card-header">
                            <p className="card-title">Doanh Thu Theo Trạng Thái</p>
                        </div>
                        <div className="card-body p-0">
                            <div className="relative w-full overflow-auto">
                                <table className="table">
                                    <thead className="table-header">
                                        <tr className="table-row">
                                            <th className="table-head">Trạng Thái</th>
                                            <th className="table-head">Doanh Thu</th>
                                            <th className="table-head">Số Đơn</th>
                                            <th className="table-head">Tỷ Lệ (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-body">
                                        {analyticsData.revenueByStatus?.map((item, index) => (
                                            <tr key={index} className="table-row">
                                                <td className="table-cell font-medium">
                                                    <span className="flex items-center gap-2">
                                                        <span 
                                                            className="w-3 h-3 rounded-full" 
                                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                        ></span>
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </td>
                                                <td className="table-cell text-green-600 font-semibold">
                                                    {formatCurrency(item.revenue)}
                                                </td>
                                                <td className="table-cell">{item.orderCount}</td>
                                                <td className="table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full rounded-full transition-all"
                                                                style={{ 
                                                                    width: `${item.percentage}%`,
                                                                    backgroundColor: COLORS[index % COLORS.length]
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-medium min-w-[50px]">
                                                            {item.percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Revenue by Shipping Method Table */}
                    {analyticsData.revenueByShippingMethod && analyticsData.revenueByShippingMethod.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <p className="card-title">Doanh Thu Theo Phương Thức Vận Chuyển</p>
                            </div>
                            <div className="card-body p-0">
                                <div className="relative w-full overflow-auto">
                                    <table className="table">
                                        <thead className="table-header">
                                            <tr className="table-row">
                                                <th className="table-head">Phương Thức</th>
                                                <th className="table-head">Doanh Thu</th>
                                                <th className="table-head">Số Đơn</th>
                                                <th className="table-head">Tỷ Lệ (%)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-body">
                                            {analyticsData.revenueByShippingMethod.map((item, index) => (
                                                <tr key={index} className="table-row">
                                                    <td className="table-cell font-medium">
                                                        {item.shippingMethod}
                                                    </td>
                                                    <td className="table-cell text-green-600 font-semibold">
                                                        {formatCurrency(item.revenue)}
                                                    </td>
                                                    <td className="table-cell">{item.orderCount}</td>
                                                    <td className="table-cell">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                                    style={{ width: `${item.percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium min-w-[50px]">
                                                                {item.percentage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <Footer />
        </div>
    );
};

export default AnalyticsPage;
