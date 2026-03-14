import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { chatStore, Conversation } from "@/data/chatStore";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'Now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const targetMemberId = searchParams.get("member");
  const [conversations, setConversations] = useState<Conversation[]>(() => chatStore.getConversations());
  const [selectedId, setSelectedId] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = conversations.find(c => c.id === selectedId);
  const filteredConversations = conversations.filter(c =>
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (targetMemberId) {
      const conv = conversations.find(c => c.memberId === targetMemberId);
      if (conv) setSelectedId(conv.id);
    } else if (conversations.length > 0 && !selectedId) {
      setSelectedId(conversations[0].id);
    }
  }, [targetMemberId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  const sendMessage = () => {
    if (!messageText.trim() || !selectedId) return;
    setMessageText("");
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in w-full max-w-full overflow-hidden">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
        <p className="text-slate-500 text-sm">Direct communication with your learners</p>
      </div>

      {/* FIXED: Added w-full and overflow-hidden here */}
      <Card className="flex-1 flex w-full overflow-hidden border-slate-200/60 shadow-sm rounded-xl relative">
        <ChatSidebar 
          conversations={filteredConversations}
          selectedId={selectedId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectConversation={setSelectedId}
          formatTime={formatTime}
        />

        {/* Main Chat Window: Added min-w-0 to prevent it from pushing the sidebar */}
        {selected ? (
          <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white/80 backdrop-blur-md z-10 flex-shrink-0">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-xs">
                  {selected.studentInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{selected.studentName}</p>
                <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">
                  {selected.online ? "• Active" : ""}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/20">
              <div className="space-y-4 max-w-3xl mx-auto">
                {selected.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isInstructor ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${msg.isInstructor ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none" : "bg-white border border-slate-200 text-slate-900 rounded-2xl rounded-tl-none"} px-4 py-2 text-sm shadow-sm`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
              <div className="flex gap-2 bg-slate-50 border border-slate-200 p-1 rounded-full px-4 items-center">
                <Input 
                  ref={inputRef}
                  placeholder="Message..." 
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm h-10"
                  value={messageText} 
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()} 
                />
                <Button onClick={sendMessage} size="icon" className="rounded-full h-8 w-8 bg-indigo-600 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50 text-slate-400">
            Select a learner to start chatting
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatPage;