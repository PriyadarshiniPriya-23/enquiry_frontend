import type { JSX } from "react";
import { Navigate } from "react-router";


export default function ProtectedRoute({ isAuthenticated, children }: { isAuthenticated: boolean; children: JSX.Element }) {
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}