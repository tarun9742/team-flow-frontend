import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./store/useStore";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import KanbanBoard from "./components/kanban/KanbanBoard";
import TeamChat from "./components/chat/TeamChat";
import TeamChatList from "./components/chat/TeamChatList";
import Assistant from "./components/assistant/Assistant";
import ProjectDetail from "./components/project/ProjectDetail";
import { Toaster } from "./components/ui/toaster";
import DashboardLayout from "./components/layout/Layout";
import TeamBoard from "./components/Team/TeamBoard";

function App() {
  const user = useStore((s) => s.user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

        <Route element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/chat" element={<TeamChatList />} />
          <Route path="/chat/:teamId" element={<TeamChat />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/team" element={<TeamBoard />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
        </Route>
      </Routes>

      <Toaster />
    </BrowserRouter>
  );
}

export default App;