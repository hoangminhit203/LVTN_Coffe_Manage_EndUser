import { useEffect, useState } from "react";
import { 
    Area, 
    AreaChart, 
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer, 
    Tooltip, 
    XAxis, 
    YAxis,
    Legend,
    Line,
    LineChart
} from "recharts";

import { useTheme } from "@/hooks/use-theme";
import { statisticsService } from "@/service/statisticsService";
import { Footer } from "@/layouts/footer";

import { 
    Users, 
    UserPlus, 
    UserCheck,
    TrendingUp,
    ShoppingBag,
    DollarSign,
    Award,
    RefreshCw,
    Mail,
    Phone,
    Calendar,
    Percent
} from "lucide-react";

const CustomersPage = () => {
    const { theme } = useTheme();
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomerData();
    }, []);

    const fetchCustomerData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await statisticsService.getCustomerStats();
            if (response.isSuccess) {
                setCustomerData(response.data);
            } else {
                setError(response.message || "Failed to fetch customer data");
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
        return date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const formatShortDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Đang tải dữ liệu khách hàng...</p>
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
                        onClick={fetchCustomerData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!customerData) {
        return null;
    }

    const growthChartData = customerData.customerGrowth?.map(item => ({
        date: formatShortDate(item.date),
        newCustomers: item.newCustomers,
        totalCustomers: item.totalCustomers,
    })) || [];

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <h1 className="title">Khách Hàng Mua Nhiều Nhất</h1>
                <button 
                    onClick={fetchCustomerData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <RefreshCw size={18} />
                    Làm mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500">
                            <Users size={24} />
                        </div>
                        <p className="card-title">Tổng Khách Hàng</p>
                    </div>
                    <div className="card-body bg-slate-100 dark:bg-slate-950">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {customerData.totalCustomers}
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-green-500/20 p-2 text-green-500">
                            <UserCheck size={24} />
                        </div>
                        <p className="card-title">Đã Đăng Ký</p>
                    </div>
                    <div className="card-body bg-slate-100 dark:bg-slate-950">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {customerData.registeredUsers}
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-purple-500/20 p-2 text-purple-500">
                            <ShoppingBag size={24} />
                        </div>
                        <p className="card-title">Khách Vãng Lai</p>
                    </div>
                    <div className="card-body bg-slate-100 dark:bg-slate-950">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {customerData.guestOrders}
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-orange-500/20 p-2 text-orange-500">
                            <UserPlus size={24} />
                        </div>
                        <p className="card-title">Mới Tháng Này</p>
                    </div>
                    <div className="card-body bg-slate-100 dark:bg-slate-950">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {customerData.newCustomersThisMonth}
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-pink-500/20 p-2 text-pink-500">
                            <TrendingUp size={24} />
                        </div>
                        <p className="card-title">Quay Lại</p>
                    </div>
                    <div className="card-body bg-slate-100 dark:bg-slate-950">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {customerData.returningCustomers}
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-teal-500/20 p-2 text-teal-500">
                            <Percent size={24} />
                        </div>
                        <p className="card-title">Tỷ Lệ Quay Lại</p>
                    </div>
                    <div className="card-body bg-slate-100 dark:bg-slate-950">
                        <p className="text-2xl font-bold text-green-600">
                            {customerData.returnCustomerRate.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Customer Growth Chart */}
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Tăng Trưởng Khách Hàng</p>
                </div>
                <div className="card-body p-0">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={growthChartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === "light" ? "#e2e8f0" : "#334155"} />
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
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="newCustomers" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                name="Khách hàng mới"
                                dot={{ fill: '#10b981', r: 4 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="totalCustomers" 
                                stroke="#2563eb" 
                                strokeWidth={2}
                                name="Tổng khách hàng"
                                dot={{ fill: '#2563eb', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Customer Growth Bar Chart */}
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Khách Hàng Mới Theo Ngày</p>
                </div>
                <div className="card-body p-0">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={growthChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === "light" ? "#e2e8f0" : "#334155"} />
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
                            <Bar dataKey="newCustomers" fill="#10b981" name="Khách hàng mới" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Customers Table */}
            <div className="card">
                <div className="card-header">
                    <div className="flex items-center gap-2">
                        <Award size={24} className="text-yellow-500" />
                        <p className="card-title">Top Khách Hàng Mua Nhiều Nhất</p>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">#</th>
                                    <th className="table-head">Khách Hàng</th>
                                    <th className="table-head">Liên Hệ</th>
                                    <th className="table-head">Tổng Đơn</th>
                                    <th className="table-head">Tổng Chi Tiêu</th>
                                    <th className="table-head">Giá Trị TB</th>
                                    <th className="table-head">Đơn Đầu</th>
                                    <th className="table-head">Đơn Cuối</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {customerData.topCustomers?.map((customer, index) => (
                                    <tr key={customer.userId} className="table-row">
                                        <td className="table-cell">
                                            <div className="flex items-center justify-center">
                                                {index === 0 && (
                                                    <span className="text-2xl">🥇</span>
                                                )}
                                                {index === 1 && (
                                                    <span className="text-2xl">🥈</span>
                                                )}
                                                {index === 2 && (
                                                    <span className="text-2xl">🥉</span>
                                                )}
                                                {index > 2 && (
                                                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex flex-col">
                                                <p className="font-semibold text-slate-900 dark:text-slate-50">
                                                    {customer.customerName}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    ID: {customer.userId.substring(0, 8)}...
                                                </p>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-500" />
                                                    <span className="text-sm">{customer.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-slate-500" />
                                                    <span className="text-sm">{customer.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag size={16} className="text-blue-500" />
                                                <span className="font-semibold">{customer.totalOrders}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span className="font-bold text-green-600">
                                                {formatCurrency(customer.totalSpent)}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <span className="font-semibold text-blue-600">
                                                {formatCurrency(customer.averageOrderValue)}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                                <Calendar size={14} />
                                                {formatDate(customer.firstOrderDate)}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                                <Calendar size={14} />
                                                {formatDate(customer.lastOrderDate)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Customer Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {customerData.topCustomers?.slice(0, 3).map((customer, index) => (
                    <div key={customer.userId} className="card">
                        <div className="card-header">
                            <div className="flex items-center justify-between w-full">
                                <p className="card-title">Top {index + 1} - {customer.customerName}</p>
                                {index === 0 && <span className="text-2xl">🥇</span>}
                                {index === 1 && <span className="text-2xl">🥈</span>}
                                {index === 2 && <span className="text-2xl">🥉</span>}
                            </div>
                        </div>
                        <div className="card-body space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
                                <span className="text-sm font-medium">{customer.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Số điện thoại</span>
                                <span className="text-sm font-medium">{customer.phone}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Tổng đơn hàng</span>
                                <span className="text-lg font-bold text-blue-600">{customer.totalOrders}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Tổng chi tiêu</span>
                                <span className="text-lg font-bold text-green-600">
                                    {formatCurrency(customer.totalSpent)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Giá trị TB</span>
                                <span className="font-semibold">{formatCurrency(customer.averageOrderValue)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Footer />
        </div>
    );
};

export default CustomersPage;
