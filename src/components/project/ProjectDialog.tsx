/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/project/ProjectDialog.tsx
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore"; 
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface Team {
  _id: string;
  name: string;
  memberIds: string[];
  description?: string;
}

export default function ProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false); // ← start false
  const [creating, setCreating] = useState(false);

  const { toast } = useToast();
  const { user, teamMembers } = useStore();

  // ONLY RUN ONCE when dialog opens
  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const res = await api.get("/teams");
        if (!isMounted) return;

        const data = res.data || [];
        setTeams(data);
        if (data.length > 0) {
          setSelectedTeamId(data[0]._id);
        }
      } catch (error: any) {
        if (!isMounted) return;
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load teams",
        });
      } finally {
        if (isMounted) setLoadingTeams(false);
      }
    };

    fetchTeams();
 
    return () => {
      isMounted = false;
    };
  }, [open]);  
 
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setSelectedMembers([]);
      setSelectedTeamId("");
      setTeams([]);
    }
  }, [open]);

  const hasTeams = teams.length > 0;

  const handleCreate = async () => {
    console.log("first");
    if (!name.trim()) {
      toast({ title: "Error", description: "Project name is required" });
      return;
    }

    setCreating(true);

    try {
      let finalTeamId = selectedTeamId;

      if (!hasTeams) {
        const teamName = `${name.trim()} Team`;
        const teamRes = await api.post("/teams", {
          name: teamName,
          description: `Auto-created for project: ${name.trim()}`,
          memberIds: selectedMembers,
        });
        finalTeamId = teamRes.data._id;
        toast({ title: "Team Created", description: teamName });
      }

      await api.post("/projects", {
        name: name.trim(),
        description: description.trim() || undefined,
        teamId: finalTeamId,
      });

      toast({ title: "Success", description: "Project created successfully!" });
      setOpen(false);  
    } catch (error: any) {
      toast({
        title: "Failed",
        description:
          error.response?.data?.message || "Could not create project",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="gap-2 font-medium flex justify-center items-center text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. E-commerce Redesign"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>

          {loadingTeams ? (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading teams...
            </div>
          ) : hasTeams ? (
            <div className="space-y-2">
              <Label>Select Team</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name} ({team.memberIds.length} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-600 font-medium">
                <Users className="w-5 h-5" />
                No team exists — select members
              </div>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-muted/40 space-y-3">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No users available
                  </p>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member._id} className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedMembers.includes(member._id)}
                        onCheckedChange={() => toggleMember(member._id)}
                      />
                      <label className="flex-1 text-sm font-medium cursor-pointer">
                        {member.name}
                        <span className="text-muted-foreground ml-2">
                          ({member.role})
                        </span>
                        {member._id === user?._id && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                A new team "<strong>{name || "Project"}</strong> Team" will be
                created.
              </p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="w-full"
          >
            {creating
              ? "Creating..."
              : hasTeams
              ? "Create Project"
              : "Create Project & Team"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
