/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  GripVertical,
  Users,
  Crown,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Separator } from "@radix-ui/react-select";
import TaskDialog from "../Tasks/TaskDialog";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  assignedTo?: string;
}
interface User {
  _id: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
}
 
function SortableTaskCard({ task, members }: { task: Task; members: User[] }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const member = members.find((m) => m._id === task.assignedTo);
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={`relative transition-all cursor-pointer ${
          isDragging
            ? "opacity-70 rotate-3 shadow-2xl scale-105"
            : "hover:shadow-lg"
        }`}
      >
        <CardContent className="pt-5 pb-4">
          <div
            {...listeners}
            className="absolute bottom-2 right-2 cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 transition"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <h4 className="font-semibold pr-8">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {task.description}
            </p>
          )}
          {member && (
            <div className="flex items-center gap-2 mt-4">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {member.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{member.name}</span>
              {member.role === "MANAGER" && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Droppable + Sortable Column
function KanbanColumn({
  id,
  title,
  tasks,
  members,
}: {
  id: "todo" | "in-progress" | "done";
  title: string;
  tasks: Task[];
  members: User[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const taskIds = tasks.map((t) => t._id);

  return (
    <div className="bg-muted/30 rounded-2xl p-6 border-2 border-border min-h-96 flex flex-col">
      <h3 className="font-bold text-lg mb-6">
        {title}{" "}
        <Badge variant="secondary" className="ml-2">
          {tasks.length}
        </Badge>
      </h3>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-4 min-h-96 transition-colors ${
            isOver ? "bg-muted/60 ring-2 ring-primary" : ""
          }`}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} members={members} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor)
  );
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [projRes, tasksRes, usersRes, currentUserRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get("/tasks"),
          api.get("/users"),
          api.get("/auth/me"),
        ]);

        setProject(projRes.data);
        setName(projRes.data.name);
        setDescription(projRes.data.description || "");

        const projectTasks = tasksRes.data.filter(
          (t: Task) => t.projectId === id
        );
        setTasks(projectTasks);

        const teamRes = await api.get(`/teams/${projRes.data.teamId}`);
        const memberIds = teamRes.data.memberIds || [];
        const members = usersRes.data.filter((u: User) =>
          memberIds.includes(u._id)
        );
        setTeamMembers(members);
        setUser(currentUserRes.data);
      } catch (err) {
        alert("Failed to load project");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]); 

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const overId = over.id as string;

    // Determine target status
    let targetStatus: Task["status"] = task.status;

    if (overId === "todo" || overId === "in-progress" || overId === "done") {
      targetStatus = overId as Task["status"];
    } else {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    // If status changed → update backend
    if (task.status !== targetStatus) {
      try {
        await api.put(`/tasks/${taskId}`, { status: targetStatus });
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId ? { ...t, status: targetStatus } : t
          )
        );
      } catch {
        alert("Failed to update task status");
      }
      return;
    }

    // Same column → reorder only (no API call needed)
    const columnTasks = tasks.filter((t) => t.status === targetStatus);
    const oldIndex = columnTasks.findIndex((t) => t._id === taskId);
    const newIndex = columnTasks.findIndex((t) => t._id === overId);

    if (oldIndex !== newIndex) {
      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      setTasks((prev) => {
        const others = prev.filter((t) => t.status !== targetStatus);
        return [...others, ...reordered];
      });
    }
  };

  const handleUpdateProject = async () => {
    try {
      await api.put(`/projects/${id}`, {
        name: name.trim(),
        description: description.trim() || null,
      });
      setProject((prev: any) => ({
        ...prev,
        name: name.trim(),
        description: description.trim() || undefined,
      }));
      setEditMode(false);
    } catch {
      alert("Update failed");
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate("/");
    } catch {
      alert("Delete failed");
    }
  };

  if (loading)
    return (
      <div className="flex-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  if (!project)
    return <div className="text-center py-20 text-2xl">Not found</div>;

  const manager = teamMembers.find((m) => m.role === "MANAGER");
  const members = teamMembers.filter((m) => m.role === "MEMBER");

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const draggingTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  return (
    <div className="container mx-auto p-6 space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {editMode ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-3xl font-bold max-w-lg"
              autoFocus
            />
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold">{project.name}</h1>
          )}
        </div>

        <div className="flex gap-3">
          {editMode ? (
            <>
              <Button onClick={handleUpdateProject}>Save</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              {/* Only ADMIN or MANAGER can edit/delete project */}
              {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  <Pencil className="w-4 h-4 mr-2" /> Edit Project
                </Button>
              )}

              {/* Only ADMIN or MANAGER can delete project */}
              {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                <Button variant="destructive" onClick={handleDeleteProject}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Project
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {editMode && (
        <div className="max-w-2xl">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="mb-4"
          />
        </div>
      )}

      {!editMode && project.description && (
        <p className="text-lg text-muted-foreground max-w-4xl">
          {project.description}
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Team ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {manager && (
              <>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar>
                    <AvatarFallback>{manager.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {manager.name}{" "}
                      <Crown className="w-4 h-4 text-yellow-500" />
                    </p>
                    <Badge>Manager</Badge>
                  </div>
                </div>
                <Separator />
              </>
            )}
            {members.map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{m.name[0]}</AvatarFallback>
                </Avatar>
                <span>{m.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <div className="flex justify-between mb-8">
            <h2 className="text-2xl font-bold">Task Board</h2>
            <TaskDialog trigger="add" projectId={id} />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KanbanColumn
                id="todo"
                title="To Do"
                tasks={columns.todo}
                members={teamMembers}
              />
              <KanbanColumn
                id="in-progress"
                title="In Progress"
                tasks={columns["in-progress"]}
                members={teamMembers}
              />
              <KanbanColumn
                id="done"
                title="Done"
                tasks={columns.done}
                members={teamMembers}
              />
            </div>

            <DragOverlay>
              {draggingTask && (
                <Card className="rotate-5 shadow-2xl cursor-grabbing">
                  <CardContent className="pt-5">
                    <h4 className="font-semibold text-lg">
                      {draggingTask.title}
                    </h4>
                    {draggingTask.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {draggingTask.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
