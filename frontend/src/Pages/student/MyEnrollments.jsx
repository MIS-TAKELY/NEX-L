import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserEnrollments } from '../../apis/enrollment.api';
import CourseCard from '../../components/student/CourseCard';
import { useGetUpcomingLiveClassesQuery } from '../../store/slices/liveClassApi';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

import { motion } from 'motion/react';

import { Skeleton } from '@/components/ui/skeleton';
import CourseSkeleton from '../../components/skeletons/CourseSkeleton';

const MyEnrollments = () => {

  const { userData } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { data: upcomingClasses = [], isLoading: loadingClasses } = useGetUpcomingLiveClassesQuery(undefined, {
    skip: !userData?._id && !userData?.id,
    pollingInterval: 10000
  });

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!userData?._id && !userData?.id) return;
      try {
        setLoading(true);
        const data = await getUserEnrollments(userData._id || userData.id);
        setEnrollments(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
        setError("Could not load your enrollments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [userData]);

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
    : 0;

  const completedCourses = enrollments.filter(e => e.progress >= 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

  if (loading || loadingClasses) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-56 md:h-14" />
          <Skeleton className="h-5 w-72 max-w-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card premium-card rounded-2xl p-12 max-w-md"
        >
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-xl flex items-center justify-center mb-6">
            <Icon icon="solar:danger-bold" className="text-destructive" size={32} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-background font-outfit text-foreground overflow-hidden">
      <div className="gradient-mesh fixed inset-0 pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              My <span className="text-gradient">Enrollments</span>
            </h1>
            <p className="text-muted-foreground text-base mt-1">
              Track your progress and continue learning
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/course-list'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-lg font-semibold text-sm hover:bg-primary/20 transition-colors border border-primary/20"
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
            Browse Courses
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <motion.div whileHover={{ y: -2 }} className="glass-card rounded-xl p-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
              <Icon icon="solar:book-bookmark-bold" className="text-primary w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{enrollments.length}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Total Courses</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="glass-card rounded-xl p-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center mb-3">
              <Icon icon="solar:check-circle-bold" className="text-emerald-500 w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{completedCourses}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Completed</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="glass-card rounded-xl p-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-3">
              <Icon icon="solar:clock-circle-bold" className="text-amber-500 w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{inProgressCourses}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">In Progress</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="glass-card rounded-xl p-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-3">
              <Icon icon="solar:chart-bold" className="text-blue-500 w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{totalProgress}%</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Avg. Progress</p>
          </motion.div>
        </motion.div>

        {upcomingClasses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Icon icon="solar:videocamera-record-bold-duotone" className="text-red-500 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Upcoming Live Classes</h2>
                <p className="text-sm text-muted-foreground">Don't miss your scheduled sessions</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingClasses.map((liveClass, index) => (
                <motion.div 
                  key={liveClass._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: 0.05 + index * 0.03 }}
                  className="glass-card rounded-xl p-5 relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/20 uppercase tracking-wide">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" /> {liveClass.status === 'live' ? 'LIVE NOW' : 'UPCOMING'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-5 pr-20">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/50 shadow-md flex-shrink-0">
                      <img src={liveClass.course?.thumbnail || '/placeholder-course.png'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-base line-clamp-1">{liveClass.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{liveClass.course?.title}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Icon icon="solar:calendar-bold" className="text-primary w-4 h-4 flex-shrink-0" />
                      <span>{dayjs(liveClass.startTime).format('MMM D, YYYY')}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Icon icon="solar:clock-circle-bold" className="text-primary w-4 h-4 flex-shrink-0" />
                      <span>{dayjs(liveClass.startTime).format('h:mm A')} · {liveClass.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Icon icon="solar:user-bold" className="text-primary w-4 h-4 flex-shrink-0" />
                      <span>{liveClass.teacher?.name}</span>
                    </div>
                  </div>
                    <button
                    onClick={() => navigate(`/student/live/${liveClass.course?._id}`)}
                    className="w-full py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <Icon icon="solar:play-bold" className="w-4 h-4" />
                    Join Room
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {enrollments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-20 glass-card rounded-2xl text-center px-4"
          >
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <Icon icon="solar:globus-bold-duotone" className="text-primary w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No enrollments yet</h2>
            <p className="text-muted-foreground max-w-sm mb-8 text-base">
              Start your learning journey today by exploring our wide range of professional courses.
            </p>
            <button
              onClick={() => window.location.href = '/course-list'}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Explore Courses 
              <Icon icon="solar:arrow-right-bold" className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.15 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="text-primary w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">My Courses</h2>
                <p className="text-sm text-muted-foreground">Continue where you left off</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => (
                <motion.div 
                  key={enrollment._id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: 0.02 * (index % 6) }}
                >
                   <CourseCard enrollment={enrollment} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyEnrollments;
