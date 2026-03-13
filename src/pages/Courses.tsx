import { useReducer, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { courses } from "@/data/courses";
import { members } from "@/data/members";
import { contentStore } from "@/data/contentStore";

const CoursesPage = () => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    const unsub = contentStore.subscribe(forceUpdate);
    return () => { unsub(); };
  }, []);

  const courseCards = courses.map(course => {
    const enrolled = members.filter(m => m.enrolledCourseIds.includes(course.id)).length;
    const moduleCount = contentStore.getModulesByCourse(course.id).length;
    const contentCount = contentStore.getCourseContentCount(course.id);
    return { ...course, enrolled, moduleCount, contentCount };
  });

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse available courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courseCards.map((course) => (
          <Link to={`/courses/${course.id}`} key={course.id}>
            <Card className="hover:shadow-elevated transition-all duration-300 cursor-pointer h-full group">
              <div className="h-40 bg-gradient-to-br from-primary via-primary-glow to-primary rounded-t-2xl flex items-end p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <h3 className="text-primary-foreground font-bold leading-tight relative z-10 text-lg">{course.name}</h3>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs rounded-lg">{course.category}</Badge>
                  <Badge className="text-xs rounded-lg">{course.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrolled} learners</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.moduleCount} modules · {course.contentCount} items</span>
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
