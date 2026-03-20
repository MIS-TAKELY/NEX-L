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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in p-4">
      <div className="bg-[#1a1a1c] border border-white/10 rounded-[2.5rem] p-10 shadow-3xl flex flex-col items-center gap-8 max-w-sm w-full text-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
        
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary relative z-10">
            <Icon icon="solar:videocamera-record-bold-duotone" className="w-12 h-12 animate-pulse" />
          </div>
          {/* Animated Circles */}
          <div className="absolute inset-0 bg-primary/20 rounded-3xl animate-ping opacity-20 scale-150" />
          <div className="absolute inset-0 bg-primary/20 rounded-3xl animate-ping opacity-10 scale-200" style={{ animationDelay: '500ms' }} />
        </div>
        
        <div className="z-10">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Incoming Consultation</p>
          <h4 className="text-2xl font-bold text-white mb-2">Teacher is calling...</h4>
          <p className="text-sm text-gray-400">One-on-one session about your course</p>
        </div>

        <div className="flex gap-4 w-full z-10 pt-4">
          <button 
            onClick={handleReject}
            className="flex-1 h-14 rounded-2xl bg-white/5 hover:bg-red-500 text-white transition-all flex items-center justify-center gap-2 border border-white/10 font-bold group"
          >
            <Icon icon="solar:close-circle-bold" className="w-5 h-5 opacity-40 group-hover:opacity-100" />
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 font-bold"
          >
            <Icon icon="solar:phone-calling-bold" className="w-5 h-5" />
            Accept Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotifier;
