import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, BookOpen, Award, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const courseData: Record<string, any> = {
  "1": {
    name: "Data Security & Privacy Essentials",
    category: "Compliance",
    students: 142,
    status: "Active",
    description: "A comprehensive course on data security, privacy regulations, and best practices for protecting organizational data.",
    modules: [
      { name: "SOC 2", lessons: ["Introduction to SOC 2", "Compliance Requirements", "Quiz: SOC 2 Basics"] },
      { name: "GDPR", lessons: ["GDPR Overview", "Data Subject Rights", "Quiz: GDPR Compliance"] },
      { name: "Phishing", lessons: ["Identifying Phishing", "Prevention Strategies", "Simulation Exercise"] },
      { name: "Data Classification", lessons: ["Classification Levels", "Handling Procedures", "Quiz: Data Classification"] },
      { name: "Incident Response", lessons: ["Response Framework", "Reporting Procedures", "Tabletop Exercise"] },
      { name: "Final Assessment", lessons: ["Comprehensive Quiz", "Case Study", "Certificate Eligibility Check"] },
    ],
  },
};

const CourseDetail = () => {
  const { id } = useParams();
  const course = courseData[id || "1"] || courseData["1"];

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
      </Link>

      <div className="h-48 bg-gradient-to-br from-primary/80 to-primary rounded-xl flex items-end p-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-foreground">{course.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">Course</Badge>
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">Public</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{course.description}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Curriculum</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-2">
                {course.modules.map((mod: any, i: number) => (
                  <AccordionItem key={i} value={`mod-${i}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">{mod.name}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {mod.lessons.map((lesson: string, j: number) => (
                          <li key={j} className="flex items-center text-sm text-muted-foreground py-1.5 pl-2 border-l-2 border-border hover:border-primary hover:text-foreground transition-colors">
                            <ChevronRight className="h-3 w-3 mr-2" />{lesson}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{course.students}</p>
                  <p className="text-xs text-muted-foreground">Enrolled Students</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{course.modules.length}</p>
                  <p className="text-xs text-muted-foreground">Modules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Certificate</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Certificate available upon meeting mastery criteria.</p>
              <Link to="/certificates">
                <Button variant="outline" size="sm" className="w-full">Manage Certificate</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
