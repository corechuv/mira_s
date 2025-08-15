import "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthDebug from "../pages/AuthDebug";
import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import Product from "../pages/Product";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Search from "../pages/Search";
import Wishlist from "../pages/Wishlist";
import Compare from "../pages/Compare";
import Account from "../pages/account/Account";
import NotFound from "../pages/NotFound";
import { Router } from "../router";
import type { Route } from "../router";
import { CartProvider, CompareProvider, SearchProvider, ThemeProvider, ViewedProvider, WishlistProvider } from "../store/store";
import AdminDashboard from "../admin/pages/Dashboard";
import AdminProducts from "../admin/pages/Products";
import AdminCatalog from "../admin/pages/Catalog";
import AdminReviews from "../admin/pages/Reviews";
import AdminUsers from "../admin/pages/Users";
import AdminSettings from "../admin/pages/Settings";

export default function App() {
  const routes: Route[] = [
    { path: "/", element: <Home /> },
    { path: "/catalog", element: <Catalog /> },
    { path: "/catalog/:lvl1", element: <Catalog /> },
    { path: "/catalog/:lvl1/:lvl2", element: <Catalog /> },
    { path: "/catalog/:lvl1/:lvl2/:lvl3", element: <Catalog /> },
    { path: "/product/:slug", element: <Product /> },
    { path: "/cart", element: <Cart /> },
    { path: "/checkout", element: <Checkout /> },
    { path: "/search", element: <Search /> },
    { path: "/wishlist", element: <Wishlist /> },
    { path: "/compare", element: <Compare /> },
    { path: "/account", element: <Account /> },
    { path: "/auth-debug", element: <AuthDebug /> },
    { path: "/about", element: <div className="container"><h1>О нас</h1><p>Контент-заглушка.</p></div> },
    { path: "/*", element: <NotFound /> },

    { path: "/admin", element: <AdminDashboard /> },
    { path: "/admin/products", element: <AdminProducts /> },
    { path: "/admin/catalog", element: <AdminCatalog /> },
    { path: "/admin/reviews", element: <AdminReviews /> },
    { path: "/admin/users", element: <AdminUsers /> },
    { path: "/admin/settings", element: <AdminSettings /> },

  ];
  return (
    <ThemeProvider>
      <SearchProvider>
        <WishlistProvider>
          <CompareProvider>
            <ViewedProvider>
              <CartProvider>
                <Header />
                <main className="main"><Router routes={routes} /></main>
                <Footer />
              </CartProvider>
            </ViewedProvider>
          </CompareProvider>
        </WishlistProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}
