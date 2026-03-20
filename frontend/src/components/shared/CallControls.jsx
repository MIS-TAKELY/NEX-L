import React from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { Icon } from "@iconify/react";

const CallControls = ({ onLeave }) => {
  const {
    useMicrophoneState,
    useCameraState,
    useScreenShareState,
  } = useCallStateHooks();

  const { microphone, isMuted: isMicMuted } = useMicrophoneState();
  const { camera, isMuted: isCamMuted } = useCameraState();
  const { screenShare, isSharing } = useScreenShareState();

  const toggleMicrophone = async () => {
    try {
      await microphone.toggle();
    } catch (err) {
      console.error("Failed to toggle microphone:", err);
    }
  };

  const toggleCamera = async () => {
    try {
      await camera.toggle();
    } catch (err) {
      console.error("Failed to toggle camera:", err);
    }
  };

  const toggleScreenShare = async () => {
    try {
      await screenShare.toggle();
    } catch (err) {
      console.error("Failed to toggle screen share:", err);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-gray-900/80 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-2xl">
      {/* Microphone Toggle */}
      <button
        onClick={toggleMicrophone}
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
          isMicMuted
            ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
            : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
        }`}
        title={isMicMuted ? "Turn on microphone" : "Turn off microphone"}
      >
        <Icon
          icon={isMicMuted ? "solar:microphone-off-bold" : "solar:microphone-bold"}
          className="w-6 h-6"
        />
      </button>

      {/* Camera Toggle */}
      <button
        onClick={toggleCamera}
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
          isCamMuted
            ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
            : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
        }`}
        title={isCamMuted ? "Turn on camera" : "Turn off camera"}
      >
        <Icon
          icon={isCamMuted ? "solar:videocamera-off-bold" : "solar:videocamera-bold"}
          className="w-6 h-6"
        />
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={toggleScreenShare}
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
          isSharing
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
        }`}
        title={isSharing ? "Stop sharing" : "Share screen"}
      >
        <Icon
          icon={isSharing ? "solar:screen-share-bold" : "solar:screen-share-outline"}
          className="w-6 h-6"
        />
      </button>

      {/* More Options - Placeholder for Google Meet style */}
      <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/5 transition-all">
        <Icon icon="solar:menu-dots-bold" className="w-6 h-6" />
      </button>

      {/* End Call / Leave */}
      {onLeave && (
        <button
          onClick={onLeave}
          className="ml-2 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-2xl px-6 py-3 transition-all duration-300 shadow-lg shadow-red-500/20 active:scale-95"
          title="Leave call"
        >
          <Icon icon="solar:phone-calling-broken" className="w-6 h-6 rotate-[135deg]" />
        </button>
      )}
    </div>
  );
};

export default CallControls;
