/**
 * Point d'entree FubaMaps.
 * Configure les providers (Auth, Commerce, Review, UI).
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "./store/authStore";
import { CommerceProvider } from "./store/commerceStore";
import { ReviewProvider } from "./store/reviewStore";
import { UIProvider } from "./store/uiStore";

import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <UIProvider>
        <CommerceProvider>
          <ReviewProvider>
            <App />
          </ReviewProvider>
        </CommerceProvider>
      </UIProvider>
    </AuthProvider>
  </StrictMode>
);
