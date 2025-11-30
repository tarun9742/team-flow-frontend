 import {
  Home,
  // KanbanSquare,
  MessageSquare,
  // Bot,
  Users,
  LogOut,
} from "lucide-react";
import { useStore } from "@/store/useStore"; 
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  // { icon: KanbanSquare, label: "Kanban", path: "/kanban" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  // { icon: Bot, label: "Assistant", path: "/assistant" },
  { icon: Users, label: "Team", path: "/team" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Team
        </h1>
        <ThemeToggle />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
 
          if (item.path === "/team" && user?.role !== "ADMIN") return null;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-white text-left
                ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground  "
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
            {user?.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>
        </div>

        <button 
          className="flex gap-4 w-full justify-start items-center text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            localStorage.clear();
            setUser(null);
            navigate("/login");
          }}
        >
          <LogOut className="w-4 h-4  " />
          Logout
        </button>
      </div>
    </div>
  );
}
