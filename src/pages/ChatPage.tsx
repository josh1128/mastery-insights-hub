import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Circle } from "lucide-react";
import { chatStore, Conversation } from "@/data/chatStore";

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const targetMemberId = searchParams.get("member");

  const [conversations, setConversations] = useState<Conversation[]>(() => chatStore.getConversations());

  const [selectedId, setSelectedId] = useState<string>(() => {
    if (targetMemberId) {
      const conv = conversations.find(c => c.memberId === targetMemberId);
      if (conv) return conv.id;
    }
    return conversations[0]?.id || "";
  });

  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = conversations.find(c => c.id === selectedId);
  const filteredConversations = conversations.filter(c =>
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  useEffect(() => {
    const unsub = chatStore.subscribe(() => {
      setConversations(chatStore.getConversations());
    });
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (targetMemberId) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [targetMemberId]);

  const sendMessage = () => {
    if (!messageText.trim() || !selectedId) return;
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <p className="text-muted-foreground text-sm mt-1">Message your learners directly</p>
        </div>
      </div>

      <Card className="h-[calc(100%-5rem)] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border/30 flex flex-col bg-card/50">
          <div className="p-3 border-b border-border/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-8 h-9 rounded-full bg-muted/40 border-0"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredConversations.map(conv => (
              <button key={conv.id}
                className={`w-full text-left p-3 border-b border-border/20 transition-colors hover:bg-slate-50 ${selectedId === conv.id ? "bg-indigo-50" : ""}`}
                onClick={() => { setSelectedId(conv.id); setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)); }}>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary/15 to-primary-glow/15 text-primary">{conv.studentInitials}</AvatarFallback>
                    </Avatar>
                    {conv.online && <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-success text-success" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{conv.studentName}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTime(conv.lastTimestamp)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full shadow-glow">{conv.unread}</Badge>
                  )}
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat area */}
        {selected ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border/30 flex items-center gap-3 bg-card/40 backdrop-blur-sm">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/15 to-primary-glow/15 text-primary">{selected.studentInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{selected.studentName}</p>
                <p className="text-xs text-muted-foreground">{selected.online ? "Online" : "Offline"}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selected.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isInstructor ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.isInstructor
                        ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-br-md shadow-glow"
                        : "bg-accent/60 text-accent-foreground rounded-bl-md backdrop-blur-sm"
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.isInstructor ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-border/30 bg-card/40 backdrop-blur-sm">
              <div className="flex gap-2">
                <Input ref={inputRef} placeholder="Type a message..." className="flex-1 rounded-full bg-muted/40 border-0"
                  value={messageText} onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage(); }} />
                <Button onClick={sendMessage} size="icon" className="rounded-full shadow-glow"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a conversation to start messaging
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatPage;
