import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, RotateCcw, BookOpen, Send, FileText, CheckSquare } from "lucide-react";
import { clusterColors, clusterMeta, LearnerDataPoint, ClusterName } from "@/data/masteryData";
import { toast } from "sonner";

interface Props {
  learners: LearnerDataPoint[];
  selectedClusters: string[];
  onToggleCluster: (cluster: string) => void;
}

type ActionType = "message" | "retest" | "resources" | null;

export function ClusterBulkActions({ learners, selectedClusters, onToggleCluster }: Props) {
  const [actionType, setActionType] = useState<ActionType>(null);
  const [messageText, setMessageText] = useState("");

  const selectedLearners = learners.filter((l) => selectedClusters.includes(l.cluster));
  const uniqueNames = [...new Set(selectedLearners.map((l) => l.name))];

  const handleAction = () => {
    const clusterNames = selectedClusters.map((c) => clusterMeta[c as ClusterName]?.label).join(", ");
    if (actionType === "message") {
      toast.success(`Message sent to ${uniqueNames.length} learners in: ${clusterNames}`);
    } else if (actionType === "retest") {
      toast.success(`Retest link sent to ${uniqueNames.length} learners in: ${clusterNames}`);
    } else if (actionType === "resources") {
      toast.success(`Remediation materials sent to ${uniqueNames.length} learners in: ${clusterNames}`);
    }
    setActionType(null);
    setMessageText("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cluster Actions</h3>
          <p className="text-xs text-muted-foreground">Select clusters, then take action on all learners in them.</p>
        </div>
        {selectedClusters.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {uniqueNames.length} learners selected
          </Badge>
        )}
      </div>

      {/* Cluster selectors */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(clusterMeta) as [ClusterName, typeof clusterMeta[ClusterName]][]).map(([key, info]) => {
          const count = learners.filter((l) => l.cluster === key).length;
          const selected = selectedClusters.includes(key);
          return (
            <button
              key={key}
              onClick={() => onToggleCluster(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                selected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              {selected && <CheckSquare className="h-3.5 w-3.5 text-primary" />}
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: clusterColors[key] }}
              />
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
            toast.success(`Intervention triggered for ${uniqueNames.length} learners.`);
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
      <Dialog open={actionType !== null} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "message" && "Send Message to Learners"}
              {actionType === "retest" && "Create & Send Retest"}
              {actionType === "resources" && "Assign Remediation Resources"}
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

            {actionType === "retest" && (
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Auto-generated retest</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  A targeted retest will be generated from the modules where these learners scored lowest.
                  The retest link will be sent directly to each learner.
                </p>
              </div>
            )}

            {actionType === "resources" && (
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Recommended resources</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supplementary materials, videos, and practice exercises related to weak areas
                  will be assigned to each learner's dashboard.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionType(null)}>Cancel</Button>
            <Button onClick={handleAction}>
              {actionType === "message" && "Send Message"}
              {actionType === "retest" && "Create & Send Retest"}
              {actionType === "resources" && "Assign Resources"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
