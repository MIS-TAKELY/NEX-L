import { getCourseById, updateCourse, uploadMedia } from '@/apis/course.api';
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Plus, Save, Trash2, Upload, Video } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [activeTab, setActiveTab] = useState('basic');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        thumbnail: '',
        isFree: false,
        tags: [],
        sections: []
    });

    const [uploading, setUploading] = useState(false);
    const [tagsInput, setTagsInput] = useState('');
    const [previews, setPreviews] = useState({
        thumbnail: null,
        lessonMedia: {} // { 'sIdx-cIdx': previewUrl }
    });

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previews.thumbnail && previews.thumbnail.startsWith('blob:')) {
                URL.revokeObjectURL(previews.thumbnail);
            }
            Object.values(previews.lessonMedia).forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [previews]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await getCourseById(id);
                setFormData({
                    ...data,
                    price: data.price || '',
                    tags: data.tags || [],
                    sections: data.sections ? data.sections.map(sec => ({
                        ...sec,
                        isOpen: false // default to closed
                    })) : []
                });
                setTagsInput(data.tags ? data.tags.join(', ') : '');
            } catch (error) {
                console.error("Failed to fetch course", error);
                // alert("Failed to load course details.");
                navigate('/instructor/courses');
            } finally {
                setFetching(false);
            }
        };

        fetchCourse();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- Curriculum Handlers ---
    const addSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                { title: 'New Section', order: prev.sections.length + 1, contents: [], isOpen: true }
            ]
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
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((sec, i) =>
                i === index ? { ...sec, isOpen: !sec.isOpen } : sec
            )
        }));
    };

    const addContent = (sectionIndex) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].contents.push({
            title: 'New Lesson',
            type: 'video',
            url: '',
            duration: 0
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
        newSections[sectionIndex].contents = newSections[sectionIndex].contents.filter((_, i) => i !== contentIndex);
        setFormData({ ...formData, sections: newSections });
    };

    // --- File Upload ---
    const handleFileUpload = async (e, sectionIndex, contentIndex) => {
        const file = e.target.files[0];
        if (!file) return;

        // Set local preview
        const localPreview = URL.createObjectURL(file);
        const key = `${sectionIndex}-${contentIndex}`;
        setPreviews(prev => ({
            ...prev,
            lessonMedia: { ...prev.lessonMedia, [key]: localPreview }
        }));

        setUploading(true);
        try {
            const data = await uploadMedia(file);
            updateContent(sectionIndex, contentIndex, 'url', data.url);
        } catch (error) {
            console.error("Upload failed", error);
            // alert("Upload failed. Please try again.");
            // Clear preview on failure if it wasn't already uploaded
            setPreviews(prev => {
                const newLessonMedia = { ...prev.lessonMedia };
                delete newLessonMedia[key];
                return { ...prev, lessonMedia: newLessonMedia };
            });
        } finally {
            setUploading(false);
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Set local preview
        const localPreview = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, thumbnail: localPreview }));

        setUploading(true);
        try {
            const data = await uploadMedia(file);
            setFormData(prev => ({ ...prev, thumbnail: data.url }));
        } catch (error) {
            console.error("Thumbnail upload failed", error);
            // alert("Thumbnail upload failed. Please try again.");
            setPreviews(prev => ({ ...prev, thumbnail: null }));
        } finally {
            setUploading(false);
        }
    }

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                sections: formData.sections.map((sec, idx) => ({
                    title: sec.title,
                    order: idx + 1,
                    contents: sec.contents.map(cont => ({
                        title: cont.title,
                        type: cont.type,
                        url: cont.url,
                        duration: cont.duration || 0
                    }))
                }))
            };

            await updateCourse(id, payload);
            // alert("Course updated successfully!");
            navigate('/instructor/courses');
        } catch (error) {
            console.error("Failed to update course", error);
            // alert("Failed to update course. " + (error.message || ""));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center text-gray-500">Loading course data...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/instructor/courses')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Edit Course</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'basic' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Basic Info
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('curriculum')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'curriculum' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Curriculum
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={tagsInput}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setTagsInput(val);
                                    const tagsArray = val.split(',').map(t => t.trim()).filter(t => t !== '');
                                    setFormData(prev => ({ ...prev, tags: tagsArray }));
                                }}
                                placeholder="e.g. React, JavaScript, Frontend"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                            {(previews.thumbnail || formData.thumbnail) && (
                                <img src={previews.thumbnail || formData.thumbnail} alt="Thumbnail preview" className="w-full h-48 object-cover rounded-lg mb-2" />
                            )}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                                <input type="file" onChange={handleThumbnailUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="flex flex-col items-center">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-gray-500 text-sm">Upload New Thumbnail</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">Course Curriculum</h2>
                            <button type="button" onClick={addSection} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                                <Plus size={18} /> Add Section
                            </button>
                        </div>

                        {formData.sections.map((section, sIdx) => (
                            <div key={sIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <button type="button" onClick={() => toggleSection(sIdx)}>
                                            {section.isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                                        </button>
                                        <input
                                            type="text"
                                            value={section.title}
                                            onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                                            className="font-medium bg-transparent border-b border-transparent focus:border-blue-500 outline-none px-1"
                                            placeholder="Section Title"
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeSection(sIdx)} className="text-red-500 hover:text-red-700 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {section.isOpen && (
                                    <div className="space-y-3 pl-8">
                                        {section.contents && Array.isArray(section.contents) && section.contents.map((content, cIdx) => (
                                            <div key={cIdx} className="bg-white p-3 rounded border border-gray-200 shadow-sm flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={content.title}
                                                            onChange={(e) => updateContent(sIdx, cIdx, 'title', e.target.value)}
                                                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-blue-500 outline-none p-1"
                                                            placeholder="Lesson Title"
                                                        />
                                                        <div className="flex items-center gap-4">
                                                            <select
                                                                value={content.type}
                                                                onChange={(e) => updateContent(sIdx, cIdx, 'type', e.target.value)}
                                                                className="text-xs border rounded p-1"
                                                            >
                                                                <option value="video">Video</option>
                                                                <option value="pdf">PDF</option>
                                                                <option value="article">Article</option>
                                                            </select>
                                                            {content.url || previews.lessonMedia[`${sIdx}-${cIdx}`] ? (
                                                                <div className="flex flex-col gap-2 w-full">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                                                            <Video size={12} /> {content.url ? 'Uploaded' : 'Selected'}
                                                                        </span>
                                                                        {!content.url && uploading && <span className="text-xs text-blue-500 animate-pulse">Uploading...</span>}
                                                                    </div>
                                                                    {content.type === 'video' && (
                                                                        <video
                                                                            src={previews.lessonMedia[`${sIdx}-${cIdx}`] || content.url}
                                                                            controls
                                                                            className="w-full max-h-40 rounded bg-black"
                                                                        />
                                                                    )}
                                                                    {content.type === 'pdf' && (content.url || previews.lessonMedia[`${sIdx}-${cIdx}`]) && (
                                                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border text-xs text-gray-600">
                                                                            <FileText size={14} />
                                                                            <span className="truncate flex-1">
                                                                                {content.url ? 'PDF Document' : 'Selected PDF'}
                                                                            </span>
                                                                            <a
                                                                                href={previews.lessonMedia[`${sIdx}-${cIdx}`] || content.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-600 hover:underline"
                                                                            >
                                                                                View
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            updateContent(sIdx, cIdx, 'url', '');
                                                                            setPreviews(prev => {
                                                                                const newLessonMedia = { ...prev.lessonMedia };
                                                                                delete newLessonMedia[`${sIdx}-${cIdx}`];
                                                                                return { ...prev, lessonMedia: newLessonMedia };
                                                                            });
                                                                        }}
                                                                        className="text-xs text-red-500 hover:underline self-start"
                                                                    >
                                                                        Change File
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <input
                                                                        type="file"
                                                                        accept={content.type === 'video' ? 'video/*' : content.type === 'pdf' ? 'application/pdf' : '*'}
                                                                        onChange={(e) => handleFileUpload(e, sIdx, cIdx)}
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                    />
                                                                    <button type="button" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                                        <Upload size={12} /> Upload Media
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => removeContent(sIdx, cIdx)} className="text-gray-400 hover:text-red-500">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addContent(sIdx)} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2">
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
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} /> Update Course
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditCourse;
