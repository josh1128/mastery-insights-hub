import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { contentStore } from "@/data/contentStore";

type ConfidenceResponse = "fully" | "somewhat" | "dont";

const responseLabels: Record<ConfidenceResponse, string> = {
  fully: "Fully understand",
  somewhat: "Somewhat understand",
  dont: "Don't understand",
};

export default function LearnerLecture() {
  const { lectureId } = useParams();
  const lecture = contentStore.getVideoLecture(lectureId || "");
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeCheckpoint, setActiveCheckpoint] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, ConfidenceResponse>>({});
  const [triggeredCheckpoints, setTriggeredCheckpoints] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!lecture || !videoRef.current) return;
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      for (const cp of lecture.confidenceCheckpoints) {
        if (
          Math.abs(currentTime - cp.timestampSeconds) <= 1 &&
          !triggeredCheckpoints.has(cp.id) &&
          !activeCheckpoint
        ) {
          video.pause();
          setActiveCheckpoint(cp.id);
          setTriggeredCheckpoints(prev => new Set(prev).add(cp.id));
          break;
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [lecture, triggeredCheckpoints, activeCheckpoint]);

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

  const activeCp = lecture.confidenceCheckpoints.find(cp => cp.id === activeCheckpoint);

  const handleResponse = (response: ConfidenceResponse) => {
    if (activeCheckpoint) {
      setResponses(prev => ({ ...prev, [activeCheckpoint]: response }));
      setActiveCheckpoint(null);
      videoRef.current?.play();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <p className="text-sm text-muted-foreground">Learner Lecture Page</p>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="p-8 pb-0">
          <h1 className="text-3xl font-light text-foreground mb-6">{lecture.title}</h1>
        </div>

        {/* Video area */}
        <div className="px-8 relative">
          {lecture.fileUrl ? (
            <video
              ref={videoRef}
              src={lecture.fileUrl}
              controls
              className="w-full rounded-lg bg-muted aspect-video"
            />
          ) : (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Video placeholder</p>
            </div>
          )}

          {/* Confidence prompt overlay */}
          {activeCp && (
            <div className="absolute inset-0 mx-8 bg-muted/95 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-6 max-w-md">
                <p className="text-lg font-medium text-foreground">{activeCp.prompt}</p>
                <div className="space-y-3">
                  {(["fully", "somewhat", "dont"] as ConfidenceResponse[]).map(r => (
                    <button
                      key={r}
                      onClick={() => handleResponse(r)}
                      className="w-full px-6 py-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      • {responseLabels[r]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar placeholder */}
        <div className="px-8 py-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: "40%" }} />
          </div>
        </div>

        {/* Chat icon */}
        <div className="flex justify-end px-8 pb-6">
          <button className="w-12 h-12 rounded-full bg-muted-foreground/80 flex items-center justify-center text-background hover:bg-muted-foreground transition-colors">
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
