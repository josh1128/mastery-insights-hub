import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Resource } from "@/data/contentStore";
import { File, ExternalLink } from "lucide-react";

interface Props {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREVIEWABLE_TYPES = ["pdf", "txt", "md", "html"];
const IMAGE_TYPES = ["png", "jpg", "jpeg", "gif", "webp"];

/**
 * Modal to preview resource content when possible (PDF, images, text).
 * For other types, shows file info and a link to open in new tab.
 */
export function ResourcePreviewModal({
  resource,
  open,
  onOpenChange,
}: Props) {
  if (!resource) return null;

  const ext = resource.fileType?.toLowerCase() || "";
  const canPreview =
    PREVIEWABLE_TYPES.includes(ext) || IMAGE_TYPES.includes(ext);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium truncate pr-8">
            {resource.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <File className="h-3.5 w-3.5" />
            <span>{resource.fileName}</span>
            <span className="uppercase">({resource.fileType})</span>
          </div>
          {canPreview && resource.fileUrl ? (
            <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden border border-border/40 bg-muted/20">
              {ext === "pdf" ? (
                <iframe
                  src={resource.fileUrl}
                  title={resource.title}
                  className="w-full h-full min-h-[400px]"
                />
              ) : IMAGE_TYPES.includes(ext) ? (
                <img
                  src={resource.fileUrl}
                  alt={resource.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              ) : (
                <iframe
                  src={resource.fileUrl}
                  title={resource.title}
                  className="w-full h-full min-h-[400px]"
                  sandbox="allow-same-origin"
                />
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Preview not available for .{ext} files. Open the file to view
                contents.
              </p>
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
