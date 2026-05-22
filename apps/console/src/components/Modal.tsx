import { type JSX, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Project-level modal convention built on shadcn `Dialog` primitives.
 * Keeps a small controlled API (open/onClose/title/subtitle/maxWidth/
 * children/footer) because the same modal pattern recurs across 18+
 * call sites and each direct `<Dialog>…<DialogContent><DialogHeader>…`
 * expansion would add the same boilerplate. Internals delegate to
 * shadcn so theming, close button (lucide X via DialogContent's
 * showCloseButton default), focus trap, and animations stay aligned
 * with the rest of the design system.
 *
 * Footer is rendered into `DialogFooter` only when provided so unused
 * modals don't get an empty bordered band at the bottom.
 *
 * The children block is wrapped in a scroll container so long forms
 * stay reachable when content exceeds the modal's max height. shadcn's
 * `DialogContent` doesn't auto-scroll; pulling it out of the dialog
 * shell keeps the header sticky and the footer pinned.
 */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Tailwind class controlling the dialog's max width — defaults to
   *  `max-w-lg` (matches the legacy wrapper). Pass a custom class to
   *  override (e.g. `max-w-2xl` for wider forms). */
  maxWidth?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = "max-w-lg",
  children,
  footer,
}: ModalProps): JSX.Element {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "max-h-[85vh] flex flex-col gap-0 p-0",
          // shadcn's default ceiling is sm:max-w-sm — bump to the
          // caller's choice (or the lg fallback) so forms aren't cramped.
          "sm:max-w-[unset]",
          maxWidth,
        )}
      >
        <DialogHeader className="px-6 py-4 border-b border-border gap-1">
          <DialogTitle className="text-lg font-semibold font-display truncate">
            {title}
          </DialogTitle>
          {subtitle && (
            <DialogDescription className="text-sm text-fg-muted">
              {subtitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer && (
          <DialogFooter className="m-0 px-6 py-4 border-t border-border bg-transparent rounded-none sm:justify-end gap-3">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
