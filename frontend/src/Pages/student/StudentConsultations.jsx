import { useState } from "react";
import { useGetStudentSessionsQuery } from "@/store/slices/tutoringSessionApi";
import { Icon } from "@iconify/react";
import ConsultationModal from "@/components/meeting/ConsultationModal";
import { Skeleton } from "@/components/ui/skeleton";

const StudentConsultations = () => {
  const { data, isLoading } = useGetStudentSessionsQuery();
  const [activeSessionId, setActiveSessionId] = useState(null);

  const handleJoin = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  const sessions = data?.sessions || [];

  if (isLoading) {
    return (
      <div className="font-outfit max-w-5xl mx-auto py-8 px-4">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-md border border-border/50 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-outfit max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Consultations</h1>
        <p className="text-sm text-muted-foreground mt-1">Join your scheduled 1-on-1 sessions with teachers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.length === 0 ? (
          <div className="col-span-full bg-secondary/20 rounded-md p-12 text-center border border-dashed border-border/50">
            <Icon icon="solar:videocamera-record-linear" className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">No consultations scheduled yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-2">When a teacher starts a consultation with you, it will appear here.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session._id} 
              className="bg-background rounded-md border border-border/50 p-6 hover:shadow-xl transition-all group overflow-hidden relative"
            >
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  session.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' :
                  session.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {session.status}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                  {session.teacher?.image ? (
                    <img src={session.teacher.image} alt={session.teacher.name} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    session.teacher?.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{session.teacher?.name}</h3>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon icon="solar:notebook-minimalistic-linear" className="w-5 h-5 text-primary/60" />
                  <span className="font-medium truncate">{session.course?.title || "General Consultation"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon icon="solar:calendar-linear" className="w-5 h-5 text-primary/60" />
                  <span className="font-medium">
                    {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {session.status === 'scheduled' && (
                <button 
                  onClick={() => handleJoin(session._id)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold text-xs hover:shadow-lg transition-all active:scale-95"
                >
                  Join Consultation
                </button>
              )}
              {session.status === 'completed' && (
                <div className="w-full text-center text-xs font-bold text-green-500 bg-green-500/5 py-3 rounded-md border border-green-500/20">
                  Completed
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConsultationModal 
        sessionId={activeSessionId} 
        onClose={() => setActiveSessionId(null)} 
        isInstructor={false}
      />
    </div>
  );
};

export default StudentConsultations;
