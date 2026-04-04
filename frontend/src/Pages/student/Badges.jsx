import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import { getMyBadges } from "../../apis/badge.api";
import BadgeCard from "../../components/student/BadgeCard";

const TYPE_FILTERS = [
  { key: "all", label: "All", icon: "solar:medal-ribbons-star-bold-duotone" },
  { key: "quiz_score", label: "Quiz", icon: "solar:diploma-verified-bold-duotone" },
  { key: "assignment", label: "Assignment", icon: "solar:document-add-bold-duotone" },
  { key: "participation", label: "Participation", icon: "solar:users-group-rounded-bold-duotone" },
  { key: "course_completion", label: "Completion", icon: "solar:cup-star-bold-duotone" },
];

const LEVEL_FILTERS = ["all", "bronze", "silver", "gold"];

const levelEmojis = { bronze: "🥉", silver: "🥈", gold: "🥇" };

export default function Badges() {
  const { userData } = useSelector((state) => state.auth);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await getMyBadges();
        setEarnedBadges(res.data || []);
      } catch (err) {
        console.error("Failed to load badges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  // Filter earned badges
  const filtered = earnedBadges.filter((ub) => {
    const badgeType = ub.badge?.type;
    const badgeLevel = ub.badge?.level;
    const matchType = typeFilter === "all" || badgeType === typeFilter;
    const matchLevel = levelFilter === "all" || badgeLevel === levelFilter;
    return matchType && matchLevel;
  });

  const byLevel = (level) => earnedBadges.filter((ub) => ub.badge?.level === level).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-md overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 mb-10"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-md blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-500/5 rounded-md blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3 serif italic">
              Achievement Center
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-foreground serif mb-3">
              My <span className="text-primary italic">Badges</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-lg">
              Earn badges by excelling in quizzes, assignments, and class participation. Every achievement counts!
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 flex-wrap">
            {[
              { label: "Earned", value: earnedBadges.length, icon: "solar:medal-star-bold", color: "text-primary" },
              { label: "Gold", value: byLevel("gold"), icon: "🥇", emoji: true, color: "text-yellow-400" },
              { label: "Silver", value: byLevel("silver"), icon: "🥈", emoji: true, color: "text-slate-400" },
              { label: "Bronze", value: byLevel("bronze"), icon: "🥉", emoji: true, color: "text-amber-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card/60 backdrop-blur border border-border rounded-md px-5 py-4 text-center min-w-[80px]">
                <div className={`text-2xl font-black ${stat.color} serif`}>
                  {stat.emoji ? stat.icon : <Icon icon={stat.icon} className={stat.color} size={24} />}
                </div>
                <div className="text-xl font-black text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        {/* Type filter */}
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all border
                ${typeFilter === f.key
                  ? "bg-primary text-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
            >
              <Icon icon={f.icon} size={14} />
              {f.label}
            </button>
          ))}
        </div>

        {/* Level filter */}
        <div className="flex gap-2 ml-auto">
          {LEVEL_FILTERS.map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-3 py-2 rounded-md text-xs font-bold capitalize transition-all border
                ${levelFilter === l
                  ? "bg-primary text-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
                }`}
            >
              {l === "all" ? "All Levels" : `${levelEmojis[l]} ${l}`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Badge Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 rounded-md bg-card animate-pulse border border-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-24 h-24 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-5xl">
            🏅
          </div>
          <h2 className="text-2xl font-black text-foreground serif mb-3">
            {earnedBadges.length === 0 ? "No badges yet" : "No badges match the filter"}
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            {earnedBadges.length === 0
              ? "Complete quizzes, assignments, and participate in your courses to unlock badges."
              : "Try changing the filters to see your earned badges."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((userBadge, i) => (
            <motion.div
              key={userBadge._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <BadgeCard
                badge={userBadge.badge}
                earned={true}
                awardedAt={userBadge.createdAt}
                awardedFor={userBadge.awardedFor}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
