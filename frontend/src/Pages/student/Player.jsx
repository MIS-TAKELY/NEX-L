import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../apis/course.api';
import SectionList from '../../components/student/SectionList';
import Loading from '../../components/student/Loading';
import QuizPlayer from './QuizPlayer';
import AssignmentPlayer from './AssignmentPlayer';
import StudentChat from '../../components/student/StudentChat';
import CourseGroupChat from '../../components/student/CourseGroupChat';
import { useStream } from '../../context/StreamContext';
import { useGetCourseLiveClassesQuery } from '../../store/slices/liveClassApi';

const Player = () => {
  const formatDisplayName = (name, backupTitle) => {
    if (!name) return backupTitle || "Choose a lesson";
    const lowerName = name.toLowerCase();
    // Check if name is a generic WhatsApp video or typical filename
    if (lowerName.includes('whatsapp video') || lowerName.match(/\.(mp4|mkv|avi|mov|pdf|zip|txt)$/)) {
      return backupTitle || "Video Content";
    }
    return name;
  };

  const { courseId } = useParams();

  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeResource, setActiveResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' | 'community' | 'mentor'
  const { chatClient } = useStream();

  const { data: liveClasses = [] } = useGetCourseLiveClassesQuery(courseId, { 
    skip: !courseId,
    pollingInterval: 10000 
  });
  const isAnyClassLive = liveClasses.some(lc => lc.status === 'live');

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
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-primary text-foreground rounded-2xl font-bold">
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

  const renderTabbedLayout = (mainContent) => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {mainContent}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 w-full sm:w-fit shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'lesson', label: 'Lesson Info', icon: 'solar:notes-bold-duotone' },
            { id: 'community', label: 'Community', icon: 'solar:users-group-rounded-bold-duotone' },
            { id: 'mentor', label: 'Ask Mentor', icon: 'solar:chat-round-dots-bold-duotone' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="transition-all duration-500 min-h-[500px]">
          {activeTab === 'lesson' && (
            <div className="animate-in fade-in slide-in-from-left-4">
              {/* For videos, we already showed the player above, so we just show description here */}
              {/* For other types, they might have their own layout but we can provide a default card if needed */}
              {activeLesson?.description || activeLesson?.summary ? (
                <div className="bg-card p-10 rounded-3xl border border-border/80 shadow-sm transition-all duration-500 premium-card hover:shadow-md">
                   <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">
                    {formatDisplayName(activeResource.name, activeLesson?.title)}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed font-medium text-lg max-w-4xl">
                    {activeLesson?.description || activeLesson?.summary}
                  </p>
                </div>
              ) : (
                <div className="bg-card/50 p-10 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center">
                   <Icon icon="solar:document-text-bold" size={48} className="text-muted-foreground opacity-20 mb-4" />
                   <p className="text-muted-foreground font-medium">No additional notes provided for this lesson.</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'community' && (
            <div className="h-[650px] rounded-3xl overflow-hidden border border-border bg-card shadow-xl animate-in fade-in slide-in-from-right-4">
              <CourseGroupChat courseId={courseId} />
            </div>
          )}
          {activeTab === 'mentor' && (
            <div className="h-[650px] rounded-3xl overflow-hidden border border-border bg-card shadow-xl animate-in fade-in slide-in-from-right-4">
              <StudentChat courseId={courseId} />
            </div>
          )}
        </div>
      </div>
    );
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
        return renderTabbedLayout(
          <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 group relative transition-all duration-500 hover:shadow-primary/5">
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
        );
      case 'pdf':
      case 'file':
        return renderTabbedLayout(
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-border/80 shadow-sm px-10 text-center premium-card transition-all duration-500 hover:shadow-md">
            <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl animate-pulse" />
              <Icon icon="solar:document-bold-duotone" className="text-primary relative z-10" size={40} />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">
              {formatDisplayName(activeResource.name, activeLesson?.title)}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md font-medium text-lg leading-relaxed">This resource is a <span className="text-primary font-bold">{type}</span>. Click below to view it.</p>

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-10 py-4 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 shadow-xl shadow-primary/10"
            >
              <Icon icon="solar:download-minimalistic-bold" className="w-4 h-4" /> Open Resource
            </a>
          </div>
        );
      case 'note':
      case 'article':
        return renderTabbedLayout(
          <div className="prose prose-lg dark:prose-invert max-w-none bg-card p-10 md:p-16 rounded-3xl border border-border/80 shadow-sm premium-card transition-all duration-500 hover:shadow-md">
            <h1 className="text-4xl font-black text-foreground mb-10 tracking-tight">
              {formatDisplayName(activeResource?.name, activeLesson?.title)}
            </h1>
            <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed font-medium text-lg">
              {activeLesson?.description || activeLesson?.summary || "No description provided."}
            </div>
          </div>
        );
      case 'quiz':
        return renderTabbedLayout(
            <QuizPlayer 
                quizData={activeLesson?.quiz} 
                courseId={courseId}
                contentId={activeLesson?._id}
            />
        );
      case 'assignment':
        return renderTabbedLayout(
            <AssignmentPlayer 
                assignmentData={activeLesson?.assignment} 
                courseId={courseId}
                contentId={activeLesson?._id}
            />
        );
      default:
        return renderTabbedLayout(
          <div className="flex flex-col items-center justify-center py-20 bg-secondary/30 rounded-3xl border-2 border-dashed border-border transition-colors duration-500">
            <Icon icon="solar:document-text-bold" className="text-primary/40 mb-6 animate-pulse" size={56} />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Preview Unavailable</p>
            <p className="text-foreground font-medium text-lg mt-2">Interactive "{type}" module coming soon!</p>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="mt-8 text-primary font-black uppercase tracking-wider text-[10px] hover:underline flex items-center gap-2 bg-background px-6 py-3 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
                Access Resource File <Icon icon="solar:arrow-right-up-bold" className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-outfit transition-colors duration-500">
      {/* Sidebar Overlay for Mobile */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-8 right-8 z-50 p-5 bg-primary text-primary-foreground rounded-full shadow-[0_20px_50px_rgba(79,70,229,0.3)] lg:hidden active:scale-90 transition-all group"
        >
          <Icon icon="solar:menu-dots-bold" size={28} className="group-hover:rotate-90 transition-transform" />
        </button>
      )}

      {/* Course Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-card border-r border-border transition-all duration-500 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-border flex items-center justify-between">
            <h2 className="text-2xl font-black text-foreground truncate pr-4 tracking-tight leading-tight">{course?.title}</h2>

            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-secondary rounded-xl transition-colors">
              <Icon icon="solar:close-circle-bold" size={28} className="text-muted-foreground hover:text-destructive" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <SectionList
              sections={course?.sections}
              onSelectContent={handleSelectContent}
              activeResourceId={activeResource?._id || activeResource?.url}
            />
          </div>

          <div className="p-6 bg-secondary/30 m-6 rounded-2xl border border-border/50 shadow-inner group hover:bg-secondary/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-sm group-hover:scale-105 transition-transform">
                <Icon icon="solar:user-bold-duotone" className="text-accent w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mb-0.5 opacity-60">Instructor</p>
                <p className="text-sm font-black text-foreground truncate tracking-tight">
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
        <header className="h-24 glass border-b border-border px-8 md:px-12 flex items-center justify-between z-30 transition-all duration-500">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 flex items-center justify-center bg-secondary/80 hover:bg-background rounded-2xl transition-all text-muted-foreground hover:text-primary active:scale-95 border border-transparent hover:border-border shadow-sm group"
            >
              <Icon icon="solar:alt-arrow-left-bold" size={24} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] text-primary font-black uppercase tracking-[0.25em] leading-none mb-2 opacity-80">Learning Module</span>
              <h3 className="text-xl font-black text-foreground truncate max-w-xs md:max-w-md tracking-tight leading-tight">
                {formatDisplayName(activeResource?.name, activeLesson?.title)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Stream button */}
            {isAnyClassLive && (
              <button
                onClick={() => navigate(`/student/live/${courseId}`)}
                title="Watch Live Class"
                className="px-5 py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive shadow-lg shadow-destructive/10 hover:shadow-destructive/20 hover:text-white transition-all flex items-center gap-2.5 text-xs font-black uppercase tracking-widest border border-destructive/20"
              >
                <Icon icon="solar:play-stream-bold-duotone" className="w-5 h-5 animate-pulse" />
                <span className="hidden xl:inline">Live Session</span>
              </button>
            )}

            {/* Group Chat button */}
            <button
              onClick={() => setActiveTab('community')}
              title="Group Chat"
              className={`px-5 py-3 rounded-xl transition-all duration-300 flex items-center gap-2.5 text-xs font-black uppercase tracking-widest border ${
                activeTab === 'community'
                  ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 border-primary'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-background border-border/40 hover:border-border shadow-sm'
              }`}
            >
              <Icon icon="solar:users-group-rounded-bold-duotone" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden xl:inline">Community</span>
            </button>

            {/* DM Chat button */}
            <button
              onClick={() => setActiveTab('mentor')}
              title="Chat with Teacher"
              className={`px-5 py-3 rounded-xl transition-all duration-300 flex items-center gap-2.5 text-xs font-black uppercase tracking-widest border ${
                activeTab === 'mentor'
                  ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 border-primary'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-background border-border/40 hover:border-border shadow-sm'
              }`}
            >
              <Icon icon="solar:chat-round-dots-bold-duotone" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden xl:inline">Mentor</span>
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
