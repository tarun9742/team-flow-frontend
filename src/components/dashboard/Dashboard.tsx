// src/components/dashboard/Dashboard.tsx
import { useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProjectDialog from "@/components/project/ProjectDialog"; 
import { Users, FolderOpen, CheckSquare, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import TaskDialog from "../Tasks/TaskDialog";

export default function Dashboard() {
  const { user, projects, tasks, teamMembers, setProjects, setTasks, setTeamMembers } = useStore();
  const navigate = useNavigate();

  // LIVE DATA FETCHING — Real-time updates
  useEffect(() => { 
    const fetchLiveData = async () => {
      try {
        const [projRes, taskRes, memberRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
          api.get("/users"),
        ]);

        setProjects(projRes.data || []);
        setTasks(taskRes.data || []);
        setTeamMembers(memberRes.data || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };

    fetchLiveData();
    // Optional: Poll every 30 seconds for real-time feel
    const interval = setInterval(fetchLiveData, 30_000);
    return () => clearInterval(interval);
  }, [setProjects, setTasks, setTeamMembers]);

  // LIVE COMPUTED STATS (re-calculates instantly)
  const stats = useMemo(() => {
    const myTasks = tasks.filter(t => t.assignedTo === user?._id);
    const completed = tasks.filter(t => t.status === "done");
    
    return {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      myTasks: myTasks.length,
      completedTasks: completed.length,
      myPendingTasks: myTasks.filter(t => t.status !== "done").length,
    };
  }, [projects, tasks, user?._id]);

  // LIVE PROJECT TASK COUNTS
  const projectsWithStats = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project._id);
      const done = projectTasks.filter(t => t.status === "done").length;
      return { ...project, taskCount: projectTasks.length, doneCount: done };
    });
  }, [projects, tasks]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {user.role === "ADMIN" && "You're in full control — manage everything"}
            {user.role === "MANAGER" && "Lead your team to success"}
            {user.role === "MEMBER" && `You have ${stats.myPendingTasks} tasks pending`}
          </p>
        </div>

        <div className="flex gap-3">
          {(user.role === "ADMIN" || user.role === "MANAGER") && <ProjectDialog />}
          <TaskDialog trigger="add" />
        </div>
      </div>

      {/* LIVE STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Across all teams</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            <Badge variant={stats.myPendingTasks > 0 ? "destructive" : "default"}>
              {stats.myPendingTasks} pending
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.myTasks}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Done this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LIVE PROJECTS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Active Projects
              </span>
              <Badge variant="outline">{projects.length} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectsWithStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No projects yet. Create your first one!</p>
              </div>
            ) : (
              projectsWithStats.map((project) => (
                <Card
                  key={project._id}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary/50 bg-card"
                  onClick={() => navigate(`/project/${project._id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">{project.taskCount} tasks</span>
                        <span className="text-green-600 font-medium">
                          {project.doneCount} completed
                        </span>
                      </div>
                      {project.taskCount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {Math.round((project.doneCount / project.taskCount) * 100)}% done
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* LIVE TEAM OVERVIEW */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </span>
              <Badge>{teamMembers.length} online</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No team members</p>
            ) : (
              <>
                {teamMembers.slice(0, 6).map((member) => (
                  <div key={member._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-all">
                    <Avatar className="h-11 w-11 ring-2 ring-background">
                      <AvatarFallback className="font-semibold">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <Badge variant={member.role === "ADMIN" ? "destructive" : "secondary"}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
                {teamMembers.length > 6 && (
                  <p className="text-center text-sm text-muted-foreground pt-4">
                    +{teamMembers.length - 6} more team members
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}