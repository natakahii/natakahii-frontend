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

const TOAST_DURATION = 3000; // 3 seconds auto-dismiss

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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none w-auto max-w-[90vw]">
      {activeToasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = {
    success: { icon: CheckCircle2, color: "text-[#16A34A]" },
    error: { icon: XCircle, color: "text-[#DC2626]" },
    warning: { icon: AlertTriangle, color: "text-[#D97706]" },
    info: { icon: Info, color: "text-[#0284C7]" },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div 
      onClick={onDismiss}
      className="bg-gray-900/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto border border-white/10 flex items-center px-4 py-2.5 cursor-pointer animate-in slide-in-from-bottom-5 fade-in duration-300 hover:scale-105 transition-all"
    >
      <Icon className={cn("w-4 h-4 shrink-0 mr-2.5", config.color)} />
      <span className="text-[13px] font-medium text-white line-clamp-1">
        {toast.title} {toast.message ? <span className="text-gray-300 ml-1 font-normal">- {toast.message}</span> : ''}
      </span>
    </div>
  );
}
