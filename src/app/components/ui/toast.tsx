import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "./utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const TOAST_DURATION = 4000; // 4 seconds auto-dismiss

let toastId = 0;
const getToastId = () => `toast-${toastId++}`;

// Simple singleton pattern for toasts
type Subscriber = (toasts: Toast[]) => void;
let toasts: Toast[] = [];
let subscribers: Subscriber[] = [];

const subscribe = (callback: Subscriber) => {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter((sub) => sub !== callback);
  };
};

const notifySubscribers = () => {
  subscribers.forEach((sub) => sub([...toasts]));
};

export const toast = (props: Omit<Toast, "id">) => {
  const id = getToastId();
  toasts = [...toasts, { ...props, id }];
  notifySubscribers();

  setTimeout(() => {
    dismiss(id);
  }, props.duration || TOAST_DURATION);

  return id;
};

const dismiss = (id: string) => {
  toasts = toasts.filter((t) => t.id !== id);
  notifySubscribers();
};

export const useToast = () => {
  return { toast, dismiss };
};

export function Toaster() {
  const [activeToasts, setActiveToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribe(setActiveToasts);
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 pointer-events-none w-[340px] max-w-[calc(100vw-2rem)]">
      {activeToasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || TOAST_DURATION;

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      if (remaining <= 0) {
        setProgress(0);
        clearInterval(interval);
      } else {
        setProgress((remaining / duration) * 100);
      }
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [duration]);

  const config = {
    success: { icon: CheckCircle2, border: "border-[#16A34A]", bg: "bg-[#16A34A]", color: "text-[#16A34A]" },
    error: { icon: XCircle, border: "border-[#DC2626]", bg: "bg-[#DC2626]", color: "text-[#DC2626]" },
    warning: { icon: AlertTriangle, border: "border-[#D97706]", bg: "bg-[#D97706]", color: "text-[#D97706]" },
    info: { icon: Info, border: "border-[#0284C7]", bg: "bg-[#0284C7]", color: "text-[#0284C7]" },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "relative bg-white rounded-xl shadow-[var(--shadow-level-3)] pointer-events-auto border border-[#E2E6F0] overflow-hidden flex flex-col animate-in slide-in-from-top-2 fade-in duration-300",
        `border-l-4 ${config.border}`
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.color)} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-bold text-[#1A2035] leading-tight">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-[13px] text-[#4A5468] mt-1 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-[#9BA5BC] hover:bg-[#F0F2F8] p-1 rounded-full transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar at bottom */}
      <div className="h-1 bg-[#F8F9FC] w-full shrink-0">
        <div
          className={cn("h-full transition-all ease-linear", config.bg)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
