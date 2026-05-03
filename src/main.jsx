import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./styles/globals.css";

import { AuthProvider } from "./context/AuthContext";
import InspiraDialog from "./components/ui/InspiraDialog";

import { BrowserRouter } from "react-router-dom";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <InspiraDialog />
    </BrowserRouter>
  </StrictMode>
);
