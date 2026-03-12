import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Plus, User, Circle } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isInstructor: boolean;
}

interface Conversation {
  id: string;
  studentName: string;
  studentInitials: string;
  lastMessage: string;
  lastTimestamp: Date;
  unread: number;
  online: boolean;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: "c1", studentName: "Sarah Johnson", studentInitials: "SJ",
    lastMessage: "I'm struggling with the GDPR module, can you help?",
    lastTimestamp: new Date(Date.now() - 1000 * 60 * 5), unread: 2, online: true,
    messages: [
      { id: "m1", senderId: "student", text: "Hi professor, I had a question about the SOC 2 module.", timestamp: new Date(Date.now() - 1000 * 60 * 60), isInstructor: false },
      { id: "m2", senderId: "instructor", text: "Of course, Sarah! What's your question?", timestamp: new Date(Date.now() - 1000 * 60 * 55), isInstructor: true },
      { id: "m3", senderId: "student", text: "I'm struggling with the GDPR module, can you help?", timestamp: new Date(Date.now() - 1000 * 60 * 5), isInstructor: false },
    ],
  },
  {
    id: "c2", studentName: "Mike Chen", studentInitials: "MC",
    lastMessage: "Thanks for the extra practice materials!",
    lastTimestamp: new Date(Date.now() - 1000 * 60 * 30), unread: 0, online: true,
    messages: [
      { id: "m4", senderId: "instructor", text: "Hi Mike, I noticed you scored below the mastery threshold on Data Classification. I've assigned some extra practice.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isInstructor: true },
      { id: "m5", senderId: "student", text: "Thanks for the extra practice materials!", timestamp: new Date(Date.now() - 1000 * 60 * 30), isInstructor: false },
    ],
  },
  {
    id: "c3", studentName: "Emily Davis", studentInitials: "ED",
    lastMessage: "When is the retake available?",
    lastTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), unread: 1, online: false,
    messages: [
      { id: "m6", senderId: "student", text: "I failed the phishing quiz. Can I retake it?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), isInstructor: false },
      { id: "m7", senderId: "instructor", text: "Yes, I've enabled a retake for you. Review the material first.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5), isInstructor: true },
      { id: "m8", senderId: "student", text: "When is the retake available?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isInstructor: false },
    ],
  },
  {
    id: "c4", studentName: "James Wilson", studentInitials: "JW",
    lastMessage: "Got it, will review before retaking.",
    lastTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), unread: 0, online: false,
    messages: [
      { id: "m9", senderId: "instructor", text: "James, your confidence self-report was very low on the Incident Response module. Would you like to schedule a 1-on-1?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), isInstructor: true },
      { id: "m10", senderId: "student", text: "Got it, will review before retaking.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), isInstructor: false },
    ],
  },
  {
    id: "c5", studentName: "Lisa Park", studentInitials: "LP",
    lastMessage: "Completed all modules with mastery!",
    lastTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), unread: 0, online: false,
    messages: [
      { id: "m11", senderId: "student", text: "Completed all modules with mastery!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isInstructor: false },
    ],
  },
];

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

const ChatPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string>("c1");
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find(c => c.id === selectedId);

  const filteredConversations = conversations.filter(c =>
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  const sendMessage = () => {
    if (!messageText.trim() || !selectedId) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: "instructor",
      text: messageText.trim(),
      timestamp: new Date(),
      isInstructor: true,
    };
    setConversations(prev => prev.map(c =>
      c.id === selectedId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, lastTimestamp: newMsg.timestamp }
        : c
    ));
    setMessageText("");

    // Simulate student reply after 2 seconds
    setTimeout(() => {
      const replies = [
        "Thank you for reaching out!",
        "I'll work on that right away.",
        "That makes sense, thanks for explaining.",
        "Can we discuss this further?",
        "Got it, I appreciate the help!",
      ];
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        senderId: "student",
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date(),
        isInstructor: false,
      };
      setConversations(prev => prev.map(c =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, reply], lastMessage: reply.text, lastTimestamp: reply.timestamp }
          : c
      ));
    }, 2000);
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <p className="text-muted-foreground text-sm mt-1">Message your learners directly</p>
        </div>
      </div>

      <Card className="h-[calc(100%-4rem)] flex overflow-hidden">
        {/* Conversations list */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-8 h-9"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredConversations.map(conv => (
              <button key={conv.id}
                className={`w-full text-left p-3 border-b transition-colors hover:bg-accent/50 ${selectedId === conv.id ? "bg-accent" : ""}`}
                onClick={() => { setSelectedId(conv.id); setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)); }}>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{conv.studentInitials}</AvatarFallback>
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
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">{conv.unread}</Badge>
                  )}
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Message thread */}
        {selected ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{selected.studentInitials}</AvatarFallback>
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
                    <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                      msg.isInstructor
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-accent text-accent-foreground rounded-bl-sm"
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

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input placeholder="Type a message..." className="flex-1"
                  value={messageText} onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage(); }} />
                <Button onClick={sendMessage} size="icon"><Send className="h-4 w-4" /></Button>
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
