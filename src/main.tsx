import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

import { AuthProvider } from "./store/auth";
import {
  ThemeProvider,
  CartProvider,
  WishlistProvider,
  CompareProvider,
  ViewedProvider,
  SearchProvider
} from "./store/store";

(function enforceHashRouting(){
  const path = location.pathname + (location.search || "");
  const hash = location.hash.replace(/^#/,''); // без '#', может быть "/" или "/admin"
  if (location.pathname !== "/") {
    // если сейчас "/admin#/" — переносим path в hash → "/#/admin"
    const target = (hash && hash !== "/") ? hash : path;
    history.replaceState({}, "", location.origin + "/#" + target);
  } else if (!location.hash) {
    // если пустой — ставим главную
    location.hash = "/";
  }
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <ViewedProvider>
            <CartProvider>
              <WishlistProvider>
                <CompareProvider>
                  <App />
                </CompareProvider>
              </WishlistProvider>
            </CartProvider>
          </ViewedProvider>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
