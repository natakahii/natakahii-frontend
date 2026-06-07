import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { ProductDetail } from "./pages/ProductDetail";
import { ShopStorefront } from "./pages/ShopStorefront";
import { VideoFeed } from "./pages/VideoFeed";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { CustomerHome } from "./pages/CustomerHome";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Tracking } from "./pages/Tracking";
import { Profile } from "./pages/Profile";

// Payment Flow
import { PaymentHistory } from "./pages/PaymentHistory";
import { Refunds } from "./pages/Refunds";

// Vendor Flow
import { VendorApply } from "./pages/vendor/VendorApply";
import { VendorLayout } from "./pages/vendor/VendorLayout";
import { VendorDashboardHome } from "./pages/vendor/VendorDashboardHome";
import { VendorProducts } from "./pages/vendor/VendorProducts";
import { VendorProductForm } from "./pages/vendor/VendorProductForm";
import { VendorAnalytics } from "./pages/vendor/VendorAnalytics";
import { VendorDropoffs } from "./pages/vendor/VendorDropoffs";
import { VendorSettings } from "./pages/vendor/VendorSettings";
import { VendorSubscriptionManagement } from "./pages/vendor/VendorSubscriptionManagement";
import { VendorWalletPage } from "./pages/vendor/VendorWallet";
import { VendorPayouts } from "./pages/vendor/VendorPayouts";
import { VendorWishlist } from "./pages/vendor/VendorWishlist";
import { VendorOrders } from "./pages/vendor/VendorOrders";

// Error/404 Page
import { NotFound } from "./pages/NotFound";
import { ErrorBoundary } from "./pages/ErrorBoundary";
import { RootLayout } from "./RootLayout";
import { RedirectIfAuthenticated, RequireAuth, RequireMissingRole, RequireRole } from "./components/auth/AuthGuards";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          // Public
          { index: true, Component: Home },
          { path: "explore", Component: Explore },
          { path: "product/:productIdentifier", Component: ProductDetail },
          { path: "shop/:shopSlug", Component: ShopStorefront },
          { path: "video", Component: VideoFeed },
          { path: "cart", Component: Cart },

          // Auth required customer routes
          { path: "customer", element: <RequireAuth><CustomerHome /></RequireAuth> },
          { path: "checkout", element: <RequireAuth><Checkout /></RequireAuth> },
          { path: "tracking", element: <RequireAuth><Tracking /></RequireAuth> },
          { path: "profile", element: <RequireAuth><Profile /></RequireAuth> },
          { path: "payments", element: <RequireAuth><PaymentHistory /></RequireAuth> },
          { path: "refunds", element: <RequireAuth><Refunds /></RequireAuth> },

          {
            path: "vendor/apply",
            element: (
              <RequireAuth>
                <RequireMissingRole role="vendor" redirectTo="/vendor/dashboard">
                  <VendorApply />
                </RequireMissingRole>
              </RequireAuth>
            ),
          },
          { path: "*", Component: NotFound },
        ],
      },
      // Auth Flow (No nav/footer)
      {
        path: "/login",
        element: (
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        ),
      },
      {
        path: "/register",
        element: (
          <RedirectIfAuthenticated>
            <Register />
          </RedirectIfAuthenticated>
        ),
      },
      {
        path: "/forgot-password",
        Component: ForgotPassword,
      },
      // Vendor Authenticated Flow
      {
        path: "/vendor/dashboard",
        element: (
          <RequireRole roles={['vendor']} redirectTo="/vendor/apply">
            <VendorLayout />
          </RequireRole>
        ),
        children: [
          { index: true, Component: VendorDashboardHome },
          { path: "products", Component: VendorProducts },
          { path: "products/add", Component: VendorProductForm },
          { path: "products/:productId/edit", Component: VendorProductForm },
          { path: "orders", Component: VendorOrders },
          { path: "analytics", Component: VendorAnalytics },
          { path: "dropoffs", Component: VendorDropoffs },
          { path: "subscription", Component: VendorSubscriptionManagement },
          { path: "settings", Component: VendorSettings },
          { path: "wallet", Component: VendorWalletPage },
          { path: "wishlist", Component: VendorWishlist },
          { path: "payouts", Component: VendorPayouts },
          { path: "*", Component: VendorDashboardHome },
        ],
      },
    ]
  }
]);
