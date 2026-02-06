import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "./CourseCard";

const CoursesSection = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const getCourses = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/courses");
      setCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
              Featured <span className="text-primary italic">Courses</span>
            </h2>
            <p className="text-lg text-gray-600">
              our popular courses rignt now!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {courses.map((course) => (
            <CourseCard key={course._id || course.id} course={course} />
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/course-list")}
            className="px-10 py-4 bg-white border-2 border-primary text-primary rounded-full font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-lg flex items-center gap-2"
          >
            👉 View All Courses
          </button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
