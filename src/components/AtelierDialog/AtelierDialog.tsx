import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import dialogStyles from "./AtelierDialog.module.css";

/* ----- Context ----- */

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  hasTitle: boolean;
  setHasTitle: (v: boolean) => void;
  hasDescription: boolean;
  setHasDescription: (v: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("AtelierDialog compound components must be used within <AtelierDialog>");
  }
  return ctx;
}

/* =========================================================================
   AtelierDialog (Root)
   ========================================================================= */

export interface AtelierDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function AtelierDialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: AtelierDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : internalOpen;

  const autoId = useId();
  const titleId = `atelier-dialog-title-${autoId}`;
  const descriptionId = `atelier-dialog-desc-${autoId}`;
  const triggerRef = useRef<HTMLElement | null>(null);

  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange: handleOpenChange,
        titleId,
        descriptionId,
        triggerRef,
        hasTitle,
        setHasTitle,
        hasDescription,
        setHasDescription,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

/* =========================================================================
   AtelierDialogTrigger
   ========================================================================= */

export interface AtelierDialogTriggerProps {
  children: ReactNode;
  className?: string;
}

export const AtelierDialogTrigger = forwardRef<
  HTMLButtonElement,
  AtelierDialogTriggerProps
>(({ children, className }, ref) => {
  const { onOpenChange, triggerRef } = useDialogContext();

  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      triggerRef.current = node;
    },
    [ref, triggerRef],
  );

  return (
    <button
      ref={setRef}
      type="button"
      onClick={() => onOpenChange(true)}
      className={className}
    >
      {children}
    </button>
  );
});

AtelierDialogTrigger.displayName = "AtelierDialogTrigger";

/* =========================================================================
   AtelierDialogContent
   ========================================================================= */

export interface AtelierDialogContentProps {
  children: ReactNode;
  className?: string;
}

export const AtelierDialogContent = forwardRef<
  HTMLDivElement,
  AtelierDialogContentProps
>(({ children, className }, _ref) => {
  const {
    open,
    onOpenChange,
    titleId,
    descriptionId,
    triggerRef,
    hasTitle,
    hasDescription,
  } = useDialogContext();

  const focusTrapRef = useFocusTrap<HTMLDivElement>({
    enabled: open,
    returnFocusTo: triggerRef.current,
  });

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const root = document.body;
    const inertTargets: HTMLElement[] = [];
    root.childNodes.forEach((node) => {
      if (
        node instanceof HTMLElement &&
        !node.hasAttribute("data-atelier-dialog-portal")
      ) {
        inertTargets.push(node);
      }
    });

    inertTargets.forEach((el) => el.setAttribute("inert", ""));

    return () => {
      inertTargets.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open, focusTrapRef]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div data-atelier-dialog-portal="">
      <div
        className={dialogStyles.overlay}
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />

      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(dialogStyles.panel, className)}
      >
        {children}

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className={dialogStyles.closeButton}
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
});

AtelierDialogContent.displayName = "AtelierDialogContent";

/* =========================================================================
   Sub-components
   ========================================================================= */

export function AtelierDialogHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(dialogStyles.header, className)}>{children}</div>
  );
}

export function AtelierDialogFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(dialogStyles.footer, className)}>{children}</div>
  );
}

export const AtelierDialogTitle = forwardRef<
  HTMLHeadingElement,
  { className?: string; children: ReactNode }
>(({ className, children }, ref) => {
  const { titleId, setHasTitle } = useDialogContext();

  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);

  return (
    <h2 ref={ref} id={titleId} className={cn(dialogStyles.title, className)}>
      {children}
    </h2>
  );
});

AtelierDialogTitle.displayName = "AtelierDialogTitle";

export const AtelierDialogDescription = forwardRef<
  HTMLParagraphElement,
  { className?: string; children: ReactNode }
>(({ className, children }, ref) => {
  const { descriptionId, setHasDescription } = useDialogContext();

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <p ref={ref} id={descriptionId} className={cn(dialogStyles.description, className)}>
      {children}
    </p>
  );
});

AtelierDialogDescription.displayName = "AtelierDialogDescription";

export const AtelierDialogClose = forwardRef<
  HTMLButtonElement,
  { className?: string; style?: React.CSSProperties; children: ReactNode }
>(({ className, style, children }, ref) => {
  const { onOpenChange } = useDialogContext();
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpenChange(false)}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
});

AtelierDialogClose.displayName = "AtelierDialogClose";
