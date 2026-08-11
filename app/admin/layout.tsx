import type { ReactNode } from "react";
import "./admin.css";
import AdminToolNav from "./AdminToolNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root">
      <AdminToolNav />
      {children}
    </div>
  );
}
