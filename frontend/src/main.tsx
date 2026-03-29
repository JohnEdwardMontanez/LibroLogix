// main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // 1. Add this import
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter> {/* 2. Wrap App here */}
    <App />
  </BrowserRouter>
);