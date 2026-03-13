import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Circle } from "lucide-react";
import { members } from "@/data/members";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isInstructor: boolean;
}

interface Conversation {
  id: string;
  memberId: string;
  studentName: string;
  studentInitials: string;
  lastMessage: string;
  lastTimestamp: Date;
  unread: number;
  online: boolean;
  messages: Message[];
}

const sampleMessages = [
  "I'm struggling with this module, can you help?",
  "Thanks for the extra practice materials!",
  "When is the retake available?",
  "Got it, will review before retaking.",
  "Completed all modules with mastery!",
  "Can we discuss the quiz results?",
  "I need more time on this topic.",
  "The resources you sent were very helpful.",
];

function buildConversations(): Conversation[] {
  return members.slice(0, 20).map((m, i) => ({
    id: `c-${m.id}`,
    memberId: m.id,
    studentName: m.name,
    studentInitials: m.initials,
    lastMessage: sampleMessages[i % sampleMessages.length],
    lastTimestamp: new Date(Date.now() - 1000 * 60 * (5 + i * 30)),
    unread: i < 2 ? i + 1 : 0,
    online: i < 3,
    messages: [
      {
        id: `m-${m.id}-1`,
        senderId: "student",
        text: sampleMessages[i % sampleMessages.length],
        timestamp: new Date(Date.now() - 1000 * 60 * (5 + i * 30)),
        isInstructor: false,
      },
    ],
  }));
}

const formatTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const targetMemberId = searchParams.get("member");

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const convs = buildConversations();
    // If targeting a member not in default list, add them
    if (targetMemberId && !convs.find(c => c.memberId === targetMemberId)) {
      const member = members.find(m => m.id === targetMemberId);
      if (member) {
        convs.unshift({
          id: `c-${member.id}`,
          memberId: member.id,
          studentName: member.name,
          studentInitials: member.initials,
          lastMessage: "No messages yet",
          lastTimestamp: new Date(),
          unread: 0,
          online: false,
          messages: [],
        });
      }
    }
    return convs;
  });

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

  // Auto-focus input when navigating from Members page
  useEffect(() => {
    if (targetMemberId) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [targetMemberId]);

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

  // Public method to send mass messages (used by interventions)
  const sendMassMessage = (memberIds: string[], text: string) => {
    setConversations(prev => {
      let updated = [...prev];
      for (const memberId of memberIds) {
        let conv = updated.find(c => c.memberId === memberId);
        if (!conv) {
          const member = members.find(m => m.id === memberId);
          if (!member) continue;
          conv = {
            id: `c-${member.id}`,
            memberId: member.id,
            studentName: member.name,
            studentInitials: member.initials,
            lastMessage: "",
            lastTimestamp: new Date(),
            unread: 0,
            online: false,
            messages: [],
          };
          updated.push(conv);
        }
        const msg: Message = {
          id: `m${Date.now()}-${memberId}`,
          senderId: "instructor",
          text,
          timestamp: new Date(),
          isInstructor: true,
        };
        updated = updated.map(c =>
          c.memberId === memberId
            ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text, lastTimestamp: msg.timestamp }
            : c
        );
      }
      return updated;
    });
  };

  // Expose sendMassMessage globally for other components
  useEffect(() => {
    (window as any).__chatSendMassMessage = sendMassMessage;
    return () => { delete (window as any).__chatSendMassMessage; };
  });

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <p className="text-muted-foreground text-sm mt-1">Message your learners directly</p>
        </div>
      </div>

      <Card className="h-[calc(100%-5rem)] flex overflow-hidden">
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
                <Input ref={inputRef} placeholder="Type a message..." className="flex-1"
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
