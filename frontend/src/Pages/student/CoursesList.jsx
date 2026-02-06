import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";
import CourseCard from "../../components/landing/CourseCard";

const CoursesList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState([]);

  const getCourses = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/courses");
      setCourses(res.data);
      console.log("course response -->", res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-outfit text-gray-800">
      <Navbar />

      <main className="flex-1 bg-gray-50 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2 leading-tight">
                All <span className="italic text-accent">Courses</span>
              </h1>
              <p className="text-gray-500 max-w-lg">
                Find exactly what you're looking for to take your skills to the
                next level.
              </p>
            </div>

            <div className="relative w-full md:w-96 group">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search courses (e.g. Python, MERN...)"
                className="w-full pl-12 pr-6 py-4 bg-white border-2 border-transparent focus:border-primary rounded-2xl shadow-sm outline-none transition-all text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {courses.map((course) => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesList;
