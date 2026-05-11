"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../lib/api";
import type { CourseSummary } from "../lib/auth-types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadCourses = async (page = 1, status = "") => {
    setLoading(true);
    try {
      const data = await adminApi.getCourses({ page, status });
      setCourses(data.courses as CourseSummary[]);
      setPagination({ current: data.currentPage, total: data.totalPages });
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses(1, statusFilter);
  }, [statusFilter]);

  const handleStatusUpdate = async (courseId: string, status: string) => {
    try {
      await adminApi.updateCourseStatus(courseId, status);
      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course._id === courseId ? { ...course, status } : course
        )
      );
    } catch (err) {
      alert("Failed to update course status");
    }
  };

  const handlePreview = async (courseId: string) => {
    setPreviewLoading(true);
    setShowPreview(true);
    try {
      const response = await adminApi.getCourseDetail(courseId);
      setSelectedCourse(response.data);
    } catch (err) {
      console.error("Failed to fetch course details:", err);
      alert("Failed to load course details");
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const CourseSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i}>
          <td><div className="skeleton" style={{ height: "20px", width: "150px" }}></div></td>
          <td><div className="skeleton" style={{ height: "20px", width: "100px" }}></div></td>
          <td><div className="skeleton" style={{ height: "20px", width: "80px" }}></div></td>
          <td><div className="skeleton" style={{ height: "20px", width: "60px" }}></div></td>
          <td><div className="skeleton" style={{ height: "24px", width: "70px", borderRadius: "12px" }}></div></td>
          <td><div className="skeleton" style={{ height: "32px", width: "120px" }}></div></td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "36px", fontWeight: "700" }}>Course Management</h2>
          <p style={{ color: "var(--muted)", marginTop: "8px", fontSize: "16px" }}>Review and approve course submissions from instructors.</p>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </header>

      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Instructor</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <CourseSkeleton />
            ) : courses.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>No courses found</td></tr>
            ) : courses.map((course) => (
              <tr key={course._id}>
                <td style={{ fontWeight: "600", color: "white" }}>{course.title}</td>
                <td>{course.teacher?.name || "Unknown"}</td>
                <td>
                  <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}>
                    {course.category}
                  </span>
                </td>
                <td>{course.isFree ? "Free" : `Rs. ${course.price}`}</td>
                <td>
                  <select
                    value={course.status}
                    onChange={(e) => handleStatusUpdate(course._id, e.target.value)}
                    className={`status-badge status-${course.status} status-select`}
                    style={{ border: 'none', fontInherit: 'inherit' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    {course.status === "pending" && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(course._id, "published")}
                          className="btn-primary" 
                          style={{ padding: "8px 16px", fontSize: "13px" }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(course._id, "draft")}
                          style={{ 
                            background: "rgba(239, 68, 68, 0.1)", 
                            border: "1px solid rgba(239, 68, 68, 0.2)", 
                            color: "var(--danger)", 
                            padding: "8px 16px", 
                            borderRadius: "12px", 
                            fontSize: "13px", 
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                          onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handlePreview(course._id)}
                      style={{ 
                        background: "rgba(255,255,255,0.05)", 
                        border: "1px solid var(--card-border)", 
                        color: "white", 
                        padding: "8px 16px", 
                        borderRadius: "12px", 
                        fontSize: "13px", 
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    >
                      Preview
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--muted)", fontSize: "14px" }}>
          Showing page <b>{pagination.current}</b> of <b>{pagination.total}</b>
        </span>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            disabled={pagination.current === 1}
            onClick={() => loadCourses(pagination.current - 1, statusFilter)}
            style={{ 
              opacity: pagination.current === 1 ? 0.4 : 1, 
              cursor: pagination.current === 1 ? "not-allowed" : "pointer", 
              background: "var(--input-bg)", 
              border: "1px solid var(--card-border)", 
              color: "white", 
              padding: "10px 20px", 
              borderRadius: "12px",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
          >
            Previous
          </button>
          <button 
            disabled={pagination.current === pagination.total}
            onClick={() => loadCourses(pagination.current + 1, statusFilter)}
            style={{ 
              opacity: pagination.current === pagination.total ? 0.4 : 1, 
              cursor: pagination.current === pagination.total ? "not-allowed" : "pointer", 
              background: "var(--input-bg)", 
              border: "1px solid var(--card-border)", 
              color: "white", 
              padding: "10px 20px", 
              borderRadius: "12px",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
          >
            Next
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "90%", maxHeight: "90vh", overflowY: "auto", padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>Course Preview</h3>
              <button onClick={() => setShowPreview(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>

            {previewLoading ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <div className="skeleton" style={{ height: "40px", width: "100%", marginBottom: "16px" }}></div>
                <div className="skeleton" style={{ height: "200px", width: "100%", marginBottom: "16px" }}></div>
                <div className="skeleton" style={{ height: "20px", width: "60%", marginBottom: "8px" }}></div>
                <div className="skeleton" style={{ height: "20px", width: "40%" }}></div>
              </div>
            ) : selectedCourse ? (
              <div className="animate-fade-in">
                <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
                  {selectedCourse.thumbnail && (
                    <img 
                      src={selectedCourse.thumbnail} 
                      alt={selectedCourse.title} 
                      style={{ width: "240px", height: "135px", borderRadius: "12px", objectFit: "cover", border: "1px solid var(--card-border)" }} 
                    />
                  )}
                  <div>
                    <h4 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>{selectedCourse.title}</h4>
                    <p style={{ color: "var(--muted)", marginBottom: "12px" }}>{selectedCourse.category} • {selectedCourse.level}</p>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--primary)" }}>
                        {selectedCourse.isFree ? "Free" : `Rs. ${selectedCourse.price}`}
                      </span>
                      <select
                        value={selectedCourse.status}
                        onChange={(e) => {
                          handleStatusUpdate(selectedCourse._id, e.target.value);
                          setSelectedCourse({ ...selectedCourse, status: e.target.value });
                        }}
                        className={`status-badge status-${selectedCourse.status} status-select`}
                        style={{ border: 'none', fontInherit: 'inherit' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <h5 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Description</h5>
                  <p style={{ lineHeight: "1.6", color: "rgba(255,255,255,0.8)" }}>{selectedCourse.description}</p>
                </div>

                <div>
                  <h5 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Curriculum ({selectedCourse.sections?.length || 0} Sections)</h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {selectedCourse.sections?.map((section: any, idx: number) => (
                      <div key={section._id} style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                        <div style={{ fontWeight: "600", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                          <span>{idx + 1}. {section.title}</span>
                          <span style={{ color: "var(--muted)", fontSize: "12px" }}>{section.contents?.length || 0} items</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "16px" }}>
                          {section.contents?.map((content: any) => (
                            <div key={content._id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                              <span style={{ fontSize: "12px" }}>
                                {content.type === "video" ? "📹" : content.type === "quiz" ? "📝" : "📄"}
                              </span>
                              {content.title}
                              {content.isPreview && <span style={{ fontSize: "10px", padding: "2px 6px", background: "var(--primary)", borderRadius: "4px", color: "black", fontWeight: "700" }}>PREVIEW</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "40px", display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                  {selectedCourse.status === "pending" && (
                    <>
                      <button 
                        onClick={() => {
                          handleStatusUpdate(selectedCourse._id, "published");
                          setShowPreview(false);
                        }}
                        className="btn-primary" 
                        style={{ padding: "12px 24px" }}
                      >
                        Approve Course
                      </button>
                      <button 
                         onClick={() => {
                          handleStatusUpdate(selectedCourse._id, "draft");
                          setShowPreview(false);
                        }}
                        style={{ 
                          background: "rgba(239, 68, 68, 0.1)", 
                          border: "1px solid rgba(239, 68, 68, 0.2)", 
                          color: "var(--danger)", 
                          padding: "12px 24px", 
                          borderRadius: "12px", 
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Reject Course
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => setShowPreview(false)}
                    style={{ 
                      background: "rgba(255,255,255,0.05)", 
                      border: "1px solid var(--card-border)", 
                      color: "white", 
                      padding: "12px 24px", 
                      borderRadius: "12px", 
                      cursor: "pointer"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <p>Course details not found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
