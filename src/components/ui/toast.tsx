"use client"

import * as React from "react"
import { Loader2, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-md border px-4 py-3 shadow-md transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success: "bg-emerald-50 text-emerald-800 border-emerald-200",
        error: "bg-red-50 text-red-800 border-red-200",
        loading: "bg-blue-50 text-blue-800 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof toastVariants> {
  open?: boolean;
  onClose?: () => void;
  loading?: boolean;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, children, open = false, onClose, loading = false, ...props }, ref) => {
    if (!open) return null;
    
    return (
      <div
        ref={ref}
        data-state={open ? "open" : "closed"}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-black/10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = "Toast";

export { Toast, toastVariants }; 