/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */ 
import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/store/useStore"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Loader2,
  Users,
  Trash2,
  Edit2,
  Crown,
  User as UserIcon,
} from "lucide-react";
import AddMemberDialog from "./AddMemberDialog";
import api from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
}

interface Team {
  _id: string;
  name: string;
  description?: string;
  managerId?: string;
  memberIds: string[];
}

export default function TeamBoard() {
  const { user } = useStore();
  const { toast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Team
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Edit Team
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editManagerId, setEditManagerId] = useState("");
  const [editMembers, setEditMembers] = useState<string[]>([]);

  // Edit User


  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [teamRes, userRes] = await Promise.all([
        api.get("/teams"),
        api.get("/users"),
      ]);
      setTeams(teamRes.data || []);
      setUsers(userRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchData();
  }, [user, fetchData]);

  const createTeam = async () => {
    if (!newName.trim()) {
      toast({ title: "Error", description: "Team name required" });
      return;
    }
    try {
      await api.post("/teams", {
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });
      toast({ title: "Success", description: "Team created!" });
      setOpenCreate(false);
      setNewName("");
      setNewDesc("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.response?.data?.message || "Could not create team",
      });
    }
  };

  const updateTeam = async () => {
    if (!selectedTeam) return;
    try {
      await api.put(`/teams/${selectedTeam._id}`, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        managerId: editManagerId === "none" ? null : editManagerId,
        memberIds: editMembers,
      });
      toast({ title: "Success", description: "Team updated!" });
      setSelectedTeam(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Update failed",
      });
    }
  };

  const deleteTeam = async (id: string) => {
    if (!confirm("Delete team permanently?")) return;
    try {
      await api.delete(`/teams/${id}`);
      toast({ title: "Deleted", description: "Team removed" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Delete failed" });
    }
  };

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    setEditName(team.name);
    setEditDesc(team.description || "");
    setEditManagerId(team.managerId || "none");
    setEditMembers(team.memberIds);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user permanently? This cannot be undone."))
      return;

    try {
      await api.delete(`/users/${userId}`);
      toast({ title: "Success", description: "User deleted" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.response?.data?.message || "Cannot delete user", 
      });
    }
  };



  if (user?.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-lg text-muted-foreground">
        Only Admins can manage teams and users.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const managers = users.filter((u) => u.role === "MANAGER");
  const members = users.filter((u) => u.role === "MEMBER");
  const getUserById = (id?: string) => users.find((u) => u._id === id);

  return (
    <div className="p-8 space-y-16">
      {/* Teams Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Teams</h1>
            <p className="text-muted-foreground">Create and manage teams</p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
              <button className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 mr-2" /> New Team
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Team Name *</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Design Team"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div>
                  <button onClick={createTeam} className="w-full">
                    Create Team
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => {
            const manager = getUserById(team.managerId);
            return (
              <Card
                key={team._id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openEditDialog(team)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{team.name}</CardTitle>
                      {team.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(team);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTeam(team._id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {manager && (
                    <Badge variant="secondary" className="mb-2">
                      Manager: {manager.name}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>
                      {team.memberIds.length} member
                      {team.memberIds.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Edit Team Dialog */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-6 py-4">
              <div>
                <Label>Team Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label>Team Manager (optional)</Label>
                <Select value={editManagerId} onValueChange={setEditManagerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="No manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none"  >No Manager</SelectItem>
                    {managers.map((m) => (
                      <SelectItem className="text-black" key={m._id} value={m._id}>
                        {m.name} ({m.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Team Members</Label>
                <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                  {members.map((m) => (
                    <div key={m._id} className="flex items-center gap-3">
                      <Checkbox
                        checked={editMembers.includes(m._id)}
                        onCheckedChange={(c) =>
                          setEditMembers((prev) =>
                            c
                              ? [...prev, m._id]
                              : prev.filter((id) => id !== m._id)
                          )
                        }
                      />
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{m.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="gap-3 flex">
                <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors" onClick={() => setSelectedTeam(null)}>
                  Cancel
                </button>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors" onClick={updateTeam}>Save Changes</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Users Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">All Users</h2>
          <AddMemberDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users
            .filter((u) => u.role !== "ADMIN")
            .map((u) => (
              <Card key={u._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={u.role === "MANAGER" ? "default" : "secondary"}
                    >
                      {u.role === "MANAGER" ? (
                        <Crown className="w-3 h-3 mr-1" />
                      ) : (
                        <UserIcon className="w-3 h-3 mr-1" />
                      )}
                      {u.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                  {/* <Select
                    value={u.role}
                    onValueChange={(val) =>
                      updateUserRole(u._id, val as "MANAGER" | "MEMBER")
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                    </SelectContent>
                  </Select> */}
                  <button
                    className="text-destructive p-2"
                    onClick={() => deleteUser(u._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </div>
  );
}
