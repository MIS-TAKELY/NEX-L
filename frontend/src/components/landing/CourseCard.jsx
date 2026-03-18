import React from 'react';

const CourseCard = ({ course, index }) => {
  return (
    <article 
      className="group cursor-pointer hover-lift font-outfit"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="aspect-[4/3] mb-5 overflow-hidden bg-gray-100 rounded-2xl relative">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider shadow-sm">
          {course.category}
        </div>
      </div>
      <div className="space-y-2 px-1">
        <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors text-foreground">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground">{course.instructor}</p>
        <p className="text-base font-bold pt-1 text-foreground">{course.price}</p>
      </div>
    </article>
  );
};

export default CourseCard;
