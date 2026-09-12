import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';

import MainLayout from '../layout/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import { ProductGridSkeleton } from '../components/Skeletons.jsx';

// Pagina de start și catalogul sunt punctele obișnuite de intrare, deci intră
// în pachetul principal. Restul se încarcă la cerere: fără asta, un vizitator
// care doar se uită la produse descarcă și validarea formularului de plată.
const ShopPage = lazy(() => import('../pages/ShopPage.jsx'));
const ProductPage = lazy(() => import('../pages/ProductPage.jsx'));
const BrandPage = lazy(() => import('../pages/BrandPage.jsx'));
const CartPage = lazy(() => import('../pages/CartPage.jsx'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage.jsx'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage.jsx'));
const OrdersPage = lazy(() => import('../pages/OrdersPage.jsx'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage.jsx'));
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const SignupPage = lazy(() => import('../pages/SignupPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

/** /brand/Nordvik era o pagină separată; acum e catalogul filtrat. */
function BrandRedirect() {
  const { brandName } = useParams();
  return (
    <Navigate to={`/shop?brand=${encodeURIComponent(brandName)}`} replace />
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={6} />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/brands" element={<BrandPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Paginile de autentificare își aduc propriul cadru. */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Rute vechi, ca linkurile deja existente să nu ducă la 404. */}
        <Route path="/search" element={<Navigate to="/shop" replace />} />
        <Route path="/brand/:brandName" element={<BrandRedirect />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
