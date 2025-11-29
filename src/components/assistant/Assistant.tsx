import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send } from "lucide-react";

export default function Assistant() {
  const { sendAssistantMessage, addMessage, user } = useStore();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Show user message
    addMessage({
      id: Date.now().toString(),
      content: input,
      senderId: user!._id,
      senderName: user!.name,
      timestamp: new Date(),
    });

    // Process assistant reply
    sendAssistantMessage(input);
    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Team Assistant</h1>
        <p className="text-muted-foreground mt-2">
          I can create tasks, assign them, move tasks, or show project status
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">Try saying:</p>
          <code className="block bg-muted px-3 py-2 rounded">
            Create task Deploy frontend
          </code>
          <code className="block bg-muted px-3 py-2 rounded">
            Move "Design Homepage" to done
          </code>
          <code className="block bg-muted px-3 py-2 rounded">
            Show project status
          </code>
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to create or manage tasks..."
          className="min-h-32"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button onClick={handleSend} className="w-full p-3">
          <Send className="w-4 h-4 mr-2" />
          Send to Assistant
        </button>
      </div>
    </div>
  );
}
