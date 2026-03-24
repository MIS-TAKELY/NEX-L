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

      <div className="pt-4 border-t border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-purple-500" />
            <span className="text-sm font-bold text-gray-700">Automated AI Evaluation</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={assignmentData.autoGrade}
              onChange={(e) => updateAssignment('autoGrade', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {assignmentData.autoGrade && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Grading Criteria / Model Answer
              </label>
              <div className="relative">
                <Target size={16} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  value={assignmentData.gradingCriteria || ""}
                  onChange={(e) => updateAssignment('gradingCriteria', e.target.value)}
                  rows="3"
                  placeholder="Paste the ideal answer or key points to evaluate against..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm transition-all shadow-sm"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-medium italic">Our AI will compare student submissions to this criteria to generate a score.</p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Maximum Points
              </label>
              <input
                type="number"
                value={assignmentData.maxScore || 100}
                onChange={(e) => updateAssignment('maxScore', Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentBuilder;
