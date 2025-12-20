import { createBrowserRouter, Navigate } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import PackageSubject from "./pages/PackageSubject";
import MainContent from "./components/MainContent";
import LoginPage from "./pages/LoginPage";

const isAuthenticated = true; // or false

function PublicPage() {

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  return <h1>Public Route - Anyone can access</h1>;
}


const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute isAuthenticated={isAuthenticated}>
      <MainContent>
        <Dashboard />
      </MainContent>
    </ProtectedRoute>,
  },
  {
    path: "/package-subject",
    element: <ProtectedRoute isAuthenticated={isAuthenticated}>
      <MainContent>
        <PackageSubject />
      </MainContent>
    </ProtectedRoute>,
  },
]);

export default router
