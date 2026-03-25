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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
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
      if (!formData.title || !formData.category || !formData.description) {
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
    <div className="bg-card/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-border/50 rounded-3xl p-6 md:p-10 min-h-screen transform-gpu transition-all duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent tracking-tight drop-shadow-sm mb-2">
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
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 rounded-full -translate-y-1/2 z-0" />
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full -translate-y-1/2 z-0 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
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
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative transition-all duration-300 ${
                  currentStep === step.id
                    ? "bg-[#1A1A2E] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] ring-4 ring-violet-500/30 border-2 border-violet-500"
                    : currentStep > step.id
                    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border-2 border-emerald-500/50"
                    : "bg-white/5 backdrop-blur-[10px] text-[#A0A0B8] border-2 border-white/10 hover:border-violet-500/50 hover:bg-white/10"
                }`}
                animate={{
                  scale: currentStep === step.id ? 1.1 : 1,
                }}
              >
                {currentStep > step.id ? <CheckCircle2 size={24} className="animate-pulse" /> : step.id}
                
                {/* Tooltip preview */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A2E] text-white text-[10px] font-medium py-1.5 px-3 rounded-lg whitespace-nowrap border border-white/10 shadow-xl pointer-events-none z-50">
                  {step.desc}
                </div>
              </motion.button>
              <div className="mt-3 text-center">
                <p
                  className={`text-xs md:text-sm font-extrabold tracking-wide uppercase transition-colors ${currentStep === step.id ? "text-white" : currentStep > step.id ? "text-emerald-400" : "text-[#6B6B80]"
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
              <div className="bg-card/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 premium-card">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-semibold text-[#A0A0B8] uppercase tracking-[0.05em]">
                      Course Title <span className="text-pink-500">*</span>
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
                    className="w-full px-5 py-4 rounded-xl bg-[#1A1A2E] border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-white placeholder:text-[#6B6B80] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    required
                  />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#A0A0B8] uppercase tracking-[0.05em] mb-2">
                      Category <span className="text-pink-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl bg-[#1A1A2E] border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] appearance-none"
                      required
                    >
                      <option value="" className="text-[#6B6B80]">Select Category</option>
                      <option value="Development" className="bg-[#1A1A2E]">Development</option>
                      <option value="Business" className="bg-[#1A1A2E]">Business</option>
                      <option value="Design" className="bg-[#1A1A2E]">Design</option>
                      <option value="Marketing" className="bg-[#1A1A2E]">Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#A0A0B8] uppercase tracking-[0.05em] mb-2">
                      Price (Rs)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0B8] font-bold">
                        रू
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-12 pr-5 py-4 rounded-xl bg-[#1A1A2E] border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-white placeholder:text-[#6B6B80] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        placeholder="0 for free"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#A0A0B8] uppercase tracking-[0.05em] mb-2">
                    Description <span className="text-pink-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell your students what they'll learn..."
                    className="w-full px-5 py-4 rounded-xl bg-[#1A1A2E] border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-white placeholder:text-[#6B6B80] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] resize-none"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                    Course Type
                  </label>
                  <div className="flex bg-secondary/50 p-1.5 rounded-2xl w-fit border border-border/50">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, courseType: "full" }))
                      }
                      className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${formData.courseType === "full"
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
                      className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${formData.courseType === "syllabus"
                        ? "bg-background text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Syllabus Only
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#A0A0B8] uppercase tracking-[0.05em] mb-2">
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
                    className="w-full px-5 py-4 rounded-xl bg-[#1A1A2E] border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-white placeholder:text-[#6B6B80] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  />
                  <p className="text-[10px] text-[#A0A0B8] mt-2 font-medium">
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
              <div className="bg-card/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 premium-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-semibold text-[#A0A0B8] uppercase tracking-[0.05em] mb-3">
                      Course Thumbnail
                    </label>
                    <div className="relative group">
                      <div
                        className={`aspect-video rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-4 relative group hover:scale-[1.02] ${
                          formData.thumbnail
                            ? "border-violet-500/30 bg-violet-500/10"
                            : "border-white/10 hover:border-violet-500/50 hover:bg-[#1A1A2E] bg-[rgba(15,15,26,0.5)]"
                        }`}
                      >
                        {formData.thumbnail ? (
                          <img
                            src={formData.thumbnail}
                            alt="Thumbnail"
                            className="w-full h-full object-cover rounded-xl shadow-lg ring-1 ring-white/10"
                          />
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                              <ImageIcon size={28} className="text-violet-400 group-hover:text-pink-400 transition-colors" />
                            </div>
                            <p className="text-sm font-bold text-white mb-3 tracking-wide">
                              Drop files here or click to browse
                            </p>
                            <div className="flex gap-2 justify-center">
                              <span className="text-[10px] font-bold text-[#A0A0B8] bg-white/5 px-2 py-1 rounded-full border border-white/10 tracking-widest">JPG</span>
                              <span className="text-[10px] font-bold text-[#A0A0B8] bg-white/5 px-2 py-1 rounded-full border border-white/10 tracking-widest">PNG</span>
                              <span className="text-[10px] font-bold text-[#A0A0B8] bg-white/5 px-2 py-1 rounded-full border border-white/10 tracking-widest">WEBP</span>
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
                          <div className="bg-background/90 backdrop-blur-sm p-2 rounded-lg shadow-sm text-green-600">
                            <CheckCircle2 size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[11px] font-semibold text-[#A0A0B8] uppercase tracking-[0.05em] mb-3">
                      Course Syllabus{" "}
                      {formData.courseType === "syllabus" && (
                        <span className="text-pink-500">*</span>
                      )}
                    </label>
                    <div className="relative group">
                      <div
                        className={`h-[180px] rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-4 relative group hover:scale-[1.02] ${formData.syllabus
                          ? "border-pink-500/30 bg-pink-500/10"
                          : "border-white/10 hover:border-pink-500/50 hover:bg-[#1A1A2E] bg-[rgba(15,15,26,0.5)]"
                          }`}
                      >
                        {formData.syllabus ? (
                          <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
                              <FileText size={28} className="text-pink-400" />
                            </div>
                            <p className="text-sm font-bold text-pink-400">
                              Syllabus Uploaded
                            </p>
                            <a
                              href={formData.syllabus}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-white hover:text-pink-300 hover:underline mt-2 font-medium"
                            >
                              View Document
                            </a>
                          </div>
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-pink-500/10 shadow-[inset_0_2px_10px_rgba(236,72,153,0.1)]">
                              <FileText size={28} className="text-pink-400 group-hover:text-orange-400 transition-colors" />
                            </div>
                            <p className="text-sm font-bold text-white mb-3 tracking-wide">
                              Drop PDF here or browse
                            </p>
                            <div className="flex gap-2 justify-center">
                              <span className="text-[10px] font-bold text-[#A0A0B8] bg-white/5 px-2 py-1 rounded-full border border-white/10 tracking-widest">PDF</span>
                              <span className="text-[10px] font-bold text-[#A0A0B8] bg-white/5 px-2 py-1 rounded-full border border-white/10 tracking-widest">DOCX</span>
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
              <div className="bg-card/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-4 premium-card">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-foreground uppercase tracking-wide">
                      Demo / Preview Video
                      <span className="ml-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase normal-case tracking-normal">Optional</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Free preview video to attract students before they purchase</p>
                  </div>
                  {formData.demoVideo && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, demoVideo: "" }))}
                      className="text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {formData.demoVideo ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-black shadow-sm aspect-video">
                    <video
                      src={formData.demoVideo}
                      controls
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute top-3 left-3 bg-green-500 text-foreground text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow">
                      Preview Ready
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      className={`aspect-video rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-300 hover:scale-[1.02] ${
                        uploadingDemoVideo
                          ? "border-green-500/50 bg-green-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                          : "border-white/10 hover:border-green-500/50 hover:bg-[#1A1A2E] bg-[rgba(15,15,26,0.5)]"
                      }`}
                    >
                      <input
                        type="file"
                        onChange={handleDemoVideoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="video/*"
                        disabled={uploadingDemoVideo}
                      />
                      {uploadingDemoVideo ? (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-green-400/20 blur-xl animate-pulse"></div>
                            <Loader2 size={36} className="text-green-400 animate-spin mb-4 relative z-10" />
                          </div>
                          <p className="text-sm font-bold text-white tracking-wide">Uploading preview video...</p>
                          <p className="text-xs text-green-400 mt-2 font-medium">This may take a moment for large files</p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border border-green-500/10 shadow-[inset_0_2px_10px_rgba(16,185,129,0.1)]">
                            <Video size={28} className="text-green-400 group-hover:text-emerald-400 transition-colors" />
                          </div>
                          <p className="text-sm font-bold text-white mb-3 tracking-wide">Drop preview video here</p>
                          <div className="flex gap-2 justify-center">
                            <span className="text-[10px] font-bold text-[#A0A0B8] bg-white/5 px-2 py-1 rounded-full border border-white/10 tracking-widest">MP4</span>
                            <span className="text-[10px] font-bold text-[#A0A0B8] bg-white/5 px-2 py-1 rounded-full border border-white/10 tracking-widest">WEBM</span>
                            <span className="text-[10px] font-bold text-[#A0A0B8] bg-white/5 px-2 py-1 rounded-full border border-white/10 tracking-widest">MOV</span>
                          </div>
                        </>
                      )}
                    </div>
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
                  className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-6 py-2.5 text-white font-bold transition-all duration-300 border border-white/10 hover:border-violet-500/50 hover:bg-white/10 shadow-lg hover:shadow-violet-500/20 active:scale-95 text-sm tracking-wide"
                >
                  <Plus size={18} className="text-violet-400" /> Add Section
                </button>
              </div>

              <div className="space-y-6">
                {formData.sections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="border border-white/5 rounded-2xl overflow-hidden bg-[rgba(26,26,46,0.5)] backdrop-blur-md shadow-xl border-l-4 border-l-violet-500 transition-all duration-300 hover:shadow-2xl hover:border-white/10"
                  >
                    {/* Section Header */}
                    <div className="flex justify-between items-center p-5 bg-white/5 border-b border-white/5">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleSection(sIdx)}
                          className="w-8 h-8 flex items-center justify-center bg-[#252542] rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-[#A0A0B8] hover:text-white hover:bg-violet-500/20 transition-colors border border-white/5"
                        >
                          {section.isOpen ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2.5 py-1 rounded border border-violet-500/20">
                            Section {sIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) =>
                              updateSectionTitle(sIdx, e.target.value)
                            }
                            className="font-bold bg-transparent border-b border-transparent focus:border-violet-500 outline-none px-2 flex-1 text-white text-lg transition-all placeholder-[#6B6B80]"
                            placeholder="Section Title"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSection(sIdx)}
                        className="text-[#6B6B80] hover:text-pink-500 p-2 hover:bg-pink-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Section Contents */}
                    {section.isOpen && (
                      <div className="p-6 space-y-6 bg-[#0F0F1A]/50">
                        <div className="space-y-6 lg:pl-4">
                          {section.contents.map((content, cIdx) => (
                            <div
                              key={cIdx}
                              className="group bg-[#1A1A2E] rounded-2xl border border-white/5 shadow-lg overflow-hidden hover:border-violet-500/30 transition-all duration-300"
                            >
                              {/* Content Header */}
                              <div className="flex justify-between items-center p-4 bg-white/5 border-b border-white/5">
                                <div className="flex items-center gap-4 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleContent(sIdx, cIdx)}
                                    className="w-6 h-6 flex items-center justify-center bg-[#252542] rounded-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] border border-white/5 hover:text-white"
                                  >
                                    {content.isOpen ? (
                                      <ChevronUp
                                        size={14}
                                        className="text-[#A0A0B8]"
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={14}
                                        className="text-[#A0A0B8]"
                                      />
                                    )}
                                  </button>
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="text-[9px] font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20 uppercase tracking-widest">
                                      Lesson {cIdx + 1}
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
                                      className="font-bold bg-transparent outline-none flex-1 text-white transition-all border-b border-transparent focus:border-violet-500 placeholder-[#6B6B80] px-1"
                                      placeholder="Lesson Title"
                                    />
                                  </div>
                                  {content.resources?.length > 0 && (
                                    <span className="text-[9px] font-black text-[#6B6B80] bg-[#252542] border border-white/5 px-3 py-1 rounded-full uppercase tracking-tighter">
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
                                  className="text-[#6B6B80] hover:text-pink-500 hover:bg-pink-500/10 p-2 rounded-lg transition-colors ml-4"
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
                                        <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2">
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
                                          className="w-full text-sm px-5 py-4 rounded-xl border border-white/5 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none resize-none bg-[#1A1A2E] text-white placeholder:text-[#6B6B80] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-200"
                                        />
                                      </div>

                                  {/* Resources List */}
                                  <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest">
                                      Learning Materials
                                    </label>

                                    <div className="grid grid-cols-1 gap-3">
                                      {content.resources.map((resource) => (
                                        <div
                                          key={resource.id}
                                          className={`flex items-center gap-4 p-3 bg-[#0F0F1A] rounded-xl border transition-all duration-300 ${resource.isUploading
                                            ? "border-violet-500/30 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                                            : "border-white/5 group/item hover:border-violet-500/30 hover:bg-[#1A1A2E]"
                                            }`}
                                        >
                                          <div className="relative flex-shrink-0">
                                            {resource.type === "video" ? (
                                              <div className="w-14 h-14 bg-[#1A1A2E] rounded-xl overflow-hidden flex items-center justify-center relative shadow-sm border border-white/5">
                                                <video
                                                  src={resource.url}
                                                  className="w-full h-full object-cover"
                                                  muted
                                                  playsInline
                                                  preload="metadata"
                                                />
                                                <Play
                                                  size={14}
                                                  className="text-white absolute z-10 opacity-70 mix-blend-difference"
                                                />
                                              </div>
                                            ) : resource.type === "image" ? (
                                              <div className="w-14 h-14 bg-[#1A1A2E] rounded-xl overflow-hidden border border-white/5 shadow-sm">
                                                <img
                                                  src={resource.url}
                                                  alt=""
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                            ) : (
                                              <div className="w-14 h-14 bg-[#1A1A2E] rounded-xl shadow-sm border border-white/5 flex items-center justify-center text-[#A0A0B8]">
                                                {getResourceIcon(resource.type)}
                                              </div>
                                            )}

                                            {resource.isUploading && (
                                              <div className="absolute inset-0 bg-[#0F0F1A]/50 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                                                <Loader2 className="animate-spin h-5 w-5 text-violet-400" />
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
                                              className="text-sm font-bold bg-transparent outline-none w-full truncate text-white hover:text-violet-400 transition-colors"
                                            />
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-[9px] font-black text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded tracking-widest">
                                                {resource.type.toUpperCase()}
                                              </span>
                                              <span className="text-[10px] font-bold text-[#A0A0B8]">
                                                {formatFileSize(resource.size)}
                                              </span>
                                              {resource.duration > 0 && (
                                                <span className="flex items-center gap-1 text-[10px] text-[#A0A0B8] font-bold">
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
                                                <span className="text-[9px] font-black text-violet-400 animate-pulse uppercase ml-1">
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
                                                className="p-2 text-[#6B6B80] hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
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
                                                className="p-2 text-[#6B6B80] hover:text-pink-500 hover:bg-pink-500/10 rounded-lg transition-all"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}

                                      {/* Add Resource Area */}
                                      <div className="relative mt-2 group">
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
                                        <div className="border border-dashed border-white/10 rounded-xl p-4 text-center group-hover:bg-[#1A1A2E] group-hover:border-violet-500/30 transition-all duration-300">
                                          <div className="flex items-center justify-center gap-3">
                                            <div className="w-8 h-8 bg-white/5 group-hover:bg-violet-500/20 rounded-full flex items-center justify-center transition-colors">
                                              <Upload
                                                size={14}
                                                className="text-[#A0A0B8] group-hover:text-violet-400 transition-colors"
                                              />
                                            </div>
                                            <div className="text-left">
                                              <p className="text-xs font-bold text-[#A0A0B8] group-hover:text-white transition-colors">
                                                Add lesson materials
                                              </p>
                                              <p className="text-[10px] text-[#6B6B80] font-medium">
                                                Videos, PDFs or Images
                                              </p>
                                            </div>
                                          </div>
                                        </div>
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
                              className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[#6B6B80] hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm tracking-tight group"
                            >
                              <Plus size={18} className="group-hover:scale-110 transition-transform" /> Add Lesson
                            </button>
                            <button
                              type="button"
                              onClick={() => addContent(sIdx, "quiz")}
                              className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[#6B6B80] hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm tracking-tight group"
                            >
                              <Plus size={18} className="group-hover:scale-110 transition-transform" /> Add Quiz
                            </button>
                            <button
                              type="button"
                              onClick={() => addContent(sIdx, "assignment")}
                              className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[#6B6B80] hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm tracking-tight group"
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
                  <div className="text-center py-16 bg-[#1A1A2E]/50 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm">
                    <div className="w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-500/20 shadow-[inset_0_2px_10px_rgba(139,92,246,0.1)]">
                      <Plus size={40} className="text-violet-400" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">
                      Empty Curriculum
                    </h3>
                    <p className="text-sm text-[#A0A0B8] mb-8 font-medium max-w-xs mx-auto">
                      Add sections and lessons to start building your course content.
                    </p>
                    <button
                      type="button"
                      onClick={addSection}
                      className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-3 rounded-full hover:bg-white/10 hover:border-violet-500/50 font-bold transition-all duration-300 shadow-lg hover:shadow-violet-500/20 active:scale-95 tracking-wide"
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
                  className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-6 py-2.5 text-white font-bold transition-all duration-300 border border-white/10 hover:border-violet-500/50 hover:bg-white/10 shadow-lg hover:shadow-violet-500/20 active:scale-95 text-sm tracking-wide"
                >
                  <Plus size={18} className="text-violet-400" /> Add Coupon
                </button>
              </div>

              <div className="space-y-4">
                {formData.coupons.map((coupon, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1A1A2E]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl space-y-6 relative group premium-card"
                  >
                    <button
                      type="button"
                      onClick={() => removeCoupon(idx)}
                      className="absolute top-4 right-4 p-2 text-[#6B6B80] hover:text-pink-500 hover:bg-pink-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2 ml-1">
                          Coupon Code
                        </label>
                        <div className="relative">
                          <Ticket size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0B8]" />
                          <input
                            type="text"
                            placeholder="E.g. WELCOME50"
                            value={coupon.code}
                            onChange={(e) => updateCouponField(idx, "code", e.target.value.toUpperCase())}
                            className="w-full pl-11 pr-5 py-4 bg-[#0F0F1A] rounded-xl border border-white/5 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none text-white placeholder:text-[#6B6B80] font-bold transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2 ml-1">
                            Discount
                          </label>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={coupon.discount}
                            onChange={(e) => updateCouponField(idx, "discount", e.target.value)}
                            className="w-full px-5 py-4 bg-[#0F0F1A] rounded-xl border border-white/5 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none text-white placeholder:text-[#6B6B80] font-bold transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2 ml-1">
                            Type
                          </label>
                          <select
                            value={coupon.type}
                            onChange={(e) => updateCouponField(idx, "type", e.target.value)}
                            className="w-full px-5 py-4 bg-[#0F0F1A] rounded-xl border border-white/5 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none text-white placeholder:text-[#6B6B80] font-bold transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] appearance-none cursor-pointer"
                          >
                            <option value="percentage" className="bg-[#1A1A2E] text-white">% Percentage</option>
                            <option value="fixed" className="bg-[#1A1A2E] text-white">Fixed Amount</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2 ml-1">
                          Expiry Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={coupon.expiry}
                          onChange={(e) => updateCouponField(idx, "expiry", e.target.value)}
                          className="w-full px-5 py-4 bg-[#0F0F1A] rounded-xl border border-white/5 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none text-white placeholder:text-[#6B6B80] font-bold transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2 ml-1">
                          Max Uses (Optional)
                        </label>
                        <input
                          type="number"
                          placeholder="Unlimited if empty"
                          value={coupon.maxUses}
                          onChange={(e) => updateCouponField(idx, "maxUses", e.target.value)}
                          className="w-full px-5 py-4 bg-[#0F0F1A] rounded-xl border border-white/5 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none text-white placeholder:text-[#6B6B80] font-bold transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {formData.coupons.length === 0 && (
                  <div className="text-center py-12 bg-[#1A1A2E]/50 rounded-2xl border-2 border-dashed border-white/10">
                    <p className="text-sm text-[#A0A0B8] font-medium tracking-wide">No coupons added yet. This is optional.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-white/10">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
            className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all duration-300 ${currentStep === 1 || loading
              ? "text-[#6B6B80]/50 cursor-not-allowed"
              : "text-[#A0A0B8] hover:text-white hover:bg-white/5"
              }`}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading || !formData.title}
              className="px-8 py-3 rounded-full font-bold text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] tracking-wide"
            >
              Save as Draft
            </button>
            {currentStep < steps.length ? (
              <button
                key="btn-next"
                type="button"
                onClick={nextStep}
                className="bg-white/10 border border-white/20 text-white px-10 py-3 rounded-full font-bold hover:bg-white/20 hover:border-violet-500/50 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-2"
              >
                Forward <ArrowRight size={18} />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="button"
                onClick={handleSubmit}
                disabled={loading || Object.values(uploadingFiles).some(Boolean)}
                className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-10 py-3 rounded-full font-bold hover:from-violet-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-violet-500/25 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
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
