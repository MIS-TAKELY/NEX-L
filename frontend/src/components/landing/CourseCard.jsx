import React from 'react';
import { Star, Users, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, index }) => {
  const navigate = useNavigate();

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/course/${course._id || course.id}`)}
      className="group cursor-pointer bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col premium-card glass-card h-full"
    >
      {/* Image Container with Overlay */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={course.image || course.thumbnail} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest shadow-lg border border-white/10">
          {course.category}
        </div>

        {course.featured && (
          <div className="absolute top-4 right-4 bg-primary px-3 py-1.5 rounded-full text-[10px] font-bold text-primary-foreground uppercase tracking-widest shadow-lg">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col max-w-[280px] mx-auto w-full">
        <h3 className="text-lg font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors text-foreground mb-3 font-outfit" title={course.title}>
          {course.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-2.5 h-2.5 text-primary" />
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">{course.instructor || "Expert Instructor"}</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1 py-3 border-y border-border/50 mb-4">
          <div className="flex flex-col items-center gap-0.5 border-r border-border/50">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span className="text-[10px] font-bold">{course.rating || "4.8"}</span>
            </div>
            <span className="text-[8px] uppercase text-muted-foreground font-bold tracking-tighter">Rating</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 border-r border-border/50">
            <span className="text-[10px] font-bold text-foreground">{course.students || "1.2K"}</span>
            <span className="text-[8px] uppercase text-muted-foreground font-bold tracking-tighter">Students</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-bold text-foreground">{course.duration || "20h"}</span>
            <span className="text-[8px] uppercase text-muted-foreground font-bold tracking-tighter">Duration</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-0.5">Price</span>
            <span className="text-lg font-black text-foreground truncate max-w-[120px]" title={course.price}>
              {course.price || "Free"}
            </span>
          </div>
          <button className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group/btn">
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default CourseCard;
