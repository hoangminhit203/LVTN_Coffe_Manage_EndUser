import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "../src/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import AnalyticsPage from "@/routes/analytics/page";
import CustomersPage from "@/routes/customers/page";
import CategoryPage from "@/routes/categories/page";
import FlavorNotePage from "@/routes/flavorNote/page";
import BrewingMethodPage from "@/routes/brewingmethod/page";
import ProductPage from "@/routes/product/page";
import NewProduct from "@/components/product/NewProduct";
import EditProduct from "@/components/product/EditProduct";
import NotFoundPage from "@/routes/not-found/page";
import OrderPage from "@/routes/order/page";
import Order from "@/components/order/Order";
import PromotionPage from "@/routes/promotion/page";
import BannerPage from "@/routes/banner/page";
import UserPage from "@/routes/user/page";
import OrderReturnPage from "@/routes/order/OrderReturnPage";
function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: "analytics",
                    element: <AnalyticsPage />,
                },
                   {
                    path: "categories",
                    element: <CategoryPage/>,
                },
                {
                    path: "flavornotes",
                    element: <FlavorNotePage/>,
                },
                {
                    path: "brewingmethods",
                    element: <BrewingMethodPage/>,
                },
                   {
                    path: "products",
                    element: <ProductPage />,
                },
                {
                    path: "products/new",
                    element: <NewProduct />,
                },
                {
                    path: "promotions",
                    element: <PromotionPage />,
                },
                {
                    path: "banners",
                    element: <BannerPage />,
                },
                {
                    path: "orders",
                    element: <OrderPage />,
                },
                {
                    path: "orders/:id",
                    element: <Order />,
                },
                {
                    path: "users",
                    element: <UserPage />,
                },
                {
                    path: '/return-requests',
                     element: <OrderReturnPage />
                },
                {
                    path: "reports",
                    element: <CustomersPage />,
                },
                {
                    path: "customers",
                    element: <h1 className="title">Khách Hàng</h1>,
                },
                {
                    path: "new-customer",
                    element: <h1 className="title">Khách Hàng Mới</h1>,
                },
              
                {
                    path: "products/edit/:id",
                    element: <EditProduct />,
                },
                {
                    path: "settings",
                    element: <h1 className="title">Cài Đặt</h1>,
                },
                {
                    path: "*",
                    element: <NotFoundPage />,
                },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;