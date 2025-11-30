import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  userId: any;
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  teamId?: string;
};

export type Team = {
  _id: string;
  name: string;
  description?: string;
  adminId: string;
  memberIds: string[];
  createdAt: string;
};

export type Project = {
  _id: string;
  name: string;
  description?: string;
  teamId: string;
  createdAt?: string;
};

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  assignedTo?: string;
  createdAt?: string;
};

export type Message = {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
};

interface AppState {
  user: User | null;
  teams: Team[];
  teamMembers: User[];
  projects: Project[];
  tasks: Task[];
  currentTeam: Team | null;
  messages: Message[];

  // CORE ACTIONS
  setUser: (user: User | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
  setTeamMembers: (members: User[]) => void;
  setTeams: (teams: Team[]) => void;

  // PROJECT ACTIONS — THESE WERE MISSING!
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // TASK ACTIONS
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;

  // MESSAGE ACTIONS
  addMessage: (message: Message) => void;
  sendAssistantMessage: (input: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      teams: [],
      teamMembers: [],
      projects: [],
      tasks: [],
      currentTeam: null,
      messages: [],

      setUser: (user) => set({ user }),
      setCurrentTeam: (team) => set({ currentTeam: team }),
      setProjects: (projects) => set({ projects }),
      setTasks: (tasks) => set({ tasks }),
      setTeamMembers: (members) => set({ teamMembers: members }),
      setTeams: (teams) => set({ teams }),

      // FIXED: UPDATE PROJECT
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === id ? { ...p, ...updates } : p
          ),
        })),

      // FIXED: DELETE PROJECT + ALL ITS TASKS
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p._id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
        })),

      // TASK ACTIONS
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t._id === id ? { ...t, ...updates } : t
          ),
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t._id !== id),
        })),

      // MESSAGE ACTIONS
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      sendAssistantMessage: (input) => { 
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: `Assistant response to: ${input}`,
          senderId: "assistant",
          senderName: "Assistant",
          timestamp: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, assistantMessage],
        }));
      },

      loadTeams: async () => {
        try {
         
        } catch (error) {
          console.error("Failed to load teams:", error);
        }
      },
    }),
    {
      name: "teamflow-storage",
      partialize: (state) => ({
        user: state.user,
        currentTeam: state.currentTeam,
      }),
    }
  )
);
