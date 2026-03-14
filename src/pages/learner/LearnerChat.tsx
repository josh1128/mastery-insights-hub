import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { chatStore, Conversation } from "@/data/chatStore";
import { members } from "@/data/members";
import { courses } from "@/data/courses";
import { motion } from "framer-motion";

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "Now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const MARCUS_ID = "member-marcus";

const LearnerChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    chatStore.getConversations(),
  );
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Determine Marcus' active course(s)
  const marcusBaseline = members.find((m) => m.id === MARCUS_ID);
  const primaryCourseId = marcusBaseline?.enrolledCourseIds[0] ?? courses[0]?.id;

  // Filter classmates: same courseId as Marcus, excluding Marcus himself
  const classmatesInCourse = members.filter(
    (m) =>
      m.id !== MARCUS_ID &&
      m.role === "learner" &&
      m.enrolledCourseIds.includes(primaryCourseId),
  );

  // Synthetic instructor contacts
  const instructorContacts = [
    { id: "instructor-josh", name: "Josh (Instructor)", initials: "J" },
    { id: "instructor-elena", name: "Elena (Instructor)", initials: "E" },
  ];

  useEffect(() => {
    const unsub = chatStore.subscribe(() => {
      setConversations([...chatStore.getConversations()]);
    });
    return () => {
      unsub();
    };
  }, []);

  const ensureConversation = (memberId: string, displayName: string, initials: string) => {
    const existing = conversations.find((c) => c.memberId === memberId);
    if (existing) return existing;
    const synthetic: Conversation = {
      id: `c-${memberId}`,
      memberId,
      studentName: displayName,
      studentInitials: initials,
      lastMessage: "Start a new conversation",
      lastTimestamp: new Date().toISOString(),
      unread: 0,
      online: false,
      messages: [],
    };
    const next = [synthetic, ...conversations];
    setConversations(next);
    return synthetic;
  };

  // Build learner-facing list: instructors pinned first, then classmates (same course)
  const learnerConversations: Conversation[] = (() => {
    const baseMap = new Map<string, Conversation>();
    conversations.forEach((c) => baseMap.set(c.memberId, c));

    const instructorConvs = instructorContacts.map((inst) => {
      const existing = baseMap.get(inst.id);
      return (
        existing ??
        ({
          id: `c-${inst.id}`,
          memberId: inst.id,
          studentName: inst.name,
          studentInitials: inst.initials,
          lastMessage: "Reach out to your instructor.",
          lastTimestamp: new Date().toISOString(),
          unread: 0,
          online: true,
          messages: [],
        } as Conversation)
      );
    });

    const classmateConvs = classmatesInCourse.map((m) => {
      const existing = baseMap.get(m.id);
      return (
        existing ??
        ({
          id: `c-${m.id}`,
          memberId: m.id,
          studentName: m.name,
          studentInitials: m.initials,
          lastMessage: "No messages yet",
          lastTimestamp: new Date().toISOString(),
          unread: 0,
          online: false,
          messages: [],
        } as Conversation)
      );
    });

    const list = [...instructorConvs, ...classmateConvs];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return list.filter((c) => c.studentName.toLowerCase().includes(q));
    }
    return list;
  })();

  const selected = learnerConversations.find((c) => c.id === selectedId) ?? learnerConversations[0];

  useEffect(() => {
    if (!selectedId && selected) {
      setSelectedId(selected.id);
    }
  }, [selected, selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  const handleSend = () => {
    if (!messageText.trim() || !selected) return;
    const target = ensureConversation(
      selected.memberId,
      selected.studentName,
      selected.studentInitials,
    );

    const ts = new Date().toISOString();
    const learnerMsg = {
      id: `msg-${Date.now()}-${MARCUS_ID}`,
      senderId: MARCUS_ID,
      recipientId: target.memberId,
      text: messageText.trim(),
      timestamp: ts,
      isInstructor: false,
    };

    chatStore["conversations"] = chatStore
      .getConversations()
      .filter((c) => c.memberId !== target.memberId)
      .concat({
        ...target,
        messages: [...target.messages, learnerMsg],
        lastMessage: learnerMsg.text,
        lastTimestamp: ts,
      });

    setConversations([...chatStore.getConversations()]);
    setMessageText("");
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in w-full max-w-full overflow-hidden">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
        <p className="text-slate-500 text-sm">
          Chat with your instructors and classmates in your course.
        </p>
      </div>

      <Card className="flex-1 flex w-full overflow-hidden border-slate-200/60 shadow-sm rounded-xl relative">
        <ChatSidebar
          conversations={learnerConversations}
          selectedId={selected?.id || ""}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectConversation={setSelectedId}
          formatTime={formatTime}
        />

        {selected ? (
          <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white/80 backdrop-blur-md z-10 flex-shrink-0">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-xs">
                  {selected.studentInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {selected.studentName}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-slate-50/20">
              <div className="space-y-4 max-w-3xl mx-auto">
                {selected.messages.map((msg) => {
                  const fromMarcus = msg.senderId === MARCUS_ID;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`flex ${fromMarcus ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 text-sm shadow-sm rounded-2xl ${
                          fromMarcus
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
              <div className="flex gap-2 bg-slate-50 border border-slate-200 p-1 rounded-full px-4 items-center">
                <Input
                  placeholder="Message..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm h-10"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="rounded-full h-8 w-8 bg-indigo-600 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50 text-slate-400">
            Select a contact to start chatting
          </div>
        )}
      </Card>
    </div>
  );
};

export default LearnerChat;

