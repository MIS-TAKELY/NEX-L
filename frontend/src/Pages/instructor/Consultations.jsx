import { useGetTeacherSessionsQuery, useUpdateTutoringSessionStatusMutation } from "@/store/slices/tutoringSessionApi";
import { Icon } from "@iconify/react";
import { useState } from "react";
import ConsultationModal from "@/components/meeting/ConsultationModal";

const Consultations = () => {
  const { data, isLoading } = useGetTeacherSessionsQuery();
  const [updateStatus] = useUpdateTutoringSessionStatusMutation();
  const [activeSessionId, setActiveSessionId] = useState(null);

  const sessions = data?.sessions || [];

  const handleJoin = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  const handleComplete = async (sessionId) => {
    try {
      await updateStatus({ id: sessionId, status: "completed" }).unwrap();
    } catch (err) {
      console.error("Failed to complete session:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-4">
        <div className="w-10 h-10 border-4 border-white/5 border-t-primary rounded-full animate-spin" />
        <p className="font-medium tracking-wide uppercase text-[10px]">Loading consultations...</p>
      </div>
    );
  }

  return (
    <div className="font-outfit">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Consultations</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your 1-on-1 student sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length === 0 ? (
          <div className="col-span-full bg-secondary/20 rounded-3xl p-12 text-center border border-dashed border-border/50">
            <Icon icon="solar:videocamera-record-linear" className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">No consultations scheduled yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-2">Start a consultation from the Students Enrolled page.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session._id} 
              className="bg-background rounded-3xl border border-border/50 p-6 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  session.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' :
                  session.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {session.status}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                  {session.student?.image ? (
                    <img src={session.student.image} alt={session.student.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    session.student?.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{session.student?.name}</h3>
                  <p className="text-xs text-muted-foreground">{session.student?.email}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon icon="solar:notebook-minimalistic-linear" className="w-5 h-5 text-primary/60" />
                  <span className="font-medium truncate">{session.course?.title || "General Consultation"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon icon="solar:calendar-linear" className="w-5 h-5 text-primary/60" />
                  <span className="font-medium">
                    {new Date(session.startTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon icon="solar:clock-circle-linear" className="w-5 h-5 text-primary/60" />
                  <span className="font-medium">
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/50">
                {session.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => handleJoin(session._id)}
                      className="flex-1 bg-primary text-primary-foreground py-3 rounded-2xl font-bold text-xs hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                    >
                      Join Room
                    </button>
                    <button 
                      onClick={() => handleComplete(session._id)}
                      className="px-4 bg-secondary/50 text-muted-foreground py-3 rounded-2xl font-bold text-xs hover:bg-secondary transition-all active:scale-95"
                    >
                      Mark Done
                    </button>
                  </>
                )}
                {session.status === 'completed' && (
                  <div className="w-full text-center text-xs font-bold text-green-500 bg-green-500/5 py-3 rounded-2xl border border-green-500/20">
                    Session Completed
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ConsultationModal 
        sessionId={activeSessionId} 
        onClose={() => setActiveSessionId(null)} 
        isInstructor={true}
      />
    </div>
  );
};

export default Consultations;
