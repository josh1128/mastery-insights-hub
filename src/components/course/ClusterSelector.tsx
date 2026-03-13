import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clusterColors, clusterMeta, type ClusterName } from "@/data/masteryData";

const clusterKeys: ClusterName[] = [
  "mastery",
  "guessing",
  "misconception",
  "struggling",
  "developing",
];

interface Props {
  value: ClusterName;
  onValueChange: (v: ClusterName) => void;
  className?: string;
}

/**
 * Per-module cluster selector for previewing learner experience by mastery cluster.
 */
export function ClusterSelector({ value, onValueChange, className }: Props) {
  return (
    <div className={className}>
      <Select
        value={value}
        onValueChange={(v) => onValueChange(v as ClusterName)}
      >
        <SelectTrigger className="h-8 w-full max-w-[200px] rounded-full text-xs">
          <SelectValue placeholder="Select cluster" />
        </SelectTrigger>
        <SelectContent>
          {clusterKeys.map((key) => (
            <SelectItem key={key} value={key} className="text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: clusterColors[key] }}
                />
                {clusterMeta[key].label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
