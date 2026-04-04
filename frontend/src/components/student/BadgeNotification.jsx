import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "motion/react";

/**
 * BadgeNotification — shows a toast when a student earns new badges.
 *
 * Props:
 *  - badges: Array of badge objects returned from the server after a quiz/assignment submission
 *  - onClose: callback when dismissed
 */
const BadgeNotification = ({ badges = [], onClose }) => {
  const [visible, setVisible] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!badges.length) return;
    // Auto-dismiss after 5 seconds per badge
    const timer = setTimeout(() => {
      if (current < badges.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        setVisible(false);
        onClose?.();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [current, badges.length, onClose]);

  if (!visible || !badges.length) return null;

  const badge = badges[current];
  const levelColors = {
    bronze: { bg: "from-amber-700/30 to-amber-600/10", border: "border-amber-500/60", text: "text-amber-400" },
    silver: { bg: "from-slate-400/30 to-slate-300/10", border: "border-slate-400/60", text: "text-slate-300" },
    gold:   { bg: "from-yellow-500/30 to-yellow-400/10", border: "border-yellow-400/60", text: "text-yellow-400" },
  };
  const colors = levelColors[badge?.level] || levelColors.bronze;

  return (
    <AnimatePresence>
      <motion.div
        key={current}
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`fixed bottom-6 right-6 z-[9999] max-w-xs w-full rounded-md border p-5
          bg-gradient-to-br ${colors.bg} ${colors.border}
          backdrop-blur-xl shadow-2xl shadow-black/30`}
      >
        {/* Dismiss button */}
        <button
          onClick={() => { setVisible(false); onClose?.(); }}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <Icon icon="solar:close-circle-linear" size={18} />
        </button>

        {/* Confetti header */}
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="solar:stars-bold" className={`${colors.text} text-xl`} />
          <span className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>
            Badge Unlocked!
          </span>
          {badges.length > 1 && (
            <span className="ml-auto text-[10px] text-muted-foreground font-bold">
              {current + 1}/{badges.length}
            </span>
          )}
        </div>

        {/* Badge content */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-background/30 flex items-center justify-center text-4xl border border-border/40 shadow-inner flex-shrink-0">
            {badge?.icon || "🏅"}
          </div>
          <div>
            <h4 className="font-black text-foreground text-base serif leading-tight">
              {badge?.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {badge?.description || "Great job! Keep it up!"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-black/20 rounded-md overflow-hidden">
          <motion.div
            className={`h-full ${colors.text.replace("text-", "bg-")}`}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeNotification;
