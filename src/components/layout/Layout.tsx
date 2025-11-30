import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-muted/20 p-6">
          <Outlet />  
        </main>
      </div>

      <Toaster />
    </div>
  );
}