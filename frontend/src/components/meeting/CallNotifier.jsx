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
            return null;
          }
          return prev;
        });
        return; // Early return, don't trigger ring logic
      }

      // Existing ring logic (call.created, call.notification.ring)
      if (event.type === "call.created" || event.type === "call.notification.ring") {
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
    const unsubRing = videoClient.on("call.notification.ring", handleEvent);
    const unsubEnded = videoClient.on("call.ended", handleEvent);
    const unsubRejected = videoClient.on("call.rejected", handleEvent);
    const unsubSessionEnded = videoClient.on("call.session_ended", handleEvent);

    return () => {
      unsubCreated();
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
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="fixed bottom-6 left-6 z-[10000] w-[350px] bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl p-5 flex items-center gap-4 shadow-2xl"
            >
              {/* Avatar Area */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border/50">
                  {callerImage ? (
                    <img src={callerImage} alt={callerName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Icon icon="solar:user-bold-duotone" className="w-7 h-7 text-primary" />
                    </div>
                  )}
                </div>
                {/* Pulsing indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-foreground text-sm font-bold truncate">{callerName}</h4>
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider animate-pulse">Incoming call...</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={handleReject}
                  className="w-12 h-12 rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all flex items-center justify-center shadow-lg shadow-destructive/20 active:scale-95"
                  title="Decline"
                >
                  <Icon icon="solar:phone-hang-up-rounded-bold" className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleAccept}
                  className="w-12 h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white transition-all flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-95"
                  title="Accept"
                >
                  <Icon icon="solar:phone-calling-rounded-bold" className="w-6 h-6" />
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
