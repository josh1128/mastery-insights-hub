import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, MessageCircle } from "lucide-react";
import { members } from "@/data/members";
import { courses } from "@/data/courses";
import { PageGlow } from "@/components/decorative/PageDecorations";

const MembersPage = () => {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = courseFilter === "all" || m.enrolledCourseIds.includes(courseFilter);
      return matchesSearch && matchesCourse;
    });
  }, [search, courseFilter]);

  const handleMessage = (memberId: string) => {
    navigate(`/chat?member=${memberId}`);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <PageGlow />
      <div className="relative z-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Members</h1>
          <p className="text-slate-500 text-sm mt-1">{members.length} learners across the platform</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or email…" 
              className="pl-9 rounded-full bg-white border-slate-200 shadow-sm" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[240px] rounded-full bg-white border-slate-200">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-xs rounded-full px-3 py-1 bg-indigo-50 text-indigo-700 border-none">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            {filtered.length} results
          </Badge>
        </div>

        <Card className="border-slate-200/60 shadow-sm overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900">Name</TableHead>
                  <TableHead className="font-bold text-slate-900">Email</TableHead>
                  <TableHead className="font-bold text-slate-900">Role</TableHead>
                  <TableHead className="font-bold text-slate-900">Joined</TableHead>
                  <TableHead className="font-bold text-slate-900">Enrolled Courses</TableHead>
                  <TableHead className="w-[120px] font-bold text-slate-900 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(m => (
                  <TableRow key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-white shadow-sm">
                          <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700 font-bold">
                            {m.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-sm text-slate-900">{m.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{m.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-md border-slate-200 text-slate-500">
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{m.joinDate}</TableCell>
                    
                    {/* --- FIXED SECTION: Deduplicated Badges --- */}
                    <TableCell>
                      <div className="flex gap-1.5 flex-wrap">
                        {Array.from(new Set(m.enrolledCourseIds)).map(cid => {
                          const c = courses.find(x => x.id === cid);
                          return c ? (
                            <Badge 
                              key={cid} 
                              variant="secondary" 
                              className="text-[10px] rounded-full bg-slate-100 text-slate-600 border-none px-2 whitespace-nowrap"
                            >
                              {c.name.split("—")[0].trim().slice(0, 20)}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right pr-6">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 gap-1.5 text-indigo-600 font-bold rounded-full hover:bg-indigo-50 hover:text-indigo-700" 
                        onClick={() => handleMessage(m.id)}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Message
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MembersPage;