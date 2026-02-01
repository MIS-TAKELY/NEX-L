import { useNavigate } from 'react-router-dom';
import CourseCard from './CourseCard';

const CoursesSection = () => {
  const navigate = useNavigate();
  const courses = [
    {
      id: 'mern-stack',
      title: 'Full-Stack Web Development (MERN)',
      benefit: 'Build production-ready full-stack applications',
      description: 'Master MongoDB, Express, React, and Node.js. Learn to build scalable web apps from scratch.',
      instructor: 'Mr. Ram',
      price: '4,500',
      category: 'Web Development',
      level: 'Intermediate',
      image: '/courses/web-dev.png'
    },
    {
      id: 'dsa-mastery',
      title: 'Data Structures & Algorithms',
      benefit: 'Ace your college exams & technical interviews',
      description: 'Comprehensive DSA guide from fundamentals to advanced patterns. Perfect for placements.',
      instructor: 'Ms. Sita',
      price: '5,000',
      category: 'Programming',
      level: 'Beginner+',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'python-beginners',
      title: 'Python for Beginners',
      benefit: 'Start your coding journey with the most popular language',
      description: 'No prior experience needed. Learn Python basics, automation, and basic data analysis.',
      instructor: 'Mr. Shyam',
      price: '3,500',
      category: 'Programming',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop'
    }
  ];

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
              Hand-picked courses to help you master the most in-demand skills.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/course-list')}
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
