/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Project {
  _id: string;
  name: string;
  teamId: string | { _id: string; [key: string]: any };
}

interface User {
  _id: string;
  name: string;
  role: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  assignedTo?: string;
}

interface Props {
  task?: Task;
  trigger?: "add" | "edit";
  projectId?: string;  
}

export default function TaskDialog({
  task,
  trigger = "add",
  projectId: forcedProjectId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [projectId, setProjectId] = useState(
    task?.projectId || forcedProjectId || ""
  );
  const [assignedTo, setAssignedTo] = useState<string>(task?.assignedTo || "");

  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch all projects when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await api.get("/projects");
        setProjects(res.data || []);
      } catch {
        alert("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [open]);

  // Load team members whenever project changes
  useEffect(() => {
    if (!projectId) {
      setTeamMembers([]);
      setAssignedTo("");
      return;
    }

    const loadTeamMembers = async () => {
      try {
        const project = projects.find((p) => p._id === projectId);
        if (!project || !project.teamId) {
          setTeamMembers([]);
          return;
        }
 
        const rawTeamId = project.teamId;
        const teamId =
          typeof rawTeamId === "string"
            ? rawTeamId
            : typeof rawTeamId === "object" && rawTeamId?._id
            ? rawTeamId._id
            : null;

        if (!teamId) {
          setTeamMembers([]);
          return;
        }

        const [teamRes, usersRes] = await Promise.all([
          api.get(`/teams/${teamId}`),
          api.get("/users"),
        ]);

        const memberIds = teamRes.data.memberIds || [];
        const allUsers = usersRes.data || [];

        const members = allUsers.filter((u: any) => memberIds.includes(u._id));
        setTeamMembers(members);

        if (!assignedTo && members.length > 0) {
          setAssignedTo(members[0]._id);
        }
      } catch (err) {
        console.error("Failed to load team:", err);
        setTeamMembers([]);
      }
    };

    loadTeamMembers();
  }, [projectId, projects]);

  // Reset form when editing
  useEffect(() => {
    if (open && task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setProjectId(task.projectId);
      setAssignedTo(task.assignedTo || "");
    }
  }, [open, task]);

  const selectedProject = projects.find((p) => p._id === projectId);

  const handleSave = async () => {
    if (!title.trim()) return alert("Task title is required.");
    if (!projectId) return alert("Please select a project.");
    if (!assignedTo) return alert("Please assign to a team member.");

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        projectId,
        assignedTo,
      };

      if (trigger === "add") {
        await api.post("/tasks", { ...payload, status: "todo" });
        alert("Task created successfully!");
      } else if (task?._id) {
        await api.put(`/tasks/${task._id}`, payload);
        alert("Task updated successfully!");
      }

      setOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task?._id || !confirm("Delete this task permanently?")) return;

    setDeleting(true);
    try {
      await api.delete(`/tasks/${task._id}`);
      alert("Task deleted.");
      setOpen(false);
    } catch {
      alert("Failed to delete task.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger === "add" ? (
          <button className="text-white flex justify-center items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
        ) : (
          <button className="p-2">
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {trigger === "add" ? "Create New Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">
              Loading projects...
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>Task Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fix login bug"
                autoFocus
              />
            </div>

            {/* Project Selection */}
            {!forcedProjectId ? (
              <div className="space-y-2">
                <Label>Project *</Label>
                {projects.length === 0 ? (
                  <p className="text-sm text-destructive">
                    No projects available. Create one first.
                  </p>
                ) : (
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Project</Label>
                <p className="font-medium">
                  {selectedProject?.name || "Loading..."}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={4}
              />
            </div>

            {/* Assign To */}
            <div className="space-y-2">
              <Label>Assign To *</Label>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-amber-600">
                  {projectId
                    ? "No members in this project's team."
                    : "Select a project first."}
                </p>
              ) : (
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose team member" />
                  </SelectTrigger>
                  <SelectContent className="text-black">
                    {teamMembers.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        {member.name}{" "}
                        <span className="text-muted-foreground">
                          ({member.role})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="bg-black text-black hover:bg-gray-900 px-4 py-2 rounded-md flex-1"
                disabled={saving || !title.trim() || !projectId || !assignedTo}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : trigger === "add" ? (
                  "Create Task"
                ) : (
                  "Save Changes"
                )}
              </button>

              {trigger === "edit" && task && (
                <button
                  className="text-black"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
