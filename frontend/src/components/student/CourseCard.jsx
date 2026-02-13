import { Icon } from '@iconify/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ enrollment }) => {
  const navigate = useNavigate();
  const { course, progress } = enrollment;

  return (
    <div
      onClick={() => navigate(`/student/player/${course._id}`)}
      className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-gray-100 dark:border-zinc-800 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative h-48 mb-4 overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={course.thumbnail || "https://via.placeholder.com/400x225?text=No+Thumbnail"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-primary/90 backdrop-blur-md text-white text-xs font-bold rounded-full">
          {course.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4 line-clamp-2 italic">
          {course.description}
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</span>
            <span className="text-sm font-extrabold text-primary">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer / Instructor */}
      <div className="mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Icon icon="solar:user-bold" className="text-accent" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            {course.teacher?.name || "Instructor"}
          </span>
        </div>

        <button
          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
          title="Continue Learning"
        >
          <Icon icon="solar:play-bold" size={20} />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
