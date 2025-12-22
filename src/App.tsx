import { createBrowserRouter, Navigate } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import PackageSubject from "./pages/PackageSubject";
import MainContent from "./components/MainContent";
import LoginPage from "./pages/LoginPage";
import Contact from "./pages/Contact";
import UserRoles from "./pages/UserRoles";
import Enquiry from "./pages/Enquiry";
import CandidateDetails from "./pages/CandidateDetails";

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
    path: "/create-enquiry",
    element: <ProtectedRoute isAuthenticated={isAuthenticated}>
      <MainContent>
        <Enquiry />
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
  {
    path: "/enquiries",
    element: <ProtectedRoute isAuthenticated={isAuthenticated}>
      <MainContent>
        <Contact />
      </MainContent>
    </ProtectedRoute>,
  },
  {
    path: "/contact-details/:id",
    element: <ProtectedRoute isAuthenticated={isAuthenticated}>
      <MainContent>
        <CandidateDetails />
      </MainContent>
    </ProtectedRoute>,
  },
  {
    path: "/user-roles",
    element: <ProtectedRoute isAuthenticated={isAuthenticated}>
      <MainContent>
        <UserRoles />
      </MainContent>
    </ProtectedRoute>,
  },
]);

export default router
