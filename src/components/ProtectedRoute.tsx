// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { type User } from "@supabase/supabase-js";

type ProtectedRouteProps = {
  user: User | null; // tu peux remplacer `any` par ton type Supabase User
};

export default function ProtectedRoute({ user }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
