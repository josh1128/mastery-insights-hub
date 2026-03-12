import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { courses } from "@/data/courses";
import { members } from "@/data/members";

const CoursesPage = () => {
  const courseCards = courses.map(course => {
    const enrolled = members.filter(m => m.enrolledCourseIds.includes(course.id)).length;
    return { ...course, enrolled, progress: Math.round(60 + Math.random() * 30) };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your learning products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courseCards.map((course) => (
          <Link to={`/courses/${course.id}`} key={course.id}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="h-36 bg-gradient-to-br from-primary/80 to-primary rounded-t-lg flex items-end p-5">
                <h3 className="text-primary-foreground font-semibold leading-tight">{course.name}</h3>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                  <Badge variant="default" className="text-xs">{course.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrolled} learners</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.modules.length} modules</span>
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
