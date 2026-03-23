import React, { useState } from 'react';
import { useCallStateHooks, useCall } from '@stream-io/video-react-sdk';
import { Icon } from '@iconify/react';

const EMOJIS = [
  { code: '💖', label: 'love' },
  { code: '👍', label: 'thumbs up' },
  { code: '🎉', label: 'party' },
  { code: '😄', label: 'smile' },
  { code: '😮', label: 'wow' },
  { code: '😢', label: 'sad' },
  { code: '🤔', label: 'thinking' },
  { code: '👎', label: 'thumbs down' },
];

const ControlBar = ({ onLeave, goLive, isInstructor, toggleChat, toggleParticipants, activePanel, sendReaction, isLive, isVideoCall, isJoining, isConsultation, layout, onLayoutChange, onOpenDeviceSettings }) => {
  const call = useCall();
  const { 
    useMicrophoneState, 
    useCameraState, 
    useScreenShareState, 
    useLocalParticipant, 
    useIsCallRecordingInProgress,
    useOwnCapabilities 
  } = useCallStateHooks();

  const { microphone, optionsAwareIsMute: micOff } = useMicrophoneState({ optimisticUpdates: true });
  const { camera, optionsAwareIsMute: camOff } = useCameraState({ optimisticUpdates: true });
  const { screenShare, isSharing } = useScreenShareState();
  const localParticipant = useLocalParticipant();
  const isRecording = useIsCallRecordingInProgress();
  const ownCapabilities = useOwnCapabilities() || [];
  
  const canRaiseHand = ownCapabilities.includes('raise-hand');
  const canSendAudio = ownCapabilities.includes('send-audio');
  const canSendVideo = ownCapabilities.includes('send-video');
  const canScreenShare = ownCapabilities.includes('screen-share');
  
  const isHandRaised = !!localParticipant?.raisedHandAt;

  const toggleMic = async () => {
    if (!canSendAudio) {
      try {
        await call.requestPermissions({ permissions: ['send-audio'] });
        alert("Microphone permission request sent to the instructor.");
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

  const toggleCam = async () => {
    if (!canSendVideo) {
      try {
        await call.requestPermissions({ permissions: ['send-video'] });
        alert("Camera permission request sent to the instructor.");
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
  const toggleShare = async () => {
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
        alert("Screen share request sent to the instructor.");
      } catch (err) {
        console.error("Failed to request screenshare permission:", err);
        alert("Unable to request screen share. Please ask the instructor to grant permissions.");
      }
      return;
    }

    try {
      await screenShare.toggle();
    } catch (err) {
      console.error("Failed to start screen share:", err);
    }
  };

  const [isRecordingToggling, setIsRecordingToggling] = useState(false);

  const toggleRecording = async () => {
    if (!call || isRecordingToggling) return;
    setIsRecordingToggling(true);
    try {
      if (isRecording) {
        await call.stopRecording();
      } else {
        await call.startRecording();
      }
    } catch (err) {
      console.error("Failed to toggle recording:", err);
    } finally {
      setIsRecordingToggling(false);
    }
  };

  const toggleHandRaise = async () => {
    if (!call) return;
    try {
      if (isHandRaised) {
        if (typeof call.lowerHand === 'function') {
          await call.lowerHand();
        } else if (canRequestPermissions) {
          // Fallback: In some SDK versions, lowering hand is done by requesting permissions without it
          await call.requestPermissions({ permissions: [] }); 
        } else {
          console.warn("User lacks permission to lower hand via requestPermissions fallback");
        }
      } else {
        // Prefer the dedicated method if available
        if (typeof call.raiseHand === 'function') {
          try {
            await call.raiseHand();
          } catch (internalErr) {
            try {
              await call.requestPermissions({ permissions: ['raise-hand'] });
            } catch(e) {
              console.error("Hand raise fallback failed:", e);
            }
          }
        } else {
          try {
            await call.requestPermissions({ permissions: ['raise-hand'] });
          } catch(e) {
            if (sendReaction) {
              sendReaction('reaction', '✋');
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to toggle hand raise:", err);
      // Optional: show a toast or notification to the user
    }
  };

  const [showReactions, setShowReactions] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleSendReaction = (emoji) => {
    if (sendReaction) {
      sendReaction('reaction', emoji);
    }
    setShowReactions(false);
  };

  if (isConsultation) {
    return (
      <div className="flex items-center justify-center w-full px-4 py-3 gap-6 transition-colors"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>

        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className="flex flex-col items-center gap-1.5 group"
          title={micOff ? (!canSendAudio ? 'Request Microphone' : 'Unmute microphone') : 'Mute microphone'}
        >
          <span className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
            micOff
              ? 'bg-destructive shadow-lg shadow-destructive/30'
              : 'bg-secondary hover:bg-secondary/70'
          }`}>
            {micOff ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
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
          title={camOff ? (!canSendVideo ? 'Request Camera' : 'Turn on camera') : 'Turn off camera'}
        >
          <span className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
            camOff
              ? 'bg-destructive shadow-lg shadow-destructive/30'
              : 'bg-secondary hover:bg-secondary/70'
          }`}>
            {camOff ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
                <path d="M23 7l-7 5 7 5V7z" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
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
    <div className="flex flex-col w-full bg-background">
      {/* Mobile-only: Panel Controls Row */}
      <div className="flex md:hidden items-center justify-center gap-1 px-3 py-2 border-b border-border/30">
        {isRecording && (
          <div className="flex items-center gap-1.5 mr-1 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <span className="text-[9px] font-bold text-destructive uppercase tracking-wider">REC</span>
          </div>
        )}

        <button
          onClick={toggleParticipants}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
            activePanel === 'participants' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
          }`}
          title="Show everyone"
        >
          <Icon icon="material-symbols:group-outline" className="w-5 h-5" />
        </button>

        <button
          onClick={toggleChat}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
            activePanel === 'chat' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
          }`}
          title="Chat with everyone"
        >
          <Icon icon="material-symbols:chat-bubble-outline" className="w-5 h-5" />
        </button>

        {onLayoutChange && (
          <button
            onClick={() => onLayoutChange(layout === 'grid' ? 'speaker' : 'grid')}
            className="w-9 h-9 flex items-center justify-center rounded-full text-foreground hover:bg-secondary transition-all"
            title={layout === 'grid' ? 'Speaker view' : 'Gallery view'}
          >
            <Icon icon={layout === 'grid' ? 'material-symbols:view-sidebar-outline' : 'material-symbols:grid-view'} className="w-5 h-5" />
          </button>
        )}

        {isInstructor && !isLive && goLive && !isVideoCall && (
          <button
            onClick={goLive}
            disabled={isJoining}
            className="ml-1 bg-destructive text-white px-4 py-1.5 rounded-lg hover:bg-destructive/90 transition-all font-bold text-[10px] tracking-widest disabled:opacity-70"
          >
            {isJoining ? 'WAIT...' : 'GO LIVE'}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between w-full px-4 py-3 md:px-6 md:py-4">
      
      {/* Left side: Meeting Info */}
      <div className="hidden md:flex items-center gap-4 min-w-[200px]">
          <div className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Meeting ID</span>
              <span className="text-sm font-medium tracking-tight">nex-l-meeting</span>
          </div>
      </div>

      {/* Center: Main Controls */}
      <div className="flex items-center gap-2 md:gap-4 mx-auto md:mx-0">
        {/* Mic Toggle */}
        <div className="group relative">
          <button
            onClick={toggleMic}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              micOff
                ? 'bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/20'
                : 'bg-secondary text-foreground hover:bg-secondary/70'
            }`}
          >
            <Icon
              icon={micOff ? 'material-symbols:mic-off' : 'material-symbols:mic'}
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded bg-popover text-popover-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
            {micOff ? (!canSendAudio ? 'Request Microphone' : 'Turn on microphone') : 'Turn off microphone'}
          </span>
        </div>

        {/* Camera Toggle */}
        <div className="group relative">
          <button
            onClick={toggleCam}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              camOff
                ? 'bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/20'
                : 'bg-secondary text-foreground hover:bg-secondary/70'
            }`}
          >
            <Icon
              icon={camOff ? 'material-symbols:videocam-off' : 'material-symbols:videocam'}
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded bg-popover text-popover-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
            {camOff ? (!canSendVideo ? 'Request Camera' : 'Turn on camera') : 'Turn off camera'}
          </span>
        </div>

        {/* Reactions Toggle */}
        <div className="group relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              showReactions ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/70'
            }`}
          >
            <Icon icon="material-symbols:add-reaction-outline" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          {showReactions && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-2xl shadow-2xl p-2 flex items-center gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji.code}
                  onClick={() => handleSendReaction(emoji.code)}
                  className="w-10 h-10 flex items-center justify-center text-xl hover:bg-secondary rounded-xl transition-colors"
                  title={emoji.label}
                >
                  {emoji.code}
                </button>
              ))}
            </div>
          )}
          
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded bg-popover text-popover-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
            Send reaction
          </span>
        </div>

        {/* Hand Raise */}
        <div className="group relative">
          <button
            onClick={toggleHandRaise}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              isHandRaised ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'bg-secondary text-foreground hover:bg-secondary/70'
            }`}
          >
            <Icon icon={isHandRaised ? 'material-symbols:back-hand' : 'material-symbols:back-hand-outline'} className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded bg-popover text-popover-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
            {isHandRaised ? 'Lower hand' : 'Raise hand'}
          </span>
        </div>

        {/* Present Now (Screen Share) */}
        <div className="group relative">
          <button
            onClick={toggleShare}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              isSharing 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                : 'bg-secondary text-foreground hover:bg-secondary/70'
            }`}
          >
            <Icon 
              icon={isSharing ? 'material-symbols:stop-screen-share' : 'material-symbols:present-to-all'} 
              className="w-5 h-5 md:w-6 md:h-6" 
            />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded bg-popover text-popover-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
            {isSharing ? 'Stop presenting' : (!canScreenShare ? 'Request Screen Share' : 'Present now')}
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
            <div className="absolute bottom-16 left-0 bg-popover border border-border rounded-xl shadow-2xl py-2 w-56 flex flex-col z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button 
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/60 text-sm transition-colors"
                onClick={() => { toggleRecording(); setShowMoreOptions(false); }}
                disabled={isRecordingToggling}
              >
                <Icon icon={isRecording ? 'material-symbols:stop-circle' : 'material-symbols:fiber-manual-record'} className={`w-5 h-5 ${isRecording ? 'text-destructive' : ''}`} />
                {isRecordingToggling ? 'Please wait...' : isRecording ? 'Stop recording' : 'Record meeting'}
              </button>
              <button 
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/60 text-sm transition-colors"
                onClick={() => { onOpenDeviceSettings?.(); setShowMoreOptions(false); }}
              >
                <Icon icon="material-symbols:settings-outline" className="w-5 h-5" />
                Device settings
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/60 text-sm transition-colors">
                <Icon icon="material-symbols:help-outline" className="w-5 h-5" />
                Report a problem
              </button>
            </div>
          )}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded bg-popover text-popover-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
            More options
          </span>
        </div>

        {/* Leave Call */}
        {onLeave && (
          <div className="group relative ml-2 md:ml-4">
            <button
              onClick={onLeave}
              className="w-14 h-10 md:w-20 md:h-12 flex items-center justify-center rounded-3xl bg-destructive text-white hover:bg-destructive/90 hover:shadow-xl shadow-destructive/30 transition-all duration-200 active:scale-95"
            >
              <Icon icon="material-symbols:call-end" className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded bg-popover text-popover-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
              Leave call
            </span>
          </div>
        )}
      </div>

      {/* Right side: Meeting Controls (Chat, People, Layout, Activities) */}
      <div className="hidden md:flex items-center gap-1 md:gap-2 min-w-[200px] justify-end">
        {isRecording && (
          <div className="flex items-center gap-1.5 mr-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">REC</span>
          </div>
        )}

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

        {onLayoutChange && (
          <button
            onClick={() => onLayoutChange(layout === 'grid' ? 'speaker' : 'grid')}
            className="w-10 h-10 flex items-center justify-center rounded-full text-foreground hover:bg-secondary transition-all"
            title={layout === 'grid' ? 'Switch to speaker view' : 'Switch to gallery view'}
          >
            <Icon icon={layout === 'grid' ? 'material-symbols:view-sidebar-outline' : 'material-symbols:grid-view'} className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {isInstructor && !isLive && goLive && !isVideoCall && (
            <button
                onClick={goLive}
                disabled={isJoining}
                className="ml-4 bg-destructive text-white px-6 py-2 rounded-xl hover:bg-destructive/90 transition-all font-bold text-xs tracking-widest disabled:opacity-70 shadow-lg shadow-destructive/20"
            >
                {isJoining ? 'INITIALIZING...' : 'GO LIVE'}
            </button>
        )}
      </div>
      </div>
    </div>
  );
};

export default ControlBar;
