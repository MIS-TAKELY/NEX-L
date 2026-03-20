import React, { useState } from 'react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { Icon } from '@iconify/react';

const ControlBar = ({ onLeave, goLive, isInstructor, toggleChat, toggleParticipants, activePanel, sendReaction, isLive, isVideoCall }) => {
  const { useMicrophoneState, useCameraState, useScreenShareState } = useCallStateHooks();
  const { microphone, isMuted: isMicMuted } = useMicrophoneState();
  const { camera, isMuted: isCamMuted } = useCameraState();
  const { screenShare, isSharing } = useScreenShareState();
  const [showReactions, setShowReactions] = useState(false);

  const toggleMic = () => microphone.toggle();
  const toggleCam = () => camera.toggle();
  const toggleShare = () => screenShare.toggle();

  return (
    <div className="flex items-center gap-2 md:gap-4 bg-[#202124]/90 backdrop-blur-xl px-4 md:px-6 py-3 rounded-full border border-white/10 shadow-2xl transition-all duration-300">
      
      {/* Audio & Video Controls */}
      <div className="flex items-center gap-2 md:gap-3 border-r border-white/10 pr-2 md:pr-4">
        <button
          onClick={toggleMic}
          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all ${
            isMicMuted ? 'bg-[#ea4335] text-white hover:bg-[#d93025]' : 'bg-[#3c4043] text-white hover:bg-[#4d5154]'
          }`}
          title={isMicMuted ? 'Turn on microphone' : 'Turn off microphone'}
        >
          <Icon icon={isMicMuted ? 'solar:microphone-off-bold' : 'solar:microphone-bold'} className="w-5 h-5" />
        </button>

        <button
          onClick={toggleCam}
          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all ${
            isCamMuted ? 'bg-[#ea4335] text-white hover:bg-[#d93025]' : 'bg-[#3c4043] text-white hover:bg-[#4d5154]'
          }`}
          title={isCamMuted ? 'Turn on camera' : 'Turn off camera'}
        >
          <Icon icon={isCamMuted ? 'solar:videocamera-off-bold' : 'solar:videocamera-bold'} className="w-5 h-5" />
        </button>

        <button
          onClick={toggleShare}
          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all ${
            isSharing ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] text-white hover:bg-[#4d5154]'
          }`}
          title={isSharing ? 'Stop sharing screen' : 'Share screen'}
        >
          <Icon icon={isSharing ? 'solar:screen-share-bold' : 'solar:screen-share-outline'} className="w-5 h-5" />
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 md:gap-3 relative pl-2 md:pl-0">
        
        {sendReaction && (
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[#3c4043] text-white hover:bg-[#4d5154] transition-all"
              title="Send a reaction"
            >
              <Icon icon="solar:smile-circle-bold" className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {showReactions && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#3c4043] p-2 rounded-2xl flex gap-1 md:gap-2 shadow-xl border border-white/10 animate-fade-in">
                {['❤️', '👍', '🔥', '👏', '😮', '😂'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      sendReaction('reaction', emoji);
                      setShowReactions(false);
                    }}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-lg md:text-xl transform hover:scale-110 active:scale-95 text-white"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {toggleParticipants && (
          <button
            onClick={toggleParticipants}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all ${
              activePanel === 'participants' ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] text-white hover:bg-[#4d5154]'
            }`}
             title="People"
          >
            <Icon icon="solar:users-group-two-rounded-bold" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {toggleChat && (
          <button
            onClick={toggleChat}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all ${
              activePanel === 'chat' ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] text-white hover:bg-[#4d5154]'
            }`}
             title="Chat"
          >
            <Icon icon="solar:chat-round-dots-bold" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {isInstructor && !isLive && goLive && !isVideoCall && (
          <button
            onClick={goLive}
            className="flex items-center gap-2 bg-[#ea4335] text-white px-4 py-2 md:px-6 md:py-3 rounded-full hover:bg-[#d93025] transition-all font-bold text-xs md:text-sm tracking-wide ml-2 hover:shadow-lg shadow-[#ea4335]/20"
          >
            <Icon icon="solar:play-bold" className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">GO LIVE</span>
          </button>
        )}

        {onLeave && (
          <button
            onClick={onLeave}
            className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center rounded-[24px] bg-[#ea4335] text-white hover:bg-[#d93025] transition-all shadow-lg ml-2 hover:shadow-xl shadow-[#ea4335]/20"
            title="Leave call"
          >
            <Icon icon="solar:phone-calling-broken" className="w-5 h-5 rotate-[135deg]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ControlBar;
