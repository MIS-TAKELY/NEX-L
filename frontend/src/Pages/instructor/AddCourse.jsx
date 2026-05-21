import { uploadMedia } from "@/apis/course.api";
import { createCoupon } from "@/apis/coupon.api";
import QuizBuilder from "@/components/instructor/course-builder/QuizBuilder";
import AssignmentBuilder from "@/components/instructor/course-builder/AssignmentBuilder";
import UploadStatusOverlay from "@/components/instructor/UploadStatusOverlay";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  Play,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  Ticket,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateCourseMutation, useGenerateContentMutation } from "@/store/slices/courseApi";
import { useToast } from "../../context/ToastContext";

const steps = [
  { id: 1, title: "Basic Information", desc: "Title, Price, Category" },
  { id: 2, title: "Course Media", desc: "Thumbnail & Syllabus" },
  { id: 3, title: "Curriculum", desc: "Sections & Lessons" },
  { id: 4, title: "Coupons", desc: "Discount Codes" },
];
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Native PDF preview is used instead of Google Docs Viewer

const AddCourse = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const [createCourseFetch] = useCreateCourseMutation();
  const [generateContent, { isLoading: generatingAI }] = useGenerateContentMutation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingFiles, setUploadingFiles] = useState({}); // Track individual file uploads
  const [showPublishOverlay, setShowPublishOverlay] = useState(false);
  const [isAttemptingPublish, setIsAttemptingPublish] = useState(false);
  const [activeYoutubeInput, setActiveYoutubeInput] = useState(null); // { sectionIndex, contentIndex }
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [showDemoYoutubeInput, setShowDemoYoutubeInput] = useState(false);
  const [demoYoutubeUrl, setDemoYoutubeUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    level: "Beginner",
    thumbnail: "",
    syllabus: "",
    demoVideo: "",
    courseType: "full",
    isFree: false,
    tags: [],
    sections: [],
    coupons: [],
  });
  const [uploadingDemoVideo, setUploadingDemoVideo] = useState(false);

  const [tagsInput, setTagsInput] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Curriculum Handlers ---
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: "New Section",
          order: prev.sections.length + 1,
          contents: [],
          isOpen: true,
        },
      ],
    }));
  };

  const updateSectionTitle = (index, title) => {
    const newSections = [...formData.sections];
    newSections[index].title = title;
    setFormData({ ...formData, sections: newSections });
  };

  const removeSection = (index) => {
    const newSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: newSections });
  };

  const toggleSection = (index) => {
    const newSections = [...formData.sections];
    newSections[index].isOpen = !newSections[index].isOpen;
    setFormData({ ...formData, sections: newSections });
  };

  const addContent = (sectionIndex, type = "mixed") => {
    const newSections = [...formData.sections];
    
    const baseContent = {
      title: type === "quiz" ? "New Quiz" : type === "assignment" ? "New Assignment" : "New Lesson",
      type: type,
      isOpen: true,
      description: "",
      resources: [],
    };

    if (type === "quiz") {
      baseContent.quizData = {
        title: "",
        description: "",
        timeLimit: 30,
        passingScore: 60,
        questions: [],
      };
    } else if (type === "assignment") {
      baseContent.assignmentData = {
        title: "",
        description: "",
        dueDate: "",
        autoGrade: false,
        gradingCriteria: "",
        maxScore: 100,
        instructions: "",
      };
    }

    newSections[sectionIndex].contents.push(baseContent);
    setFormData({ ...formData, sections: newSections });
  };

  const updateContent = (sectionIndex, contentIndex, field, value) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].contents[contentIndex][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const removeContent = (sectionIndex, contentIndex) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].contents = newSections[
      sectionIndex
    ].contents.filter((_, i) => i !== contentIndex);
    setFormData({ ...formData, sections: newSections });
  };

  const toggleContent = (sectionIndex, contentIndex) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].contents[contentIndex].isOpen =
      !newSections[sectionIndex].contents[contentIndex].isOpen;
    setFormData({ ...formData, sections: newSections });
  };

  // --- Resource/File Management ---
  const addResource = async (sectionIndex, contentIndex, files) => {
    const uploadKey = `${sectionIndex}-${contentIndex}`;

    const tempResources = files.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file), // Immediate preview
      type: file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
          ? "image"
          : file.type.includes("pdf")
            ? "pdf"
            : "file",
      size: file.size,
      duration: 0,
      isUploading: true,
      file: file, // Keep reference to file for actual upload
    }));

    const updatedSections = formData.sections.map((sec, sIdx) => {
      if (sIdx !== sectionIndex) return sec;
      return {
        ...sec,
        contents: sec.contents.map((cont, cIdx) => {
          if (cIdx !== contentIndex) return cont;
          return {
            ...cont,
            resources: [...(cont.resources || []), ...tempResources]
          };
        })
      };
    });

    setFormData(prev => ({ ...prev, sections: updatedSections }));

    // 2. Upload files one by one or in parallel
    tempResources.forEach(async (tempResource) => {
      const resourceId = tempResource.id;
      setUploadingFiles((prev) => ({ ...prev, [resourceId]: true }));

      try {
        const data = await uploadMedia(tempResource.file);

        // Update the form data with the actual URL
        setFormData((prev) => {
          const newSections = prev.sections.map((sec, sIdx) => {
            if (sIdx !== sectionIndex) return sec;
            return {
              ...sec,
              contents: sec.contents.map((cont, cIdx) => {
                if (cIdx !== contentIndex) return cont;
                return {
                  ...cont,
                  resources: cont.resources.map(r => {
                    if (r.id !== resourceId) return r;
                    const { file, ...resourceData } = r; // Remove file reference
                    return {
                      ...resourceData,
                      url: data.url,
                      duration: data.duration || 0,
                      thumbnail: data.thumbnail || null,
                      isUploading: false
                    };
                  })
                };
              })
            };
          });
          return { ...prev, sections: newSections };
        });
      } catch (error) {
        console.error("Upload failed", error);
        setFormData((prev) => {
          const newSections = prev.sections.map((sec, sIdx) => {
            if (sIdx !== sectionIndex) return sec;
            return {
              ...sec,
              contents: sec.contents.map((cont, cIdx) => {
                if (cIdx !== contentIndex) return cont;
                return {
                  ...cont,
                  resources: cont.resources.filter(r => r.id !== resourceId)
                };
              })
            };
          });
          return { ...prev, sections: newSections };
        });
        showToast(`Failed to upload ${tempResource.name}`, "error");
      } finally {
        setUploadingFiles((prev) => {
          const newState = { ...prev };
          delete newState[resourceId];
          return newState;
        });
      }
    });
  };

  const handleAddYoutubeResource = (sectionIndex, contentIndex) => {
    if (!youtubeUrl.trim()) {
      showToast("Please enter a YouTube URL", "error");
      return;
    }

    const videoId = getYoutubeVideoId(youtubeUrl);
    if (!videoId) {
      showToast("Invalid YouTube URL. Please provide a valid YouTube link.", "error");
      return;
    }

    const newResource = {
      id: `yt-${Date.now()}-${Math.random()}`,
      name: "YouTube Lecture Video",
      url: youtubeUrl.trim(),
      type: "video",
      size: 0,
      duration: 0,
      isUploading: false,
    };

    const updatedSections = formData.sections.map((sec, sIdx) => {
      if (sIdx !== sectionIndex) return sec;
      return {
        ...sec,
        contents: sec.contents.map((cont, cIdx) => {
          if (cIdx !== contentIndex) return cont;
          return {
            ...cont,
            resources: [...(cont.resources || []), newResource],
          };
        }),
      };
    });

    setFormData((prev) => ({ ...prev, sections: updatedSections }));
    setYoutubeUrl("");
    setActiveYoutubeInput(null);
    showToast("YouTube lecture added!", "success");
  };

  const removeResource = (sectionIndex, contentIndex, resourceId) => {
    const newSections = [...formData.sections];
    const content = newSections[sectionIndex].contents[contentIndex];
    content.resources = content.resources.filter((r) => r.id !== resourceId);
    setFormData({ ...formData, sections: newSections });
  };

  const updateResourceName = (sectionIndex, contentIndex, resourceId, name) => {
    const newSections = [...formData.sections];
    const content = newSections[sectionIndex].contents[contentIndex];
    const resource = content.resources.find((r) => r.id === resourceId);
    if (resource) resource.name = name;
    setFormData({ ...formData, sections: newSections });
  };

  // --- Coupon Handlers ---
  const addCoupon = () => {
    setFormData((prev) => ({
      ...prev,
      coupons: [
        ...prev.coupons,
        {
          code: "",
          discount: "",
          type: "percentage",
          expiry: "",
          maxUses: "",
        },
      ],
    }));
  };

  const updateCouponField = (index, field, value) => {
    const newCoupons = [...formData.coupons];
    newCoupons[index][field] = value;
    setFormData({ ...formData, coupons: newCoupons });
  };

  const removeCoupon = (index) => {
    const newCoupons = formData.coupons.filter((_, i) => i !== index);
    setFormData({ ...formData, coupons: newCoupons });
  };

  // --- File Upload Handlers ---
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await uploadMedia(file);
      setFormData((prev) => ({ ...prev, thumbnail: data.url }));
    } catch (error) {
      console.error("Thumbnail upload failed", error);
      showToast("Thumbnail upload failed", "error");
    }
  };

  const handleSyllabusUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await uploadMedia(file);
      setFormData((prev) => ({ ...prev, syllabus: data.url }));
    } catch (error) {
      console.error("Syllabus upload failed", error);
      showToast("Syllabus upload failed", "error");
    }
  };

  const handleDemoVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDemoVideo(true);
    try {
      const data = await uploadMedia(file);
      setFormData((prev) => ({ ...prev, demoVideo: data.url }));
      showToast("Demo video uploaded!", "success");
    } catch (error) {
      console.error("Demo video upload failed", error);
      showToast("Demo video upload failed", "error");
    } finally {
      setUploadingDemoVideo(false);
    }
  };

  const handleAddDemoYoutubeUrl = () => {
    if (!demoYoutubeUrl.trim()) {
      showToast("Please enter a YouTube URL", "error");
      return;
    }
    const videoId = getYoutubeVideoId(demoYoutubeUrl);
    if (!videoId) {
      showToast("Invalid YouTube URL. Please provide a valid YouTube link.", "error");
      return;
    }
    setFormData((prev) => ({ ...prev, demoVideo: demoYoutubeUrl.trim() }));
    setDemoYoutubeUrl("");
    setShowDemoYoutubeInput(false);
    showToast("YouTube demo video added!", "success");
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData || !userData.id) {
      showToast("You must be logged in to create a course", "error");
      return;
    }

    // Check if any uploads are still in progress
    const isStillUploading = Object.values(uploadingFiles).some(Boolean);
    if (isStillUploading) {
      setShowPublishOverlay(true);
      setIsAttemptingPublish(true);
      return; // Return and wait for uploads to complete
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        teacherId: userData.id,
        status: "published",
        sections: formData.sections.map((sec, idx) => ({
          title: sec.title,
          order: idx + 1,
          contents: sec.contents.map((cont) => ({
            title: cont.title,
            type: cont.type,
            description: cont.description,
            quizData: cont.quizData,
            assignmentData: cont.assignmentData,
            resources: cont.resources.map((r) => ({
              name: r.name,
              url: r.url,
              type: r.type,
              size: r.size,
              duration: r.duration,
              thumbnail: r.thumbnail,
            })),
          })),
        })),
      };

      const result = await createCourseFetch(payload).unwrap();
      const courseId = result._id || result.data?._id;

      // Create coupons if any
      if (formData.coupons && formData.coupons.length > 0 && courseId) {
        for (const coupon of formData.coupons) {
          if (coupon.code && coupon.discount) {
            try {
              await createCoupon({
                ...coupon,
                courseId,
                teacherId: userData.id
              });
            } catch (couponErr) {
              console.error("Failed to create coupon:", couponErr);
              // We won't block the whole process if one coupon fails
            }
          }
        }
      }

      showToast("Course created successfully!", "success");
      navigate("/instructor/courses");
    } catch (error) {
      console.error("Failed to create course", error);
      showToast("Failed to create course. " + (error.data?.message || error.message || ""), "error");
    } finally {
      setLoading(false);
      setShowPublishOverlay(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!userData || !userData.id) {
      showToast("You must be logged in to save a draft", "error");
      return;
    }

    if (!formData.title) {
      showToast("Please provide at least a course title to save as draft.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        teacherId: userData.id,
        status: "draft",
        sections: formData.sections.map((sec, idx) => ({
          title: sec.title,
          order: idx + 1,
          contents: sec.contents.map((cont) => ({
            title: cont.title,
            type: cont.type,
            description: cont.description,
            resources: cont.resources.map((r) => ({
              name: r.name,
              url: r.url,
              type: r.type,
              size: r.size,
              duration: r.duration,
              thumbnail: r.thumbnail,
            })),
          })),
        })),
      };

      await createCourseFetch(payload).unwrap();
      showToast("Draft saved successfully!", "success");
      navigate("/instructor/courses");
    } catch (error) {
      console.error("Failed to save draft", error);
      showToast("Failed to save draft. " + (error.data?.message || error.message || ""), "error");
    } finally {
      setLoading(false);
    }
  };

  // Watch for upload completion if publish was attempted
  useEffect(() => {
    if (isAttemptingPublish && !Object.values(uploadingFiles).some(Boolean)) {
      setIsAttemptingPublish(false);
      handleSubmit({ preventDefault: () => { } }); // Re-trigger publish
    }
  }, [uploadingFiles, isAttemptingPublish]);

  const totalResourcesToUpload = useRef(0);
  const uploadedResourcesCount = useRef(0);

  // Update overlay counts (optional, but nice for progress)
  const pendingCount = Object.values(uploadingFiles).filter(Boolean).length;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "video":
        return <Video size={16} className="text-red-500" />;
      case "image":
        return <ImageIcon size={16} className="text-green-500" />;
      case "pdf":
        return <FileText size={16} className="text-red-600" />;
      default:
        return <File size={16} className="text-primary" />;
    }
  };

  const nextStep = () => {
    // Basic validation before moving to next step
    if (currentStep === 1) {
      if (!formData.title || !formData.category || !formData.level || !formData.description) {
        showToast("Please fill in all required basic info fields.", "error");
        return;
      }
    } else if (currentStep === 2) {
      if (formData.courseType === "syllabus" && !formData.syllabus) {
        showToast("Syllabus is required for 'Syllabus Only' course type.", "error");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setIsAttemptingPublish(false); // Reset attempt if going back
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="space-y-8 font-outfit text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight drop-shadow-sm mb-2">
            Create New Course
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium">
            Build structured lessons with multiple videos, files, and resources
            per section.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="relative flex justify-between">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-card/5 rounded-md -translate-y-1/2 z-0" />
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-md -translate-y-1/2 z-0 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step) => (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group"
            >
              <motion.button
                type="button"
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={`w-12 h-12 rounded-md flex items-center justify-center font-bold relative transition-all duration-300 ${
                  currentStep === step.id
                    ? "bg-card text-foreground shadow-[0_0_20px_rgba(139,92,246,0.4)] ring-4 ring-primary/30 border-2 border-primary"
                    : currentStep > step.id
                    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border-2 border-emerald-500/50"
                    : "bg-muted/5 backdrop-blur-[10px] text-muted-foreground border-2 border-border/50 hover:border-primary/50 hover:bg-muted/10"
                }`}
                animate={{
                  scale: currentStep === step.id ? 1.1 : 1,
                }}
              >
                {currentStep > step.id ? <CheckCircle2 size={24} className="animate-pulse" /> : step.id}
                
                {/* Tooltip preview */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-medium py-1.5 px-3 rounded-md whitespace-nowrap border border-border shadow-xl pointer-events-none z-50">
                  {step.desc}
                </div>
              </motion.button>
              <div className="mt-3 text-center">
                <p
                  className={`text-xs md:text-sm font-extrabold tracking-wide uppercase transition-colors ${currentStep === step.id ? "text-foreground" : currentStep > step.id ? "text-emerald-400" : "text-muted-foreground/70"
                    }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-md p-6 md:p-8 border border-border shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 premium-card">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">
                      Course Title <span className="text-destructive">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.title) {
                          showToast("Please enter a title first", "error");
                          return;
                        }
                        try {
                          const result = await generateContent({ title: formData.title }).unwrap();
                          if (result.success) {
                            setFormData(prev => ({
                              ...prev,
                              description: result.data.description,
                              category: result.data.category,
                              tags: result.data.tags
                            }));
                            setTagsInput(result.data.tags.join(", "));
                            showToast("AI content generated!", "success");
                          }
                        } catch (err) {
                          showToast("Failed to generate AI content", "error");
                        }
                      }}
                      disabled={generatingAI}
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:text-blue-700 transition-colors"
                    >
                      {generatingAI ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      Magic Fill
                    </button>
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Master Advanced React and Framer Motion"
                    className="w-full px-5 py-4 rounded-md bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground/50"
                    required
                  />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-2">
                      Category <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="category"
                      value={showCustomCategory ? "__custom__" : formData.category}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setShowCustomCategory(true);
                          setFormData((prev) => ({ ...prev, category: customCategoryInput }));
                        } else {
                          setShowCustomCategory(false);
                          setCustomCategoryInput("");
                          handleChange(e);
                        }
                      }}
                      className="w-full px-5 py-4 rounded-md bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 appearance-none"
                      required={!showCustomCategory}
                    >
                      <option value="" className="text-muted-foreground">Select Category</option>
                      <option value="Development" className="bg-card">Web Development</option>
                      <option value="Mobile" className="bg-card">Mobile Development</option>
                      <option value="DataScience" className="bg-card">Data Science &amp; ML</option>
                      <option value="CloudDevOps" className="bg-card">Cloud &amp; DevOps</option>
                      <option value="Cybersecurity" className="bg-card">Cybersecurity</option>
                      <option value="Design" className="bg-card">UI/UX Design</option>
                      <option value="GraphicDesign" className="bg-card">Graphic Design</option>
                      <option value="Business" className="bg-card">Business</option>
                      <option value="Marketing" className="bg-card">Marketing</option>
                      <option value="Finance" className="bg-card">Finance &amp; Accounting</option>
                      <option value="Photography" className="bg-card">Photography &amp; Video</option>
                      <option value="Music" className="bg-card">Music &amp; Audio</option>
                      <option value="Health" className="bg-card">Health &amp; Fitness</option>
                      <option value="Language" className="bg-card">Language Learning</option>
                      <option value="PersonalDev" className="bg-card">Personal Development</option>
                      <option value="__custom__" className="bg-card font-semibold text-primary">✏️ Add Custom Category…</option>
                    </select>
                    {showCustomCategory && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={customCategoryInput}
                          onChange={(e) => {
                            setCustomCategoryInput(e.target.value);
                            setFormData((prev) => ({ ...prev, category: e.target.value }));
                          }}
                          placeholder="Type your category name…"
                          className="flex-1 px-4 py-3 rounded-md bg-muted/30 border border-primary/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 text-sm"
                          autoFocus
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomCategory(false);
                            setCustomCategoryInput("");
                            setFormData((prev) => ({ ...prev, category: "" }));
                          }}
                          className="px-3 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all text-xs font-bold"
                          title="Cancel custom category"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-2">
                      Level <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-md bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 appearance-none"
                      required
                    >
                      <option value="Beginner" className="bg-card">Beginner</option>
                      <option value="Intermediate" className="bg-card">Intermediate</option>
                      <option value="Advanced" className="bg-card">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-2">
                      Price (Rs)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                        रू
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-12 pr-5 py-4 rounded-md bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground/50"
                        placeholder="0 for free"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-2">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell your students what they'll learn..."
                    className="w-full px-5 py-4 rounded-md bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 resize-none placeholder:text-muted-foreground/50"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                    Course Type
                  </label>
                  <div className="flex bg-secondary/50 p-1.5 rounded-md w-fit border border-border/50">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, courseType: "full" }))
                      }
                      className={`px-8 py-2.5 rounded-md text-sm font-bold transition-all duration-300 ${formData.courseType === "full"
                        ? "bg-background text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Full Course
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          courseType: "syllabus",
                        }))
                      }
                      className={`px-8 py-2.5 rounded-md text-sm font-bold transition-all duration-300 ${formData.courseType === "syllabus"
                        ? "bg-background text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Syllabus Only
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTagsInput(val);
                      const tagsArray = val
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t !== "");
                      setFormData((prev) => ({ ...prev, tags: tagsArray }));
                    }}
                    placeholder="React, Frontend, JavaScript"
                    className="w-full px-5 py-4 rounded-md bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                    Separate tags with commas
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Media */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-card/40 backdrop-blur-md rounded-md p-6 md:p-8 border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 premium-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-3">
                      Course Thumbnail
                    </label>
                    <div className="relative group">
                      <div
                        className={`aspect-video rounded-md overflow-hidden border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-4 relative group hover:scale-[1.02] ${
                          formData.thumbnail
                            ? "border-primary/30 bg-primary/10"
                            : "border-border/50 hover:border-primary/50 hover:bg-muted/10 bg-muted/5"
                        }`}
                      >
                        {formData.thumbnail ? (
                          <img
                            src={formData.thumbnail}
                            alt="Thumbnail"
                            className="w-full h-full object-cover rounded-md shadow-lg ring-1 ring-white/10"
                          />
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                              <ImageIcon size={28} className="text-primary group-hover:text-accent transition-colors" />
                            </div>
                            <p className="text-sm font-bold text-foreground mb-3 tracking-wide">
                              Drop files here or click to browse
                            </p>
                            <div className="flex gap-2 justify-center">
                              <span className="text-[10px] font-bold text-muted-foreground bg-muted/10 px-2 py-1 rounded-md border border-border/50 tracking-widest">JPG</span>
                              <span className="text-[10px] font-bold text-muted-foreground bg-muted/10 px-2 py-1 rounded-md border border-border/50 tracking-widest">PNG</span>
                              <span className="text-[10px] font-bold text-muted-foreground bg-muted/10 px-2 py-1 rounded-md border border-border/50 tracking-widest">WEBP</span>
                            </div>
                          </>
                        )}
                        <input
                          type="file"
                          onChange={handleThumbnailUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                        />
                      </div>
                      {formData.thumbnail && (
                        <div className="absolute top-2 right-2 flex gap-2">
                          <div className="bg-background/90 backdrop-blur-sm p-2 rounded-md shadow-sm text-green-600">
                            <CheckCircle2 size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-3">
                      Course Syllabus{" "}
                      {formData.courseType === "syllabus" && (
                        <span className="text-destructive">*</span>
                      )}
                    </label>
                    <div className="relative group">
                      <div
                        className={`h-[180px] rounded-md overflow-hidden border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-4 relative group hover:scale-[1.02] ${formData.syllabus
                          ? "border-accent/30 bg-accent/10"
                          : "border-border/50 hover:border-accent/50 hover:bg-muted/10 bg-muted/5"
                          }`}
                      >
                        {formData.syllabus ? (
                          <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-primary/20 rounded-md flex items-center justify-center mb-4 shadow-inner">
                              <FileText size={28} className="text-accent" />
                            </div>
                            <p className="text-sm font-bold text-accent">
                              Syllabus Uploaded
                            </p>
                            <a
                              href={formData.syllabus}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-foreground hover:text-accent hover:underline mt-2 font-medium"
                            >
                              View Document
                            </a>
                          </div>
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-primary/20 rounded-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-accent/10 shadow-[inset_0_2px_10px_rgba(236,72,153,0.1)]">
                              <FileText size={28} className="text-accent group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-sm font-bold text-foreground mb-3 tracking-wide">
                              Drop PDF here or browse
                            </p>
                            <div className="flex gap-2 justify-center">
                              <span className="text-[10px] font-bold text-muted-foreground bg-muted/10 px-2 py-1 rounded-md border border-border/50 tracking-widest">PDF</span>
                              <span className="text-[10px] font-bold text-muted-foreground bg-muted/10 px-2 py-1 rounded-md border border-border/50 tracking-widest">DOCX</span>
                            </div>
                          </>
                        )}
                        <input
                          type="file"
                          onChange={handleSyllabusUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".pdf,.doc,.docx"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo / Preview Video */}
              <div className="bg-card/40 backdrop-blur-md rounded-md p-6 md:p-8 border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-4 premium-card">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-foreground uppercase tracking-wide">
                      Demo / Preview Video
                      <span className="ml-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 uppercase normal-case tracking-normal">Optional</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Free preview video to attract students before they purchase</p>
                  </div>
                  {formData.demoVideo && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, demoVideo: "" }))}
                      className="text-xs font-bold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {formData.demoVideo ? (
                  <div className="relative rounded-md overflow-hidden border border-border/50 bg-black shadow-sm aspect-video">
                    {getYoutubeVideoId(formData.demoVideo) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(formData.demoVideo)}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Demo Video Preview"
                      />
                    ) : (
                      <video
                        src={formData.demoVideo}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                    <span className="absolute top-3 left-3 bg-green-500 text-foreground text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow">
                      {getYoutubeVideoId(formData.demoVideo) ? "YouTube · Preview Ready" : "Preview Ready"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Two-option picker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Upload Local File */}
                      <div className="relative group cursor-pointer">
                        <input
                          type="file"
                          onChange={handleDemoVideoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          accept="video/*"
                          disabled={uploadingDemoVideo}
                        />
                        <div className={`border-2 border-dashed rounded-md p-6 text-center flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-muted/30 group-hover:border-emerald-500/40 ${
                          uploadingDemoVideo
                            ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                            : "border-border/50 bg-muted/5"
                        }`}>
                          {uploadingDemoVideo ? (
                            <>
                              <div className="relative mb-3">
                                <div className="absolute inset-0 rounded-full bg-green-400/20 blur-lg animate-pulse" />
                                <Loader2 size={28} className="text-green-400 animate-spin relative z-10" />
                              </div>
                              <p className="text-xs font-bold text-green-400">Uploading...</p>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-primary/20 rounded-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/10">
                                <Upload size={22} className="text-emerald-500 group-hover:text-primary transition-colors" />
                              </div>
                              <p className="text-sm font-bold text-foreground mb-1">Upload Local File</p>
                              <div className="flex gap-1.5 justify-center">
                                <span className="text-[9px] font-bold text-muted-foreground bg-muted/10 px-1.5 py-0.5 rounded border border-border/50">MP4</span>
                                <span className="text-[9px] font-bold text-muted-foreground bg-muted/10 px-1.5 py-0.5 rounded border border-border/50">WEBM</span>
                                <span className="text-[9px] font-bold text-muted-foreground bg-muted/10 px-1.5 py-0.5 rounded border border-border/50">MOV</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* YouTube Link */}
                      <div
                        onClick={() => { setShowDemoYoutubeInput(true); setDemoYoutubeUrl(""); }}
                        className="border-2 border-dashed border-border/50 rounded-md p-6 text-center hover:bg-muted/30 hover:border-red-500/40 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-red-500/10">
                          <Video size={22} className="text-red-500 group-hover:text-red-400 transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-foreground mb-1">Add YouTube Link</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Embed lecture from YouTube</p>
                      </div>
                    </div>

                    {/* Inline YouTube URL Input */}
                    {showDemoYoutubeInput && (
                      <div className="p-4 bg-card border border-border/60 rounded-md shadow-sm space-y-3 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Paste YouTube Link</label>
                          <button
                            type="button"
                            onClick={() => { setShowDemoYoutubeInput(false); setDemoYoutubeUrl(""); }}
                            className="text-muted-foreground hover:text-foreground transition-colors text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={demoYoutubeUrl}
                            onChange={(e) => setDemoYoutubeUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddDemoYoutubeUrl()}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="flex-1 text-sm px-3 py-2.5 rounded-md border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 text-foreground placeholder:text-muted-foreground/50"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleAddDemoYoutubeUrl}
                            className="px-4 py-2 bg-red-500 hover:bg-red-500/90 text-white text-sm font-bold rounded-md transition-colors flex items-center gap-1.5"
                          >
                            <Video size={14} /> Add
                          </button>
                        </div>
                        {demoYoutubeUrl && getYoutubeVideoId(demoYoutubeUrl) && (
                          <div className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} /> Valid YouTube URL detected
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Curriculum */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    Construct Curriculum
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    Add sections and lessons. Upload multiple files to each
                    lesson.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSection}
                  className="flex items-center gap-2 bg-muted/50 hover:bg-muted backdrop-blur-md rounded-md px-6 py-2.5 text-foreground font-bold transition-all duration-300 border border-border hover:border-primary/50 shadow-lg hover:shadow-primary/20 active:scale-95 text-sm tracking-wide"
                >
                  <Plus size={18} className="text-primary" /> Add Section
                </button>
              </div>

              <div className="space-y-6">
                {formData.sections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="border border-border/50 rounded-md overflow-hidden bg-card/50 backdrop-blur-md shadow-xl border-l-4 border-l-primary transition-all duration-300 hover:shadow-2xl hover:border-border"
                  >
                    {/* Section Header */}
                    <div className="flex justify-between items-center p-5 bg-muted/10 border-b border-border/50">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleSection(sIdx)}
                          className="w-8 h-8 flex items-center justify-center bg-secondary rounded-md shadow-inner text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors border border-border/50"
                        >
                          {section.isOpen ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-[9px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded border border-primary/20 uppercase tracking-widest">
                            Section {sIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) =>
                              updateSectionTitle(sIdx, e.target.value)
                            }
                            className="font-bold bg-transparent border-b border-transparent focus:border-primary outline-none px-2 flex-1 text-foreground text-lg transition-all placeholder:text-muted-foreground/50"
                            placeholder="Section Title"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSection(sIdx)}
                        className="text-muted-foreground/70 hover:text-destructive p-2 hover:bg-destructive/10 rounded-md transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Section Contents */}
                    {section.isOpen && (
                      <div className="p-6 space-y-6 bg-muted/5">
                        <div className="space-y-6 lg:pl-4">
                          {section.contents.map((content, cIdx) => (
                            <div
                              key={cIdx}
                              className="group bg-card rounded-md border border-border/50 shadow-lg overflow-hidden hover:border-primary/30 transition-all duration-300"
                            >
                              {/* Content Header */}
                              <div className="flex justify-between items-center p-4 bg-muted/10 border-b border-border/50">
                                <div className="flex items-center gap-4 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleContent(sIdx, cIdx)}
                                    className="w-6 h-6 flex items-center justify-center bg-secondary rounded-md shadow-inner border border-border/50 hover:text-foreground"
                                  >
                                    {content.isOpen ? (
                                      <ChevronUp
                                        size={14}
                                        className="text-muted-foreground"
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={14}
                                        className="text-muted-foreground"
                                      />
                                    )}
                                  </button>
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="text-[9px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20 uppercase tracking-widest">
                                      {content.type === "quiz" ? "Quiz" : content.type === "assignment" ? "Assignment" : "Lesson"} {cIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={content.title}
                                      onChange={(e) =>
                                        updateContent(
                                          sIdx,
                                          cIdx,
                                          "title",
                                          e.target.value,
                                        )
                                      }
                                      className="font-bold bg-transparent outline-none flex-1 text-foreground transition-all border-b border-transparent focus:border-primary placeholder:text-muted-foreground/50 px-1"
                                      placeholder={content.type === "quiz" ? "Quiz Title" : content.type === "assignment" ? "Assignment Title" : "Lesson Title"}
                                    />
                                  </div>
                                  {content.resources?.length > 0 && (
                                    <span className="text-[9px] font-black text-muted-foreground bg-secondary border border-border/50 px-3 py-1 rounded-md uppercase tracking-tighter">
                                      {content.resources.length} resource
                                      {content.resources.length !== 1
                                        ? "s"
                                        : ""}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeContent(sIdx, cIdx)}
                                  className="text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors ml-4"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              {/* Content Body */}
                              {content.isOpen && (
                                <div className="p-5 space-y-6">
                                  {content.type === "quiz" ? (
                                    <QuizBuilder
                                      content={content}
                                      onChange={(updatedContent) => {
                                        const newSections = [...formData.sections];
                                        newSections[sIdx].contents[cIdx] = updatedContent;
                                        setFormData({ ...formData, sections: newSections });
                                      }}
                                    />
                                  ) : content.type === "assignment" ? (
                                    <AssignmentBuilder
                                      content={content}
                                      onChange={(updatedContent) => {
                                        const newSections = [...formData.sections];
                                        newSections[sIdx].contents[cIdx] = updatedContent;
                                        setFormData({ ...formData, sections: newSections });
                                      }}
                                    />
                                  ) : (
                                    <>
                                      {/* Lesson Description */}
                                      <div>
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                                          Lesson Description
                                        </label>
                                        <textarea
                                          value={content.description}
                                          onChange={(e) =>
                                            updateContent(
                                              sIdx,
                                              cIdx,
                                              "description",
                                              e.target.value,
                                            )
                                          }
                                          rows="3"
                                          placeholder="What will students learn in this specific lesson?"
                                          className="w-full text-sm px-5 py-4 rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none bg-muted/30 text-foreground placeholder:text-muted-foreground/50 shadow-inner transition-all duration-200"
                                        />
                                      </div>

                                  {/* Resources List */}
                                  <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                      Learning Materials
                                    </label>

                                    <div className="grid grid-cols-1 gap-3">
                                      {content.resources.map((resource) => (
                                        <div
                                          key={resource.id}
                                          className={`flex items-center gap-4 p-3 bg-secondary/50 rounded-md border transition-all duration-300 ${resource.isUploading
                                            ? "border-primary/30 bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                                            : "border-border/50 group/item hover:border-primary/30 hover:bg-muted/10"
                                            }`}
                                        >
                                          <div className="relative flex-shrink-0">
                                            {resource.type === "video" ? (
                                              <div className="w-14 h-14 bg-muted rounded-md overflow-hidden flex items-center justify-center relative shadow-sm border border-border/50">
                                                {getYoutubeVideoId(resource.url) ? (
                                                  <img
                                                    src={`https://img.youtube.com/vi/${getYoutubeVideoId(resource.url)}/mqdefault.jpg`}
                                                    alt="YouTube Preview"
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <video
                                                    src={resource.url}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                  />
                                                )}
                                                <Play
                                                  size={14}
                                                  className="text-foreground absolute z-10 opacity-70 mix-blend-difference"
                                                />
                                              </div>
                                            ) : resource.type === "image" ? (
                                              <div className="w-14 h-14 bg-muted rounded-md overflow-hidden border border-border/50 shadow-sm">
                                                <img
                                                  src={resource.url}
                                                  alt=""
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                            ) : (
                                              <div className="w-14 h-14 bg-muted rounded-md shadow-sm border border-border/50 flex items-center justify-center text-muted-foreground">
                                                {getResourceIcon(resource.type)}
                                              </div>
                                            )}

                                            {resource.isUploading && (
                                              <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center rounded-md">
                                                <Loader2 className="animate-spin h-5 w-5 text-primary" />
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <input
                                              type="text"
                                              value={resource.name}
                                              disabled={resource.isUploading}
                                              onChange={(e) =>
                                                updateResourceName(
                                                  sIdx,
                                                  cIdx,
                                                  resource.id,
                                                  e.target.value,
                                                )
                                              }
                                              className="text-sm font-bold bg-transparent outline-none w-full truncate text-foreground hover:text-primary transition-colors"
                                            />
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-[9px] font-black text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded tracking-widest">
                                                {resource.type.toUpperCase()}
                                              </span>
                                              <span className="text-[10px] font-bold text-muted-foreground">
                                                {formatFileSize(resource.size)}
                                              </span>
                                              {resource.duration > 0 && (
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                                                  <Clock size={10} />
                                                  {Math.floor(
                                                    resource.duration / 60,
                                                  )}
                                                  :
                                                  {(resource.duration % 60)
                                                    .toString()
                                                    .padStart(2, "0")}
                                                </span>
                                              )}
                                              {resource.isUploading ? (
                                                <span className="text-[9px] font-black text-primary animate-pulse uppercase ml-1">
                                                  Uploading...
                                                </span>
                                              ) : (
                                                <span className="text-[9px] font-black text-green-500 uppercase ml-1 flex items-center gap-0.5">
                                                  <CheckCircle2 size={10} />{" "}
                                                  Ready
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {!resource.isUploading && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all duration-300">
                                              <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-muted-foreground/70 hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                                                title="Preview"
                                              >
                                                <Upload
                                                  size={16}
                                                  className="rotate-180"
                                                />
                                              </a>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeResource(
                                                    sIdx,
                                                    cIdx,
                                                    resource.id,
                                                  )
                                                }
                                                className="p-2 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}

                                      {/* Add Resource Area */}
                                      <div className="mt-4 p-4 border border-border/50 rounded-md bg-secondary/10 space-y-4 shadow-sm">
                                        <div className="flex items-center justify-between border-b border-border/20 pb-2">
                                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Add Learning Resource</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {/* Upload Local File Option */}
                                          <div className="relative group cursor-pointer">
                                            <input
                                              type="file"
                                              multiple
                                              onChange={(e) => {
                                                if (e.target.files.length > 0) {
                                                  addResource(
                                                    sIdx,
                                                    cIdx,
                                                    Array.from(e.target.files),
                                                  );
                                                }
                                              }}
                                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                              accept="video/*,image/*,.pdf,.doc,.docx,.txt"
                                            />
                                            <div className="border border-dashed border-border/50 rounded-md p-4 text-center group-hover:bg-muted/30 group-hover:border-primary/30 transition-all duration-300 h-full flex flex-col items-center justify-center">
                                              <Upload size={18} className="text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                                              <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors block">Upload Local File</span>
                                              <span className="text-[9px] text-muted-foreground/60 font-medium block mt-0.5">Videos, PDFs, Images</span>
                                            </div>
                                          </div>

                                          {/* YouTube Link Option */}
                                          <div 
                                            onClick={() => {
                                              setActiveYoutubeInput({ sectionIndex: sIdx, contentIndex: cIdx });
                                              setYoutubeUrl("");
                                            }}
                                            className="border border-dashed border-border/50 rounded-md p-4 text-center hover:bg-muted/30 hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group"
                                          >
                                            <Video size={18} className="text-muted-foreground group-hover:text-red-500 mb-2 transition-colors animate-pulse" />
                                            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors block">Add YouTube Link</span>
                                            <span className="text-[9px] text-muted-foreground/60 font-medium block mt-0.5">Embed lectures from YouTube</span>
                                          </div>
                                        </div>

                                        {/* Inline YouTube Input Field */}
                                        {activeYoutubeInput?.sectionIndex === sIdx && activeYoutubeInput?.contentIndex === cIdx && (
                                          <div className="mt-3 p-3 bg-card border border-border/60 rounded-md shadow-sm space-y-3 animate-in fade-in duration-300">
                                            <div className="flex justify-between items-center">
                                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Paste YouTube Link</label>
                                              <button 
                                                type="button" 
                                                onClick={() => setActiveYoutubeInput(null)}
                                                className="text-muted-foreground hover:text-foreground transition-colors text-xs font-bold"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                            <div className="flex gap-2">
                                              <input
                                                type="text"
                                                value={youtubeUrl}
                                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="flex-1 text-xs px-3 py-2 rounded-md border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => handleAddYoutubeResource(sIdx, cIdx)}
                                                className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-md transition-colors"
                                              >
                                                Add
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                              </div>
                            )}
                          </div>
                        ))}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                              type="button"
                              onClick={() => addContent(sIdx, "mixed")}
                              className="w-full py-4 border-2 border-dashed border-border/50 rounded-md text-muted-foreground/70 hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm tracking-tight group"
                            >
                              <Plus size={18} className="group-hover:scale-110 transition-transform" /> Add Lesson
                            </button>
                            <button
                              type="button"
                              onClick={() => addContent(sIdx, "quiz")}
                              className="w-full py-4 border-2 border-dashed border-border/50 rounded-md text-muted-foreground/70 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm tracking-tight group"
                            >
                              <Plus size={18} className="group-hover:scale-110 transition-transform" /> Add Quiz
                            </button>
                            <button
                              type="button"
                              onClick={() => addContent(sIdx, "assignment")}
                              className="w-full py-4 border-2 border-dashed border-border/50 rounded-md text-muted-foreground/70 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm tracking-tight group"
                            >
                              <Plus size={18} className="group-hover:scale-110 transition-transform" /> Add Assignment
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {formData.sections.length === 0 && (
                  <div className="text-center py-16 bg-muted/50 rounded-md border border-border/50 shadow-2xl backdrop-blur-sm">
                    <div className="w-20 h-20 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                      <Plus size={40} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">
                      Empty Curriculum
                    </h3>
                    <p className="text-sm text-muted-foreground mb-8 font-medium max-w-xs mx-auto">
                      Add sections and lessons to start building your course content.
                    </p>
                    <button
                      type="button"
                      onClick={addSection}
                      className="bg-primary/10 backdrop-blur-md border border-primary/20 text-primary px-8 py-3 rounded-md hover:bg-primary hover:text-primary-foreground font-bold transition-all duration-300 shadow-lg hover:shadow-primary/20 active:scale-95 tracking-wide"
                    >
                      Initialize First Section
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Coupons */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    Discount Coupons
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    Create promotional offers for your students
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCoupon}
                  className="flex items-center gap-2 bg-muted/50 hover:bg-muted backdrop-blur-md rounded-md px-6 py-2.5 text-foreground font-bold transition-all duration-300 border border-border hover:border-primary/50 shadow-lg hover:shadow-primary/20 active:scale-95 text-sm tracking-wide"
                >
                  <Plus size={18} className="text-primary" /> Add Coupon
                </button>
              </div>

              <div className="space-y-4">
                {formData.coupons.map((coupon, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card backdrop-blur-xl p-6 md:p-8 rounded-md border border-border/50 shadow-2xl space-y-6 relative group premium-card"
                  >
                    <button
                      type="button"
                      onClick={() => removeCoupon(idx)}
                      className="absolute top-4 right-4 p-2 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                          Coupon Code
                        </label>
                        <div className="relative">
                          <Ticket size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="E.g. WELCOME50"
                            value={coupon.code}
                            onChange={(e) => updateCouponField(idx, "code", e.target.value.toUpperCase())}
                            className="w-full pl-11 pr-5 py-4 bg-muted/30 rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/50 font-bold transition-all duration-300 shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                            Discount
                          </label>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={coupon.discount}
                            onChange={(e) => updateCouponField(idx, "discount", e.target.value)}
                            className="w-full px-5 py-4 bg-muted/30 rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/50 font-bold transition-all duration-300 shadow-inner"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                            Type
                          </label>
                          <select
                            value={coupon.type}
                            onChange={(e) => updateCouponField(idx, "type", e.target.value)}
                            className="w-full px-5 py-4 bg-muted/30 rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-foreground placeholder-text-muted-foreground/50 font-bold transition-all duration-300 shadow-inner appearance-none cursor-pointer"
                          >
                            <option value="percentage" className="bg-card text-foreground">% Percentage</option>
                            <option value="fixed" className="bg-card text-foreground">Fixed Amount</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                          Expiry Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={coupon.expiry}
                          onChange={(e) => updateCouponField(idx, "expiry", e.target.value)}
                          className="w-full px-5 py-4 bg-muted/30 rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-foreground placeholder-text-muted-foreground/50 font-bold transition-all duration-300 shadow-inner [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                          Max Uses (Optional)
                        </label>
                        <input
                          type="number"
                          placeholder="Unlimited if empty"
                          value={coupon.maxUses}
                          onChange={(e) => updateCouponField(idx, "maxUses", e.target.value)}
                          className="w-full px-5 py-4 bg-muted/30 rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/50 font-bold transition-all duration-300 shadow-inner"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {formData.coupons.length === 0 && (
                  <div className="text-center py-12 bg-muted/20 rounded-md border-2 border-dashed border-border/50">
                    <p className="text-sm text-muted-foreground font-medium tracking-wide">No coupons added yet. This is optional.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-border/50">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
            className={`px-6 py-3 rounded-md font-bold flex items-center gap-2 transition-all duration-300 ${currentStep === 1 || loading
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading || !formData.title}
              className="px-8 py-3 rounded-md font-bold text-primary border border-primary/30 hover:bg-primary/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] tracking-wide"
            >
              Save as Draft
            </button>
            {currentStep < steps.length ? (
              <button
                key="btn-next"
                type="button"
                onClick={nextStep}
                className="bg-primary text-primary-foreground px-10 py-3 rounded-md font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-2 border border-primary/50"
              >
                Forward <ArrowRight size={18} />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="button"
                onClick={handleSubmit}
                disabled={loading || Object.values(uploadingFiles).some(Boolean)}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-10 py-3 rounded-md font-bold hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg shadow-primary/25 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide border border-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Finalizing...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Launch Course
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      <UploadStatusOverlay
        isOpen={showPublishOverlay}
        totalFiles={Object.keys(uploadingFiles).length}
        uploadedFiles={0} // We can compute this more accurately if needed
      />
    </div>
  );
};

export default AddCourse;
