import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useGetCourseByIdQuery, useGetInstructorCoursesQuery } from "@/store/slices/courseApi";
import { useToast } from "@/context/ToastContext";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;
const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/gi;

const AssignmentsReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { userData } = useSelector((state) => state.auth);
  const { showToast } = useToast();

  const { data: instructorCoursesRes, isLoading: instructorCoursesLoading } = useGetInstructorCoursesQuery(
    { instructorId: userData?.id, page: 1, limit: 100 },
    { skip: !userData?.id }
  );
  const { data: courseRes, isLoading: courseLoading } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [gradeValues, setGradeValues] = useState({});
  const [activeSubmission, setActiveSubmission] = useState(null);

  const course = courseRes?.data;
  const availableCourses = instructorCoursesRes?.courses || [];
  const normalizeMediaUrl = useCallback((value = "") => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
      return value;
    }
    const baseUrl = import.meta.env.VITE_BACKEND_URL || "";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = value.startsWith("/") ? value : `/${value}`;
    return `${cleanBase}${cleanPath}`;
  }, []);

  const courseSummary = {
    assignments: assignments.length,
    submissions: assignments.reduce((total, item) => total + (item.submissionCount || 0), 0),
    graded: assignments.reduce((total, item) => total + (item.gradedCount || 0), 0),
    autoGraded: assignments.filter((item) => item.autoGrade).length,
  };

  const resolveAttachmentUrls = useCallback((submission) => {
    const urls = [];

    if (Array.isArray(submission.fileUrl)) {
      urls.push(...submission.fileUrl.filter(Boolean));
    } else if (submission?.fileUrl) {
      const raw = String(submission.fileUrl).trim();
      if (raw) {
        if (raw.includes("\n") || raw.includes(",")) {
          urls.push(
            ...raw
              .split(/[\n,]+/)
              .map((item) => item.trim())
              .filter(Boolean)
          );
        } else {
          urls.push(raw);
        }
      }
    }

    if (submission?.text) {
      const matches = String(submission.text).match(URL_PATTERN) || [];
      urls.push(...matches);
    }

    return [...new Set(urls.map((url) => normalizeMediaUrl(url)).filter(Boolean))];
  }, [normalizeMediaUrl]);

  const isImageUrl = useCallback((value = "") => {
    return /\.(png|jpe?g|gif|webp|bmp|svg|avif|heic|heif)(\?|#|$)/i.test(value);
  }, []);

  const isPdfUrl = useCallback((value = "") => {
    return /\.pdf(\?|#|$)/i.test(value);
  }, []);

  const attachmentPreview = useMemo(() => {
    if (!activeSubmission) return [];
    return resolveAttachmentUrls(activeSubmission).map((url) => ({
      url,
      type: isImageUrl(url) ? "image" : isPdfUrl(url) ? "pdf" : "file",
    }));
  }, [activeSubmission, resolveAttachmentUrls, isImageUrl, isPdfUrl]);

  const renderTextWithLinks = (text) => {
    if (!text) return null;

    const blocks = String(text)
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);

    return blocks.map((block, blockIndex) => {
      const segments = [];
      let lastIndex = 0;
      const matches = [...block.matchAll(URL_PATTERN)];

      matches.forEach((match, matchIndex) => {
        const [url] = match;
        const start = match.index ?? 0;
        if (start > lastIndex) {
          segments.push(
            <span key={`${blockIndex}-text-${matchIndex}-before`}>
              {block.slice(lastIndex, start)}
            </span>
          );
        }
        segments.push(
          <a
            key={`${blockIndex}-text-${matchIndex}-link`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2 break-all"
          >
            {url}
          </a>
        );
        lastIndex = start + url.length;
      });

      if (lastIndex < block.length) {
        segments.push(
          <span key={`${blockIndex}-text-tail`}>
            {block.slice(lastIndex)}
          </span>
        );
      }

      return (
        <p key={`answer-block-${blockIndex}`} className="whitespace-pre-wrap break-words leading-8 text-foreground/90">
          {segments.length > 0 ? segments : block}
        </p>
      );
    });
  };

  // Extract all assignments from course sections
  useEffect(() => {
    if (!course?.sections) return;
    const all = [];
    for (const section of course.sections) {
      if (section.contents) {
        for (const content of section.contents) {
          if (content.type === "assignment") {
            const assignmentData = content.assignment && typeof content.assignment === "object"
              ? content.assignment
              : {
                  _id: content.assignment?._id || content.assignment || content._id,
                  title: content.title,
                  description: content.description || content.summary || "",
                  dueDate: null,
                  maxScore: 100,
                  autoGrade: false,
                  gradingCriteria: "",
                };

            all.push({
              ...assignmentData,
              sectionTitle: section.title,
              contentTitle: content.title,
              contentDescription: content.description || content.summary || "",
              submissionCount: Array.isArray(assignmentData.submissions) ? assignmentData.submissions.length : 0,
              gradedCount: Array.isArray(assignmentData.submissions)
                ? assignmentData.submissions.filter((sub) => sub.grade !== null && sub.grade !== undefined).length
                : 0,
            });
          }
        }
      }
    }
    setAssignments(all);
    setSelectedAssignment((prev) => {
      if (!prev) return all[0] || null;
      return all.find((assignment) => assignment._id === prev._id) || all[0] || null;
    });
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

  useEffect(() => {
    if (selectedAssignment?._id) {
      fetchSubmissions(selectedAssignment._id);
    } else {
      setSubmissions([]);
      setGradeValues({});
    }
  }, [selectedAssignment?._id, fetchSubmissions]);

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
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

  const openSubmission = (submission) => {
    setActiveSubmission(submission);
  };

  const closeSubmission = () => {
    setActiveSubmission(null);
  };

  if (!courseId) {
    if (instructorCoursesLoading) {
      return <TableSkeleton rows={4} columns={3} />;
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a course to open its assignment details and submissions.
          </p>
        </div>

        {availableCourses.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-md border border-border">
            <Icon icon="solar:document-text-bold" className="text-muted-foreground/40 mx-auto mb-4" size={56} />
            <h2 className="text-xl font-bold text-foreground">No Courses Found</h2>
            <p className="text-muted-foreground mt-2">Create or publish a course with assignments first.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availableCourses.map((courseItem) => (
              <button
                key={courseItem._id}
                onClick={() => navigate(`/instructor/assignments-review?courseId=${courseItem._id}`)}
                className="text-left bg-card rounded-md border border-border/50 shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Course</p>
                    <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {courseItem.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {courseItem.description || "No description provided."}
                    </p>
                  </div>
                  <Icon icon="solar:arrow-right-up-bold" className="text-muted-foreground group-hover:text-primary" size={18} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (courseLoading) {
    return <TableSkeleton rows={5} columns={4} />;
  }

  if (courseId && !course && !courseLoading) {
    return (
      <div className="text-center py-20 bg-card rounded-md border border-border">
        <Icon icon="solar:danger-triangle-bold" className="text-destructive/60 mx-auto mb-4" size={56} />
        <h2 className="text-xl font-bold text-foreground">Course Not Found</h2>
        <p className="text-muted-foreground mt-2">The course id in the URL does not resolve to a course you can access.</p>
        <button
          onClick={() => navigate("/instructor/courses")}
          className="mt-6 px-5 py-3 rounded-md bg-primary text-primary-foreground text-sm font-bold"
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Teacher View</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">Assignment Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review assignment instructions, due dates, and student submissions for {course?.title || "this course"}.
          </p>
        </div>

        <button
          onClick={() => navigate("/instructor/courses")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-all text-sm font-medium border border-border/50 w-fit"
        >
          <Icon icon="solar:notebook-bold" size={16} />
          Change Course
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-md border border-border/50 shadow-sm p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Assignments</p>
          <p className="text-2xl font-black text-foreground mt-2">{courseSummary.assignments}</p>
        </div>
        <div className="bg-card rounded-md border border-border/50 shadow-sm p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Submissions</p>
          <p className="text-2xl font-black text-foreground mt-2">{courseSummary.submissions}</p>
        </div>
        <div className="bg-card rounded-md border border-border/50 shadow-sm p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Graded</p>
          <p className="text-2xl font-black text-foreground mt-2">{courseSummary.graded}</p>
        </div>
        <div className="bg-card rounded-md border border-border/50 shadow-sm p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Auto Grade</p>
          <p className="text-2xl font-black text-foreground mt-2">{courseSummary.autoGraded}</p>
        </div>
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
                        {assignment.submissionCount || 0} submission{(assignment.submissionCount || 0) !== 1 ? "s" : ""}
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
                Choose an assignment from the left panel to view its details and student submissions.
              </p>
            </div>
          ) : loadingSubmissions ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
            <>
              {/* Assignment Details */}
              <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                        {selectedAssignment.sectionTitle}
                      </span>
                      {selectedAssignment.autoGrade && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          <Icon icon="solar:magic-stick-3-bold" size={12} />
                          Auto-grading Enabled
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-foreground mt-3">
                      {selectedAssignment.contentTitle || selectedAssignment.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-3xl whitespace-pre-wrap">
                      {selectedAssignment.contentDescription || selectedAssignment.description || "No assignment description provided."}
                    </p>
                  </div>

                  <div className="shrink-0 grid grid-cols-2 gap-3 min-w-[240px]">
                    <div className="bg-card/70 rounded-md border border-border/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Max Score</p>
                      <p className="text-lg font-black text-foreground mt-1">{selectedAssignment.maxScore || 100}</p>
                    </div>
                    <div className="bg-card/70 rounded-md border border-border/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Submissions</p>
                      <p className="text-lg font-black text-foreground mt-1">{submissions.length}</p>
                    </div>
                    <div className="bg-card/70 rounded-md border border-border/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Due Date</p>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                    <div className="bg-card/70 rounded-md border border-border/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Graded</p>
                      <p className="text-lg font-black text-foreground mt-1">
                        {submissions.filter((sub) => sub.grade !== null && sub.grade !== undefined).length}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedAssignment.gradingCriteria && (
                  <div className="mt-5 rounded-md border border-emerald-500/15 bg-emerald-500/5 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-black">Grading Criteria</p>
                    <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">
                      {selectedAssignment.gradingCriteria}
                    </p>
                  </div>
                )}
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
                                <button
                                  onClick={() => openSubmission(sub)}
                                  className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline text-left"
                                >
                                  <Icon icon="solar:eye-bold" size={12} />
                                  View Submission
                                </button>
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
                              onClick={() => openSubmission(sub)}
                              className="mr-2 inline-flex items-center justify-center w-9 h-9 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-all"
                              title="View submission"
                              aria-label="View submission"
                            >
                              <Icon icon="solar:eye-bold" size={16} />
                            </button>
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

    <Dialog open={!!activeSubmission} onOpenChange={(open) => !open && closeSubmission()}>
      <DialogContent className="max-w-6xl w-[calc(100%-1rem)] max-h-[90vh] overflow-hidden p-0" showCloseButton={false}>
        {activeSubmission && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] max-h-[90vh]">
            <div className="p-6 md:p-8 overflow-y-auto border-b lg:border-b-0 lg:border-r border-border bg-background">
              <DialogHeader className="text-left mb-6 pr-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                    {selectedAssignment?.contentTitle || selectedAssignment?.title}
                  </span>
                  <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-secondary text-secondary-foreground border border-border/50">
                    {activeSubmission.student?.name || "Student"}
                  </span>
                </div>
                <DialogTitle className="text-2xl md:text-3xl font-black text-foreground mt-3">
                  Student Submission
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Review the full response, preview attachments, and grade from the same view.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-border bg-card p-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Submitted</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {activeSubmission.submittedAt
                        ? new Date(activeSubmission.submittedAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-card p-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Current Grade</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {activeSubmission.grade !== null && activeSubmission.grade !== undefined
                        ? `${activeSubmission.grade}/${selectedAssignment?.maxScore || 100}`
                        : "Not graded"}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-border bg-card p-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Written Response</p>
                  {activeSubmission.text ? (
                    <div className="space-y-4 text-foreground">
                      <div className="max-h-[320px] overflow-y-auto pr-2 text-sm md:text-[15px] leading-8">
                        {renderTextWithLinks(activeSubmission.text)}
                      </div>
                      {resolveAttachmentUrls(activeSubmission).length > 0 && (
                        <div className="rounded-md border border-dashed border-border/70 bg-secondary/10 p-3 text-xs text-muted-foreground">
                          Links included in the response are also shown in the attachments section below.
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No written response provided.</p>
                  )}
                </div>

                <div className="rounded-md border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Attachments</p>
                    <span className="text-xs text-muted-foreground font-medium">{attachmentPreview.length} file(s)</span>
                  </div>
                  {attachmentPreview.length > 0 ? (
                    <div className="space-y-4">
                      {attachmentPreview.map((attachment, index) => (
                        <div key={`${attachment.url}-${index}`} className="rounded-md border border-border overflow-hidden bg-background">
                          <div className="px-4 py-3 flex items-center justify-between border-b border-border/50 bg-secondary/20">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon
                                icon={
                                  attachment.type === "image"
                                    ? "solar:gallery-bold"
                                    : attachment.type === "pdf"
                                      ? "solar:document-text-bold"
                                      : "solar:file-bold"
                                }
                                className="text-primary shrink-0"
                                size={16}
                              />
                              <span className="text-xs font-semibold text-foreground truncate">
                                {attachment.url}
                              </span>
                            </div>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-primary hover:underline shrink-0"
                            >
                              Open
                            </a>
                          </div>

                          {attachment.type === "image" ? (
                            <img
                              src={attachment.url}
                              alt="Submission attachment"
                              className="w-full max-h-[520px] object-contain bg-black/5"
                            />
                          ) : attachment.type === "pdf" ? (
                            <iframe
                              title={`PDF attachment ${index + 1}`}
                              src={attachment.url}
                              className="w-full h-[650px] border-0 bg-muted"
                            />
                          ) : (
                            <div className="p-6 text-sm text-muted-foreground">
                              Preview unavailable for this file type.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No attachments provided.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto bg-muted/20">
              <div className="space-y-5">
                <div className="rounded-md border border-border bg-card p-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Assignment Prompt</p>
                  <h3 className="text-lg font-black text-foreground mt-2">
                    {selectedAssignment?.contentTitle || selectedAssignment?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap leading-7">
                    {selectedAssignment?.contentDescription || selectedAssignment?.description || "No assignment description provided."}
                  </p>
                </div>

                <div className="rounded-md border border-border bg-card p-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Quick Grade</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max={selectedAssignment?.maxScore || 100}
                      value={gradeValues[activeSubmission._id] ?? activeSubmission.grade ?? ""}
                      onChange={(e) => handleGradeChange(activeSubmission._id, e.target.value)}
                      className="w-28 px-3 py-2 bg-secondary/50 border border-border rounded-md text-sm font-semibold text-center outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                    <span className="text-sm text-muted-foreground">
                      / {selectedAssignment?.maxScore || 100}
                    </span>
                    <button
                      onClick={() => handleGradeSubmit(activeSubmission._id)}
                      disabled={gradingId === activeSubmission._id}
                      className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {gradingId === activeSubmission._id ? (
                        <Icon icon="solar:spinner-bold" className="animate-spin" size={16} />
                      ) : (
                        <Icon icon="solar:check-read-bold" size={16} />
                      )}
                      Save Grade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AssignmentsReview;
