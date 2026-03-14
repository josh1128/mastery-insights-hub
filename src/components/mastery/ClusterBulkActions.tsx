import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageCircle, RotateCcw, BookOpen, CheckSquare, FileText } from "lucide-react";
import { clusterColors, LearnerDataPoint, ClusterName, ThresholdConfig } from "@/data/masteryData";
import { contentStore } from "@/data/contentStore";
import { sendMassMessage } from "@/data/chatStore";
import { toast } from "sonner";

interface Props {
  learners: LearnerDataPoint[];
  selectedClusters: string[];
  onToggleCluster: (cluster: string) => void;
  courseId: string;
  thresholds: ThresholdConfig;
}

type ActionType = "message" | "retest" | "resources" | null;

export function ClusterBulkActions({ learners, selectedClusters, onToggleCluster, courseId, thresholds }: Props) {
  const navigate = useNavigate();
  const [actionType, setActionType] = useState<ActionType>(null);
  const [messageText, setMessageText] = useState("");
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [resourceModuleId, setResourceModuleId] = useState("");
  const [retestModuleId, setRetestModuleId] = useState("");
  const [selectedRetestQuizId, setSelectedRetestQuizId] = useState("");

  const selectedLearners = learners.filter((l) => selectedClusters.includes(l.cluster));
  const uniqueNames = [...new Set(selectedLearners.map((l) => l.name))];
  const uniqueIds = [...new Set(selectedLearners.map((l) => l.id))];

  const courseModules = contentStore.getModulesByCourse(courseId);
  const resourcesForModule = resourceModuleId
    ? contentStore.getResourcesByModule(courseId, resourceModuleId)
    : [];
  const retestQuizzesForModule = retestModuleId
    ? contentStore.getQuizzesByModule(courseId, retestModuleId).filter((q) => q.isRetest)
    : [];
  const hasRetestsForModule = retestQuizzesForModule.length > 0;

  // --- Original Logic Restored ---
  const openRetestFlow = () => {
    if (selectedClusters.length === 0) {
      toast.error("Select at least one cluster first");
      return;
    }
    setRetestModuleId("");
    setSelectedRetestQuizId("");
    setActionType("retest");
  };

  const openResourcesFlow = () => {
    if (selectedClusters.length === 0) {
      toast.error("Select at least one cluster first");
      return;
    }
    setResourceModuleId("");
    setSelectedResourceIds([]);
    setActionType("resources");
  };

  const assignRetestToClusters = () => {
    if (!selectedRetestQuizId || uniqueIds.length === 0) return;
    contentStore.addIntervention({
      id: `int-retest-${Date.now()}`,
      type: "retest",
      targetLearnerIds: uniqueIds,
      contentId: selectedRetestQuizId,
      courseId,
      createdAt: new Date().toISOString(),
    });
    const clusterNames = selectedClusters.map((c) => thresholds.labels[c as ClusterName]).join(", ");
    toast.success(`Retest assigned to ${uniqueNames.length} learners in: ${clusterNames}`);
    setActionType(null);
    setRetestModuleId("");
    setSelectedRetestQuizId("");
  };

  const navigateToCreateRetest = () => {
    sessionStorage.setItem("retestLearnerIds", JSON.stringify(uniqueIds));
    sessionStorage.setItem("retestCourseId", courseId);
    if (retestModuleId) {
      sessionStorage.setItem("retestModuleId", retestModuleId);
      const mod = courseModules.find((m) => m.id === retestModuleId);
      if (mod) sessionStorage.setItem("retestModuleTitle", mod.name);
    }
    setActionType(null);
    setRetestModuleId("");
    setSelectedRetestQuizId("");
    navigate("/admin/content?action=retest");
  };

  const handleAction = () => {
    const clusterNames = selectedClusters.map((c) => thresholds.labels[c as ClusterName]).join(", ");

    if (actionType === "message") {
      const trimmed = messageText.trim();
      if (!trimmed) { toast.error("Please enter a message"); return; }
      if (uniqueIds.length === 0) { toast.error("Select at least one learner"); return; }
      try {
        sendMassMessage(uniqueIds, trimmed);
        contentStore.addIntervention({
          id: `int-${Date.now()}`,
          type: "message",
          targetLearnerIds: uniqueIds,
          message: trimmed,
          courseId,
          createdAt: new Date().toISOString(),
        });
        toast.success(`Message sent to ${uniqueNames.length} learners in: ${clusterNames}`);
      } catch (err: any) {
        toast.error(err?.message || "Failed to send message");
        return;
      }
    } else if (actionType === "resources") {
      if (selectedResourceIds.length === 0) { toast.error("Select at least one resource"); return; }
      if (!resourceModuleId) { toast.error("Select a target module first"); return; }
      for (const resourceId of selectedResourceIds) {
        contentStore.addIntervention({
          id: `int-${Date.now()}-${resourceId}`,
          type: "resource",
          targetLearnerIds: uniqueIds,
          contentId: resourceId,
          courseId,
          createdAt: new Date().toISOString(),
        });
      }
      toast.success(`${selectedResourceIds.length} resource(s) assigned to ${uniqueNames.length} learners in: ${clusterNames}`);
    }
    setActionType(null);
    setMessageText("");
    setSelectedResourceIds([]);
    setResourceModuleId("");
  };

  const toggleResource = (id: string) => {
    setSelectedResourceIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  // Helper for color-matched badges in dialogs
  const ClusterPills = () => (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {selectedClusters.map((c) => {
        const color = clusterColors[c as ClusterName];
        return (
          <Badge 
            key={c} 
            variant="outline"
            className="text-xs rounded-full border px-2.5 py-0.5 font-medium"
            style={{
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}30`
            }}
          >
            {thresholds.labels[c as ClusterName]} ({learners.filter((l) => l.cluster === c).length})
          </Badge>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cluster Actions</h3>
          <p className="text-xs text-muted-foreground">Select clusters, then take action on all learners in them.</p>
        </div>
        {selectedClusters.length > 0 && (
          <Badge variant="secondary" className="text-xs rounded-full">{uniqueNames.length} learners selected</Badge>
        )}
      </div>

      {/* Cluster selectors */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(clusterColors) as ClusterName[]).map((key) => {
          const count = learners.filter((l) => l.cluster === key).length;
          const selected = selectedClusters.includes(key);
          return (
            <button key={key} onClick={() => onToggleCluster(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                selected ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600/20 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}>
              {selected && <CheckSquare className="h-3.5 w-3.5 text-violet-700" />}
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: clusterColors[key] }} />
              <span className="font-medium text-slate-900">{thresholds.labels[key]}</span>
              <span className="text-slate-500 text-xs">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      {selectedClusters.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col items-start gap-1.5 rounded-2xl border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all" onClick={() => setActionType("message")}>
            <MessageCircle className="h-4 w-4 text-violet-700" />
            <div className="text-left">
              <p className="text-xs font-medium text-slate-900">Mass Message</p>
              <p className="text-[10px] text-slate-500">Message all {uniqueNames.length} learners</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col items-start gap-1.5 rounded-2xl border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all" onClick={openRetestFlow}>
            <RotateCcw className="h-4 w-4 text-violet-700" />
            <div className="text-left">
              <p className="text-xs font-medium text-slate-900">Create / Assign Retest</p>
              <p className="text-[10px] text-slate-500">Create or assign a retest for selected clusters</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col items-start gap-1.5 rounded-2xl border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all" onClick={openResourcesFlow}>
            <BookOpen className="h-4 w-4 text-violet-700" />
            <div className="text-left">
              <p className="text-xs font-medium text-slate-900">Assign Resources</p>
              <p className="text-[10px] text-slate-500">Module-specific remediation materials</p>
            </div>
          </Button>
        </div>
      )}

      {/* Retest dialog */}
      <Dialog open={actionType === "retest"} onOpenChange={(open) => !open && (setActionType(null), setRetestModuleId(""), setSelectedRetestQuizId(""))}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Create or Assign Retest</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Create or assign a retest quiz for the selected clusters.</p>
          </DialogHeader>
          <div className="space-y-4">
            <ClusterPills />
            <p className="text-sm text-muted-foreground">
              Applies to <strong className="text-foreground">{uniqueNames.length}</strong> learners
            </p>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Target module</Label>
              <Select value={retestModuleId} onValueChange={(v) => { setRetestModuleId(v); setSelectedRetestQuizId(""); }}>
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {courseModules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {retestModuleId && (
              <>
                {hasRetestsForModule ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Existing retest quiz</Label>
                    <ScrollArea className="max-h-40">
                      <div className="space-y-1.5">
                        {retestQuizzesForModule.map((q) => (
                          <label key={q.id} className="flex items-center gap-3 rounded-xl border border-border/40 p-3 cursor-pointer hover:bg-slate-50 transition-colors">
                            <Checkbox
                              checked={selectedRetestQuizId === q.id}
                              onCheckedChange={() => setSelectedRetestQuizId(selectedRetestQuizId === q.id ? "" : q.id)}
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <FileText className="h-4 w-4 text-primary shrink-0" />
                              <span className="text-sm font-medium">{q.title}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center">
                    <p className="text-sm text-muted-foreground">No retest quiz exists for this module yet.</p>
                    <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={navigateToCreateRetest}>
                      Create new retest quiz
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionType(null)} className="rounded-full">Cancel</Button>
            {hasRetestsForModule && (
              <Button onClick={assignRetestToClusters} disabled={!selectedRetestQuizId} className="rounded-full">
                Assign Retest
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message dialog */}
      <Dialog open={actionType === "message"} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Send Message to Learners</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ClusterPills />
            <p className="text-sm text-muted-foreground leading-relaxed">
              This action will apply to <strong className="text-foreground">{uniqueNames.length}</strong> learners:{" "}
              {uniqueNames.slice(0, 5).join(", ")}
              {uniqueNames.length > 5 && ` and ${uniqueNames.length - 5} more`}
            </p>
            <Textarea
              placeholder="Write your message to learners…"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              className="rounded-2xl border-slate-200"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionType(null)} className="rounded-full">Cancel</Button>
            <Button onClick={handleAction} className="rounded-full">Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resources dialog */}
      <Dialog open={actionType === "resources"} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Assign Resources to Learners</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ClusterPills />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Target module</Label>
              <Select value={resourceModuleId} onValueChange={(v) => { setResourceModuleId(v); setSelectedResourceIds([]); }}>
                <SelectTrigger className="rounded-full border-slate-200">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {courseModules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {resourceModuleId && (
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {resourcesForModule.map(r => (
                    <label key={r.id} className="flex items-center gap-3 rounded-2xl border border-border/40 p-3 cursor-pointer hover:bg-slate-50 transition-colors">
                      <Checkbox
                        checked={selectedResourceIds.includes(r.id)}
                        onCheckedChange={() => toggleResource(r.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.fileName}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionType(null)} className="rounded-full">Cancel</Button>
            <Button onClick={handleAction} disabled={!resourceModuleId || selectedResourceIds.length === 0} className="rounded-full">
              Assign Resources
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}