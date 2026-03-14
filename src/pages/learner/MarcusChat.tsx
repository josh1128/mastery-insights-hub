import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { chatStore } from "@/data/chatStore";

const MARCUS_ID = "member-marcus";
const INSTRUCTOR_ID = "instructor-demo";

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "Now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function MarcusChat() {
  const [, setTick] = useState(0);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = chatStore.subscribe(() => setTick(t => t + 1));
    return () => { unsub(); };
  }, []);

  const conversations = chatStore.getConversations();
  const conversation = conversations.find(c => c.memberId === MARCUS_ID);
  const messages = conversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = () => {
    if (!messageText.trim()) return;
    const trimmed = messageText.trim();
    const ts = new Date().toISOString();
  
    // Directly push Marcus's message into his conversation
    const conversations = chatStore.getConversations();
    const conv = conversations.find(c => c.memberId === MARCUS_ID);
    if (!conv) return;
  
    conv.messages.push({
      id: `msg-${Date.now()}`,
      senderId: MARCUS_ID,
      recipientId: INSTRUCTOR_ID,
      text: trimmed,
      timestamp: ts,
      isInstructor: false,
    });
    conv.lastMessage = trimmed;
    conv.lastTimestamp = ts;
  
    setMessageText("");
    setTick(t => t + 1);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
        <p className="text-slate-500 text-sm">Chat with your instructor</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/60 shadow-sm rounded-xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white/80 backdrop-blur-md flex-shrink-0">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-xs">
              EL
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-slate-900">Elena (Instructor)</p>
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">• Active</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 bg-slate-50/20">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-8">
                No messages yet. Say hello to your instructor!
              </p>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${!msg.isInstructor ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2 text-sm shadow-sm rounded-2xl ${
                    !msg.isInstructor
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white border border-slate-200 text-slate-900 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                  <p className={`text-[10px] mt-1 ${!msg.isInstructor ? "text-indigo-200" : "text-slate-400"}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
          <div className="flex gap-2 bg-slate-50 border border-slate-200 p-1 rounded-full px-4 items-center">
            <Input
              ref={inputRef}
              placeholder="Message your instructor..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm h-10"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              size="icon"
              className="rounded-full h-8 w-8 bg-indigo-600 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}