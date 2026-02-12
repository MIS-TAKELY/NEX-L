import { uploadMedia } from "@/apis/course.api";
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateCourseMutation } from "@/store/slices/courseApi";
import { useToast } from "../../context/ToastContext";

const steps = [
  { id: 1, title: "Basic Information", desc: "Title, Price, Category" },
  { id: 2, title: "Course Media", desc: "Thumbnail & Syllabus" },
  { id: 3, title: "Curriculum", desc: "Sections & Lessons" },
];

const AddCourse = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const [createCourseFetch] = useCreateCourseMutation();
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
    courseType: "full",
    isFree: false,
    tags: [],
    sections: [],
  });

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

  const addContent = (sectionIndex) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].contents.push({
      title: "New Lesson",
      type: "mixed", // 'video', 'pdf', 'article', 'mixed'
      resources: [], // Array of files: [{ name, url, type, size, duration }]
      description: "",
      isOpen: true,
    });
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
        return <File size={16} className="text-blue-500" />;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create New Course
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Build structured lessons with multiple videos, files, and resources
            per section.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="relative flex justify-between">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step) => (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.button
                type="button"
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= step.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-gray-400 border-2 border-gray-100"
                  }`}
                animate={{
                  scale: currentStep === step.id ? 1.2 : 1,
                }}
              >
                {currentStep > step.id ? <CheckCircle2 size={18} /> : step.id}
              </motion.button>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                    }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
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
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Master Advanced React and Framer Motion"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all appearance-none"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Development">Development</option>
                      <option value="Business">Business</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Price (Rs)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                        रू
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0 for free"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell your students what they'll learn..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Course Type
                  </label>
                  <div className="flex bg-gray-50 p-1 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, courseType: "full" }))
                      }
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${formData.courseType === "full"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
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
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${formData.courseType === "syllabus"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      Syllabus Only
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">
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
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Course Thumbnail
                    </label>
                    <div className="relative group">
                      <div
                        className={`aspect-video rounded-2xl overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 ${formData.thumbnail
                          ? "border-blue-100 bg-blue-50/20"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                      >
                        {formData.thumbnail ? (
                          <img
                            src={formData.thumbnail}
                            alt="Thumbnail"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                              <ImageIcon size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-500">
                              Upload high-res image
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              PNG, JPG or WebP (16:9)
                            </p>
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
                          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm text-green-600">
                            <CheckCircle2 size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Course Syllabus{" "}
                      {formData.courseType === "syllabus" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div className="relative group">
                      <div
                        className={`h-[180px] rounded-2xl overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 ${formData.syllabus
                          ? "border-red-100 bg-red-50/20"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                      >
                        {formData.syllabus ? (
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                              <FileText size={24} className="text-red-500" />
                            </div>
                            <p className="text-sm font-bold text-red-600">
                              Syllabus Uploaded
                            </p>
                            <a
                              href={formData.syllabus}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-500 hover:underline mt-2"
                            >
                              View Document
                            </a>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                              <File size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-500">
                              Upload PDF Guide
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Required for Syllabus Only mode
                            </p>
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
                  <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                    Construct Curriculum
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Add sections and lessons. Upload multiple files to each
                    lesson.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSection}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  <Plus size={18} /> Add Section
                </button>
              </div>

              <div className="space-y-6">
                {formData.sections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm"
                  >
                    {/* Section Header */}
                    <div className="flex justify-between items-center p-5 bg-gray-50/50 border-b border-gray-100">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleSection(sIdx)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-blue-600 transition-colors"
                        >
                          {section.isOpen ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-white px-2 py-0.5 rounded border">
                            Section {sIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) =>
                              updateSectionTitle(sIdx, e.target.value)
                            }
                            className="font-bold bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none px-1 flex-1 text-gray-800 text-lg transition-all"
                            placeholder="e.g. Introduction to React state"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSection(sIdx)}
                        className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Section Contents */}
                    {section.isOpen && (
                      <div className="p-6 space-y-6 bg-white">
                        <div className="space-y-6 lg:pl-4">
                          {section.contents.map((content, cIdx) => (
                            <div
                              key={cIdx}
                              className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-blue-200 transition-all"
                            >
                              {/* Content Header */}
                              <div className="flex justify-between items-center p-4 bg-gray-50/30 border-b border-gray-50">
                                <div className="flex items-center gap-4 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleContent(sIdx, cIdx)}
                                    className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-xs"
                                  >
                                    {content.isOpen ? (
                                      <ChevronUp
                                        size={14}
                                        className="text-gray-400"
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={14}
                                        className="text-gray-400"
                                      />
                                    )}
                                  </button>
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">
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
                                      className="font-bold bg-transparent outline-none flex-1 text-gray-700 transition-all border-b border-transparent focus:border-blue-400"
                                      placeholder="Lesson Title"
                                    />
                                  </div>
                                  {content.resources.length > 0 && (
                                    <span className="text-[9px] font-black text-gray-400 bg-white border border-gray-100 px-3 py-1 rounded-full uppercase tracking-tighter">
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
                                  className="text-gray-200 hover:text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              {/* Content Body */}
                              {content.isOpen && (
                                <div className="p-5 space-y-6">
                                  {/* Lesson Description */}
                                  <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
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
                                      className="w-full text-sm px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50/30 transition-all"
                                    />
                                  </div>

                                  {/* Resources List */}
                                  <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                      Learning Materials
                                    </label>

                                    <div className="grid grid-cols-1 gap-3">
                                      {content.resources.map((resource) => (
                                        <div
                                          key={resource.id}
                                          className={`flex items-center gap-4 p-3 bg-white rounded-xl border transition-all ${resource.isUploading
                                            ? "border-blue-200 bg-blue-50/20"
                                            : "border-gray-100 group/item hover:border-blue-200"
                                            }`}
                                        >
                                          <div className="relative flex-shrink-0">
                                            {resource.type === "video" ? (
                                              <div className="w-14 h-14 bg-black rounded-xl overflow-hidden flex items-center justify-center relative shadow-sm border border-gray-800">
                                                <video
                                                  src={resource.url}
                                                  className="w-full h-full object-cover"
                                                  muted
                                                  playsInline
                                                  preload="metadata"
                                                />
                                                <Play
                                                  size={14}
                                                  className="text-white absolute z-10 opacity-70"
                                                />
                                              </div>
                                            ) : resource.type === "image" ? (
                                              <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                <img
                                                  src={resource.url}
                                                  alt=""
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                            ) : (
                                              <div className="w-14 h-14 bg-white rounded-xl shadow-xs border border-gray-100 flex items-center justify-center">
                                                {getResourceIcon(resource.type)}
                                              </div>
                                            )}

                                            {resource.isUploading && (
                                              <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                                                <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
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
                                              className="text-sm font-bold bg-transparent outline-none w-full truncate text-gray-700 hover:text-blue-600 focus:text-blue-600 transition-colors"
                                            />
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded tracking-tighter">
                                                {resource.type.toUpperCase()}
                                              </span>
                                              <span className="text-[10px] font-bold text-gray-300">
                                                {formatFileSize(resource.size)}
                                              </span>
                                              {resource.duration > 0 && (
                                                <span className="flex items-center gap-1 text-[10px] text-gray-300 font-bold">
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
                                                <span className="text-[9px] font-black text-blue-500 animate-pulse uppercase ml-1">
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
                                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                                              <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}

                                      {/* Add Resource Area */}
                                      <div className="relative mt-2">
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
                                        <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-blue-50/30 hover:border-blue-200 transition-all">
                                          <div className="flex items-center justify-center gap-3">
                                            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                                              <Upload
                                                size={14}
                                                className="text-gray-400"
                                              />
                                            </div>
                                            <div className="text-left">
                                              <p className="text-xs font-bold text-gray-600">
                                                Add lesson materials
                                              </p>
                                              <p className="text-[10px] text-gray-400 font-medium">
                                                Videos, PDFs or Images
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addContent(sIdx)}
                            className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 font-bold text-sm tracking-tight"
                          >
                            <Plus size={18} /> Add New Lesson to Section
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {formData.sections.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm ring-1 ring-gray-900/5">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Plus size={40} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mb-2 tracking-tight">
                      Empty Curriculum
                    </h3>
                    <p className="text-sm text-gray-500 mb-8 font-medium max-w-xs mx-auto">
                      Start your journey by organizing your course content into
                      sections and lessons.
                    </p>
                    <button
                      type="button"
                      onClick={addSection}
                      className="bg-blue-600 text-white px-8 py-3 rounded-2xl hover:bg-blue-700 font-black transition-all shadow-xl shadow-blue-200 active:scale-95"
                    >
                      Initialize First Section
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${currentStep === 1 || loading
              ? "text-gray-200 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading || !formData.title}
              className="px-6 py-3 rounded-xl font-bold text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            {currentStep < steps.length ? (
              <button
                key="btn-next"
                type="button"
                onClick={nextStep}
                className="bg-black text-white px-10 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-2"
              >
                Forward <ArrowRight size={18} />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="submit"
                disabled={loading || Object.values(uploadingFiles).some(Boolean)}
                className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
