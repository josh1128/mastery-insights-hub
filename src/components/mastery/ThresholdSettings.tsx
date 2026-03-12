import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ThresholdConfig, defaultThresholds, clusterColors, ClusterName } from "@/data/masteryData";

interface Props {
  thresholds: ThresholdConfig;
  onSave: (t: ThresholdConfig) => void;
}

const fields: { key: keyof ThresholdConfig; label: string; cluster: ClusterName; direction: string }[] = [
  { key: "masteryMinConfidence", label: "Mastery — Min Confidence", cluster: "mastery", direction: "≥" },
  { key: "masteryMinScore", label: "Mastery — Min Score", cluster: "mastery", direction: "≥" },
  { key: "guessingMaxConfidence", label: "Guessing — Max Confidence", cluster: "guessing", direction: "≤" },
  { key: "guessingMinScore", label: "Guessing — Min Score", cluster: "guessing", direction: "≥" },
  { key: "misconceptionMinConfidence", label: "Misconception — Min Confidence", cluster: "misconception", direction: "≥" },
  { key: "misconceptionMaxScore", label: "Misconception — Max Score", cluster: "misconception", direction: "≤" },
  { key: "strugglingMaxConfidence", label: "Struggling — Max Confidence", cluster: "struggling", direction: "≤" },
  { key: "strugglingMaxScore", label: "Struggling — Max Score", cluster: "struggling", direction: "≤" },
];

export function ThresholdSettings({ thresholds, onSave }: Props) {
  const [draft, setDraft] = useState(thresholds);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setOpen(false);
  };

  const handleReset = () => setDraft(defaultThresholds);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings2 className="h-4 w-4" /> Adjust Thresholds
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cluster Classification Thresholds</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adjust the confidence and score cutoffs that determine how learners are classified into clusters.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: clusterColors[f.cluster] }}
                  />
                  {f.label}
                </Label>
                <span className="text-xs font-medium text-muted-foreground">
                  {f.direction} {draft[f.key]}%
                </span>
              </div>
              <Slider
                value={[draft[f.key]]}
                onValueChange={([v]) => setDraft((p) => ({ ...p, [f.key]: v }))}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleReset}>Reset to Default</Button>
          <Button onClick={handleSave}>Apply Thresholds</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
