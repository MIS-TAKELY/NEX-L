import React from 'react';
import CourseCard from './CourseCard';
import { courses } from '../../data/landingData';

const Courses = () => {
  return (
    <section id="courses" className="py-20 md:py-32 px-6 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 md:mb-24 max-w-2xl text-left">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-foreground leading-[1] tracking-tighter serif">
            Featured <span className="text-primary italic">Courses</span>
          </h2>
          <p className="text-xl text-muted-foreground font-normal max-w-xl font-outfit">
            Explore our handpicked premium courses, designed for depth and professional mastery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary transition-colors group">
            View all courses
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Courses;
