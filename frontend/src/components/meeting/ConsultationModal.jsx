import { Icon } from "@iconify/react";
import ConsultationClient from "./ConsultationClient";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const ConsultationModal = ({ sessionId, onClose, isInstructor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sessionId) return null;

  return (
    <div className={`fixed z-[9999] pointer-events-none transition-all duration-300 ${isExpanded ? 'inset-4 md:inset-8 lg:inset-12' : 'bottom-6 right-6'}`}>
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className={`${isExpanded ? 'w-full h-full' : 'w-[380px] h-[580px]'} bg-background rounded-[2.5rem] border border-border/50 shadow-3xl overflow-hidden relative pointer-events-auto flex flex-col premium-card glass transition-all duration-300`}
      >
        {/* Header / Call Info */}
        <div className="h-12 bg-secondary/30 border-b border-border/50 flex items-center justify-between px-6 flex-shrink-0 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Consultation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
               onClick={() => setIsExpanded(!isExpanded)}
               className="w-8 h-8 rounded-full flex items-center justify-center transition-all text-muted-foreground hover:bg-secondary/50 hover:text-foreground active:scale-95"
               title={isExpanded ? "Minimize" : "Expand"}
            >
              <Icon icon={isExpanded ? "solar:minimize-square-3-bold-duotone" : "solar:maximize-square-3-bold-duotone"} className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95"
              title="End Call"
            >
              <Icon icon="solar:phone-hang-up-bold" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <ConsultationClient 
            sessionId={sessionId} 
            onLeave={onClose} 
            isInstructor={isInstructor}
            isExpanded={isExpanded}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ConsultationModal;
