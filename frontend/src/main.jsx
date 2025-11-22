// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { UIProvider } from "./context/UIContext.jsx";

// Tailwind / global css (already present)
import "./index.css";

// Optional: enable web vitals / performance logging here if desired

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Order: Auth first so other providers/components can read auth synchronously */}
    <AuthProvider>
      <ThemeProvider>
        <UIProvider>
          {/* Router should be inside providers so routes/components can use contexts */}
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UIProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
