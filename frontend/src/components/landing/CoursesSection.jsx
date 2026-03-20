import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "./CourseCard";

const CoursesSection = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const getCourses = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const res = await axios.get(`${backendUrl}/api/v1/courses`);
      setCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <section className="py-48 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-32 gap-6">
          <div className="max-w-2xl text-left">
            <h2 className="text-6xl md:text-7xl font-black mb-8 text-foreground leading-[1] tracking-tighter serif">
              Featured <span className="text-primary italic">Courses</span>
            </h2>
            <p className="text-xl text-muted-foreground font-normal max-w-xl">
              Explore our handpicked premium courses, designed for depth and professional mastery.
            </p>
          </div>
        </div>

        {/* Dynamic Masonry-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-32">
          {courses.map((course, index) => (
            <div 
              key={course._id || course.id} 
              className={`${
                index === 0 || index === 3 ? "lg:col-span-2 lg:row-span-1" : "col-span-1"
              } transition-all duration-700 hover:-translate-y-2`}
            >
              <CourseCard course={course} isFeatured={index === 0 || index === 3} />
            </div>
          ))}
        </div>

        <div className="flex justify-start">
          <button
            onClick={() => navigate("/course-list")}
            className="px-12 py-6 bg-primary text-primary-foreground rounded-3xl font-bold text-xl hover:bg-primary-hover transition-all duration-500 shadow-2xl shadow-primary/10 flex items-center gap-4 group"
          >
            Explore All Courses
            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
