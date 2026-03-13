import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, Clock } from "lucide-react";
import { courses } from "@/data/courses";
import { contentStore, VideoLecture, ConfidenceCheckpoint } from "@/data/contentStore";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLecture?: VideoLecture;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoLectureDialog({ open, onOpenChange, editLecture }: Props) {
  const [title, setTitle] = useState(editLecture?.title || "");
  const [courseId, setCourseId] = useState(editLecture?.courseId || "");
  const [moduleId, setModuleId] = useState(editLecture?.moduleId || "");
  const [fileName, setFileName] = useState(editLecture?.fileName || "");
  const [fileUrl, setFileUrl] = useState(editLecture?.fileUrl || "");
  const [checkpoints, setCheckpoints] = useState<ConfidenceCheckpoint[]>(editLecture?.confidenceCheckpoints || []);

  const selectedCourse = courses.find(c => c.id === courseId);

  const [cpMinutes, setCpMinutes] = useState("");
  const [cpSeconds, setCpSeconds] = useState("");
  const [cpPrompt, setCpPrompt] = useState("How confident are you that you understand this concept?");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileUrl(URL.createObjectURL(file));
    }
  };

  const addCheckpoint = () => {
    const totalSeconds = (parseInt(cpMinutes) || 0) * 60 + (parseInt(cpSeconds) || 0);
    if (totalSeconds <= 0) { toast.error("Enter a valid timestamp"); return; }
    const cp: ConfidenceCheckpoint = {
      id: `cp-${Date.now()}`,
      timestampSeconds: totalSeconds,
      prompt: cpPrompt || "How confident are you that you understand this concept?",
    };
    setCheckpoints(prev => [...prev, cp].sort((a, b) => a.timestampSeconds - b.timestampSeconds));
    setCpMinutes("");
    setCpSeconds("");
  };

  const removeCheckpoint = (id: string) => {
    setCheckpoints(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!courseId || !moduleId) { toast.error("Select a course and module"); return; }
    if (!fileName) { toast.error("Upload a video file"); return; }

    const lecture: VideoLecture = {
      id: editLecture?.id || `vid-${Date.now()}`,
      title: title.trim(),
      courseId,
      moduleId,
      fileName,
      fileUrl,
      confidenceCheckpoints: checkpoints,
      createdAt: editLecture?.createdAt || new Date().toISOString(),
    };

    if (editLecture) {
      contentStore.updateVideoLecture(lecture.id, lecture);
      toast.success("Lecture updated");
    } else {
      contentStore.addVideoLecture(lecture);
      toast.success("Lecture created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editLecture ? "Edit Video Lecture" : "Upload Video Lecture"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Lecture Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to GDPR" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={v => { setCourseId(v); setModuleId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={moduleId} onValueChange={setModuleId} disabled={!courseId}>
                <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                <SelectContent>
                  {selectedCourse?.modules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label>Video File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{fileName}</span>
                  <Button size="sm" variant="ghost" onClick={() => { setFileName(""); setFileUrl(""); }}>Change</Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Drag & drop or click to upload</p>
                  <Input type="file" accept="video/*" onChange={handleFileChange} className="max-w-xs mx-auto" />
                </>
              )}
            </div>
          </div>

          {/* Confidence Checkpoints */}
          <div className="space-y-3">
            <Label className="text-base">Confidence Checkpoints</Label>
            <p className="text-xs text-muted-foreground">
              Add timestamps where learners will be prompted about their understanding level.
            </p>

            {checkpoints.length > 0 && (
              <div className="space-y-2">
                {checkpoints.map(cp => (
                  <div key={cp.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm font-mono bg-muted px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />
                        {formatTime(cp.timestampSeconds)}
                      </div>
                      <span className="text-sm text-muted-foreground">{cp.prompt}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeCheckpoint(cp.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3 rounded-lg border border-border p-3">
              <div className="space-y-1">
                <Label className="text-xs">Min</Label>
                <Input value={cpMinutes} onChange={e => setCpMinutes(e.target.value)} placeholder="0" className="w-16 h-8 text-sm" type="number" min={0} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sec</Label>
                <Input value={cpSeconds} onChange={e => setCpSeconds(e.target.value)} placeholder="0" className="w-16 h-8 text-sm" type="number" min={0} max={59} />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Prompt</Label>
                <Input value={cpPrompt} onChange={e => setCpPrompt(e.target.value)} className="h-8 text-sm" />
              </div>
              <Button size="sm" onClick={addCheckpoint}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editLecture ? "Save Changes" : "Create Lecture"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
