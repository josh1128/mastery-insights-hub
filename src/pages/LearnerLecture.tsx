import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { contentStore } from "@/data/contentStore";

export default function LearnerLecture() {
  const { lectureId } = useParams();
  const lecture = contentStore.getVideoLecture(lectureId || "");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!lecture || !videoRef.current) return;
    const video = videoRef.current;
    const handleEnded = () => {
      setCompleted(true);
      contentStore.completeLecture("demo-learner", lecture.id);
    };
    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [lecture]);

  if (!lecture) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to="/admin/content" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
        <p className="text-muted-foreground">Lecture not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Link to="/admin/content" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Content
      </Link>

      <div className="bg-card/90 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden shadow-glass">
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-light text-foreground">{lecture.title}</h1>
        </div>

        <div className="px-8">
          {lecture.fileUrl ? (
            <video
              ref={videoRef}
              src={lecture.fileUrl}
              controls
              className="w-full rounded-2xl bg-muted aspect-video"
            />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-muted to-accent/30 rounded-2xl flex items-center justify-center">
              <p className="text-muted-foreground">Video placeholder</p>
            </div>
          )}
        </div>

        <div className="p-8 pt-4">
          {completed && (
            <p className="text-sm text-primary font-medium">✓ Lecture completed</p>
          )}
          {!completed && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Watch the full lecture to unlock the quiz.</p>
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setCompleted(true); contentStore.completeLecture("demo-learner", lecture.id); }}>
                Mark as Complete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
