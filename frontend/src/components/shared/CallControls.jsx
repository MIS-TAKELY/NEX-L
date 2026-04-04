import React from "react";
import { useCallStateHooks, useCall } from "@stream-io/video-react-sdk";
import { Icon } from "@iconify/react";

const CallControls = ({ onLeave }) => {
  const {
    useMicrophoneState,
    useCameraState,
    useScreenShareState,
    useOwnCapabilities,
  } = useCallStateHooks();

  const call = useCall();
  const ownCapabilities = useOwnCapabilities() || [];
  
  const canSendAudio = ownCapabilities.includes('send-audio');
  const canSendVideo = ownCapabilities.includes('send-video');
  const canScreenShare = ownCapabilities.includes('screen-share');
  const canRequestPermissions = ownCapabilities.includes('send-permissions-request');

  const { microphone, isMuted: isMicMuted } = useMicrophoneState();
  const { camera, isMuted: isCamMuted } = useCameraState();
  const { screenShare, isSharing } = useScreenShareState();

  const toggleMicrophone = async () => {
    if (!canSendAudio) {
      try {
        await call.requestPermissions({ permissions: ['send-audio'] });
        alert("Microphone permission request sent.");
      } catch (err) {
        console.error("Failed to request microphone permission:", err);
        alert("Unable to request microphone access. Please ask the instructor to grant permissions.");
      }
      return;
    }
    try {
      await microphone.toggle();
    } catch (err) {
      console.error("Failed to toggle microphone:", err);
    }
  };

  const toggleCamera = async () => {
    if (!canSendVideo) {
      try {
        await call.requestPermissions({ permissions: ['send-video'] });
        alert("Camera permission request sent.");
      } catch (err) {
        console.error("Failed to request camera permission:", err);
        alert("Unable to request camera access. Please ask the instructor to grant permissions.");
      }
      return;
    }
    try {
      await camera.toggle();
    } catch (err) {
      console.error("Failed to toggle camera:", err);
    }
  };

  const toggleScreenShare = async () => {
    if (isSharing) {
      try {
        await screenShare.toggle();
      } catch (err) {
        console.error("Failed to stop screen share:", err);
      }
      return;
    }

    if (!canScreenShare) {
      try {
        await call.requestPermissions({ permissions: ['screen-share'] });
        alert("Screen share request sent.");
      } catch (err) {
        console.error("Failed to request screenshare permission:", err);
        alert("Unable to request screen share. Please ask the instructor to grant permissions.");
      }
      return;
    }
    try {
      await screenShare.toggle();
    } catch (err) {
      console.error("Failed to toggle screen share:", err);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-gray-900/80 backdrop-blur-xl px-6 py-3 rounded-md border border-white/10 shadow-2xl">
      {/* Microphone Toggle */}
      <button
        onClick={toggleMicrophone}
        className={`w-12 h-12 flex items-center justify-center rounded-md transition-all duration-300 ${
          isMicMuted
            ? !canSendAudio && !canRequestPermissions
              ? "bg-card/5 text-muted-foreground opacity-50 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
            : "bg-card/10 text-white hover:bg-card/20 border border-white/5"
        }`}
        title={isMicMuted ? (!canSendAudio && canRequestPermissions ? "Request Microphone" : "Turn on microphone") : "Turn off microphone"}
      >
        <Icon
          icon={isMicMuted ? "solar:microphone-off-bold" : "solar:microphone-bold"}
          className={`w-6 h-6 ${!canSendAudio && !canRequestPermissions ? 'opacity-50' : ''}`}
        />
      </button>

      {/* Camera Toggle */}
      <button
        onClick={toggleCamera}
        className={`w-12 h-12 flex items-center justify-center rounded-md transition-all duration-300 ${
          isCamMuted
            ? !canSendVideo && !canRequestPermissions
              ? "bg-card/5 text-muted-foreground opacity-50 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
            : "bg-card/10 text-white hover:bg-card/20 border border-white/5"
        }`}
        title={isCamMuted ? (!canSendVideo && canRequestPermissions ? "Request Camera" : "Turn on camera") : "Turn off camera"}
      >
        <Icon
          icon={isCamMuted ? "solar:videocamera-off-bold" : "solar:videocamera-bold"}
          className={`w-6 h-6 ${!canSendVideo && !canRequestPermissions ? 'opacity-50' : ''}`}
        />
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={toggleScreenShare}
        className={`w-12 h-12 flex items-center justify-center rounded-md transition-all duration-300 ${
          isSharing
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : !canScreenShare && !canRequestPermissions
              ? "bg-card/5 text-muted-foreground opacity-50 cursor-not-allowed"
              : "bg-card/10 text-white hover:bg-card/20 border border-white/5"
        }`}
        title={isSharing ? "Stop sharing" : !canScreenShare && canRequestPermissions ? "Request Screen Share" : "Share screen"}
      >
        <Icon
          icon={isSharing ? "solar:screen-share-bold" : "solar:screen-share-outline"}
          className={`w-6 h-6 ${!canScreenShare && !canRequestPermissions ? 'opacity-50' : ''}`}
        />
      </button>

      {/* More Options - Placeholder for Google Meet style */}
      <button className="w-12 h-12 flex items-center justify-center rounded-md bg-card/10 text-white hover:bg-card/20 border border-white/5 transition-all">
        <Icon icon="solar:menu-dots-bold" className="w-6 h-6" />
      </button>

      {/* End Call / Leave */}
      {onLeave && (
        <button
          onClick={onLeave}
          className="ml-2 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-md px-6 py-3 transition-all duration-300 shadow-lg shadow-red-500/20 active:scale-95"
          title="Leave call"
        >
          <Icon icon="material-symbols:call-end-rounded" className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

export default CallControls;
