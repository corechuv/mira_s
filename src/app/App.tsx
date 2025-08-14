import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
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

export default function App(){
  const routes: Route[] = [
    { path:"/", element:<Home/> },
    { path:"/catalog", element:<Catalog/> },
    { path:"/catalog/:lvl1", element:<Catalog/> },
    { path:"/catalog/:lvl1/:lvl2", element:<Catalog/> },
    { path:"/catalog/:lvl1/:lvl2/:lvl3", element:<Catalog/> },
    { path:"/product/:slug", element:<Product/> },
    { path:"/cart", element:<Cart/> },
    { path:"/checkout", element:<Checkout/> },
    { path:"/search", element:<Search/> },
    { path:"/wishlist", element:<Wishlist/> },
    { path:"/compare", element:<Compare/> },
    { path:"/account", element:<Account/> },
    { path:"/about", element:<div className="container"><h1>О нас</h1><p>Контент-заглушка.</p></div> },
    { path:"/*", element:<NotFound/> }
  ];
  return (
    <ThemeProvider>
      <SearchProvider>
        <WishlistProvider>
          <CompareProvider>
            <ViewedProvider>
              <CartProvider>
                <Header/>
                <main className="main"><Router routes={routes}/></main>
                <Footer/>
              </CartProvider>
            </ViewedProvider>
          </CompareProvider>
        </WishlistProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}
