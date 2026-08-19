import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  label: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * 🚨 Renders through a portal because `TopNav` uses `backdrop-blur`, and a
 * filtered ancestor becomes the containing block for `position: fixed` — a
 * dialog mounted inside the nav gets clipped to its 60px strip instead of
 * covering the viewport.
 */
export function Modal({ label, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[hsl(216_30%_3%/.72)] px-6 py-10 backdrop-blur-[3px]"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-[404px] animate-fadeUp overflow-hidden rounded-[14px] border border-[hsl(215_15%_18%)] bg-[hsl(215_22%_10%)] shadow-[0_24px_70px_-12px_hsl(216_40%_2%/.9)]"
      >
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-[14px] top-[14px] rounded-md p-1 text-[hsl(212_10%_50%)] transition-colors hover:bg-[hsl(215_18%_15%)] hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
