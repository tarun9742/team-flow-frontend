// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  adminId: string;
  memberIds: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  teamId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  assignedTo?: User;
  order?: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
}
