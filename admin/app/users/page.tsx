"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current: 1, total: 1 });

  const loadUsers = async (page = 1, query = "") => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({ page, search: query });
      setUsers(data.users);
      setPagination({ current: data.currentPage, total: data.totalPages });
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const updatedUser = await adminApi.updateUserRole(userId, newRole);
      setUsers(users.map((u: any) => u._id === userId ? updatedUser : u));
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1, search);
  };

  const parseRoles = (rolesData: any) => {
    if (Array.isArray(rolesData)) return rolesData;
    try {
      return JSON.parse(rolesData || "[]");
    } catch (e) {
      return [];
    }
  };

  const UserSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i}>
          <td>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "50%" }}></div>
              <div>
                <div className="skeleton" style={{ height: "16px", width: "120px", marginBottom: "4px" }}></div>
                <div className="skeleton" style={{ height: "12px", width: "150px" }}></div>
              </div>
            </div>
          </td>
          <td>
            <div style={{ display: "flex", gap: "4px" }}>
              <div className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "12px" }}></div>
              <div className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "12px" }}></div>
            </div>
          </td>
          <td><div className="skeleton" style={{ height: "20px", width: "80px" }}></div></td>
          <td><div className="skeleton" style={{ height: "20px", width: "60px" }}></div></td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "32px", fontWeight: "700" }}>User Management</h2>
          <p style={{ color: "var(--muted)", marginTop: "8px" }}>Manage system users, roles, and account status.</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px" }}>
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              background: "var(--card-bg)", 
              border: "1px solid var(--card-border)", 
              borderRadius: "12px", 
              padding: "10px 16px", 
              color: "white",
              width: "300px"
            }} 
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </header>

      <div className="glass-card" style={{ padding: "0" }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Roles</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <UserSkeleton />
            ) : users.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>No users found</td></tr>
            ) : users.map((user: any) => {
              const roles = parseRoles(user.roles);
              return (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "12px" }}>
                        {user.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p style={{ fontWeight: "600" }}>{user.name}</p>
                        <p style={{ fontSize: "12px", color: "var(--muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                      {roles.map((r: string) => (
                        <span key={r} style={{ 
                          background: "rgba(59, 130, 246, 0.1)", 
                          color: "var(--primary)", 
                          padding: "2px 10px", 
                          borderRadius: "12px", 
                          fontSize: "11px", 
                          fontWeight: "600",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          textTransform: "capitalize"
                        }}>
                          {r}
                        </span>
                      ))}
                      <div style={{ position: "relative" }}>
                        <select 
                          value=""
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          style={{ 
                            background: "rgba(255, 255, 255, 0.05)", 
                            border: "1px dashed var(--card-border)", 
                            color: "var(--muted)", 
                            fontSize: "11px", 
                            padding: "2px 8px", 
                            borderRadius: "12px",
                            cursor: "pointer",
                            appearance: "none"
                          }}
                        >
                          <option value="" disabled>+ Add Role</option>
                          <option value="student" disabled={roles.includes("student")}>Student</option>
                          <option value="teacher" disabled={roles.includes("teacher")}>Teacher</option>
                          <option value="instructor" disabled={roles.includes("instructor")}>Instructor</option>
                          <option value="admin" disabled={roles.includes("admin")}>Admin</option>
                        </select>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", fontWeight: "600" }}>Suspend</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "12px" }}>
        <button 
          disabled={Number(pagination.current) <= 1}
          onClick={() => loadUsers(Number(pagination.current) - 1, search)}
          style={{ opacity: Number(pagination.current) <= 1 ? 0.5 : 1, cursor: "pointer", background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "white", padding: "8px 16px", borderRadius: "8px" }}
        >
          Previous
        </button>
        <span style={{ alignSelf: "center", color: "var(--muted)" }}>Page {pagination.current} of {pagination.total}</span>
        <button 
          disabled={Number(pagination.current) >= Number(pagination.total)}
          onClick={() => loadUsers(Number(pagination.current) + 1, search)}
          style={{ opacity: Number(pagination.current) >= Number(pagination.total) ? 0.5 : 1, cursor: "pointer", background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "white", padding: "8px 16px", borderRadius: "8px" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
