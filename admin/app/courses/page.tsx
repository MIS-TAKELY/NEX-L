"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../lib/api";
import type { CourseSummary } from "../lib/auth-types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ current: 1, total: 1 });

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
      <header style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "32px", fontWeight: "700" }}>Course Management</h2>
          <p style={{ color: "var(--muted)", marginTop: "8px" }}>Review and approve course submissions.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ 
              background: "var(--card-bg)", 
              border: "1px solid var(--card-border)", 
              borderRadius: "12px", 
              padding: "10px 16px", 
              color: "white"
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </header>

      <div className="glass-card" style={{ padding: "0" }}>
        <table>
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Instructor</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <CourseSkeleton />
            ) : courses.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>No courses found</td></tr>
            ) : courses.map((course) => (
              <tr key={course._id}>
                <td style={{ fontWeight: "600" }}>{course.title}</td>
                <td>{course.teacher?.name || "Unknown"}</td>
                <td>{course.category}</td>
                <td>{course.isFree ? "Free" : `Rs. ${course.price}`}</td>
                <td>
                  <span className={`status-badge status-${course.status}`}>
                    {course.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {course.status === "pending" && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(course._id, "published")}
                          className="btn-primary" 
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(course._id, "draft")}
                          style={{ 
                            background: "rgba(239, 68, 68, 0.1)", 
                            border: "1px solid rgba(239, 68, 68, 0.2)", 
                            color: "var(--danger)", 
                            padding: "6px 12px", 
                            borderRadius: "8px", 
                            fontSize: "12px", 
                            cursor: "pointer" 
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontWeight: "600" }}>Preview</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "12px" }}>
        <button 
          disabled={pagination.current === 1}
          onClick={() => loadCourses(pagination.current - 1, statusFilter)}
          style={{ opacity: pagination.current === 1 ? 0.5 : 1, cursor: "pointer", background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "white", padding: "8px 16px", borderRadius: "8px" }}
        >
          Previous
        </button>
        <span style={{ alignSelf: "center", color: "var(--muted)" }}>Page {pagination.current} of {pagination.total}</span>
        <button 
          disabled={pagination.current === pagination.total}
          onClick={() => loadCourses(pagination.current + 1, statusFilter)}
          style={{ opacity: pagination.current === pagination.total ? 0.5 : 1, cursor: "pointer", background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "white", padding: "8px 16px", borderRadius: "8px" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
