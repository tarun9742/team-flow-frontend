/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/kanban/KanbanBoard.tsx
import { useStore } from "@/store/useStore";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TaskDialog from "../Tasks/TaskDialog";
import { GripVertical } from "lucide-react";

const COLUMNS = {
  todo: { title: "To Do", color: "bg-gray-500" },
  "in-progress": { title: "In Progress", color: "bg-blue-500" },
  done: { title: "Done", color: "bg-green-500" },
} as const;

type ColumnKey = keyof typeof COLUMNS;

// Helper: Get user from ID
const getMemberById = (userId?: string) => {
  if (!userId) return null;
  const teamMembers = useStore.getState().teamMembers;
  return teamMembers.find(m => m._id === userId) ?? null;
};

export default function KanbanBoard() {
  const { tasks, updateTask } = useStore();

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === result.source.droppableId &&
      destination.index === result.source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ColumnKey;
    if (!COLUMNS[newStatus]) return;

    updateTask(draggableId, { status: newStatus });
  };

  const getTasksByStatus = (status: ColumnKey) =>
    tasks.filter((t) => t.status === status);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(COLUMNS).map(([status, { title, color }]) => {
          const columnTasks = getTasksByStatus(status as ColumnKey);

          return (
            <div key={status} className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${color}`} />
                  {title}
                </h3>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-96 flex-1 space-y-4 rounded-xl bg-muted/40 p-4 transition-all ${
                      snapshot.isDraggingOver
                        ? "bg-primary/10 ring-2 ring-primary/50"
                        : ""
                    }`}
                  >
                    {columnTasks.map((task, index) => {
                      const assignedMember = getMemberById(task.assignedTo);

                      return (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative group transition-all ${
                                snapshot.isDragging
                                  ? "shadow-2xl rotate-3 scale-105"
                                  : "hover:shadow-lg"
                              }`}
                            >
                              <CardContent className="pt-5 pb-4">
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-2 right-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>

                                {/* Edit Button */}
                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <TaskDialog task={task} trigger="edit" />
                                </div>

                                <h4 className="font-semibold text-base pr-8">
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                {assignedMember && (
                                  <div className="flex items-center gap-2 mt-4">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium">
                                        {assignedMember.name[0].toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {assignedMember.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {assignedMember.role}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    {columnTasks.length === 0 && (
                      <div className="text-center text-muted-foreground py-16 border-2 border-dashed border-muted rounded-xl">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}