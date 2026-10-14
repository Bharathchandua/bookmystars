import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

import App from "./App.jsx";

/* ── Favicon: loaded from src/assets so Vite hashes it (no cache issues) ── */
import faviconSrc from "./assets/favicon.png";
(function setFavicon() {
  ["icon", "apple-touch-icon"].forEach((rel, i) => {
    const link = document.createElement("link");
    link.rel = rel;
    link.type = "image/png";
    if (i === 0) link.sizes = "32x32";
    if (i === 1) link.sizes = "180x180";
    link.href = faviconSrc;
    document.head.appendChild(link);
  });
})();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);