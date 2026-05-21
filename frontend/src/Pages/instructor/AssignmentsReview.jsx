import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useGetCourseByIdQuery } from "@/store/slices/courseApi";
import { useToast } from "@/context/ToastContext";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

const AssignmentsReview = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { userData } = useSelector((state) => state.auth);
  const { showToast } = useToast();

  const { data: courseRes, isLoading: courseLoading } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [gradeValues, setGradeValues] = useState({});

  const course = courseRes?.data;

  // Extract all assignments from course sections
  useEffect(() => {
    if (!course?.sections) return;
    const all = [];
    for (const section of course.sections) {
      if (section.contents) {
        for (const content of section.contents) {
          if (content.type === "assignment" && content.assignment) {
            all.push({
              ...content.assignment,
              sectionTitle: section.title,
              contentTitle: content.title,
            });
          }
        }
      }
    }
    setAssignments(all);
  }, [course]);

  // Fetch submissions for a selected assignment
  const fetchSubmissions = useCallback(async (assignmentId) => {
    setLoadingSubmissions(true);
    try {
      const res = await axios.get(`${API_URL}/assignments/${assignmentId}/submissions`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setSubmissions(res.data.data.submissions || []);
        // Initialize grade values
        const grades = {};
        (res.data.data.submissions || []).forEach((sub) => {
          grades[sub._id] = sub.grade ?? "";
        });
        setGradeValues(grades);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      showToast("Failed to load submissions", "error");
    } finally {
      setLoadingSubmissions(false);
    }
  }, [showToast]);

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    fetchSubmissions(assignment._id);
  };

  const handleGradeChange = (submissionId, value) => {
    setGradeValues((prev) => ({ ...prev, [submissionId]: value }));
  };

  const handleGradeSubmit = async (submissionId) => {
    if (!selectedAssignment) return;
    const grade = gradeValues[submissionId];
    if (grade === "" || grade === undefined || isNaN(Number(grade))) {
      showToast("Please enter a valid grade", "error");
      return;
    }

    setGradingId(submissionId);
    try {
      const res = await axios.put(
        `${API_URL}/assignments/${selectedAssignment._id}/submissions/${submissionId}/grade`,
        { grade: Number(grade) },
        { withCredentials: true }
      );
      if (res.data?.success) {
        showToast("Grade saved successfully!", "success");
        // Refresh submissions
        fetchSubmissions(selectedAssignment._id);
      }
    } catch (err) {
      console.error("Failed to grade submission:", err);
      showToast("Failed to save grade", "error");
    } finally {
      setGradingId(null);
    }
  };

  if (courseLoading) {
    return <TableSkeleton rows={5} columns={4} />;
  }

  if (!courseId) {
    return (
      <div className="text-center py-20">
        <Icon icon="solar:document-text-bold" className="text-muted-foreground/40 mx-auto mb-4" size={56} />
        <h2 className="text-xl font-bold text-foreground">No Course Selected</h2>
        <p className="text-muted-foreground mt-2">Select a course from My Courses to review assignments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Assignment Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and grade student submissions for {course?.title || "your course"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment List */}
        <div className="lg:col-span-1 bg-card rounded-md border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/20">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Assignments</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{assignments.length} total</p>
          </div>
          <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
            {assignments.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm italic">
                No assignments found in this course.
              </div>
            ) : (
              assignments.map((assignment) => (
                <button
                  key={assignment._id}
                  onClick={() => handleSelectAssignment(assignment)}
                  className={`w-full text-left p-4 transition-colors hover:bg-secondary/20 ${
                    selectedAssignment?._id === assignment._id
                      ? "bg-primary/5 border-l-2 border-primary"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                      selectedAssignment?._id === assignment._id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      <Icon icon="solar:file-check-bold" size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {assignment.contentTitle || assignment.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {assignment.sectionTitle} · Max: {assignment.maxScore || 100} pts
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {assignment.submissions?.length || 0} submission{(assignment.submissions?.length || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Submissions Panel */}
        <div className="lg:col-span-2 bg-card rounded-md border border-border/50 shadow-sm overflow-hidden">
          {!selectedAssignment ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center mb-4">
                <Icon icon="solar:file-check-bold" className="text-muted-foreground" size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground">Select an Assignment</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Choose an assignment from the left panel to view student submissions.
              </p>
            </div>
          ) : loadingSubmissions ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
            <>
              {/* Assignment Header */}
              <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {selectedAssignment.contentTitle || selectedAssignment.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedAssignment.sectionTitle} · Max Score: {selectedAssignment.maxScore || 100}
                      {selectedAssignment.dueDate && (
                        <> · Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}</>
                      )}
                    </p>
                    {selectedAssignment.autoGrade && (
                      <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <Icon icon="solar:magic-stick-3-bold" size={12} />
                        Auto-grading Enabled
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">
                    {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="overflow-x-auto">
                {submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Icon icon="solar:inbox-archive-bold" className="text-muted-foreground/30 mb-3" size={40} />
                    <h3 className="font-bold text-foreground">No Submissions Yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Students haven't submitted this assignment yet.
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-secondary/30 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="text-left px-6 py-4">Student</th>
                        <th className="text-left px-6 py-4">Submitted</th>
                        <th className="text-left px-6 py-4">Submission</th>
                        <th className="text-center px-6 py-4">Auto-Grade</th>
                        <th className="text-center px-6 py-4 w-48">Manual Grade</th>
                        <th className="text-right px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-sm">
                      {submissions.map((sub) => (
                        <tr key={sub._id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden border border-primary/20 flex-shrink-0">
                                {sub.student?.image ? (
                                  <img src={sub.student.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  (sub.student?.name || "?").charAt(0)
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground leading-tight text-sm">
                                  {sub.student?.name || "Unknown Student"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {sub.student?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-xs">
                            {sub.submittedAt
                              ? new Date(sub.submittedAt).toLocaleDateString(undefined, {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {sub.text && (
                                <div className="group relative">
                                  <p className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                                    {sub.text}
                                  </p>
                                  {sub.text.length > 80 && (
                                    <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-popover border border-border rounded-md shadow-xl text-xs text-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                                      {sub.text}
                                    </div>
                                  )}
                                </div>
                              )}
                              {sub.fileUrl && (
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                                >
                                  <Icon icon="solar:file-bold" size={12} />
                                  View File
                                </a>
                              )}
                              {!sub.text && !sub.fileUrl && (
                                <span className="text-xs text-muted-foreground italic">No content</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {sub.grade !== null && sub.grade !== undefined ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-500">
                                {sub.grade}
                                <span className="text-emerald-500/60">/ {selectedAssignment.maxScore || 100}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 justify-center">
                              <input
                                type="number"
                                min="0"
                                max={selectedAssignment.maxScore || 100}
                                value={gradeValues[sub._id] ?? ""}
                                onChange={(e) => handleGradeChange(sub._id, e.target.value)}
                                placeholder="Grade"
                                className="w-20 px-3 py-1.5 bg-secondary/50 border border-border rounded-md text-xs font-medium text-center outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                              />
                              <span className="text-[10px] text-muted-foreground">
                                / {selectedAssignment.maxScore || 100}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleGradeSubmit(sub._id)}
                              disabled={gradingId === sub._id}
                              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {gradingId === sub._id ? (
                                <Icon icon="solar:spinner-bold" className="animate-spin" size={14} />
                              ) : (
                                <Icon icon="solar:check-read-bold" size={14} />
                              )}
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsReview;
