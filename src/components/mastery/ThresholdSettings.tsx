import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ThresholdConfig, defaultThresholds, clusterColors, ClusterName } from "@/data/masteryData";

interface Props {
  thresholds: ThresholdConfig;
  onSave: (t: ThresholdConfig) => void;
}

export function ThresholdSettings({ thresholds, onSave }: Props) {
  const [draft, setDraft] = useState<ThresholdConfig>(thresholds);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setOpen(false);
  };

  const handleReset = () => setDraft(defaultThresholds);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-slate-200 hover:bg-slate-100">
          <Settings2 className="h-4 w-4" /> Adjust Clusters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 tracking-tight">Cluster Classification Settings</DialogTitle>
          <p className="text-sm text-slate-500 leading-relaxed">
            Define the baseline for what constitutes "Correct" and "Confident", and customize the names of your learner groups.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Threshold Sliders */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b pb-2">Cutoff Thresholds</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Score Cutoff (Correct vs. Wrong)</Label>
                <span className="text-xs font-medium text-muted-foreground">{draft.scoreThreshold}%</span>
              </div>
              <Slider
                value={[draft.scoreThreshold]}
                onValueChange={([v]) => setDraft((p) => ({ ...p, scoreThreshold: v }))}
                min={0} max={100} step={5} className="w-full"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Confidence Cutoff (Confident vs. Unsure)</Label>
                <span className="text-xs font-medium text-muted-foreground">{draft.confidenceThreshold}%</span>
              </div>
              <Slider
                value={[draft.confidenceThreshold]}
                onValueChange={([v]) => setDraft((p) => ({ ...p, confidenceThreshold: v }))}
                min={0} max={100} step={5} className="w-full"
              />
            </div>
          </div>

          {/* Group Naming */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b pb-2">Custom Group Names</h4>
            <div className="grid grid-cols-2 gap-4">
              {(["mastery", "overconfident", "underconfident", "struggling"] as ClusterName[]).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: clusterColors[key] }} />
                    Default: {defaultThresholds.labels[key]}
                  </Label>
                  <Input
                    value={draft.labels[key]}
                    onChange={(e) => setDraft(p => ({ ...p, labels: { ...p.labels, [key]: e.target.value } }))}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleReset} className="rounded-xl hover:bg-slate-100">Reset to Defaults</Button>
          <Button onClick={handleSave} className="rounded-xl">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}