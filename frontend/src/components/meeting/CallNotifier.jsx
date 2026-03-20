import { useEffect, useState } from "react";
import { useStream } from "@/context/StreamContext";
import { Icon } from "@iconify/react";
import ConsultationModal from "./ConsultationModal";

const CallNotifier = () => {
  const { videoClient } = useStream();
  const [incomingCall, setIncomingCall] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!videoClient) return;

    const handleEvent = (event) => {
      const call = event.call;
      if (call.id.startsWith("consult-")) {
        setIncomingCall(call);
        
        try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
          audio.play().catch(() => {});
        } catch (e) {}
      }
    };

    const unsubCreated = videoClient.on("call.created", handleEvent);
    const unsubRing = videoClient.on("call.notification.ring", handleEvent);

    return () => {
      unsubCreated();
      unsubRing();
    };
  }, [videoClient]);

  const handleAccept = () => {
    setShowModal(true);
  };

  const handleReject = () => {
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  // Extract sessionId from callId "consult-{sessionId}"
  const sessionId = incomingCall.id.replace("consult-", "");

  if (showModal) {
    return (
      <ConsultationModal 
        sessionId={sessionId} 
        onClose={() => {
          setShowModal(false);
          setIncomingCall(null);
        }} 
        isInstructor={false}
      />
    );
  }

  return (
    <div className="fixed top-6 right-6 z-[10000] animate-bounce-in">
      <div className="bg-background border border-primary/20 rounded-3xl p-6 shadow-2xl shadow-primary/20 backdrop-blur-xl flex items-center gap-6 min-w-[320px]">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
          <Icon icon="solar:videocamera-record-bold-duotone" className="w-8 h-8 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-ping" />
        </div>
        
        <div className="flex-1">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Incoming Consultation</p>
          <h4 className="font-bold text-foreground">Teacher is calling...</h4>
          <p className="text-xs text-muted-foreground mt-0.5">One-on-one session</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleReject}
            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20"
          >
            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
          <button 
            onClick={handleAccept}
            className="w-10 h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all flex items-center justify-center shadow-lg shadow-green-500/20"
          >
            <Icon icon="solar:phone-calling-bold" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotifier;
