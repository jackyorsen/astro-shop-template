import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './components/MainLayout';
import { AdminLayout } from './components/AdminLayout';
import { HomePage } from './pages_react/HomePage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AdminProvider } from './context/AdminContext';
import { ScrollToTop } from './components/ScrollToTop';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { CookieBanner } from './components/CookieBanner';
import { CountryRedirectModal } from './components/CountryRedirectModal';
// Shop Pages
import ShopPage from './pages_react/ShopPage';
import ProductDetailPage from './pages_react/ProductDetailPage';
import CheckoutPage from './pages_react/CheckoutPage';
import CartPage from './pages_react/CartPage';
import CategoryPage from './pages_react/CategoryPage';
import SuccessPage from './pages_react/SuccessPage';
import LandingPageSchminktisch from './pages_react/LandingPageSchminktisch';
import RoomPage from './pages_react/RoomPage';
import SalePage from './pages_react/SalePage';
import CollectionPage from './pages_react/CollectionPage';

// Static Pages
const ShippingPage = lazy(() => import('./pages_react/ShippingPage'));
const ReturnsPage = lazy(() => import('./pages_react/ReturnsPage'));
const FAQPage = lazy(() => import('./pages_react/FAQPage'));
const DataProtectionPage = lazy(() => import('./pages_react/DataProtectionPage'));
const ImprintPage = lazy(() => import('./pages_react/ImprintPage'));
const TermsPage = lazy(() => import('./pages_react/TermsPage'));
const PaymentMethodsPage = lazy(() => import('./pages_react/PaymentMethodsPage'));
const TrackingPage = lazy(() => import('./pages_react/TrackingPage'));

// Auth Pages
const LoginPage = lazy(() => import('./pages_react/LoginPage'));
const AccountPage = lazy(() => import('./pages_react/AccountPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages_react/AdminDashboardPage'));
const AdminOrdersPage = lazy(() => import('./pages_react/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('./pages_react/AdminProductsPage'));
const AdminCouponsPage = lazy(() => import('./pages_react/AdminCouponsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages_react/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages_react/AdminSettingsPage'));

// Full Page Loader Component
const FullPageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#f0f0f0] border-t-[#2b4736] rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-500 text-sm">Lädt...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <CountryRedirectModal />
          <GlobalErrorBoundary>
            <Suspense fallback={<FullPageLoader />}>
              <Routes>
                {/* ========================================
                    SHOP FRONTEND ROUTES (with MainLayout)
                    ======================================== */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:sku" element={<ProductDetailPage />} />
                  <Route path="/:world/:subcategory/:slug" element={<ProductDetailPage />} />
                  <Route path="/raum/:slug" element={<RoomPage />} />
                  <Route path="/kategorie/:slug" element={<CategoryPage />} />
                  <Route path="/sale" element={<SalePage />} />

                  {/* World & Collection Routes */}
                  <Route path="/work" element={<CollectionPage type="work" />} />
                  <Route path="/work/:subcategory" element={<CollectionPage type="work" />} />
                  <Route path="/beauty" element={<CollectionPage type="beauty" />} />
                  <Route path="/beauty/:subcategory" element={<CollectionPage type="beauty" />} />
                  <Route path="/bestseller" element={<CollectionPage type="bestseller" />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Static Pages */}
                  <Route path="/tracking" element={<TrackingPage />} />
                  <Route path="/lieferung-versand" element={<ShippingPage />} />
                  <Route path="/ruecksendung-umtausch" element={<ReturnsPage />} />
                  <Route path="/zahlungsarten" element={<PaymentMethodsPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/datenschutzerklaerung" element={<DataProtectionPage />} />
                  <Route path="/impressum" element={<ImprintPage />} />
                  <Route path="/agb" element={<TermsPage />} />
                </Route>

                {/* ========================================
                    ADMIN BACKEND ROUTES (with AdminLayout)
                    ======================================== */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminProvider>
                        <AdminLayout />
                      </AdminProvider>
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* ========================================
                    STANDALONE ROUTES (no layout)
                    ======================================== */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/lp/schminktisch" element={<LandingPageSchminktisch />} />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </GlobalErrorBoundary>
          <CookieBanner />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
