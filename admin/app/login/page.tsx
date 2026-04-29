"use client";

import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Login failed");
      } else {
        // Check if user is admin
        const session = await authClient.getSession();
        const user = session.data?.user;
        
        if (user?.role === "admin") {
          router.push("/");
        } else {
          setError("Access denied: You are not an admin.");
          await authClient.signOut();
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh", 
      background: "var(--background)" 
    }}>
      <div className="glass-card" style={{ padding: "40px", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", textAlign: "center" }}>Admin Login</h2>
        <p style={{ color: "var(--muted)", textAlign: "center", marginBottom: "32px" }}>Enter your credentials to access the panel.</p>
        
        {error && (
          <div style={{ 
            background: "rgba(239, 68, 68, 0.1)", 
            color: "var(--danger)", 
            padding: "12px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            fontSize: "14px",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", color: "var(--muted)" }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                background: "rgba(255, 255, 255, 0.05)", 
                border: "1px solid var(--card-border)", 
                borderRadius: "8px", 
                padding: "12px", 
                color: "white" 
              }} 
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", color: "var(--muted)" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: "12px", justifyContent: "center" }}
          >
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
