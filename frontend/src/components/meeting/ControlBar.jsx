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
      <div className="flex items-center justify-center w-full bg-background px-4 py-4 border-t border-border/50 gap-4 transition-colors">
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 shadow-xl border border-border/50 active:scale-95 ${
            micOff
              ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
              : 'bg-secondary/50 text-foreground hover:bg-secondary'
          }`}
        >
          <Icon icon={micOff ? 'solar:mic-broken-bold' : 'solar:mic-bold'} className="w-6 h-6" />
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCam}
          className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 shadow-xl border border-border/50 active:scale-95 ${
            camOff
              ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
              : 'bg-secondary/50 text-foreground hover:bg-secondary'
          }`}
        >
          <Icon icon={camOff ? 'solar:videocamera-broken-bold' : 'solar:videocamera-bold'} className="w-6 h-6" />
        </button>

        {/* Leave Call */}
        {onLeave && (
          <button
            onClick={onLeave}
            className="w-16 h-12 flex items-center justify-center rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg shadow-destructive/20 transition-all duration-200 active:scale-95 ml-2 border border-destructive/50"
          >
            <Icon icon="solar:phone-hang-up-bold" className="w-6 h-6" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full bg-[#202124] px-4 py-3 md:px-6 md:py-4 border-t border-white/10">
      
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
                ? 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                : 'bg-[#3c4043] text-white hover:bg-[#4d5154]'
            }`}
          >
            <Icon
              icon={micOff ? 'material-symbols:mic-off' : 'material-symbols:mic'}
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3c4043] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {micOff ? 'Turn on microphone (ctrl + d)' : 'Turn off microphone (ctrl + d)'}
          </span>
        </div>

        {/* Camera Toggle */}
        <div className="group relative">
          <button
            onClick={toggleCam}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              camOff
                ? 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                : 'bg-[#3c4043] text-white hover:bg-[#4d5154]'
            }`}
          >
            <Icon
              icon={camOff ? 'material-symbols:videocam-off' : 'material-symbols:videocam'}
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3c4043] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {camOff ? 'Turn on camera (ctrl + e)' : 'Turn off camera (ctrl + e)'}
          </span>
        </div>

        {/* Captions Toggle (Mock) */}
        <div className="group relative">
          <button
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[#3c4043] text-white hover:bg-[#4d5154] transition-all duration-200 active:scale-95"
            title="Turn on captions"
          >
            <Icon icon="material-symbols:closed-caption" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3c4043] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Turn on captions (c)
          </span>
        </div>

        {/* Hand Raise */}
        <div className="group relative">
          <button
            onClick={() => sendReaction && sendReaction('reaction', '✋')}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[#3c4043] text-white hover:bg-[#4d5154] transition-all duration-200 active:scale-95"
          >
            <Icon icon="material-symbols:back-hand" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3c4043] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Raise hand (ctrl + alt + h)
          </span>
        </div>

        {/* Present Now (Screen Share) */}
        <div className="group relative">
          <button
            onClick={toggleShare}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
              isSharing ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] text-white hover:bg-[#4d5154]'
            }`}
          >
            <Icon icon={isSharing ? 'material-symbols:stop-screen-share' : 'material-symbols:present-to-all'} className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3c4043] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {isSharing ? 'Stop presenting' : 'Present now'}
          </span>
        </div>

        {/* More Options */}
        <div className="group relative">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[#3c4043] text-white hover:bg-[#4d5154] transition-all duration-200 active:scale-95 ${showMoreOptions ? 'bg-[#4d5154]' : ''}`}
          >
            <Icon icon="material-symbols:more-vert" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          {showMoreOptions && (
            <div className="absolute bottom-16 left-0 bg-[#3c4043] rounded-lg shadow-xl border border-white/10 py-2 w-56 flex flex-col z-50 animate-fade-in">
              <button 
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-white text-sm"
                onClick={() => setIsRecording(!isRecording)}
              >
                <Icon icon={isRecording ? 'material-symbols:stop-circle' : 'material-symbols:fiber-manual-record'} className={`w-5 h-5 ${isRecording ? 'text-red-500' : ''}`} />
                {isRecording ? 'Stop recording' : 'Record meeting'}
              </button>
              <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-white text-sm">
                <Icon icon="material-symbols:settings-outline" className="w-5 h-5" />
                Settings
              </button>
              <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-white text-sm">
                <Icon icon="material-symbols:noise-control-off" className="w-5 h-5" />
                Noise cancellation
              </button>
              <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-white text-sm">
                <Icon icon="material-symbols:help-outline" className="w-5 h-5" />
                Report a problem
              </button>
            </div>
          )}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3c4043] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            More options
          </span>
        </div>

        {/* Leave Call */}
        {onLeave && (
          <div className="group relative">
            <button
              onClick={onLeave}
              className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center rounded-3xl bg-[#ea4335] text-white hover:bg-[#d93025] hover:shadow-lg shadow-[#ea4335]/20 transition-all duration-200 active:scale-95"
            >
              <Icon icon="material-symbols:call-end" className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3c4043] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
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
            activePanel === 'participants' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-white hover:bg-white/10'
          }`}
          title="Meeting details"
        >
          <Icon icon="material-symbols:info-outline" className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={toggleParticipants}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            activePanel === 'participants' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-white hover:bg-white/10'
          }`}
          title="Show everyone"
        >
          <Icon icon="material-symbols:group-outline" className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={toggleChat}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            activePanel === 'chat' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-white hover:bg-white/10'
          }`}
          title="Chat with everyone"
        >
          <Icon icon="material-symbols:chat-bubble-outline" className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-all"
          title="Activities"
        >
          <Icon icon="material-symbols:category-outline" className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {isInstructor && !isLive && goLive && !isVideoCall && (
            <button
                onClick={goLive}
                disabled={isJoining}
                className="bg-[#ea4335] text-white px-4 py-2 rounded-lg hover:bg-[#d93025] transition-all font-bold text-xs tracking-wide disabled:opacity-70"
            >
                {isJoining ? 'INITIALIZING...' : 'GO LIVE'}
            </button>
        )}
      </div>
    </div>
  );
};

export default ControlBar;
