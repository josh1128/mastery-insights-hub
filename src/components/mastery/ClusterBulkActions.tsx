import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, RotateCcw, BookOpen, Send, FileText, CheckSquare } from "lucide-react";
import { clusterColors, clusterMeta, LearnerDataPoint, ClusterName } from "@/data/masteryData";
import { contentStore } from "@/data/contentStore";
import { toast } from "sonner";

interface Props {
  learners: LearnerDataPoint[];
  selectedClusters: string[];
  onToggleCluster: (cluster: string) => void;
  courseId: string;
}

type ActionType = "message" | "retest" | "resources" | null;

export function ClusterBulkActions({ learners, selectedClusters, onToggleCluster, courseId }: Props) {
  const navigate = useNavigate();
  const [actionType, setActionType] = useState<ActionType>(null);
  const [messageText, setMessageText] = useState("");
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

  const selectedLearners = learners.filter((l) => selectedClusters.includes(l.cluster));
  const uniqueNames = [...new Set(selectedLearners.map((l) => l.name))];
  const uniqueIds = [...new Set(selectedLearners.map((l) => l.id))];

  const availableResources = contentStore.getResourcesByCourse(courseId);

  const handleAction = () => {
    const clusterNames = selectedClusters.map((c) => clusterMeta[c as ClusterName]?.label).join(", ");

    if (actionType === "message") {
      if (!messageText.trim()) { toast.error("Please enter a message"); return; }
      // Actually send the message via chat
      const sendFn = (window as any).__chatSendMassMessage;
      if (sendFn) {
        sendFn(uniqueIds, messageText.trim());
      }
      // Also create an intervention record
      contentStore.addIntervention({
        id: `int-${Date.now()}`,
        type: "message",
        targetLearnerIds: uniqueIds,
        message: messageText.trim(),
        courseId,
        createdAt: new Date().toISOString(),
      });
      toast.success(`Message sent to ${uniqueNames.length} learners in: ${clusterNames}`);
    } else if (actionType === "retest") {
      // Navigate to content page to create a retest quiz
      toast.success(`Navigating to Content page to create a retest for ${uniqueNames.length} learners`);
      // Store the target learner IDs for the retest
      sessionStorage.setItem("retestLearnerIds", JSON.stringify(uniqueIds));
      sessionStorage.setItem("retestCourseId", courseId);
      navigate("/admin/content?action=retest");
      setActionType(null);
      return;
    } else if (actionType === "resources") {
      if (selectedResourceIds.length === 0) { toast.error("Select at least one resource"); return; }
      // Create intervention for each resource
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
  };

  const toggleResource = (id: string) => {
    setSelectedResourceIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cluster Actions</h3>
          <p className="text-xs text-muted-foreground">Select clusters, then take action on all learners in them.</p>
        </div>
        {selectedClusters.length > 0 && (
          <Badge variant="secondary" className="text-xs">{uniqueNames.length} learners selected</Badge>
        )}
      </div>

      {/* Cluster selectors */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(clusterMeta) as [ClusterName, typeof clusterMeta[ClusterName]][]).map(([key, info]) => {
          const count = learners.filter((l) => l.cluster === key).length;
          const selected = selectedClusters.includes(key);
          return (
            <button key={key} onClick={() => onToggleCluster(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                selected ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border hover:border-muted-foreground/30"
              }`}>
              {selected && <CheckSquare className="h-3.5 w-3.5 text-primary" />}
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: clusterColors[key] }} />
              <span className="font-medium">{info.label}</span>
              <span className="text-muted-foreground">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      {selectedClusters.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-3 flex-col items-start gap-1" onClick={() => setActionType("message")}>
            <MessageCircle className="h-4 w-4 text-primary" />
            <div className="text-left">
              <p className="text-xs font-medium">Mass Message</p>
              <p className="text-[10px] text-muted-foreground">Message all {uniqueNames.length} learners</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col items-start gap-1" onClick={() => setActionType("retest")}>
            <RotateCcw className="h-4 w-4 text-primary" />
            <div className="text-left">
              <p className="text-xs font-medium">Create Retest</p>
              <p className="text-[10px] text-muted-foreground">New test & send link</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col items-start gap-1" onClick={() => setActionType("resources")}>
            <BookOpen className="h-4 w-4 text-primary" />
            <div className="text-left">
              <p className="text-xs font-medium">Assign Resources</p>
              <p className="text-[10px] text-muted-foreground">Remediation materials</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col items-start gap-1" onClick={() => {
            // Trigger full workflow: message + resource assignment
            contentStore.addIntervention({
              id: `int-${Date.now()}`,
              type: "extra-quiz",
              targetLearnerIds: uniqueIds,
              courseId,
              createdAt: new Date().toISOString(),
            });
            toast.success(`Group intervention triggered for ${uniqueNames.length} learners.`);
          }}>
            <Send className="h-4 w-4 text-primary" />
            <div className="text-left">
              <p className="text-xs font-medium">Group Intervention</p>
              <p className="text-[10px] text-muted-foreground">Trigger full workflow</p>
            </div>
          </Button>
        </div>
      )}

      {/* Action dialog */}
      <Dialog open={actionType !== null && actionType !== "retest"} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "message" && "Send Message to Learners"}
              {actionType === "resources" && "Assign Resources to Learners"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {selectedClusters.map((c) => (
                <Badge key={c} variant="secondary" className="text-xs">
                  {clusterMeta[c as ClusterName]?.label} ({learners.filter((l) => l.cluster === c).length})
                </Badge>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              This action will apply to <strong className="text-foreground">{uniqueNames.length}</strong> learners:{" "}
              {uniqueNames.slice(0, 5).join(", ")}
              {uniqueNames.length > 5 && ` and ${uniqueNames.length - 5} more`}
            </p>

            {actionType === "message" && (
              <Textarea
                placeholder="Write your message to learners…"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
              />
            )}

            {actionType === "resources" && (
              <div className="space-y-3">
                {availableResources.length === 0 ? (
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-sm text-muted-foreground">No resources available. Create resources in the Content page first.</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => { setActionType(null); navigate("/admin/content"); }}>
                      Go to Content
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="max-h-60">
                    <div className="space-y-2">
                      {availableResources.map(r => (
                        <label key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                          <Checkbox
                            checked={selectedResourceIds.includes(r.id)}
                            onCheckedChange={() => toggleResource(r.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{r.title}</p>
                            <p className="text-xs text-muted-foreground">{r.fileName} · {r.isOptional ? "Optional" : "Required"}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{r.fileType.toUpperCase()}</Badge>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionType(null)}>Cancel</Button>
            <Button onClick={handleAction}>
              {actionType === "message" && "Send Message"}
              {actionType === "resources" && "Assign Resources"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
