// src/components/TeamChat.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { format } from "date-fns";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface Message {
  _id: string;
  content: string;
  senderId: { _id: string; name: string; email: string };
  timestamp: string;
}

export default function TeamChat() {
  const { user, teams } = useStore();
  const { teamId } = useParams<{ teamId: string }>();

  // ALL HOOKS MUST BE AT THE TOP — UNCONDITIONALLY
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current team
  const currentTeam = teams.find(t => t._id === teamId);

  // Check if user can send messages in this team
  const canSendMessages = () => {
    if (!user || !currentTeam) return false;
    if (user.role === "ADMIN" || user.role === "MANAGER") return true;
    return user.teamId === teamId;
  };

  // Socket setup effect
  useEffect(() => {
    const token = localStorage.getItem("firebaseToken");
    if (!token || !teamId) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", async () => {
      setIsConnected(true);
      setLoadingMessages(true);
      setError(null);
      // Fetch message history for specific team
      try {
        console.log(`Fetching messages for team: ${teamId}`);
        const res = await api.get(`/messages/team/${teamId}`);
        setMessages(res.data);
        console.log(`Loaded ${res.data.length} messages`);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setLoadingMessages(false);
      }
    });
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("newMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("error", (error: string) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [teamId]);

  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message function
  const sendMessage = useCallback(() => {
    
    if (!message.trim() || !socketRef.current  ) return;
 
    socketRef.current.emit("sendMessage", { content: message.trim(), teamId });
    setMessage("");
  }, [message, teamId, canSendMessages]);

  const isOwnMessage = (msg: Message) => msg.senderId._id === user?._id;

  // NOW safe to early return (after all hooks)
  if (!user || !user._id) {
    return (
      <>
        <button
          onClick={() => alert("Please log in to use team chat")}
          className="fixed bottom-6 right-6 z-50 bg-gray-400 text-white p-5 rounded-full shadow-2xl lg:hidden"
          aria-label="Chat (login required)"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </>
    );
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 lg:hidden flex items-center justify-center"
        aria-label="Open team chat"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Chat Drawer */}
      <div
        className={`fixed min-h-[80%] min-w-md inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto lg:shadow-none flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/20 p-2"
              aria-label="Back to team list"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="text-xl font-bold">{currentTeam?.name || "Team Chat"}</h3>
              <p className="text-sm opacity-90">Hello, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-yellow-400"} animate-pulse`}
              title={isConnected ? "Connected" : "Connecting..."}
            />
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white/80 hover:text-white text-3xl leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/20">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-destructive text-center">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground italic">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${isOwnMessage(msg) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl shadow-md ${
                    isOwnMessage(msg)
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {!isOwnMessage(msg) && (
                    <p className="text-xs font-bold text-primary mb-1">
                      {msg.senderId.name}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage(msg) ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {format(new Date(msg.timestamp), "HH:mm")}
                  </p>
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4 shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-5 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-800 placeholder-gray-500"
              autoFocus={isOpen}
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="p-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-full hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              aria-label="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}