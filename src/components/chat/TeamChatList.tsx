import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users } from "lucide-react";
import api from "@/lib/api";

interface Team {
  _id: string;
  name: string;
  description?: string;
  memberIds: string[];
}

export default function TeamChatList() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await api.get("/teams");
        setTeams(res.data || []);
      } catch (error) {
        console.error("Failed to load teams:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeams();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-96">
        <div className="text-lg">Loading teams...</div>
      </div>
    );
  }

  if (teams.length === 0) {
    return null;
  }

  const handleEnterChat = (teamId: string) => {
    navigate(`/chat/${teamId}`);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Chats</h1>
        <p className="text-muted-foreground">Select a team to enter their chat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {team.name}
              </CardTitle>
              {team.description && (
                <p className="text-sm text-muted-foreground">{team.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{team.memberIds.length} members</span>
                </div>
                <Button
                  onClick={() => handleEnterChat(team._id)}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                >
                  Enter Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
