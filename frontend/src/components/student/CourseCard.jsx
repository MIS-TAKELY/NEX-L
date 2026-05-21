import { Icon } from '@iconify/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRateCourseMutation } from '../../store/slices/courseApi';
import { useToast } from '../../context/ToastContext';

const CourseCard = ({ enrollment }) => {
  const navigate = useNavigate();
  const { course, progress } = enrollment;
  const [rateCourse, { isLoading }] = useRateCourseMutation();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleRate = async (e) => {
    e.stopPropagation();
    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }
    try {
      await rateCourse({ courseId: course._id, rating, review }).unwrap();
      showToast("Rating submitted successfully!", "success");
      setIsOpen(false);
    } catch (err) {
      showToast(err.data?.message || "Failed to submit rating", "error");
    }
  };

  const progressColor = progress >= 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-primary' : 'bg-amber-500';
  const progressLabel = progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
      onClick={() => !isOpen && navigate(`/student/player/${course._id}`)}
      className="group cursor-pointer glass-card rounded-xl flex flex-col h-full relative overflow-hidden bg-card/60"
    >

      <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
        <img
          src={course.thumbnail || "https://via.placeholder.com/400x225?text=No+Thumbnail"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold rounded-full border border-white/20 uppercase tracking-wide shadow-lg flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {course.category}
        </div>

        {progress >= 100 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-semibold rounded-full flex items-center gap-1">
            <Icon icon="solar:check-circle-bold" className="w-3 h-3" />
            Completed
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 relative z-10">
        <h3 className="text-base font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {course.title}
        </h3>

        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Icon icon="solar:chart-line-bold" className="text-primary w-3.5 h-3.5" />
              {progressLabel}
            </span>
            <span className={`text-sm font-semibold ${progress >= 100 ? 'text-emerald-500' : 'text-primary'}`}>{progress}%</span>
          </div>

          <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className={`h-full ${progressColor} rounded-full`}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon icon="solar:user-bold" className="text-primary w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground line-clamp-1">
              {course.teacher?.name || "Instructor"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-4 pt-0" onClick={(e) => e.stopPropagation()}>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button
              className="flex-1 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition-colors text-xs font-medium"
              title="Rate Course"
            >
              <Icon icon="solar:star-bold" className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rate</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Rate Course</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Icon
                      icon={star <= rating ? "solar:star-bold" : "solar:star-outline"}
                      className={`w-8 h-8 ${star <= rating ? "text-amber-400" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
              <div className="grid gap-2">
                <label htmlFor="review" className="text-sm font-medium">Review (Optional)</label>
                <textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="What did you think about this course?"
                />
              </div>
              <button
                onClick={handleRate}
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all"
              >
                {isLoading ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <button
          className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors text-xs font-semibold shadow-md shadow-primary/20"
          title="Continue Learning"
          onClick={() => navigate(`/student/player/${course._id}`)}
        >
          <Icon icon="solar:play-bold" className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Continue</span>
        </button>
      </div>
    </motion.div>
  );
};

export default CourseCard;
