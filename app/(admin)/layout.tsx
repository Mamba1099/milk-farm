"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { DrawerNavigation } from "@/components/layout/drawer-navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <DrawerNavigation>{children}</DrawerNavigation>
    </ProtectedRoute>
  );
}
