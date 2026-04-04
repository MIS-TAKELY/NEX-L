import { Icon } from '@iconify/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const CourseCard = ({ enrollment }) => {
  const navigate = useNavigate();
  const { course, progress } = enrollment;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/student/player/${course._id}`)}
      className="group cursor-pointer glass-card premium-card rounded-md border border-white/10 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 flex flex-col h-full relative overflow-hidden w-full max-w-[320px] mx-auto bg-card"
    >
      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Thumbnail */}
      <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-md border border-white/5 shadow-inner">
        <img
          src={course.thumbnail || "https://via.placeholder.com/400x225?text=No+Thumbnail"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        <div className="absolute top-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-black rounded-md border border-white/20 uppercase tracking-widest shadow-xl flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-md bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
          {course.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col relative z-10 px-0.5">
        <h3 className="text-lg font-bold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors tracking-tight leading-tight">
          {course.title}
        </h3>

        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 font-medium leading-relaxed">
          {course.description}
        </p>

        <div className="mt-auto space-y-2.5 bg-secondary/50 dark:bg-card/5 p-3 rounded-md border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Icon icon="solar:chart-line-bold" className="text-primary w-3.5 h-3.5" />
              Progress
            </span>
            <span className="text-xs font-black text-primary">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-muted/60 rounded-md overflow-hidden border border-border/50">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-primary relative"
            >
              <div className="absolute inset-0 w-full h-full relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[-100%] w-[50%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer / Instructor */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between px-0.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Icon icon="solar:user-bold" className="text-primary w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Instructor</span>
            <span className="text-xs font-bold text-foreground line-clamp-1 max-w-[100px]">
              {course.teacher?.name || "Instructor"}
            </span>
          </div>
        </div>

        <button
          className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all duration-300 group/btn shadow-lg shadow-primary/30 active:scale-95"
          title="Continue Learning"
        >
          <Icon icon="solar:play-bold" className="w-5 h-5 group-hover/btn:scale-110 transition-transform ml-0.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default CourseCard;
