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

const MyEnrollments = () => {

  const { userData } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { data: upcomingClasses = [], isLoading: loadingClasses } = useGetUpcomingLiveClassesQuery(undefined, {
    skip: !userData?._id && !userData?.id,
    pollingInterval: 10000 // Poll every 10s to catch new live classes
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

  if (loading || loadingClasses) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Fetching your learning journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
          <Icon icon="solar:danger-bold" className="text-red-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 max-w-md mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-primary text-foreground rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-background font-outfit text-foreground overflow-hidden">
      {/* Background Effects */}
      <div className="gradient-mesh fixed inset-0 pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3 tracking-tight">
            My <span className="text-gradient">Enrollments</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            You are currently enrolled in <span className="text-primary font-bold">{enrollments.length}</span> course{enrollments.length !== 1 ? 's' : ''}
          </p>
        </motion.div>


      {upcomingClasses.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
              <Icon icon="solar:videocamera-record-bold-duotone" className="text-red-500 w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Upcoming Live Classes</h2>
              <p className="text-sm text-muted-foreground">Don't miss out on your scheduled sessions</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingClasses.map((liveClass, index) => (
              <motion.div 
                key={liveClass._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="glass-card premium-card rounded-3xl p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4">
                   <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-500/30 animate-pulse uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" /> {liveClass.status === 'live' ? 'LIVE NOW' : 'LIVE SOON'}
                   </div>
                </div>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                    <img src={liveClass.course?.thumbnail || '/placeholder-course.png'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">{liveClass.title}</h3>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{liveClass.course?.title}</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium bg-white/5 p-3 rounded-2xl border border-white/5">
                    <Icon icon="solar:calendar-bold" className="text-primary w-5 h-5" />
                    <span>{dayjs(liveClass.startTime).format('MMM D, YYYY')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium bg-white/5 p-3 rounded-2xl border border-white/5">
                    <Icon icon="solar:clock-circle-bold" className="text-primary w-5 h-5" />
                    <span>{dayjs(liveClass.startTime).format('h:mm A')} ({liveClass.duration} min)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Icon icon="solar:user-bold" className="text-primary w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">by {liveClass.teacher?.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/student/live/${liveClass.course?._id}`)}
                  className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 group/btn active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                  <Icon icon="solar:play-bold" className="group-hover/btn:scale-110 transition-transform" />
                  Join Room
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}


      {enrollments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center justify-center py-24 glass-card premium-card rounded-[2.5rem] text-center px-4 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="w-28 h-28 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 border border-primary/20 shadow-2xl relative z-10">
            <Icon icon="solar:globus-bold-duotone" className="text-primary w-14 h-14" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight text-gradient">No enrollments yet</h2>
            <p className="text-muted-foreground max-w-sm mb-10 text-lg font-medium">
              Start your learning journey today by exploring our wide range of professional courses.
            </p>
            <button
              onClick={() => window.location.href = '/course-list'}
              className="px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 active:scale-95 flex items-center gap-3 mx-auto group"
            >
              Explore Courses 
              <Icon icon="solar:arrow-right-bold" className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {enrollments.map((enrollment, index) => (
            <div key={enrollment._id} className={`stagger-${(index % 5) + 1}`}>
               <CourseCard enrollment={enrollment} />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  </div>

  );
};

export default MyEnrollments;
