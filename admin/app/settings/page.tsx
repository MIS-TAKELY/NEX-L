"use client";

import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";
import { adminApi } from "../lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
  );

  useEffect(() => {
    async function loadData() {
      try {
        const { data: session } = await authClient.getSession();
        if (session) {
          setUser(session.user);
          setName(session.user.name || "");
          setBio(session.user.bio || "");
        }
        
        const settings = await adminApi.getSettings();
        setSystemSettings(settings);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await authClient.updateUser({
        name,
        // @ts-ignore - bio is an additional field
        bio,
      });

      if (error) throw new Error(error.message);
      showMessage("success", "Profile updated successfully!");
    } catch (err: any) {
      showMessage("error", err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showMessage("error", "Passwords do not match.");
    }
    
    setSaving(true);
    try {
      const { data, error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) throw new Error(error.message);
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("success", "Password updated successfully!");
    } catch (err: any) {
      showMessage("error", err.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSystemSetting = async (key: string, value: any) => {
    try {
      await adminApi.updateSetting(key, value);
      const updatedSettings = await adminApi.getSettings();
      setSystemSettings(updatedSettings);
      showMessage("success", `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} updated!`);
    } catch (err) {
      showMessage("error", "Failed to update system setting.");
    }
  };

  const getSettingValue = (key: string, defaultValue: any) => {
    const setting = systemSettings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton" style={{ height: "40px", width: "200px", marginBottom: "24px" }}></div>
        <div className="glass-card" style={{ height: "400px", padding: "40px" }}>
          <div className="skeleton" style={{ height: "20px", width: "100%", marginBottom: "20px" }}></div>
          <div className="skeleton" style={{ height: "20px", width: "80%", marginBottom: "20px" }}></div>
          <div className="skeleton" style={{ height: "20px", width: "60%" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "700" }}>Settings</h2>
        <p style={{ color: "var(--muted)", marginTop: "8px" }}>Manage your account settings and preferences.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "32px" }}>
        {/* Sidebar Tabs */}
        <div className="glass-card" style={{ padding: "16px", alignSelf: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[
              { id: "profile", label: "Profile", icon: "👤" },
              { id: "security", label: "Security", icon: "🔒" },
              { id: "preferences", label: "Preferences", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: activeTab === tab.id ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  color: activeTab === tab.id ? "var(--primary)" : "var(--muted)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "15px",
                  fontWeight: activeTab === tab.id ? "600" : "400",
                  transition: "all 0.2s",
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="glass-card" style={{ padding: "40px" }}>
          {message.text && (
            <div style={{ 
              padding: "12px 16px", 
              borderRadius: "8px", 
              marginBottom: "24px",
              background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: message.type === "success" ? "var(--success)" : "var(--danger)",
              border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
              fontSize: "14px",
              transition: "all 0.3s"
            }}>
              {message.text}
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile}>
              <h3 style={{ fontSize: "20px", marginBottom: "24px" }}>Profile Information</h3>
              
              <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
                <div style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "50%", 
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "white"
                }}>
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div>
                  <button type="button" className="btn-primary" style={{ fontSize: "14px", padding: "8px 16px" }}>
                    Change Avatar
                  </button>
                  <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", color: "var(--muted)" }}>Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ 
                      background: "rgba(255, 255, 255, 0.05)", 
                      border: "1px solid var(--card-border)", 
                      borderRadius: "8px", 
                      padding: "12px", 
                      color: "white",
                      outline: "none"
                    }} 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", color: "var(--muted)" }}>Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ""}
                    disabled
                    style={{ 
                      background: "rgba(255, 255, 255, 0.02)", 
                      border: "1px solid var(--card-border)", 
                      borderRadius: "8px", 
                      padding: "12px", 
                      color: "var(--muted)",
                      cursor: "not-allowed"
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
                <label style={{ fontSize: "14px", color: "var(--muted)" }}>Bio</label>
                <textarea 
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little bit about yourself..."
                  style={{ 
                    background: "rgba(255, 255, 255, 0.05)", 
                    border: "1px solid var(--card-border)", 
                    borderRadius: "8px", 
                    padding: "12px", 
                    color: "white",
                    outline: "none",
                    resize: "none"
                  }} 
                />
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleUpdatePassword}>
              <h3 style={{ fontSize: "20px", marginBottom: "24px" }}>Change Password</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px", marginBottom: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", color: "var(--muted)" }}>Current Password</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{ 
                        background: "rgba(255, 255, 255, 0.05)", 
                        border: "1px solid var(--card-border)", 
                        borderRadius: "8px", 
                        padding: "12px", 
                        paddingRight: "40px",
                        color: "white",
                        width: "100%",
                        outline: "none"
                      }} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
                    >
                      {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", color: "var(--muted)" }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ 
                        background: "rgba(255, 255, 255, 0.05)", 
                        border: "1px solid var(--card-border)", 
                        borderRadius: "8px", 
                        padding: "12px", 
                        paddingRight: "40px",
                        color: "white",
                        width: "100%",
                        outline: "none"
                      }} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", color: "var(--muted)" }}>Confirm New Password</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ 
                        background: "rgba(255, 255, 255, 0.05)", 
                        border: "1px solid var(--card-border)", 
                        borderRadius: "8px", 
                        padding: "12px", 
                        paddingRight: "40px",
                        color: "white",
                        width: "100%",
                        outline: "none"
                      }} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {activeTab === "preferences" && (
            <div>
              <h3 style={{ fontSize: "20px", marginBottom: "24px" }}>System Preferences</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                  <div>
                    <p style={{ fontWeight: "600" }}>Default Currency</p>
                    <p style={{ fontSize: "12px", color: "var(--muted)" }}>Set the global currency for course pricing.</p>
                  </div>
                  <select 
                    value={getSettingValue("defaultCurrency", "NPR")}
                    onChange={(e) => handleUpdateSystemSetting("defaultCurrency", e.target.value)}
                    style={{ background: "#1a1b1e", color: "white", border: "1px solid var(--card-border)", padding: "8px 12px", borderRadius: "8px" }}
                  >
                    <option value="NPR">Nepalese Rupee (Rs.)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                  <div>
                    <p style={{ fontWeight: "600" }}>Maintenance Mode</p>
                    <p style={{ fontSize: "12px", color: "var(--muted)" }}>Put the site in maintenance mode for everyone except admins.</p>
                  </div>
                  <div 
                    onClick={() => handleUpdateSystemSetting("maintenanceMode", !getSettingValue("maintenanceMode", false))}
                    style={{ 
                      width: "40px", 
                      height: "20px", 
                      background: getSettingValue("maintenanceMode", false) ? "var(--warning)" : "rgba(255, 255, 255, 0.1)", 
                      borderRadius: "20px", 
                      position: "relative", 
                      cursor: "pointer",
                      transition: "background 0.3s"
                    }}
                  >
                    <div style={{ 
                      width: "16px", 
                      height: "16px", 
                      background: "white", 
                      borderRadius: "50%", 
                      position: "absolute", 
                      left: getSettingValue("maintenanceMode", false) ? "22px" : "2px", 
                      top: "2px",
                      transition: "left 0.3s"
                    }}></div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                  <div>
                    <p style={{ fontWeight: "600" }}>Site Name</p>
                    <p style={{ fontSize: "12px", color: "var(--muted)" }}>Global name displayed across the platform.</p>
                  </div>
                  <input 
                    type="text"
                    defaultValue={getSettingValue("siteName", "NEX-L")}
                    onBlur={(e) => handleUpdateSystemSetting("siteName", e.target.value)}
                    style={{ 
                      background: "rgba(255, 255, 255, 0.05)", 
                      border: "1px solid var(--card-border)", 
                      borderRadius: "8px", 
                      padding: "8px 12px", 
                      color: "white",
                      width: "150px"
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        input:focus, textarea:focus, select:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}
