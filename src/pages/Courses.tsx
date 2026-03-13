import { useReducer, useEffect } from "react";
import { BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { courses } from "@/data/courses";
import { members } from "@/data/members";
import { contentStore } from "@/data/contentStore";
import { PageGlow } from "@/components/decorative/PageDecorations";
import { BentoGrid, BentoCard, type BentoItem } from "@/components/ui/bento-grid";

const CoursesPage = () => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = contentStore.subscribe(forceUpdate);
    return () => { unsub(); };
  }, []);

  const courseItems: BentoItem[] = courses.map(course => {
    const enrolled = members.filter(m => m.enrolledCourseIds.includes(course.id)).length;
    const moduleCount = contentStore.getModulesByCourse(course.id).length;
    const contentCount = contentStore.getCourseContentCount(course.id);
    return {
      title: course.name,
      description: course.description || "Browse modules, quizzes, and lectures for this course.",
      icon: <BookOpen className="h-5 w-5" />,
      status: course.status,
      meta: `${moduleCount} modules`,
      tags: [course.category],
      cta: `${enrolled} learners · ${contentCount} items →`,
      colSpan: course === courses[0] ? 2 : 1,
      hasPersistentHover: false,
    };
  });

  return (
    <div className="space-y-10 animate-fade-in relative">
      <PageGlow />
      <div className="relative z-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse available courses</p>
        </div>

        <BentoGrid
          items={courseItems}
          columns={2}
          onItemClick={(_, index) => navigate(`/courses/${courses[index].id}`)}
        />
      </div>
    </div>
  );
};

export default CoursesPage;
