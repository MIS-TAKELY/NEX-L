import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resolveAssignmentByContent } from '../../apis/course.api';
import SectionList from '../../components/student/SectionList';
import Loading from '../../components/student/Loading';
import QuizPlayer from './QuizPlayer';
import AssignmentPlayer from './AssignmentPlayer';
import StudentChat from '../../components/student/StudentChat';
import CourseGroupChat from '../../components/student/CourseGroupChat';
import { useStream } from '../../context/StreamContext';
import { useGetCourseLiveClassesQuery } from '../../store/slices/liveClassApi';
import { useGetCourseByIdQuery, useGetEnrollmentByCourseQuery, useMarkContentCompletedMutation, useSummarizeContentMutation, useAskAIMutation } from '../../store/slices/courseApi';
import { useSelector } from 'react-redux';
import { useToast } from '../../context/ToastContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

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
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeResource, setActiveResource] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' | 'community' | 'mentor'
  const { chatClient } = useStream();

  const { data: liveClasses = [] } = useGetCourseLiveClassesQuery(courseId, { 
    skip: !courseId,
    pollingInterval: 10000 
  });
  const isAnyClassLive = liveClasses.some(lc => lc.status === 'live');
  const { userData } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const { data: courseRes, isLoading: courseLoading, error: courseError } = useGetCourseByIdQuery(courseId, { skip: !courseId });
  const { data: enrollmentRes } = useGetEnrollmentByCourseQuery({ studentId: userData?.id, courseId }, { skip: !userData?.id || !courseId });
  const [markCompleted, { isLoading: markingCompleted }] = useMarkContentCompletedMutation();
  const [summarizeContent, { isLoading: summarizing }] = useSummarizeContentMutation();
  const [askAI, { isLoading: isAskingAI }] = useAskAIMutation();

  const [aiSummary, setAiSummary] = useState(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [aiChatAnswer, setAiChatAnswer] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [resolvedAssignment, setResolvedAssignment] = useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  const course = courseRes?.data;
  const enrollment = enrollmentRes?.enrollment;

  useEffect(() => {
    let cancelled = false;

    const loadAssignment = async () => {
      if (activeLesson?.type !== 'assignment') {
        setResolvedAssignment(null);
        setAssignmentLoading(false);
        return;
      }

      if (activeLesson?.assignment && typeof activeLesson.assignment === 'object') {
        setResolvedAssignment(activeLesson.assignment);
        setAssignmentLoading(false);
        return;
      }

      if (!activeLesson?._id) {
        setResolvedAssignment(null);
        setAssignmentLoading(false);
        return;
      }

      setAssignmentLoading(true);
      try {
        const response = await resolveAssignmentByContent(activeLesson._id);
        if (!cancelled) {
          setResolvedAssignment(response?.data || null);
        }
      } catch (error) {
        console.warn("Unable to resolve assignment details:", error);
        if (!cancelled) {
          setResolvedAssignment(null);
        }
      } finally {
        if (!cancelled) {
          setAssignmentLoading(false);
        }
      }
    };

    loadAssignment();

    return () => {
      cancelled = true;
    };
  }, [activeLesson?._id, activeLesson?.type, activeLesson?.assignment]);

  const isLikelyImageUrl = (value = '') =>
    /\.(png|jpe?g|gif|webp|bmp|svg|avif|heic|heif)(\?|#|$)/i.test(value);

  const isImageResource = (resource = {}) => {
    const type = (resource.type || '').toLowerCase();
    const url = resource.url || '';
    const name = resource.name || '';

    return (
      type === 'image' ||
      type.startsWith('image/') ||
      isLikelyImageUrl(url) ||
      isLikelyImageUrl(name)
    );
  };

  const toAbsoluteResourceUrl = (value = '') => {
    if (!value) return '';
    if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
      return value;
    }
    if (value.startsWith('//')) {
      return `${window.location.protocol}${value}`;
    }
    
    // Ensure we handle relative paths regardless of starting slash
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = value.startsWith('/') ? value : `/${value}`;

    return `${cleanBase}${cleanPath}`;
  };

  const getBestImageResource = () => {
    if (isImageResource(activeResource)) return activeResource;
    return activeLesson?.resources?.find((resource) => isImageResource(resource)) || null;
  };

  const toDataUrl = async (url) => {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }

    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) return url;

      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Unable to convert image to data URL, falling back to image URL.', error);
      return url;
    }
  };

  const resolveImagePayload = async () => {
    const imageResource = getBestImageResource();
    if (!imageResource) return '';

    const rawUrl = imageResource.url || activeLesson?.url || '';
    const absoluteUrl = toAbsoluteResourceUrl(rawUrl);
    return toDataUrl(absoluteUrl);
  };


  useEffect(() => {
    if (course && !activeLesson) {
      const firstSection = course.sections?.[0];
      const firstLesson = firstSection?.contents?.[0];
      if (firstLesson) {
        setActiveLesson(firstLesson);
        if (firstLesson.resources?.[0]) {
          setActiveResource(firstLesson.resources[0]);
        } else if (firstLesson.url) {
          setActiveResource({ url: firstLesson.url, type: firstLesson.type, name: firstLesson.title });
        } else {
          setActiveResource({ type: firstLesson.type, name: firstLesson.title, _id: firstLesson._id });
        }
      }
    }
  }, [course, activeLesson]);

  const handleSummarize = async (mode = 'short') => {
    const textToSummarize = activeLesson?.description || activeLesson?.summary;
    const title = activeLesson?.title || activeResource?.name;
    const imageUrl = await resolveImagePayload();
    
    if (!textToSummarize && !title && !imageUrl) {
        showToast("No content or image found to generate notes.", "error");
        return;
    }

    try {
      showToast(imageUrl ? "AI is reading the image..." : (textToSummarize ? "Summarizing with AI..." : "Generating AI Notes..."), "loading");
      const result = await summarizeContent({ 
        text: textToSummarize || '', 
        mode,
        title: title || '',
        imageUrl: imageUrl || '',
        imageDataUrl: imageUrl || '',
        courseTitle: course?.title || ''
      }).unwrap();
      
      if (result.success) {
        setAiSummary({
          text: result.data,
          mode: mode
        });
        showToast("AI task completed!", "success");
      }
    } catch (err) {
      console.error("AI Task failed", err);
      showToast("AI task failed. Please try again.", "error");
    }
  };

  const handleCopy = () => {
    if (!aiSummary?.text) return;
    navigator.clipboard.writeText(aiSummary.text);
    setCopied(true);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>AI Learning Notes - ${course?.title}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
            h1 { color: #4f46e5; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            h2, h3 { color: #1f2937; margin-top: 30px; }
            .meta { font-size: 0.8em; color: #666; margin-bottom: 40px; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>${activeLesson?.title || 'Learning Notes'}</h1>
          <div class="meta">Course: ${course?.title} | Generated by AI</div>
          <div>${aiSummary.text.replace(/\n/g, '<br/>')}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleAskAI = async (e) => {
    if (e) e.preventDefault();
    if (!userQuestion.trim()) return;
    
    const title = activeLesson?.title || activeResource?.name;
    const imageUrl = await resolveImagePayload();

    const rawDescription = activeLesson?.description || activeLesson?.summary || "";
    const generatedNotes = aiSummary?.text ? `\n\n[Additional Context from Generated AI Notes]:\n${aiSummary.text}` : "";
    const lessonMeta = `[Lesson Title: ${title || 'Unknown'}]\n[Lesson Context]: ${rawDescription}`;
    const context = `${lessonMeta}${generatedNotes}`.trim();

    console.log("[AI Q&A Request] Sending payload:", { question: userQuestion, contextLength: context.length, hasImage: !!imageUrl });
    if (imageUrl) console.log("[AI Q&A Request] Image URL:", imageUrl);

    try {
      showToast(imageUrl ? "AI is reviewing visual content..." : "AI is thinking...", "loading");
      const result = await askAI({
        question: userQuestion,
        context,
        courseTitle: course?.title,
        imageUrl: imageUrl || '',
        imageDataUrl: imageUrl || ''
      }).unwrap();


      
      if (result.success) {
        setAiChatAnswer(result.data);
        showToast("Answer generated!", "success");
      }
    } catch (err) {
      console.error("AI Q&A failed", err);
      showToast("AI couldn't answer that. Please try again.", "error");
    }
  };


  const handleMarkAsCompleted = async () => {
    if (!enrollment?._id || !activeLesson?._id) return;
    try {
      await markCompleted({
        enrollmentId: enrollment._id,
        contentId: activeLesson._id
      }).unwrap();
    } catch (err) {
      console.error("Failed to mark as completed", err);
    }
  };

  const isCompleted = enrollment?.completedContents?.includes(activeLesson?._id);

  if (courseLoading) return <Loading />;

  if (courseError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <Icon icon="solar:danger-bold" className="text-red-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-foreground mb-2">Error Occurred</h2>
        <p className="text-muted-foreground mb-8">{courseError.data?.message || "Unable to load course details."}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-primary text-foreground rounded-md font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const handleSelectContent = (resource, lesson) => {
    setActiveLesson(lesson);
    setActiveResource(resource);
    setAiSummary(null); // Reset AI summary when switching lessons
    setAiChatAnswer(null); // Reset chat
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const renderTabbedLayout = (mainContent) => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {mainContent}

        {/* AI Learning Tools - Available for all content types */}
        {activeResource && (
          <div className="bg-gradient-to-br from-primary/[0.04] via-card to-accent/[0.04] rounded-xl border border-border/60 shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 group/ai">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-background/40 border-b border-border/30 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20 group-hover/ai:scale-105 transition-transform">
                  <Icon icon="solar:magic-stick-3-bold-duotone" className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground tracking-tight">AI Learning Tools</h3>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Generate summaries & study notes</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(activeLesson?.description || activeLesson?.summary) && (
                  <button
                    onClick={() => handleSummarize('short')}
                    disabled={summarizing}
                    className="px-4 py-2 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 border border-violet-500/20 hover:border-violet-500/40 shadow-sm"
                  >
                    {summarizing ? (
                      <Icon icon="solar:restart-bold" className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Icon icon="solar:text-align-left-bold-duotone" className="w-3.5 h-3.5" />
                    )}
                    Quick Summary
                  </button>
                )}
                {(activeLesson?.description || activeLesson?.summary) && (
                  <button
                    onClick={() => handleSummarize('elaborated')}
                    disabled={summarizing}
                    className="px-4 py-2 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 border border-indigo-500/20 hover:border-indigo-500/40 shadow-sm"
                  >
                    {summarizing ? (
                      <Icon icon="solar:restart-bold" className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Icon icon="solar:document-text-bold-duotone" className="w-3.5 h-3.5" />
                    )}
                    Detailed Notes
                  </button>
                )}
                {(!activeLesson?.description && !activeLesson?.summary) && (
                  <button
                    onClick={() => handleSummarize('short')}
                    disabled={summarizing}
                    className="px-4 py-2 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 border border-amber-500/20 hover:border-amber-500/40 shadow-sm"
                  >
                    {summarizing ? (
                      <Icon icon="solar:restart-bold" className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Icon icon="solar:magic-stick-3-bold-duotone" className="w-3.5 h-3.5" />
                    )}
                    Generate AI Notes
                  </button>
                )}
              </div>
            </div>

            {/* Summary Display */}
            <AnimatePresence>
              {aiSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                          {aiSummary.mode === 'elaborated' ? 'Detailed Study Notes' : 'Quick Summary'} Generated
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleCopy}
                          className="p-2 hover:bg-secondary/80 rounded-lg transition-all text-muted-foreground hover:text-foreground active:scale-90 relative"
                          title="Copy to clipboard"
                        >
                          <Icon
                            icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'}
                            size={16}
                            className={copied ? 'text-emerald-500' : ''}
                          />
                        </button>
                        <button
                          onClick={handlePrint}
                          className="p-2 hover:bg-secondary/80 rounded-lg transition-all text-muted-foreground hover:text-foreground active:scale-90"
                          title="Print"
                        >
                          <Icon icon="solar:printer-minimalistic-bold" size={16} />
                        </button>
                        <button
                          onClick={() => handleSummarize(aiSummary.mode || 'short')}
                          className="p-2 hover:bg-secondary/80 rounded-lg transition-all text-muted-foreground hover:text-foreground active:scale-90"
                          title="Regenerate"
                        >
                          <Icon icon="solar:restart-bold" size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-card/60 p-6 rounded-xl border border-border/40 shadow-sm leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiSummary.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-card/80 backdrop-blur-xl rounded-md border border-border/50 w-full sm:w-fit shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'lesson', label: 'Lesson Info', icon: 'solar:notes-bold-duotone' },
            { id: 'community', label: 'Community', icon: 'solar:users-group-rounded-bold-duotone' },
            { id: 'mentor', label: 'Ask Mentor', icon: 'solar:chat-round-dots-bold-duotone' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-md text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
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
            <div className="animate-in fade-in slide-in-from-left-4 space-y-8">
              {/* Note Content Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-primary font-black uppercase tracking-[0.25em] leading-none mb-2 opacity-80">Lesson Resources</span>
                  <h2 className="text-3xl font-black text-foreground tracking-tight">
                    {formatDisplayName(activeResource?.name, activeLesson?.title)}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {enrollment && (
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={markingCompleted || isCompleted}
                      className={`flex items-center gap-2.5 px-6 py-3 rounded-md text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                          : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95'
                      }`}
                    >
                      {markingCompleted ? (
                         <Icon icon="solar:restart-bold-duotone" className="w-4 h-4 animate-spin" />
                      ) : isCompleted ? (
                        <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4" />
                      ) : (
                        <Icon icon="solar:verified-check-bold-duotone" className="w-4 h-4" />
                      )}
                      {isCompleted ? 'Completed' : 'Mark as Done'}
                    </button>
                  )}
                </div>
              </div>

              {/* Note Content Body */}
              {activeLesson?.description || activeLesson?.summary ? (
                <div className="bg-card p-10 rounded-md border border-border/80 shadow-sm transition-all duration-500 premium-card hover:shadow-md">
                  <div className="text-muted-foreground leading-relaxed font-medium text-lg max-w-4xl whitespace-pre-wrap">
                    {activeLesson?.description || activeLesson?.summary}
                  </div>
                </div>
              ) : (
                <div className="bg-card/50 p-10 rounded-md border border-dashed border-border flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-primary/5 rounded-md flex items-center justify-center mb-4 border border-primary/10">
                    <Icon icon="solar:document-text-bold" size={32} className="text-primary/40" />
                   </div>
                   <p className="text-foreground font-black uppercase tracking-widest text-[10px] mb-2">No Instructor Notes</p>
                   <p className="text-muted-foreground font-medium text-sm max-w-xs">Use the <span className="text-orange-500 font-bold">AI Learning Tools</span> above to create study materials for this lesson!</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'community' && (
            <div className="h-[650px] rounded-md overflow-hidden border border-border bg-card shadow-xl animate-in fade-in slide-in-from-right-4">
              <CourseGroupChat courseId={courseId} />
            </div>
          )}
          {activeTab === 'mentor' && (
            <div className="h-[650px] rounded-md overflow-hidden border border-border bg-card shadow-xl animate-in fade-in slide-in-from-right-4">
              <StudentChat courseId={courseId} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!activeResource && activeTab === 'lesson') return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a lesson or resource from the sidebar to begin
      </div>
    );

    if (!activeResource && (activeTab === 'community' || activeTab === 'mentor')) {
      return renderTabbedLayout(null);
    }

    const type = activeResource.type || activeLesson?.type;
    const url = activeResource.url || activeLesson?.url;
    const assignmentData = resolvedAssignment
      || (activeLesson?.assignment && typeof activeLesson.assignment === 'object' ? activeLesson.assignment : null)
      || (activeLesson?.type === 'assignment'
        ? {
            _id: activeLesson?._id,
            title: activeLesson?.title || 'Assignment',
            description: activeLesson?.description || activeLesson?.summary || 'Assignment details are being loaded.',
            dueDate: null,
            maxScore: 100,
            instructions: '',
          }
        : null);

    switch (type) {
      case 'video': {
        const ytVideoId = getYoutubeVideoId(url);
        return renderTabbedLayout(
          <div className="aspect-video w-full bg-black rounded-md overflow-hidden shadow-2xl border border-white/5 group relative transition-all duration-500 hover:shadow-primary/5">
            {ytVideoId ? (
              <iframe
                key={url}
                src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=0&rel=0`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="YouTube Video Player"
              />
            ) : (
              <video
                key={url}
                controls
                className="w-full h-full"
                src={url}
                poster={course?.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        );
      }
      case 'image':
        return renderTabbedLayout(
          <div className="w-full bg-card/50 rounded-md overflow-hidden shadow-2xl border border-border group relative transition-all duration-500 hover:shadow-primary/5 flex items-center justify-center p-4">
            <img
              key={url}
              src={url}
              alt={activeResource.name}
              className="max-w-full max-h-[70vh] rounded shadow-lg transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        );
      case 'pdf':
      case 'file':
        return renderTabbedLayout(
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-md border border-border/80 shadow-sm px-10 text-center premium-card transition-all duration-500 hover:shadow-md">
            <div className="w-20 h-20 bg-primary/5 rounded-md flex items-center justify-center mb-6 relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-md animate-pulse" />
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
              className="px-10 py-4 bg-primary text-primary-foreground rounded-md font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 shadow-xl shadow-primary/10"
            >
              <Icon icon="solar:download-minimalistic-bold" className="w-4 h-4" /> Open Resource
            </a>
          </div>
        );
      case 'note':
      case 'article':
        return renderTabbedLayout(
          <div className="prose prose-lg dark:prose-invert max-w-none bg-card p-10 md:p-16 rounded-md border border-border/80 shadow-sm premium-card transition-all duration-500 hover:shadow-md">
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
        if (assignmentLoading && !assignmentData) {
          return renderTabbedLayout(
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-md border border-border shadow-sm">
              <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Icon icon="solar:restart-bold" className="text-primary animate-spin" size={28} />
              </div>
              <p className="text-sm font-bold text-foreground">Loading assignment details...</p>
            </div>
          );
        }
        return renderTabbedLayout(
            <AssignmentPlayer 
                assignmentData={assignmentData} 
                courseId={courseId}
                contentId={activeLesson?._id}
            />
        );
      default:
        return renderTabbedLayout(
          <div className="flex flex-col items-center justify-center py-20 bg-secondary/30 rounded-md border-2 border-dashed border-border transition-colors duration-500">
            <Icon icon="solar:document-text-bold" className="text-primary/40 mb-6 animate-pulse" size={56} />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Preview Unavailable</p>
            <p className="text-foreground font-medium text-lg mt-2">Interactive "{type}" module coming soon!</p>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="mt-8 text-primary font-black uppercase tracking-wider text-[10px] hover:underline flex items-center gap-2 bg-background px-6 py-3 rounded-md border border-border shadow-sm hover:shadow-md transition-all">
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
          className="fixed bottom-8 right-8 z-50 p-5 bg-primary text-primary-foreground rounded-md shadow-[0_20px_50px_rgba(79,70,229,0.3)] lg:hidden active:scale-90 transition-all group"
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

            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-secondary rounded-md transition-colors">
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

          <div className="p-6 bg-secondary/30 m-6 rounded-md border border-border/50 shadow-inner group hover:bg-secondary/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center border border-accent/20 shadow-sm group-hover:scale-105 transition-transform">
                <Icon icon="solar:user-bold-duotone" className="text-accent w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mb-0.5 opacity-60">Instructor</p>
                <p className="text-sm font-black text-foreground truncate tracking-tight">
                  {course?.teacher?.name || "Instructor"}
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
              className="w-12 h-12 flex items-center justify-center bg-secondary/80 hover:bg-background rounded-md transition-all text-muted-foreground hover:text-primary active:scale-95 border border-transparent hover:border-border shadow-sm group"
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
                className="px-5 py-3 bg-destructive/10 text-destructive rounded-md hover:bg-destructive shadow-lg shadow-destructive/10 hover:shadow-destructive/20 hover:text-white transition-all flex items-center gap-2.5 text-xs font-black uppercase tracking-widest border border-destructive/20"
              >
                <Icon icon="solar:play-stream-bold-duotone" className="w-5 h-5 animate-pulse" />
                <span className="hidden xl:inline">Live Session</span>
              </button>
            )}

            {/* Group Chat button */}
            <button
              onClick={() => setActiveTab('community')}
              title="Group Chat"
              className={`px-5 py-3 rounded-md transition-all duration-300 flex items-center gap-2.5 text-xs font-black uppercase tracking-widest border ${
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
              className={`px-5 py-3 rounded-md transition-all duration-300 flex items-center gap-2.5 text-xs font-black uppercase tracking-widest border ${
                activeTab === 'mentor'
                  ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 border-primary'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-background border-border/40 hover:border-border shadow-sm'
              }`}
            >
              <Icon icon="solar:chat-round-dots-bold-duotone" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden xl:inline">Mentor</span>
            </button>

            <button
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              title="AI Tutor"
              className={`p-3 rounded-md transition-all duration-300 relative ${
                isAiPanelOpen
                  ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 border-primary'
                  : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
              } border`}
            >
              <Icon icon="solar:magic-stick-3-bold-duotone" className="w-5 h-5 flex-shrink-0" />
              {aiChatAnswer && !isAiPanelOpen && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-background rounded-full animate-bounce" />
              )}
            </button>
          </div>
        </header>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar relative z-10">
          <div className="max-w-6xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* AI Tutor Sidebar */}
        {isAiPanelOpen && (
          <aside
            className="fixed top-0 right-0 w-full sm:w-[500px] h-screen bg-card border-l border-border z-[9999] flex flex-col shadow-2xl"
          >
            <div className="p-8 border-b border-border/50 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Icon icon="solar:magic-stick-3-bold-duotone" className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-foreground leading-none mb-1">AI Personal Tutor</h3>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-80 decoration-primary decoration-2">Always Available</span>
                </div>
              </div>
              <button 
                onClick={() => setIsAiPanelOpen(false)}
                className="w-10 h-10 rounded-md hover:bg-secondary/80 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
              >
                <Icon icon="solar:close-circle-bold" size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
              {/* Context Action - Generate summary from sidebar too */}
              {!aiSummary && (
                <div className="p-8 rounded-md bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] border border-border/50 text-center space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/20">
                    <Icon icon="solar:magic-stick-3-bold-duotone" className="text-white w-7 h-7" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No notes generated yet</p>
                  <p className="text-[10px] text-muted-foreground/60 font-medium leading-relaxed max-w-xs mx-auto">
                    Use the AI tools in the lesson area to generate quick summaries or detailed study notes.
                  </p>
                  <button 
                    onClick={() => { setIsAiPanelOpen(false); }}
                    className="w-full py-3 bg-secondary/60 text-muted-foreground hover:text-foreground rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-border/40"
                  >
                    <Icon icon="solar:round-alt-arrow-left-bold" />
                    Back to Lesson
                  </button>
                </div>
              )}

              {/* AI Summary in Sidebar */}
              {aiSummary && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                        {aiSummary.mode === 'elaborated' ? 'Detailed Study Notes' : 'Quick Summary'}
                      </h4>
                    </div>
                    <div className="flex gap-1">
                       <button onClick={handleCopy} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-all active:scale-90" title="Copy">
                         <Icon icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} size={16} className={copied ? 'text-emerald-500' : ''} />
                       </button>
                       <button onClick={handlePrint} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-all active:scale-90" title="Print">
                         <Icon icon="solar:printer-minimalistic-bold" size={16} />
                       </button>
                    </div>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 bg-card/40 p-6 rounded-xl border border-border/40 shadow-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiSummary.text}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Q&A Chat Style */}
              {aiChatAnswer && (
                <div className="space-y-4 pt-4 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] flex-1 bg-border/50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Recent Q&A</span>
                    <div className="h-[1px] flex-1 bg-border/50" />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col items-end">
                      <div className="bg-primary text-primary-foreground p-4 rounded-md rounded-tr-none text-sm font-semibold max-w-[85%] shadow-md">
                         {userQuestion || "Last Question"}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start">
                      <div className="bg-card border border-primary/20 p-6 rounded-md rounded-tl-none shadow-xl max-w-[95%]">
                        <div className="flex items-center gap-2 mb-4 opacity-50">
                          <Icon icon="solar:magic-stick-3-bold" className="text-primary w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Tutor Response</span>
                        </div>
                        <div className="prose prose-sm dark:prose-invert text-foreground/90 leading-relaxed font-semibold">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {aiChatAnswer}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Input Area */}
            <div className="p-8 pt-4 bg-card/80 backdrop-blur-md border-t border-border/50">
              <div className="relative group">
                <textarea 
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Ask your tutor anything..."
                  className="w-full min-h-[100px] p-5 pb-16 bg-secondary/30 border border-border/40 rounded-md text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">ENTER</kbd> TO SEND
                </div>
                <button 
                  onClick={handleAskAI}
                  disabled={isAskingAI || !userQuestion.trim()}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-primary text-primary-foreground rounded-md flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-90 disabled:opacity-30 shadow-md shadow-primary/10"
                >
                  {isAskingAI ? (
                    <Icon icon="solar:restart-bold" className="animate-spin" />
                  ) : (
                    <Icon icon="solar:round-alt-arrow-right-bold" />
                  )}
                </button>
              </div>
              <p className="mt-4 text-[9px] text-center text-muted-foreground/60 font-black uppercase tracking-widest">
                AI can make mistakes. Verify important facts.
              </p>
            </div>
          </aside>
        )}

    </div>
  );
};

export default Player;
