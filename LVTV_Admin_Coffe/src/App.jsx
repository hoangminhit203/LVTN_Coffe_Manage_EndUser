import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "../src/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
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
                    path: "orders",
                    element: <OrderPage />,
                },
                {
                    path: "orders/:id",
                    element: <Order />,
                },
                {
                    path: "analytics",
                    element: <h1 className="title">Analytics</h1>,
                },
                {
                    path: "reports",
                    element: <h1 className="title">Reports</h1>,
                },
                {
                    path: "customers",
                    element: <h1 className="title">Customers</h1>,
                },
                {
                    path: "new-customer",
                    element: <h1 className="title">New Customer</h1>,
                },
                {
                    path: "verified-customers",
                    element: <h1 className="title">Verified Customers</h1>,
                },
                {
                    path: "products/edit/:id",
                    element: <EditProduct />,
                },
                {
                    path: "settings",
                    element: <h1 className="title">Settings</h1>,
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