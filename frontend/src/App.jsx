import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { CookiesProvider } from "react-cookie";

// Context providers
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Layout components
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/Layout/AdminLayout";

// Pages
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
//import ProductDetail from './pages/ProductDetail.jsx';
//import Cart from './pages/Cart.jsx';
//import Wishlist from './pages/Wishlist.jsx';
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
//import Account from './pages/Account.jsx';
import About from "./pages/About.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminCategories from "./pages/admin/Categories.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";

// Protected Route component
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";




// Styles
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <CookiesProvider>
          <Router>
            <AuthProvider>
              <ThemeProvider>
                <CartProvider>
                  <WishlistProvider>
                    <div className="App">
                    {/* <div className="min-h-screen bg-primary-50 text-gray-900 font-body transition-colors duration-300"> */}
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Layout />}>
                          <Route index element={<Home />} />
                          <Route path="shop" element={<Shop />} />
                          <Route path="shop/:category" element={<Shop />} />
                          {/*  <Route path="product/:slug" element={<ProductDetail />} />
                          <Route path="cart" element={<Cart />} />
                          <Route path="wishlist" element={<Wishlist />} /> */}
                          <Route path="about" element={<About />} />
                          <Route path="login" element={<Login />} />
                          <Route path="register" element={<Register />} />

                          {/* Protected Routes */}
                          {/* <Route path="account" element={
                            <ProtectedRoute>
                              <Account />
                            </ProtectedRoute>
                          } /> */}
                          <Route
                            path="checkout"
                            element={
                              <ProtectedRoute>
                                <Checkout />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="order-confirmation/:orderId"
                            element={
                              <ProtectedRoute>
                                <OrderConfirmation />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="orders"
                            element={
                              <ProtectedRoute>
                                <OrderHistory />
                              </ProtectedRoute>
                            }
                          />
                        </Route>

                        {/* Admin Routes */}
                        <Route
                          path="/admin"
                          element={
                            <AdminRoute>
                              <AdminLayout />
                            </AdminRoute>
                          }
                        >
                          <Route index element={<AdminDashboard />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="users" element={<AdminUsers />} />
                          <Route
                            path="categories"
                            element={<AdminCategories />}
                          />
                          <Route path="settings" element={<AdminSettings />} />
                        </Route>

                        {/* 404 Route */}
                        <Route path="*" element={<Home />} />
                      </Routes>

                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: "#363636",
                            color: "#fff",
                          },
                        }}
                      />
                      {/* <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          className:
                            "bg-neutral-800 text-white px-4 py-2 rounded-xl shadow-md border border-neutral-700",
                        }} */}
                      />
                    </div>
                  </WishlistProvider>
                </CartProvider>
              </ThemeProvider>
            </AuthProvider>
          </Router>
        </CookiesProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
