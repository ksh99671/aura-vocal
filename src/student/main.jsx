import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./student.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
