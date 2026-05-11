"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "./lib/auth-client";
import "./globals.css";
import type { AdminSessionUser } from "./lib/auth-types";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      if (pathname === "/login") {
        setLoading(false);
        return;
      }

      try {
        const { data: session } = await authClient.getSession();
        if (!session || (session.user as AdminSessionUser).role !== "admin") {
          router.push("/login");
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };



  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex" }}>
      <div className="sidebar">
        <div style={{ marginBottom: "48px" }}>
          <h1 style={{ 
            fontSize: "28px", 
            fontWeight: "800",
            background: "linear-gradient(135deg, #60a5fa, #a855f7)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.03em"
          }}>
            NEX-L Admin
          </h1>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <a href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Dashboard
          </a>
          <a href="/users" className={`nav-link ${pathname === "/users" ? "active" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Users
          </a>
          <a href="/courses" className={`nav-link ${pathname === "/courses" ? "active" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Courses
          </a>
          <a href="/settings" className={`nav-link ${pathname === "/settings" ? "active" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </a>
        </nav>
        
        <div style={{ marginTop: "auto" }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: "100%", 
              textAlign: "left", 
              padding: "12px 16px", 
              background: "rgba(255, 255, 255, 0.03)", 
              border: "1px solid var(--card-border)", 
              color: "white", 
              borderRadius: "12px", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </div>
      <main className="main-content" style={{ flex: 1 }}>
        {children}
      </main>

      <style jsx global>{`
        .nav-link {
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--muted);
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }
        .nav-link.active {
          color: white;
          background: rgba(59, 130, 246, 0.1);
          box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
        }
        .nav-link svg {
          opacity: 0.7;
          transition: all 0.2s;
        }
        .nav-link:hover svg, .nav-link.active svg {
          opacity: 1;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0a0c" }}>
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
