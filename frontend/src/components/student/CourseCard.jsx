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
      className="group cursor-pointer bg-card rounded-xl border border-border/50 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 flex flex-col h-full premium-card glass-card max-w-[280px] mx-auto w-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-xl bg-muted">
        <img
          src={course.thumbnail || "https://via.placeholder.com/400x225?text=No+Thumbnail"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-background/80 backdrop-blur-md text-primary text-[10px] font-bold rounded-full border border-white/10 uppercase tracking-widest shadow-lg">
          {course.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-1">
        <h3 className="text-base font-bold text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors font-outfit" title={course.title}>
          {course.title}
        </h3>

        <p className="text-[10px] text-muted-foreground mb-4 line-clamp-2 italic font-medium opacity-80">
          {course.description}
        </p>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
            <span className="text-[10px] font-black text-primary">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/20">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Footer / Instructor */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Icon icon="solar:user-bold" className="text-primary text-[10px]" />
          </div>
          <span className="text-[11px] font-semibold text-foreground/80">
            {course.teacher?.name || "Instructor"}
          </span>
        </div>

        <button
          className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group/btn shadow-sm"
          title="Continue Learning"
        >
          <Icon icon="solar:play-bold" className="text-xs group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default CourseCard;
