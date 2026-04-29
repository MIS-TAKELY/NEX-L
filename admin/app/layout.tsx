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
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "24px", background: "linear-gradient(to right, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            NEX-L Admin
          </h1>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <a href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>Dashboard</a>
          <a href="/users" className={`nav-link ${pathname === "/users" ? "active" : ""}`}>Users</a>
          <a href="/courses" className={`nav-link ${pathname === "/courses" ? "active" : ""}`}>Courses</a>
          <a href="/settings" className={`nav-link ${pathname === "/settings" ? "active" : ""}`}>Settings</a>
        </nav>
        
        <div style={{ marginTop: "auto" }}>
          <button 
            onClick={handleLogout}
            style={{ width: "100%", textAlign: "left", padding: "12px", background: "transparent", border: "1px solid var(--card-border)", color: "white", borderRadius: "8px", cursor: "pointer" }}
          >
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
          border-radius: 8px;
          color: var(--muted);
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 500;
        }
        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-link.active {
          color: var(--primary);
          background: rgba(59, 130, 246, 0.1);
        }
        .loader {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          letter-spacing: 1px;
          opacity: 0.7;
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
