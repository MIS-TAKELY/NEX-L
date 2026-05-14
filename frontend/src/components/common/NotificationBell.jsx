import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetStudentSessionsQuery, useGetTeacherSessionsQuery } from "@/store/slices/tutoringSessionApi";

const STORAGE_PREFIX = "nexl-notification-dismissed";

const formatSessionTime = (startTime) => {
  if (!startTime) return "";

  const date = new Date(startTime);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} · ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const NotificationBell = ({ role }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { userData, userRole, isLoggedIn } = useSelector((state) => state.auth);
  const activeRole = role || userRole;
  const userId = userData?.id || "anonymous";
  const storageKey = `${STORAGE_PREFIX}:${activeRole || "guest"}:${userId}`;

  const isStudent = activeRole === "student";
  const isInstructor = activeRole === "instructor";

  const { data: studentSessionsData } = useGetStudentSessionsQuery(undefined, {
    skip: !isLoggedIn || !isStudent,
    pollingInterval: 15000,
    refetchOnFocus: true,
  });
  const { data: teacherSessionsData } = useGetTeacherSessionsQuery(undefined, {
    skip: !isLoggedIn || !isInstructor,
    pollingInterval: 15000,
    refetchOnFocus: true,
  });

  const rawSessions = isStudent ? studentSessionsData?.sessions : teacherSessionsData?.sessions;
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to read notification state:", error);
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = useMemo(() => {
    return (rawSessions || [])
      .filter((session) => session?.status === "scheduled" && !dismissedIds.includes(session._id))
      .map((session) => {
        const counterpart = isStudent ? session.teacher : session.student;

        return {
          id: session._id,
          startTime: session.startTime,
          title: session.course?.title || "Consultation",
          subtitle: counterpart?.name || (isStudent ? "Teacher" : "Student"),
          detail: formatSessionTime(session.startTime),
          status: session.status,
        };
      })
      .sort((a, b) => {
        const aTime = new Date(a.startTime || 0).getTime();
        const bTime = new Date(b.startTime || 0).getTime();
        return aTime - bTime;
      });
  }, [rawSessions, dismissedIds, isStudent]);

  const unreadCount = notifications.length;
  const targetPath = isInstructor ? "/instructor/consultations" : "/student/consultations";

  const persistDismissed = (nextIds) => {
    setDismissedIds(nextIds);
    localStorage.setItem(storageKey, JSON.stringify(nextIds));
  };

  const handleMarkAllRead = () => {
    persistDismissed([...new Set([...dismissedIds, ...notifications.map((item) => item.id)])]);
    setOpen(false);
  };

  const handleDismissOne = (id) => {
    persistDismissed([...new Set([...dismissedIds, id])]);
  };

  const handleNavigate = (id) => {
    handleDismissOne(id);
    setOpen(false);
    navigate(targetPath);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="w-10 h-10 bg-card rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all shadow-sm border border-border/60 hover:border-primary/20 relative"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Icon icon="solar:bell-linear" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-md border border-background flex items-center justify-center text-foreground text-[10px] font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-3 w-[340px] max-w-[calc(100vw-2rem)] rounded-md border border-border bg-card shadow-2xl z-[110] overflow-hidden"
        >
          <div className="p-4 border-b border-border/60 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                Notifications
              </p>
              <h3 className="text-sm font-bold text-foreground mt-1">
                {isInstructor ? "Instructor updates" : "Student updates"}
              </h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-md bg-secondary/50 flex items-center justify-center text-muted-foreground">
                  <Icon icon="solar:bell-off-linear" size={22} />
                </div>
                <p className="text-sm font-semibold text-foreground">You are all caught up</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No pending consultation notifications right now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                        <Icon icon="solar:videocamera-record-linear" size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.subtitle}
                            </p>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md shrink-0">
                            {item.status}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">{item.detail}</p>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleNavigate(item.id)}
                            className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                          >
                            View consultation
                          </button>
                          <button
                            onClick={() => handleDismissOne(item.id)}
                            className="px-3 py-2 rounded-md bg-secondary/60 text-muted-foreground text-xs font-bold hover:text-foreground transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
