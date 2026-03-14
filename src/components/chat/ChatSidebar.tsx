import { Search, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Conversation } from "@/data/chatStore";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedId: string;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onSelectConversation: (id: string) => void;
  formatTime: (iso: string) => string;
}

export const ChatSidebar = ({
  conversations,
  selectedId,
  searchTerm,
  onSearchChange,
  onSelectConversation,
  formatTime
}: ChatSidebarProps) => {
  return (
    // CHANGED: w-80 -> w-[400px] for a wider, more professional feel
    <div className="w-[400px] border-r border-slate-200/60 flex flex-col bg-slate-50/50 flex-shrink-0">
      <div className="p-4 border-b border-slate-200/60">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search learners..." 
            className="pl-10 h-11 rounded-xl bg-white border-slate-200 shadow-sm focus-visible:ring-indigo-500/20"
            value={searchTerm} 
            onChange={e => onSearchChange(e.target.value)} 
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {conversations.map(conv => (
          <button 
            key={conv.id}
            className={`w-full text-left p-5 border-b border-slate-100 transition-all ${
              selectedId === conv.id ? "bg-white shadow-sm ring-1 ring-slate-200/50 z-10" : "hover:bg-slate-100/50"
            }`}
            onClick={() => onSelectConversation(conv.id)}
          >
            <div className="flex items-center gap-4">
              {/* Left: Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarFallback className="text-sm bg-indigo-100 text-indigo-700 font-bold">
                    {conv.studentInitials}
                  </AvatarFallback>
                </Avatar>
                {conv.online && (
                  <Circle className="absolute bottom-0 right-0 h-3.5 w-3.5 fill-emerald-500 text-white stroke-[3px]" />
                )}
              </div>

              {/* Middle: Name & Preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {conv.studentName}
                  </p>
                  {/* Right: Timestamp inside the name row for better alignment */}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                    {formatTime(conv.lastTimestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <p className="text-xs text-slate-500 truncate leading-relaxed">
                    {conv.lastMessage}
                  </p>
                  {/* Unread Badge */}
                  {conv.unread > 0 && (
                    <Badge className="h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] rounded-full bg-indigo-600 text-white border-none shrink-0 font-black">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
};