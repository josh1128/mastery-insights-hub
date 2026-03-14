import { useReducer, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { contentStore } from "@/data/contentStore";
import { CURRENT_LEARNER_ID } from "@/lib/learnerIdentity";
import { getCourse } from "@/data/courses";

export default function LearnerMessages() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const unsub = contentStore.subscribe(forceUpdate);
    return () => unsub();
  }, []);

  const learnerId = CURRENT_LEARNER_ID;
  const allMessages = contentStore.getAssignedMessagesForLearner(learnerId);

  const messagesByCourse = allMessages.reduce<Record<string, typeof allMessages>>((acc, m) => {
    const cid = m.courseId;
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Messages from your instructor
        </p>
      </div>

      {allMessages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              When your instructor sends you a message, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(messagesByCourse).map(([courseId, msgs]) => {
            const course = getCourse(courseId);
            return (
              <Card key={courseId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {course?.name ?? "Course"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {msgs.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-border/60 bg-muted/20 p-4"
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Message from instructor
                      </p>
                      <p className="text-sm text-foreground">{m.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
