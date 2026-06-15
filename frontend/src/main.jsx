import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ToastProvider } from "./components/ToastContext";
import { AuthProvider } from "./store/authStore";
import { CommerceProvider } from "./store/commerceStore";
import { ReviewProvider } from "./store/reviewStore";
import { UIProvider } from "./store/uiStore";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <UIProvider>
        <AuthProvider>
          <CommerceProvider>
            <ReviewProvider>
              <App />
            </ReviewProvider>
          </CommerceProvider>
        </AuthProvider>
      </UIProvider>
    </ToastProvider>
  </StrictMode>
);
