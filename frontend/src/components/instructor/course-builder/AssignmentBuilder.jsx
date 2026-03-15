import React from 'react';
import { Calendar, AlignLeft } from 'lucide-react';

const AssignmentBuilder = ({ content, onChange }) => {
  const assignmentData = content.assignmentData || { dueDate: "" };

  const updateAssignment = (field, value) => {
    onChange({
      ...content,
      assignmentData: {
        ...assignmentData,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          Assignment Due Date (Optional)
        </label>
        <div className="relative">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={assignmentData.dueDate ? new Date(assignmentData.dueDate).toISOString().split('T')[0] : ""}
            onChange={(e) => updateAssignment('dueDate', e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm"
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1 font-medium">Students will see this deadline when submitting their work.</p>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          Assignment Instructions
        </label>
        <div className="relative">
          <AlignLeft size={16} className="absolute left-3 top-3 text-gray-400" />
          <textarea
            value={content.description || ""}
            onChange={(e) => onChange({ ...content, description: e.target.value })}
            rows="4"
            placeholder="Describe what students need to do to complete this assignment..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm transition-all shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default AssignmentBuilder;
