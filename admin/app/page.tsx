"use client";

import { useEffect, useState } from "react";
import { adminApi } from "./lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingCourses: 0,
    totalEnrollments: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await adminApi.getStats();
        setStats(statsData);
        
        const coursesData = await adminApi.getCourses({ limit: 5 });
        setRecentCourses(coursesData.courses);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "700" }}>System Overview</h2>
        <p style={{ color: "var(--muted)", marginTop: "8px" }}>Welcome back, Admin. Here's what's happening today.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
        {[
          { label: "Total Users", value: stats.totalUsers.toLocaleString(), sub: "↑ 12% from last month", color: "var(--success)" },
          { label: "Active Courses", value: stats.totalCourses, sub: "5 newly published", color: "var(--primary)" },
          { label: "Pending Approvals", value: stats.pendingCourses, sub: "Action required", color: "var(--warning)", warning: true },
          { label: "Total Enrollments", value: stats.totalEnrollments.toLocaleString(), sub: "↑ 8% this week", color: "var(--success)" },
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: "24px", border: item.warning ? "1px solid rgba(245, 158, 11, 0.3)" : undefined }}>
            <p style={{ color: "var(--muted)", fontSize: "14px" }}>{item.label}</p>
            {loading ? (
              <div className="skeleton" style={{ height: "32px", width: "100px", marginTop: "8px" }}></div>
            ) : (
              <h3 style={{ fontSize: "28px", marginTop: "8px", color: item.warning ? "var(--warning)" : "inherit" }}>{item.value}</h3>
            )}
            <div style={{ marginTop: "12px", fontSize: "12px", color: item.color }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "48px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div className="glass-card" style={{ padding: "24px" }}>
          <h4 style={{ fontSize: "20px", marginBottom: "20px" }}>Recent Course Submissions</h4>
          <table>
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Instructor</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{ height: "20px", width: "150px" }}></div></td>
                    <td><div className="skeleton" style={{ height: "20px", width: "100px" }}></div></td>
                    <td><div className="skeleton" style={{ height: "20px", width: "80px" }}></div></td>
                    <td><div className="skeleton" style={{ height: "24px", width: "70px", borderRadius: "12px" }}></div></td>
                    <td><div className="skeleton" style={{ height: "20px", width: "60px" }}></div></td>
                  </tr>
                ))
              ) : recentCourses.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>No recent submissions</td></tr>
              ) : recentCourses.map((course: any, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "500" }}>{course.title}</td>
                  <td>{course.teacher?.name || "Unknown"}</td>
                  <td>{course.category}</td>
                  <td>
                    <span className={`status-badge status-${course.status}`}>
                      {course.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{new Date(course.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card" style={{ padding: "24px" }}>
          <h4 style={{ fontSize: "20px", marginBottom: "20px" }}>Active Instructors</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { name: "Sarah Wilson", courses: 12, rating: 4.9 },
              { name: "Michael Chen", courses: 8, rating: 4.8 },
              { name: "David Miller", courses: 15, rating: 4.7 },
            ].map((ins, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--card-border)", display: "flex", alignItems: "center", justifyCenter: "center", fontWeight: "600" }}>
                  {ins.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: "600" }}>{ins.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--muted)" }}>{ins.courses} Courses • ⭐ {ins.rating}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: "100%", marginTop: "24px", justifyContent: "center" }}>
            View All Instructors
          </button>
        </div>
      </div>
    </div>
  );
}
