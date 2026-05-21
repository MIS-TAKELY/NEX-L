import { Icon } from "@iconify/react";
import ConsultationClient from "./ConsultationClient";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const ConsultationModal = ({ sessionId, onClose, isInstructor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [consultationInfo, setConsultationInfo] = useState(null);

  if (!sessionId) return null;

  const headerTitle = consultationInfo
    ? `Consultation with ${consultationInfo.studentName || "Student"}`
    : "One-on-One Consultation";

  const headerSubtitle = consultationInfo?.courseTitle || "";

  return (
    <div className={`fixed z-[9999] pointer-events-none transition-all duration-300 ${isExpanded ? 'inset-0' : 'bottom-6 right-6'}`}>
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className={`${isExpanded ? 'w-full h-full rounded-none' : 'w-[420px] h-[620px] rounded-md'} overflow-hidden relative pointer-events-auto flex flex-col transition-all duration-300`}
        style={{
          background: "var(--card)",
          border: isExpanded ? "none" : "1px solid var(--border)",
          boxShadow: isExpanded ? "none" : "0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px var(--border)"
        }}
      >
        {/* Top gradient accent bar */}
        <div className="h-0.5 w-full flex-shrink-0 bg-gradient-to-r from-primary via-accent to-primary" />

        {/* Header / Call Info */}
        <div
          className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
          style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-md bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-md h-2.5 w-2.5 bg-green-500" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest truncate block" style={{ color: "var(--muted-foreground)" }}>
                {headerTitle}
              </span>
              {headerSubtitle && (
                <span className="text-[8px] font-semibold uppercase tracking-wider opacity-60 truncate block" style={{ color: "var(--muted-foreground)" }}>
                  {headerSubtitle}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
               onClick={() => setIsExpanded(!isExpanded)}
               className="w-8 h-8 rounded-md flex items-center justify-center transition-all active:scale-95"
               style={{ color: "var(--muted-foreground)" }}
               title={isExpanded ? "Minimize" : "Expand"}
            >
              <Icon icon={isExpanded ? "solar:minimize-square-3-bold-duotone" : "solar:maximize-square-3-bold-duotone"} className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all active:scale-95"
              style={{ color: "var(--destructive)" }}
              title="End Call"
            >
              <Icon icon="fluent:call-end-24-filled" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video area - always dark for visibility */}
        <div className="flex-1 overflow-hidden relative bg-[#1a1a2e]">
          <ConsultationClient 
            sessionId={sessionId} 
            onLeave={onClose} 
            isInstructor={isInstructor}
            isExpanded={isExpanded}
            onInfoLoaded={setConsultationInfo}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ConsultationModal;
