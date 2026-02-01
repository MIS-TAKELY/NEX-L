import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import Navbar from '../../components/common/Navbar';
import SocialTopbar from '../../components/common/SocialTopbar';
import CourseCard from '../../components/landing/CourseCard';

const CoursesList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const allCategories = [
    {
      name: 'Programming Foundations',
      courses: [
        { id: 'prog-basics', title: 'Programming Basics & Logic', benefit: 'Master core logic', level: 'Beginner', price: '2,000', instructor: 'Mr. Ram' },
        { id: 'python-beg', title: 'Python for Beginners', benefit: 'Learn Python easily', level: 'Beginner', price: '3,500', instructor: 'Mr. Shyam' },
        { id: 'c-prog', title: 'C Programming', benefit: 'Foundation for all', level: 'Beginner', price: '2,500', instructor: 'Mr. Ram' },
        { id: 'cpp-prog', title: 'C++ Programming', benefit: 'Performance coding', level: 'Beginner', price: '2,800', instructor: 'Mr. Ram' },
        { id: 'java-oop', title: 'Java Programming (OOP)', benefit: 'Enterprise foundations', level: 'Beginner', price: '3,200', instructor: 'Mr. Shyam' },
      ]
    },
    {
      name: 'Web Development',
      courses: [
        { id: 'frontend-basics', title: 'HTML, CSS, JavaScript', benefit: 'Start your UI journey', level: 'Beginner', price: '3,000', instructor: 'Ms. Sita' },
        { id: 'tailwind-css', title: 'Tailwind CSS', benefit: 'Modern styling', level: 'Beginner', price: '1,500', instructor: 'Ms. Sita' },
        { id: 'react-adv', title: 'React (Beginner → Advanced)', benefit: 'Build modern UIs', level: 'Intermediate', price: '4,500', instructor: 'Mr. Ram' },
        { id: 'node-express', title: 'Node.js & Express', benefit: 'Backend power', level: 'Intermediate', price: '4,000', instructor: 'Mr. Ram' },
        { id: 'mongodb-db', title: 'MongoDB & Database Design', benefit: 'Modern storage', level: 'Intermediate', price: '3,500', instructor: 'Mr. Ram' },
        { id: 'rest-api', title: 'REST APIs', benefit: 'Seamless communication', level: 'Intermediate', price: '2,500', instructor: 'Mr. Ram' },
        { id: 'mern-stack', title: 'MERN Stack Projects', benefit: 'Full-stack mastery', level: 'Advanced', price: '5,500', instructor: 'Mr. Ram' },
      ]
    },
    {
      name: 'Data Structures & Algorithms',
      courses: [
        { id: 'dsa-c', title: 'DSA in C / C++', benefit: 'Competitive edge', level: 'Intermediate', price: '4,000', instructor: 'Ms. Sita' },
        { id: 'dsa-java', title: 'DSA in Java', benefit: 'Enterprise prep', level: 'Intermediate', price: '4,000', instructor: 'Mr. Shyam' },
        { id: 'dsa-python', title: 'DSA in Python', benefit: 'AI & Data prep', level: 'Intermediate', price: '4,000', instructor: 'Mr. Shyam' },
      ]
    },
    {
      name: 'College / Exam Focused',
      courses: [
        { id: 'dbms-exam', title: 'DBMS Masterclass', benefit: 'Score better', level: 'Beginner', price: '2,500', instructor: 'Mr. Ram' },
        { id: 'os-basics', title: 'Operating Systems', benefit: 'Core CS concepts', level: 'Intermediate', price: '2,800', instructor: 'Mr. Shyam' },
        { id: 'cn-basics', title: 'Computer Networks', benefit: 'Connectivity fundamentals', level: 'Intermediate', price: '2,800', instructor: 'Ms. Sita' },
        { id: 'se-basics', title: 'Software Engineering', benefit: 'Professional methodologies', level: 'Intermediate', price: '2,500', instructor: 'Mr. Ram' },
      ]
    },
    {
      name: 'Projects',
      courses: [
        { id: 'mini-projects', title: 'Mini Projects (Beginner)', benefit: 'Build your confidence', level: 'Beginner', price: '1,500', instructor: 'Ms. Sita' },
        { id: 'project-bootcamp', title: 'Final Year Project Bootcamp', benefit: 'Build and document like a pro', level: 'Advanced', price: '6,000', instructor: 'Ms. Sita' },
        { id: 'git-basics', title: 'Git & GitHub Basics', benefit: 'Version control power', level: 'Beginner', price: '1,000', instructor: 'Mr. Shyam' },
      ]
    },
    {
      name: 'Career & Skills',
      courses: [
        { id: 'resume-building', title: 'Resume Building', benefit: 'Get noticed by recruiters', level: 'Beginner', price: '500', instructor: 'Ms. Sita' },
        { id: 'interview-prep', title: 'Interview Preparation', benefit: 'Crack the interview', level: 'Intermediate', price: '2,000', instructor: 'Mr. Ram' },
      ]
    }
  ];

  const filteredCategories = allCategories.map(cat => ({
    ...cat,
    courses: cat.courses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.courses.length > 0);

  return (
    <div className="flex flex-col min-h-screen font-outfit text-gray-800">
      <SocialTopbar />
      <Navbar />

      <main className="flex-1 bg-gray-50 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2 leading-tight">
                All <span className="italic text-accent">Courses</span>
              </h1>
              <p className="text-gray-500 max-w-lg">
                Find exactly what you're looking for to take your skills to the next level.
              </p>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search courses (e.g. Python, MERN...)"
                className="w-full pl-12 pr-6 py-4 bg-white border-2 border-transparent focus:border-primary rounded-2xl shadow-sm outline-none transition-all text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-20">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-accent pl-4">
                      {category.name}
                    </h2>
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{category.courses.length} courses</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.courses.map((course) => (
                      <CourseCard key={course.id} course={{
                        ...course,
                        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop',
                        description: 'Master the skills of ' + course.title + ' with our professional guidance.'
                      }} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-500">Try searching for something else like "Web" or "DSA".</p>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-6 text-accent font-bold hover:underline"
                    >
                        Clear search
                    </button>
                </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesList;
