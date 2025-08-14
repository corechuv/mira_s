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
