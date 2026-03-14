import { useReducer, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { courses } from "@/data/courses";
import { members } from "@/data/members";
import { contentStore } from "@/data/contentStore";
import { PageGlow } from "@/components/decorative/PageDecorations";

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
    const marcusEnrolledBaseline = members.find(m => m.id === "member-marcus")?.enrolledCourseIds || [];
    const marcusOverrides = contentStore.getEnrolledCourseIds("member-marcus");
    const marcusEnrolledIds = marcusOverrides.length > 0 ? marcusOverrides : marcusEnrolledBaseline;
    const isMarcusEnrolled = marcusEnrolledIds.includes(course.id);
    const isActive = course.status === "Active" || course.status === "In Progress";
    return { ...course, enrolled, moduleCount, contentCount, isMarcusEnrolled, isActive };
  });

  return (
    <div className="space-y-10 animate-fade-in relative">
      <PageGlow />
      <div className="relative z-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse available courses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courseCards.map((course) => {
            const ctaLabel = course.isMarcusEnrolled
              ? "Continue learning"
              : course.isActive
              ? "Enroll"
              : "Preview course";

            return (
              <Card
                key={course.id}
                className="hover:shadow-glow transition-all duration-300 h-full group overflow-hidden border-slate-200/80 bg-white/90"
              >
                <Link to={`/courses/${course.id}`}>
                  <div className="h-40 bg-gradient-to-br from-primary via-primary-glow to-primary rounded-t-2xl flex items-end p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border border-primary-foreground/10" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full border border-primary-foreground/5" />
                    <h3 className="text-primary-foreground font-bold leading-tight relative z-10 text-lg">
                      {course.name}
                    </h3>
                  </div>
                </Link>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs rounded-full px-3">
                      {course.category}
                    </Badge>
                    <Badge className="text-xs rounded-full px-3">{course.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrolled} learners
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.moduleCount} modules · {course.contentCount} items
                    </span>
                  </div>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!course.isMarcusEnrolled && course.isActive) {
                          contentStore.enrollLearnerInCourse("member-marcus", course.id);
                        }
                      }}
                      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                        course.isMarcusEnrolled
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : course.isActive
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-slate-100 text-slate-500 cursor-default"
                      }`}
                    >
                      {ctaLabel}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
