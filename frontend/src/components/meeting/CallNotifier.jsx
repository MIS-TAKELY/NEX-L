import { useEffect, useState, useRef } from "react";
import { useStream } from "@/context/StreamContext";
import { Icon } from "@iconify/react";
import ConsultationModal from "./ConsultationModal";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";

const CallNotifier = () => {
  const { videoClient } = useStream();
  const { userRole } = useSelector((state) => state.auth);

  const [incomingCall, setIncomingCall] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [callerName, setCallerName] = useState("Teacher");
  const [callerImage, setCallerImage] = useState("");

  const isCallActiveRef = useRef(false);

  useEffect(() => {
    isCallActiveRef.current = showModal;
  }, [showModal]);

  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (incomingCall && !showModal) {
      audioRef.current.loop = true;
      audioRef.current.volume = 1.0;
      audioRef.current.muted = false;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio play failed, user interaction may be needed:", err);
        });
      }
    } else {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        console.error("Error pausing audio:", e);
      }
    }
  }, [incomingCall?.id, showModal]);

  useEffect(() => {
    if (!videoClient) return;

    const handleEvent = (event) => {
      console.log("CallNotifier: Received event:", event.type, event.call?.id);
      const call = event.call;
      
      if (!call || !call.id.startsWith("consult-")) return;

      // Handle call cancellation or ending events
      if (
        event.type === "call.ended" || 
        event.type === "call.rejected" || 
        event.type === "call.session_ended" ||
        event.type === "call.disconnected"
      ) {
        setIncomingCall((prev) => {
          if (prev && prev.id === call.id) {
            console.log("CallNotifier: Call ended/rejected, clearing notification", call.id);
            setShowModal(false); // Reset modal explicitly
            return null;
          }
          return prev;
        });
        return; // Early return, don't trigger ring logic
      }

      // Existing ring logic (call.created, call.notification.ring, call.ring)
      if (event.type === "call.created" || event.type === "call.notification.ring" || event.type === "call.ring") {
        if (isCallActiveRef.current) {
          console.log("CallNotifier: Call already active, ignoring ring event");
          return;
        }

        console.log("CallNotifier: Detected consultation call:", call.id);
        
        // Extract caller info if available
        const creator = call?.state?.createdBy || call?.created_by;
        
        // Don't notify the user who created the call (the instructor)
        if (creator && videoClient?.user?.id && creator.id === videoClient.user.id) {
          console.log("CallNotifier: Ignoring own outgoing call");
          return;
        }

        if (creator) {
          setCallerName(creator.name || "Teacher");
          setCallerImage(creator.image || "");
        }

        setIncomingCall(call);
      }
    };

    const unsubCreated = videoClient.on("call.created", handleEvent);
    const unsubNotificationRing = videoClient.on("call.notification.ring", handleEvent);
    const unsubRing = videoClient.on("call.ring", handleEvent);
    const unsubEnded = videoClient.on("call.ended", handleEvent);
    const unsubRejected = videoClient.on("call.rejected", handleEvent);
    const unsubSessionEnded = videoClient.on("call.session_ended", handleEvent);

    return () => {
      unsubCreated();
      unsubNotificationRing();
      unsubRing();
      unsubEnded();
      unsubRejected();
      unsubSessionEnded();
    };
  }, [videoClient]);

  if (userRole !== "student") {
    return null;
  }

  const handleAccept = () => {
    isCallActiveRef.current = true; // Prevent race conditions from delayed ring events
    setShowModal(true);
  };

  const handleReject = () => {
    setIncomingCall(null);
  };

  return (
    <>
      <audio ref={audioRef} src="/ringtone.mp3" preload="auto" />
      
      {showModal && incomingCall ? (
        <ConsultationModal 
          sessionId={incomingCall.id.replace("consult-", "")} 
          onClose={() => {
            setShowModal(false);
            setIncomingCall(null);
          }} 
          isInstructor={false}
        />
      ) : (
        <AnimatePresence>
          {incomingCall && (
            <motion.div 
              initial={{ y: 80, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="fixed bottom-6 left-6 z-[10000] w-[340px] rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px var(--border)"
              }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%] animate-[gradient-shift_3s_ease_infinite]" />

              <div className="p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden text-white font-bold text-xl"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                  >
                    {callerImage ? (
                      <img src={callerImage} alt={callerName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{callerName?.charAt(0)?.toUpperCase() || "T"}</span>
                    )}
                  </div>
                  {/* Live pulse dot */}
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-card" />
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--primary)" }}>
                    📞 Consult Call
                  </p>
                  <h4 className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
                    {callerName}
                  </h4>
                  <p className="text-xs animate-pulse mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    is calling you...
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-4 flex gap-3">
                {/* Decline */}
                <button 
                  onClick={handleReject}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:brightness-110"
                  style={{ background: "var(--destructive)", color: "#fff" }}
                  title="Decline"
                >
                  <Icon icon="fluent:call-end-24-filled" width={20} height={20} />
                  Decline
                </button>

                {/* Accept — with ring animation */}
                <button 
                  onClick={handleAccept}
                  className="flex-1 relative flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:brightness-110"
                  style={{ background: "#22c55e", color: "#fff" }}
                  title="Accept"
                >
                  {/* ring pulse behind button */}
                  <span className="absolute inset-0 rounded-xl animate-ping opacity-30 bg-green-500 pointer-events-none" />
                  <Icon icon="fluent:call-24-filled" width={20} height={20} />
                  Accept
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default CallNotifier;
