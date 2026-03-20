import React, { useState, useEffect } from 'react';
import { useCallStateHooks, CallingState } from '@stream-io/video-react-sdk';
import ControlBar from './ControlBar';
import SidePanel from './SidePanel';
import JoinScreen from './JoinScreen';
import VideoGrid from './VideoGrid';
import { Icon } from '@iconify/react';
// import FloatingSelfView from './FloatingSelfView'; // Left out as stream layouts handle self view nicely

const MeetingLayout = ({
  courseName,
  courseId,
  call,
  onLeave,
  isInstructor = false,
  goLive,
  reactions = [],
  callType = 'livestream', // 'livestream' | 'videocall'
  autoJoin = false
}) => {
  const { useCallCallingState, useParticipantCount, useIsCallLive } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const isLive = useIsCallLive();

  const [activePanel, setActivePanel] = useState(null); // 'chat' or 'participants'

  // Auto-hide controls state
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!activePanel) { // Only hide if side panel is closed
            setControlsVisible(false);
        }
      }, 5000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [activePanel]);

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
    if (!activePanel) setControlsVisible(true); // Keep controls visible if opening panel
  };

  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
      if (isJoining) return;
      try {
        setIsJoining(true);
        if (call.state.callingState !== CallingState.JOINED && call.state.callingState !== CallingState.JOINING) {
           await call.join({ create: isInstructor || callType === 'videocall' });
        }
      } catch (err) {
        console.error("Join failed:", err);
        alert("Failed to connect to media server. Please check your network and try again.");
      } finally {
        setIsJoining(false);
      }
  };

  if (callingState !== CallingState.JOINED && !autoJoin) {
    return (
      <JoinScreen 
        onJoin={handleJoin} 
        courseName={courseName} 
        isInstructor={isInstructor} 
        goLive={goLive}
        isVideoCall={callType === 'videocall'}
        isJoining={isJoining}
      />
    );
  }

  // If auto-joined but still connecting (like WatcherView originally handled)
  if (callingState !== CallingState.JOINED && autoJoin) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#202124] text-white font-sans gap-6">
            <div className="w-24 h-24 rounded-full bg-[#3c4043] flex items-center justify-center shadow-lg relative">
              <div className="absolute inset-0 bg-[#8ab4f8]/20 rounded-full animate-ping" />
              <Icon icon="solar:tv-bold-duotone" className="w-10 h-10 text-gray-400" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-medium tracking-wide">Waiting for host...</h2>
                <p className="text-gray-400 pt-2 font-light">The session will start automatically when the instructor arrives.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#202124] text-white overflow-hidden text-sm font-sans font-medium">
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden h-full transition-all duration-300">
        
        {/* Top Header - Meeting Info */}
        <div className={`absolute top-0 left-0 w-full p-4 lg:p-6 flex justify-between items-start z-20 pointer-events-none transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="pointer-events-auto flex items-center gap-3 bg-[#3c4043]/80 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/5 shadow-md">
                <h1 className="font-medium text-base truncate max-w-[200px] md:max-w-xs">{courseName || "Meeting"}</h1>
                {callType === 'livestream' && (
                    <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#ea4335] animate-pulse drop-shadow-[0_0_5px_rgba(234,67,53,0.8)]' : 'bg-gray-400'}`} />
                        <span className="text-xs text-gray-200">
                          {isLive ? `LIVE · ${participantCount} viewers` : "Backstage"}
                        </span>
                    </div>
                )}
                {callType === 'videocall' && (
                   <div className="flex items-center gap-2 border-l border-white/20 pl-3 text-xs text-gray-200">
                      <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4" />
                      {participantCount}
                   </div>
                )}
            </div>
        </div>

        {/* Main Video Area */}
        <div className="w-full h-full p-4 lg:p-6 flex items-center justify-center pb-24 md:pb-28 transition-all duration-300">
             <VideoGrid callType={callType} isInstructor={isInstructor} />
        </div>

        {/* Reactions Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full z-10">
          {reactions?.map((reaction, i) => (
            <div
              key={i}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 animate-float-up text-5xl"
              style={{
                left: `${40 + Math.random() * 20}%`,
                animationDelay: `${Math.random() * 0.2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {reaction.emoji_code}
            </div>
          ))}
        </div>

        {/* Floating Control Bar */}
        <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-500 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <ControlBar
            onLeave={onLeave}
            goLive={goLive}
            isInstructor={isInstructor}
            toggleChat={() => togglePanel('chat')}
            toggleParticipants={() => togglePanel('participants')}
            activePanel={activePanel}
            sendReaction={callType === 'livestream' ? (type, emoji) => call.sendReaction({ type, emoji_code: emoji }) : null}
            isLive={isLive}
            isVideoCall={callType === 'videocall'}
          />
        </div>
      </div>

      {/* Side Panel for Chat & Participants */}
      <SidePanel
        activePanel={activePanel}
        onClose={() => togglePanel(null)}
        courseId={courseId}
      />
    </div>
  );
};
export default MeetingLayout;
