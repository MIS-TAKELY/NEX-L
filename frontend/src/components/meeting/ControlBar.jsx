import React, { useState } from 'react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { Icon } from '@iconify/react';

const ControlBar = ({ onLeave, goLive, isInstructor, toggleChat, toggleParticipants, activePanel, sendReaction, isLive, isVideoCall, isJoining, isConsultation }) => {
  const { useMicrophoneState, useCameraState, useScreenShareState } = useCallStateHooks();

  // Use optimisticUpdates: true for instant visual feedback — same as Stream SDK's own ToggleAudioPublishingButton
  const { microphone, optionsAwareIsMute: micOff } = useMicrophoneState({ optimisticUpdates: true });
  const { camera, optionsAwareIsMute: camOff } = useCameraState({ optimisticUpdates: true });
  const { screenShare, isSharing } = useScreenShareState();
  const [showReactions, setShowReactions] = useState(false);

  const toggleMic = () => microphone.toggle();
  const toggleCam = () => camera.toggle();
  const toggleShare = () => screenShare.toggle();

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  if (isConsultation) {
    return (
      <div className="flex items-center justify-center w-full px-4 py-3 gap-6 transition-colors"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>

        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className="flex flex-col items-center gap-1.5 group"
          title={micOff ? 'Unmute microphone' : 'Mute microphone'}
        >
          <span className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
            micOff
              ? 'bg-destructive shadow-lg shadow-destructive/30'
              : 'bg-secondary hover:bg-secondary/70'
          }`}>
            {micOff ? (
              /* Mic Off SVG */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              /* Mic On SVG */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: 'var(--foreground)' }}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </span>
          <span className="text-[10px] font-medium" style={{ color: micOff ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
            {micOff ? 'Unmute' : 'Mute'}
          </span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCam}
          className="flex flex-col items-center gap-1.5 group"
          title={camOff ? 'Turn on camera' : 'Turn off camera'}
        >
          <span className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
            camOff
              ? 'bg-destructive shadow-lg shadow-destructive/30'
              : 'bg-secondary hover:bg-secondary/70'
          }`}>
            {camOff ? (
              /* Camera Off SVG */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
                <path d="M23 7l-7 5 7 5V7z" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              /* Camera On SVG */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: 'var(--foreground)' }}>
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            )}
          </span>
          <span className="text-[10px] font-medium" style={{ color: camOff ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
            {camOff ? 'Start Cam' : 'Stop Cam'}
          </span>
        </button>

        {/* Leave Call */}
        {onLeave && (
          <button
            onClick={onLeave}
            className="flex flex-col items-center gap-1.5 group"
            title="End call"
          >
            <span className="w-12 h-12 flex items-center justify-center rounded-full bg-destructive hover:bg-destructive/80 shadow-lg shadow-destructive/30 transition-all duration-200 active:scale-95">
              {/* Phone hang up SVG */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.01L6.6 10.8z"/>
              </svg>
            </span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--destructive)' }}>
              End Call
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full px-4 py-3 md:px-6 md:py-4" style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}>
      
      {/* Left side: Meeting Info */}
      <div className="hidden md:flex items-center gap-4 min-w-[200px]">
         {/* Meeting details could go here */}
      </div>

      {/* Center: Main Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mic Toggle */}
        <div className="group relative">
          <button
            onClick={toggleMic}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              micOff
                ? 'bg-destructive text-white hover:bg-destructive/90'
                : 'bg-secondary text-foreground hover:bg-secondary/70'
            }`}
          >
            <Icon
              icon={micOff ? 'material-symbols:mic-off' : 'material-symbols:mic'}
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap" style={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }}>
            {micOff ? 'Turn on microphone' : 'Turn off microphone'}
          </span>
        </div>

        {/* Camera Toggle */}
        <div className="group relative">
          <button
            onClick={toggleCam}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              camOff
                ? 'bg-destructive text-white hover:bg-destructive/90'
                : 'bg-secondary text-foreground hover:bg-secondary/70'
            }`}
          >
            <Icon
              icon={camOff ? 'material-symbols:videocam-off' : 'material-symbols:videocam'}
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap" style={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }}>
            {camOff ? 'Turn on camera' : 'Turn off camera'}
          </span>
        </div>

        {/* Captions Toggle (Mock) */}
        <div className="group relative">
          <button
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/70 transition-all duration-200 active:scale-95"
            title="Turn on captions"
          >
            <Icon icon="material-symbols:closed-caption" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap" style={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }}>
            Turn on captions
          </span>
        </div>

        {/* Hand Raise */}
        <div className="group relative">
          <button
            onClick={() => sendReaction && sendReaction('reaction', '✋')}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/70 transition-all duration-200 active:scale-95"
          >
            <Icon icon="material-symbols:back-hand" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap" style={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }}>
            Raise hand
          </span>
        </div>

        {/* Present Now (Screen Share) */}
        <div className="group relative">
          <button
            onClick={toggleShare}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              isSharing ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/70'
            }`}
          >
            <Icon icon={isSharing ? 'material-symbols:stop-screen-share' : 'material-symbols:present-to-all'} className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap" style={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }}>
            {isSharing ? 'Stop presenting' : 'Present now'}
          </span>
        </div>

        {/* More Options */}
        <div className="group relative">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/70 transition-all duration-200 active:scale-95 ${showMoreOptions ? 'ring-2 ring-primary/40' : ''}`}
          >
            <Icon icon="material-symbols:more-vert" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          {showMoreOptions && (
            <div className="absolute bottom-16 left-0 rounded-xl shadow-2xl py-2 w-56 flex flex-col z-50 animate-fade-in" style={{ background: "var(--popover)", border: "1px solid var(--border)", color: "var(--popover-foreground)" }}>
              <button 
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/60 text-sm transition-colors"
                onClick={() => setIsRecording(!isRecording)}
              >
                <Icon icon={isRecording ? 'material-symbols:stop-circle' : 'material-symbols:fiber-manual-record'} className={`w-5 h-5 ${isRecording ? 'text-destructive' : ''}`} />
                {isRecording ? 'Stop recording' : 'Record meeting'}
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/60 text-sm transition-colors">
                <Icon icon="material-symbols:settings-outline" className="w-5 h-5" />
                Settings
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/60 text-sm transition-colors">
                <Icon icon="material-symbols:noise-control-off" className="w-5 h-5" />
                Noise cancellation
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/60 text-sm transition-colors">
                <Icon icon="material-symbols:help-outline" className="w-5 h-5" />
                Report a problem
              </button>
            </div>
          )}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap" style={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }}>
            More options
          </span>
        </div>

        {/* Leave Call */}
        {onLeave && (
          <div className="group relative">
            <button
              onClick={onLeave}
              className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center rounded-3xl bg-destructive text-white hover:bg-destructive/90 hover:shadow-lg shadow-destructive/20 transition-all duration-200 active:scale-95"
            >
              <Icon icon="material-symbols:call-end" className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap" style={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }}>
              Leave call
            </span>
          </div>
        )}
      </div>

      {/* Right side: Meeting Controls (Chat, People, Activities) */}
      <div className="flex items-center gap-1 md:gap-2 min-w-[200px] justify-end">
        <button
          onClick={toggleParticipants}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            activePanel === 'participants' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
          }`}
          title="Meeting details"
        >
          <Icon icon="material-symbols:info-outline" className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={toggleParticipants}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            activePanel === 'participants' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
          }`}
          title="Show everyone"
        >
          <Icon icon="material-symbols:group-outline" className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={toggleChat}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            activePanel === 'chat' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
          }`}
          title="Chat with everyone"
        >
          <Icon icon="material-symbols:chat-bubble-outline" className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          className="w-10 h-10 flex items-center justify-center rounded-full text-foreground hover:bg-secondary transition-all"
          title="Activities"
        >
          <Icon icon="material-symbols:category-outline" className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {isInstructor && !isLive && goLive && !isVideoCall && (
            <button
                onClick={goLive}
                disabled={isJoining}
                className="bg-destructive text-white px-4 py-2 rounded-lg hover:bg-destructive/90 transition-all font-bold text-xs tracking-wide disabled:opacity-70"
            >
                {isJoining ? 'INITIALIZING...' : 'GO LIVE'}
            </button>
        )}
      </div>
    </div>
  );
};

export default ControlBar;
