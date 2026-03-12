import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const courses = [
  { id: 1, name: "Data Security & Privacy Essentials", category: "Compliance", students: 142, modules: 6, progress: 78, status: "Active" },
  { id: 2, name: "AI Reskilling - Engineering", category: "AI Reskilling", students: 89, modules: 8, progress: 45, status: "Active" },
  { id: 3, name: "AI Reskilling - Sales", category: "AI Reskilling", students: 64, modules: 5, progress: 62, status: "Active" },
  { id: 4, name: "Advanced Prompt Engineering", category: "AI Reskilling", students: 37, modules: 10, progress: 23, status: "Draft" },
  { id: 5, name: "Employee Onboarding", category: "Onboarding", students: 215, modules: 4, progress: 91, status: "Active" },
  { id: 6, name: "Compliance Training", category: "Compliance", students: 312, modules: 3, progress: 85, status: "Active" },
];

const CoursesPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your learning products</p>
      </div>
      <Button>+ New Course</Button>
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

export default CoursesPage;
