import { Icon } from "@iconify/react";

const levelConfig = {
  bronze: {
    color: "from-amber-700/20 to-amber-600/10",
    border: "border-amber-600/40",
    badge: "bg-amber-700/20 text-amber-500 border-amber-600/50",
    glow: "shadow-amber-700/20",
    icon: "🥉",
    label: "Bronze",
  },
  silver: {
    color: "from-slate-400/20 to-slate-300/10",
    border: "border-slate-400/40",
    badge: "bg-slate-400/20 text-slate-400 border-slate-400/50",
    glow: "shadow-slate-400/20",
    icon: "🥈",
    label: "Silver",
  },
  gold: {
    color: "from-yellow-500/20 to-yellow-400/10",
    border: "border-yellow-500/40",
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    glow: "shadow-yellow-500/20",
    icon: "🥇",
    label: "Gold",
  },
};

const typeLabels = {
  quiz_score: { label: "Quiz Score", icon: "solar:diploma-verified-bold-duotone" },
  assignment: { label: "Assignment", icon: "solar:document-add-bold-duotone" },
  participation: { label: "Participation", icon: "solar:users-group-rounded-bold-duotone" },
  course_completion: { label: "Completion", icon: "solar:cup-star-bold-duotone" },
  batch_membership: { label: "Batch Member", icon: "solar:layers-minimalistic-bold-duotone" },
};

const BadgeCard = ({ badge, earned = false, awardedAt = null, awardedFor = "" }) => {
  const level = levelConfig[badge?.level] || levelConfig.bronze;
  const type = typeLabels[badge?.type] || { label: "Badge", icon: "solar:medal-ribbons-star-bold-duotone" };

  return (
    <div
      className={`relative rounded-md p-5 border transition-all duration-300 bg-gradient-to-br
        ${earned
          ? `${level.color} ${level.border} shadow-lg ${level.glow} hover:scale-[1.02] hover:shadow-xl`
          : "from-muted/30 to-muted/10 border-border/30 opacity-50 grayscale"
        }`}
    >
      {/* Earned glow overlay */}
      {earned && (
        <div className="absolute inset-0 rounded-md pointer-events-none overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-md blur-2xl" />
        </div>
      )}

      {/* Top row: icon + level badge */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-14 h-14 rounded-md bg-background/50 flex items-center justify-center text-3xl border border-border/50 shadow-inner backdrop-blur">
          {badge?.icon || "🏅"}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${level.badge}`}>
            {level.icon} {level.label}
          </span>
          {earned && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-md">
              ✓ Earned
            </span>
          )}
        </div>
      </div>

      {/* Name & description */}
      <div className="relative z-10">
        <h3 className="font-black text-foreground text-base mb-1 serif leading-tight">
          {badge?.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {badge?.description || `Score ≥ ${badge?.threshold}% to earn this badge.`}
        </p>

        {/* Type pill */}
        <div className="flex items-center gap-1.5">
          <Icon icon={type.icon} className="text-primary" size={13} />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {type.label}
          </span>
          <span className="ml-auto text-[10px] font-bold text-muted-foreground">
            ≥{badge?.threshold}%
          </span>
        </div>

        {/* Award date */}
        {earned && awardedAt && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground">
              <span className="font-bold text-foreground/60">Awarded:</span>{" "}
              {new Date(awardedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            {awardedFor && (
              <p className="text-[10px] text-primary/70 mt-0.5">{awardedFor}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeCard;
