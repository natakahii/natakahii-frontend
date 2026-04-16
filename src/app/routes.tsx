import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { CustomerLayout } from "./components/CustomerLayout";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { ProductDetail } from "./pages/ProductDetail";
import { VideoFeed } from "./pages/VideoFeed";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { CustomerHome } from "./pages/CustomerHome";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Tracking } from "./pages/Tracking";
import { Profile } from "./pages/Profile";

// Vendor Flow
import { VendorApply } from "./pages/vendor/VendorApply";
import { VendorLayout } from "./pages/vendor/VendorLayout";
import { VendorDashboardHome } from "./pages/vendor/VendorDashboardHome";
import { VendorProducts } from "./pages/vendor/VendorProducts";
import { VendorProductForm } from "./pages/vendor/VendorProductForm";
import { VendorAnalytics } from "./pages/vendor/VendorAnalytics";
import { VendorDropoffs } from "./pages/vendor/VendorDropoffs";

// Admin Flow
//import { AdminLayout } from "./pages/admin/AdminLayout";
//import { AdminDashboard } from "./pages/admin/AdminDashboard";
//import { AdminCargo } from "./pages/admin/AdminCargo";

// Error/404 Page
import { NotFound } from "./pages/NotFound";
import { RootLayout } from "./RootLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Visitor Flow
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "explore", Component: Explore },
      { path: "product/:id", Component: ProductDetail },
      { path: "video", Component: VideoFeed },
      { path: "vendor/apply", Component: VendorApply },
      { path: "*", Component: NotFound },
    ],
  },
  // Auth Flow (No nav/footer)
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  // Customer Authenticated Flow
  {
    path: "/",
    Component: CustomerLayout,
    children: [
      { path: "customer", Component: CustomerHome },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "tracking", Component: Tracking },
      { path: "profile", Component: Profile },
    ],
  },
  // Vendor Authenticated Flow
  {
    path: "/vendor/dashboard",
    Component: VendorLayout,
    children: [
      { index: true, Component: VendorDashboardHome },
      { path: "products", Component: VendorProducts },
      { path: "products/add", Component: VendorProductForm },
      { path: "analytics", Component: VendorAnalytics },
      { path: "dropoffs", Component: VendorDropoffs },
      { path: "*", Component: VendorDashboardHome },
    ],
  },
  // Admin Flow
 // {
  //  path: "/admin",
  //  Component: AdminLayout,
  //  children: [
    //  { index: true, Component: AdminDashboard },
     // { path: "cargo", Component: AdminCargo },
    //  { path: "*", Component: AdminDashboard },
    //],
 // },
  ] 
}
]);
