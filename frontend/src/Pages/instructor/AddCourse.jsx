import { createCourse, uploadMedia } from "@/apis/course.api";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const AddCourse = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // basic, curriculum, settings

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    thumbnail: "",
    syllabus: "",
    courseType: "full", // 'full' or 'syllabus'
    isFree: false,
    tags: [],
    sections: [],
  });

  const [uploading, setUploading] = useState(false);
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
      type: "video",
      url: "",
      duration: 0,
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

  // --- File Upload ---
  const handleFileUpload = async (e, sectionIndex, contentIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadMedia(file);
      updateContent(sectionIndex, contentIndex, "url", data.url);
      // optionally set duration or other metadata from response if available
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadMedia(file);
      setFormData((prev) => ({ ...prev, thumbnail: data.url }));
    } catch (error) {
      console.error("Thumbnail upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSyllabusUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadMedia(file);
      setFormData((prev) => ({ ...prev, syllabus: data.url }));
    } catch (error) {
      console.error("Syllabus upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData || !userData.id) {
      alert("You must be logged in to create a course");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        teacherId: userData.id,
        // sanitize sections
        sections: formData.sections.map((sec, idx) => ({
          title: sec.title,
          order: idx + 1,
          contents: sec.contents.map((cont) => ({
            title: cont.title,
            type: cont.type,
            url: cont.url,
            duration: cont.duration || 0,
          })),
        })),
      };

      await createCourse(payload);
      alert("Course created successfully!");
      navigate("/instructor/courses");
    } catch (error) {
      console.error("Failed to create course", error);
      alert("Failed to create course. " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create New Course
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose between a structured full course or a syllabus-only flow.
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, courseType: "full" }))
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.courseType === "full" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Full Course
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, courseType: "syllabus" }))
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.courseType === "syllabus" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Syllabus Only
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "basic" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("curriculum")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "curriculum" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Curriculum
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Complete React Guide"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Detailed description..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (Rs)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Development">Development</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
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
                placeholder="e.g. React, JavaScript, Frontend"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail
                </label>
                {formData.thumbnail && (
                  <img
                    src={formData.thumbnail}
                    alt="Thumbnail preview"
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                  <input
                    type="file"
                    onChange={handleThumbnailUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">Upload Thumbnail</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Syllabus{" "}
                  {formData.courseType === "syllabus" ? (
                    <span className="text-red-500">*</span>
                  ) : (
                    <span className="text-gray-400">(Optional)</span>
                  )}
                </label>
                {formData.syllabus && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-2 border border-blue-100">
                    <FileText className="text-blue-600" size={20} />
                    <span className="text-sm font-medium text-blue-800 truncate">
                      Syllabus Uploaded
                    </span>
                    <a
                      href={formData.syllabus}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline ml-auto"
                    >
                      View
                    </a>
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                  <input
                    type="file"
                    onChange={handleSyllabusUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">Upload Syllabus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Curriculum Tab */}
        {activeTab === "curriculum" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Course Curriculum
              </h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={18} /> Add Section
              </button>
            </div>

            {formData.sections.map((section, sIdx) => (
              <div
                key={sIdx}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <button type="button" onClick={() => toggleSection(sIdx)}>
                      {section.isOpen ? (
                        <ChevronUp size={20} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                      className="font-medium bg-transparent border-b border-transparent focus:border-blue-500 outline-none px-1"
                      placeholder="Section Title"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSection(sIdx)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {section.isOpen && (
                  <div className="space-y-3 pl-8">
                    {section.contents.map((content, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-white p-3 rounded border border-gray-200 shadow-sm flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
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
                              className="w-full text-sm font-medium border-b border-gray-200 focus:border-blue-500 outline-none p-1"
                              placeholder="Lesson Title"
                            />
                            <div className="flex items-center gap-4">
                              <select
                                value={content.type}
                                onChange={(e) =>
                                  updateContent(
                                    sIdx,
                                    cIdx,
                                    "type",
                                    e.target.value,
                                  )
                                }
                                className="text-xs border rounded p-1"
                              >
                                <option value="video">Video</option>
                                <option value="pdf">PDF</option>
                                <option value="article">Article</option>
                              </select>
                              {content.url ? (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <Video size={12} /> Uploaded
                                </span>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="file"
                                    onChange={(e) =>
                                      handleFileUpload(e, sIdx, cIdx)
                                    }
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <button
                                    type="button"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    PDF <Upload size={12} />{" "}
                                    {formData.courseType === "syllabus"
                                      ? "Upload Media (Optional)"
                                      : "Upload Media"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeContent(sIdx, cIdx)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addContent(sIdx)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
                    >
                      <Plus size={16} /> Add Lesson
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading || uploading}
            className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <Save size={18} /> Publish Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;
