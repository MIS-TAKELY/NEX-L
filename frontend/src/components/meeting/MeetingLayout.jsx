import React, { useState, useEffect } from 'react';
import { useCallStateHooks, CallingState } from '@stream-io/video-react-sdk';
import ControlBar from './ControlBar';
import SidePanel from './SidePanel';
import JoinScreen from './JoinScreen';
import VideoGrid from './VideoGrid';
import DeviceSettingsModal from './DeviceSettingsModal';
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
  autoJoin = false,
  isCompact,
}) => {
  const { 
    useCallCallingState, 
    useParticipantCount, 
    useIsCallLive,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const isLive = useIsCallLive();

  // Custom reaction buffering since SDK hook is missing
  const [sdkReactions, setSdkReactions] = useState([]);

  useEffect(() => {
    if (!call) return;

    const unsubscribe = call.on('call.reaction_new', (event) => {
      const { reaction, user } = event;
      if (!reaction) return;

      const newReaction = {
        id: Date.now() + Math.random(),
        reaction: reaction,
        participant: {
          user: user,
          userId: user?.id,
          name: user?.name,
          image: user?.image
        },
        emoji_code: reaction.emoji_code
      };

      setSdkReactions((prev) => [...prev, newReaction]);

      // Remove after 5 seconds
      setTimeout(() => {
        setSdkReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
      }, 5000);
    });

    return () => unsubscribe();
  }, [call]);
  
  // Use reactions from SDK if local prop is empty
  const activeReactions = (reactions && reactions.length > 0) ? reactions : sdkReactions;

  const [activePanel, setActivePanel] = useState(null); // 'chat' or 'participants'
  const [layout, setLayout] = useState('grid'); // 'grid' | 'speaker'
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

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

  const handleGoLive = async () => {
      if (!goLive || isJoining) return;
      try {
          setIsJoining(true);
          await goLive();
      } catch (err) {
          console.error("Go live failed:", err);
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
        goLive={handleGoLive}
        isVideoCall={callType === 'videocall' || callType === 'consultation'}
        isJoining={isJoining}
        isConsultation={isCompact !== undefined ? isCompact : callType === 'consultation'}
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

  const isConsultation = callType === 'consultation';
  const layoutCompact = isCompact !== undefined ? isCompact : isConsultation;

  return (
    <div className={`${layoutCompact ? 'relative w-full h-full' : 'fixed inset-0'} z-[100] flex flex-col bg-background text-foreground overflow-hidden text-sm font-sans font-medium`}>
      
      {/* Top Header - Meeting Info (Hidden in Consultation) */}
      {!layoutCompact && (
        <div className={`absolute top-0 left-0 p-4 lg:p-6 flex items-center gap-3 z-20 pointer-events-none transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="pointer-events-auto flex items-center gap-3 text-white">
                <h1 className="font-medium text-base truncate max-w-[200px] md:max-w-xs">{courseName || "Meeting"}</h1>
                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                {callType === 'livestream' ? (
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#ea4335] animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-xs text-gray-300">
                          {isLive ? `${participantCount} viewers` : "Backstage"}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                       <Icon icon="material-symbols:person-outline-rounded" className="w-4 h-4" />
                       {participantCount}
                    </div>
                )}
            </div>
        </div>
      )}

      <div className="flex-1 relative flex overflow-hidden w-full">
        {/* Main Video Area */}
        <div className={`flex-1 relative flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${activePanel ? 'mr-0' : ''}`}>
          <div className="w-full h-full p-2 lg:p-4 flex items-center justify-center">
               <VideoGrid callType={callType} isInstructor={isInstructor} layout={layout} />
          </div>

          {/* Reactions Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full z-10">
            {activeReactions?.map((reaction, i) => (
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
        </div>

        {/* Side Panel for Chat & Participants — desktop: inline, mobile: overlay */}
        <div className={`hidden md:block transition-all duration-300 ease-in-out ${activePanel ? 'md:w-80 lg:w-96' : 'w-0'} overflow-hidden h-full relative border-l border-white/10`}>
          <SidePanel
            activePanel={activePanel}
            onClose={() => togglePanel(null)}
            courseId={courseId}
            isInstructor={isInstructor}
          />
        </div>

        {/* Mobile overlay panel */}
        {activePanel && (
          <div className="md:hidden fixed inset-0 z-[110] flex flex-col">
            <div className="absolute inset-0 bg-black/40" onClick={() => togglePanel(null)} />
            <div className="relative mt-auto h-[70vh] bg-background rounded-t-2xl border-t border-border/50 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
              <SidePanel
                activePanel={activePanel}
                onClose={() => togglePanel(null)}
                courseId={courseId}
                isInstructor={isInstructor}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className={`relative z-20 transition-all duration-500 ${controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`} style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}>
        <ControlBar
          onLeave={onLeave}
          goLive={handleGoLive}
          isInstructor={isInstructor}
          toggleChat={() => togglePanel('chat')}
          toggleParticipants={() => togglePanel('participants')}
          activePanel={activePanel}
          sendReaction={callType === 'livestream' ? (type, emoji) => call.sendReaction({ type, emoji_code: emoji }) : (type, emoji) => call.sendReaction({ type, emoji_code: emoji })}
          isLive={isLive}
          isVideoCall={callType === 'videocall' || callType === 'consultation'}
          isJoining={isJoining}
          isConsultation={layoutCompact}
          layout={layout}
          onLayoutChange={callType !== 'livestream' ? setLayout : undefined}
          onOpenDeviceSettings={() => setShowDeviceSettings(true)}
        />
      </div>
      {showDeviceSettings && (
        <DeviceSettingsModal onClose={() => setShowDeviceSettings(false)} />
      )}
    </div>
  );
};
export default MeetingLayout;
