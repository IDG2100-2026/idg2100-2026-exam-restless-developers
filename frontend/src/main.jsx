import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { applyTheme, getInitialTheme } from "./utils/theme.js";

const initialTheme = getInitialTheme();

applyTheme(initialTheme);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App initialTheme={initialTheme} />
  </StrictMode>,
);
