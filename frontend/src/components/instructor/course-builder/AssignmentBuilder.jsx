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
    <div className="space-y-6 bg-muted/40 p-6 rounded-md border border-border shadow-inner">
      <div>
        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
          Assignment Due Date (Optional)
        </label>
        <div className="relative">
          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="date"
            value={assignmentData.dueDate ? new Date(assignmentData.dueDate).toISOString().split('T')[0] : ""}
            onChange={(e) => updateAssignment('dueDate', e.target.value)}
            className="w-full pl-11 pr-5 py-4 bg-background rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300 text-sm shadow-sm text-foreground placeholder:text-muted-foreground [color-scheme:light dark]"
          />
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">Students will see this deadline when submitting their work.</p>
      </div>

      <div>
        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
          Assignment Instructions
        </label>
        <div className="relative">
          <AlignLeft size={16} className="absolute left-4 top-4 text-muted-foreground" />
          <textarea
            value={content.description || ""}
            onChange={(e) => onChange({ ...content, description: e.target.value })}
            rows="4"
            placeholder="Describe what students need to do to complete this assignment..."
            className="w-full pl-11 pr-5 py-4 bg-background rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none transition-all duration-300 text-sm shadow-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
          Max Score
        </label>
        <div className="relative">
          <Target size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="number"
            value={assignmentData.maxScore || 100}
            onChange={(e) => updateAssignment('maxScore', parseInt(e.target.value, 10))}
            min="1"
            className="w-full pl-11 pr-5 py-4 bg-background rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300 text-sm shadow-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="autoGrade"
          checked={assignmentData.autoGrade || false}
          onChange={(e) => updateAssignment('autoGrade', e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
        />
        <label htmlFor="autoGrade" className="flex items-center gap-2 text-sm font-bold text-foreground cursor-pointer">
          <Brain size={16} className="text-primary" />
          Enable Auto-Grading
        </label>
      </div>

      {assignmentData.autoGrade && (
        <div>
          <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
            Grading Criteria
          </label>
          <div className="relative">
            <Target size={16} className="absolute left-4 top-4 text-muted-foreground" />
            <textarea
              value={assignmentData.gradingCriteria || ""}
              onChange={(e) => updateAssignment('gradingCriteria', e.target.value)}
              rows="4"
              placeholder="Describe the criteria for auto-grading (e.g., 'The answer should explain the concept of recursion with examples')..."
              className="w-full pl-11 pr-5 py-4 bg-background rounded-md border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none transition-all duration-300 text-sm shadow-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">Auto-grading uses AI to compare student submissions against this criteria.</p>
        </div>
      )}

    </div>
  );
};

export default AssignmentBuilder;
