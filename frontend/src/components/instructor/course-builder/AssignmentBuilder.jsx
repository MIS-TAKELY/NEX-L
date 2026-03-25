import React from 'react';
import { Calendar, AlignLeft, Brain, Target } from 'lucide-react';

const AssignmentBuilder = ({ content, onChange }) => {
  const assignmentData = content.assignmentData || { dueDate: "", autoGrade: false, gradingCriteria: "", maxScore: 100 };

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
    <div className="space-y-6 bg-[#0F0F1A]/50 p-6 rounded-2xl border border-white/5 shadow-inner">
      <div>
        <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2">
          Assignment Due Date (Optional)
        </label>
        <div className="relative">
          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0B8]" />
          <input
            type="date"
            value={assignmentData.dueDate ? new Date(assignmentData.dueDate).toISOString().split('T')[0] : ""}
            onChange={(e) => updateAssignment('dueDate', e.target.value)}
            className="w-full pl-11 pr-5 py-4 bg-[#1A1A2E] rounded-xl border border-white/5 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none transition-all duration-300 text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-white placeholder:text-[#6B6B80] [color-scheme:dark]"
          />
        </div>
        <p className="text-[10px] text-[#6B6B80] mt-2 font-medium">Students will see this deadline when submitting their work.</p>
      </div>

      <div>
        <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2">
          Assignment Instructions
        </label>
        <div className="relative">
          <AlignLeft size={16} className="absolute left-4 top-4 text-[#A0A0B8]" />
          <textarea
            value={content.description || ""}
            onChange={(e) => onChange({ ...content, description: e.target.value })}
            rows="4"
            placeholder="Describe what students need to do to complete this assignment..."
            className="w-full pl-11 pr-5 py-4 bg-[#1A1A2E] rounded-xl border border-white/5 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none resize-none transition-all duration-300 text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-white placeholder:text-[#6B6B80]"
          />
        </div>
      </div>

    </div>
  );
};

export default AssignmentBuilder;
