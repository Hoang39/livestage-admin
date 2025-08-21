import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@libs/i18n/config.ts";

import "@styles/index.css";
import App from "@app/App.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);
