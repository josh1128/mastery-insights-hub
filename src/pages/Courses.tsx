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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse available courses</p>
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
