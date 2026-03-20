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

const MyEnrollments = () => {
  const { userData } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { data: upcomingClasses = [], isLoading: loadingClasses } = useGetUpcomingLiveClassesQuery(undefined, {
    skip: !userData?._id && !userData?.id
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            My <span className="text-primary italic">Enrollments</span>
          </h1>
          <p className="text-gray-500 font-medium">
            You are currently enrolled in {enrollments.length} course{enrollments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {upcomingClasses.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Icon icon="solar:videocamera-record-bold-duotone" className="text-red-500 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Live Classes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingClasses.map((liveClass) => (
              <div key={liveClass._id} className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE SOON
                   </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <img src={liveClass.course?.thumbnail || '/placeholder-course.png'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{liveClass.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">{liveClass.course?.title}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon icon="solar:calendar-bold" className="text-primary" />
                    <span>{dayjs(liveClass.startTime).format('MMM D, YYYY')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon icon="solar:clock-circle-bold" className="text-primary" />
                    <span>{dayjs(liveClass.startTime).format('h:mm A')} ({liveClass.duration} min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon icon="solar:user-bold" className="text-primary" />
                    <span className="text-xs">by {liveClass.teacher?.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/student/live/${liveClass.course?._id}`)}
                  className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <Icon icon="solar:play-bold" />
                  Join Room
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 text-center px-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Icon icon="solar:globus-bold" className="text-primary" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">No enrollments yet</h2>
          <p className="text-gray-500 dark:text-zinc-400 max-w-sm mb-8">
            Start your learning journey today by exploring our wide range of professional courses.
          </p>
          <button
            onClick={() => window.location.href = '/course-list'}
            className="px-10 py-4 bg-primary text-foreground rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-xl hover:shadow-primary/20 active:scale-95 flex items-center gap-2"
          >
            Explore Courses <Icon icon="solar:arrow-right-bold" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enrollment) => (
            <CourseCard key={enrollment._id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
