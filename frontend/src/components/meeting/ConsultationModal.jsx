import { Icon } from "@iconify/react";
import ConsultationClient from "./ConsultationClient";
import { useEffect } from "react";

const ConsultationModal = ({ sessionId, onClose }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!sessionId) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 md:p-8">
      <div className="w-full h-full max-w-6xl max-h-[90vh] bg-[#0c0c0e] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative group">
        
        {/* Close Button - Optional since ControlBar has Leave button, but good for safety */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[1000] w-10 h-10 bg-white/5 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all border border-white/10 text-white/40"
        >
          <Icon icon="solar:close-circle-linear" className="w-6 h-6" />
        </button>

        <ConsultationClient 
          sessionId={sessionId} 
          onLeave={onClose} 
        />
      </div>
    </div>
  );
};

export default ConsultationModal;
