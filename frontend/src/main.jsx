// ==============================
// src/main.jsx
// ==============================
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../src/index.css"; // TailwindCSS compiled

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
