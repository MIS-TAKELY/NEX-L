import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      price: '',
      category: '',
      thumbnail: null
  });

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      // Logic to save course would go here
      navigate('/instructor/my-courses');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Course</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Course Title */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
            <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Complete React Guide"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
            />
        </div>

        {/* Description */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Detailed description of your course..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
            ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="29.99"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                />
            </div>
            
             {/* Category */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    required
                >
                    <option value="">Select Category</option>
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                </select>
            </div>
        </div>

        {/* Thumbnail Placeholder */}
        <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                 <div className="text-4xl mb-2">📷</div>
                 <p className="text-gray-500 text-sm">Click to upload or drag and drop</p>
                 <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                 <input type="file" className="hidden" />
             </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
             <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
             >
                 Create Course
             </button>
             <button 
                type="button" 
                onClick={() => navigate('/instructor/my-courses')}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
             >
                 Cancel
             </button>
        </div>
      </form>
    </div>
  )
}

export default AddCourse
