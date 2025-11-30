import { useState } from "react";
import { useStore } from "@/store/useStore"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast"; 

export default function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"MANAGER" | "MEMBER">("MEMBER");

  const { toast } = useToast();

  const user = useStore((state) => state.user);

  if (user?.role !== "ADMIN") return null;

  const handleAdd = async () => {
    if (!name || !email || !password) {
      toast({ title: "Error", description: "All fields required" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/create-user", { name, email, password, role });
      toast({ title: "Success", description: `${name} added as ${role}` });
      setName(""); setEmail(""); setPassword(""); setRole("MEMBER");
      setOpen(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Error creating user";
      toast({ title: "Failed", description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button  className="text-white flex justify-center items-center">
          <Plus className="w-4 h-4 mr-2" /> Add New User
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@company.com" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as "MANAGER" | "MEMBER")} disabled={loading}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button onClick={handleAdd} className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create User"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}