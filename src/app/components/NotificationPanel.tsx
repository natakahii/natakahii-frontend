import { useState } from "react";
import { createPortal } from "react-dom";
import { Bell, X, CheckCircle2, Box, MessageSquare, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { EmptyState } from "./ui/empty-state";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  group: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications: NotificationItem[] = [];

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return <Box className="w-5 h-5 text-[#142490]" />;
      case "message": return <MessageSquare className="w-5 h-5 text-[#F05A28]" />;
      case "alert": return <AlertCircle className="w-5 h-5 text-[#D97706]" />;
      case "success": return <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />;
      default: return <Bell className="w-5 h-5 text-[#9BA5BC]" />;
    }
  };

  const grouped = {
    today: notifications.filter(n => n.group === "today"),
    yesterday: notifications.filter(n => n.group === "yesterday"),
    older: notifications.filter(n => n.group === "older"),
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-[var(--shadow-level-4)] z-[150] flex flex-col border-l border-[#E2E6F0]"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#E2E6F0] bg-[#F8F9FC]">
              <h2 className="text-xl font-extrabold text-[#1A2035] tracking-tight">Notifications</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[13px] font-bold text-[#142490] hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-[#9BA5BC] hover:bg-[#E2E6F0] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white hide-scrollbar">
              {notifications.length === 0 ? (
                <EmptyState 
                  variant="notifications" 
                  title="You're all caught up!" 
                  description="No new notifications to show."
                />
              ) : (
                <>
                  {["today", "yesterday", "older"].map((group) => {
                    const items = grouped[group as keyof typeof grouped];
                    if (items.length === 0) return null;
                    return (
                      <div key={group}>
                        <h3 className="text-[12px] font-extrabold uppercase tracking-wider text-[#9BA5BC] mb-3">
                          {group}
                        </h3>
                        <div className="space-y-2">
                          {items.map((notif) => (
                            <div 
                              key={notif.id}
                              className={`relative group flex gap-4 p-4 rounded-[16px] border transition-colors ${
                                notif.unread ? "bg-[#E8EBFA] border-[#142490]/20" : "bg-white border-[#E2E6F0] hover:bg-[#F8F9FC]"
                              }`}
                            >
                              <div className="shrink-0 mt-1">
                                {getIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-[14px] leading-tight ${notif.unread ? "font-extrabold text-[#1A2035]" : "font-bold text-[#4A5468]"}`}>
                                  {notif.title}
                                </h4>
                                <p className="text-[13px] text-[#4A5468] mt-1 leading-snug">
                                  {notif.desc}
                                </p>
                                <div className="text-[11px] font-medium text-[#9BA5BC] mt-2">
                                  {notif.time}
                                </div>
                              </div>
                              
                              {notif.unread && (
                                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#F05A28] rounded-full animate-pulse shadow-sm" />
                              )}

                              <button 
                                onClick={() => handleDelete(notif.id)}
                                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-[#9BA5BC] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-full"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
