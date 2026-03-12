import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Course {
  id: number;
  name: string;
  category: string;
  students: number;
  modules: number;
  progress: number;
  status: string;
}

const initialCourses: Course[] = [
  { id: 1, name: "Data Security & Privacy Essentials", category: "Compliance", students: 142, modules: 6, progress: 78, status: "Active" },
  { id: 2, name: "AI Reskilling - Engineering", category: "AI Reskilling", students: 89, modules: 8, progress: 45, status: "Active" },
  { id: 3, name: "AI Reskilling - Sales", category: "AI Reskilling", students: 64, modules: 5, progress: 62, status: "Active" },
  { id: 4, name: "Advanced Prompt Engineering", category: "AI Reskilling", students: 37, modules: 10, progress: 23, status: "Draft" },
  { id: 5, name: "Employee Onboarding", category: "Onboarding", students: 215, modules: 4, progress: 91, status: "Active" },
  { id: 6, name: "Compliance Training", category: "Compliance", students: 312, modules: 3, progress: 85, status: "Active" },
];

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Compliance");
  const navigate = useNavigate();

  const createCourse = () => {
    if (!newName.trim()) return;
    const newCourse: Course = {
      id: Date.now(),
      name: newName.trim(),
      category: newCategory,
      students: 0,
      modules: 0,
      progress: 0,
      status: "Draft",
    };
    setCourses(prev => [...prev, newCourse]);
    setNewName("");
    setDialogOpen(false);
    toast.success("Course created");
    navigate(`/courses/${newCourse.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your learning products</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Course name" value={newName} onChange={e => setNewName(e.target.value)} />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="AI Reskilling">AI Reskilling</SelectItem>
                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createCourse} className="w-full">Create Course</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Link to={`/courses/${course.id}`} key={course.id}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="h-32 bg-gradient-to-br from-primary/80 to-primary rounded-t-lg flex items-end p-4">
                <h3 className="text-primary-foreground font-semibold text-sm leading-tight">{course.name}</h3>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                  <Badge variant={course.status === "Active" ? "default" : "outline"} className="text-xs">{course.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.students}</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.modules} modules</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg Progress</span>
                    <span className="font-medium text-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
