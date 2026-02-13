import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../apis/course.api';
import SectionList from '../../components/student/SectionList';
import Loading from '../../components/student/Loading';

const Player = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeResource, setActiveResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await getCourseById(courseId);
        if (response.success) {
          setCourse(response.data);
          // Set initial content if available
          const firstSection = response.data.sections?.[0];
          const firstLesson = firstSection?.contents?.[0];
          if (firstLesson) {
            setActiveLesson(firstLesson);
            if (firstLesson.resources?.[0]) {
              setActiveResource(firstLesson.resources[0]);
            } else if (firstLesson.url) {
              setActiveResource({ url: firstLesson.url, type: firstLesson.type, name: firstLesson.title });
            }
          }
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Failed to fetch course details:", err);
        setError("Unable to load course details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <Icon icon="solar:danger-bold" className="text-red-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Occurred</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-primary text-white rounded-2xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const handleSelectContent = (resource, lesson) => {
    setActiveLesson(lesson);
    setActiveResource(resource);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const renderContent = () => {
    if (!activeResource) return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a lesson or resource from the sidebar to begin
      </div>
    );

    const type = activeResource.type || activeLesson?.type;
    const url = activeResource.url || activeLesson?.url;

    switch (type) {
      case 'video':
        return (
          <div className="space-y-6">
            <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800">
              <video
                key={url}
                controls
                className="w-full h-full"
                src={url}
                poster={course?.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 italic">{activeResource.name || activeLesson?.title}</h2>
              <p className="text-gray-600 dark:text-zinc-400 leading-relaxed font-medium italic">
                {activeLesson?.description || activeLesson?.summary || "No description provided for this lesson."}
              </p>
            </div>
          </div>
        );
      case 'pdf':
      case 'file':
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-[3rem] border border-gray-100 dark:border-zinc-800 shadow-sm px-10 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Icon icon="solar:document-bold" className="text-primary" size={40} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 italic">{activeResource.name || activeLesson?.title}</h2>
            <p className="text-gray-500 mb-8 max-w-md font-medium">This resource is a {type}. You can view it by clicking the button below.</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-10 py-4 bg-primary text-white rounded-2xl font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
            >
              <Icon icon="solar:download-minimalistic-bold" /> Open Resource
            </a>
          </div>
        );
      case 'note':
      case 'article':
        return (
          <div className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[3rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 italic">{activeResource.name || activeLesson?.title}</h1>
            <div className="text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-medium italic">
              {activeLesson?.description || activeLesson?.summary || "No description provided."}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-zinc-800">
            <Icon icon="solar:document-text-bold" className="text-primary mb-4" size={48} />
            <p className="text-gray-500 font-medium text-lg">Detailed content display for "{type}" is coming soon!</p>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="mt-4 text-primary font-bold hover:underline">
                View Resource URL
              </a>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 overflow-hidden font-outfit">
      {/* Sidebar Overlay for Mobile */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl lg:hidden active:scale-95 transition-all"
        >
          <Icon icon="solar:menu-dots-bold" size={24} />
        </button>
      )}

      {/* Course Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white truncate pr-4 italic">{course?.title}</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Icon icon="solar:close-circle-linear" size={24} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <SectionList
              sections={course?.sections}
              onSelectContent={handleSelectContent}
              activeResourceId={activeResource?._id || activeResource?.url}
            />
          </div>

          <div className="p-4 bg-gray-50 dark:bg-zinc-800/30 m-4 rounded-3xl border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Icon icon="solar:user-bold" className="text-accent" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Instructor</p>
                <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate italic">
                  {course?.teacher?.name || "Expert Instructor"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 px-6 md:px-10 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-2xl transition-all text-gray-500 hover:text-primary active:scale-95"
            >
              <Icon icon="solar:alt-arrow-left-linear" size={24} />
            </button>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Current Lesson</p>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white truncate max-w-xs md:max-w-md italic">
                {activeResource?.name || activeLesson?.title || "Choose a lesson"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 shadow-sm">
              Resources <Icon icon="solar:download-minimalistic-linear" />
            </button>
          </div>
        </header>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative z-10">
          <div className="max-w-5xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Player;
