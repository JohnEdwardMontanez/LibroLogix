import { createBrowserRouter, Navigate } from "react-router";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import InventoryPage from "./pages/InventoryPage";
import SalesPage from "./pages/SalesPage";
import ProfilePage from "./pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: WelcomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/inventory",
    Component: InventoryPage,
  },
  {
    path: "/stock",
    element: <Navigate to="/inventory" replace />,
  },
  {
    path: "/sales",
    Component: SalesPage,
  },
  {
    path: "/profile",
    Component: ProfilePage,
  },
]);