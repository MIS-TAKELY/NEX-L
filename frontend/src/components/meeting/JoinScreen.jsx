import React from 'react';
import { Icon } from '@iconify/react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';

const JoinScreen = ({ onJoin, courseName, isInstructor, goLive, isVideoCall, isJoining, isConsultation }) => {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { microphone, optionsAwareIsMute: isMicMuted } = useMicrophoneState({ optimisticUpdates: true });
  const { camera, optionsAwareIsMute: isCamMuted } = useCameraState({ optimisticUpdates: true });

  const toggleMic = () => microphone.toggle();
  const toggleCam = () => camera.toggle();

  return (
    <div className={`${isConsultation ? 'relative w-full h-full p-4' : 'fixed inset-0 p-8'} z-[100] bg-[#202124] flex flex-col items-center justify-center font-sans text-white overflow-hidden`}>
      {/* Small top header just for style */}
      {!isConsultation && (
        <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
          <span className="font-medium tracking-widest text-[#8ab4f8]">NEX-L MEET</span>
        </div>
      )}

      <div className={`w-full flex flex-col ${isConsultation ? 'gap-4 max-w-sm' : 'md:flex-row items-center justify-between gap-12 max-w-5xl'} z-10 my-auto`}>
        
        {/* Left Side: Camera Preview */}
        <div className={`flex-1 w-full flex flex-col ${isConsultation ? 'gap-4' : 'gap-6 max-w-2xl'}`}>
          <div className={`relative aspect-video bg-[#3c4043] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-white/5 group`}>
            {!isCamMuted ? (
               <div className="w-full h-full bg-[#202124] flex items-center justify-center border border-white/5 flex-col gap-2">
                 <Icon icon="solar:camera-add-bold-duotone" className={`${isConsultation ? 'w-8 h-8' : 'w-12 h-12'} text-gray-600`} />
                 <span className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">Camera On</span>
               </div>
            ) : (
              <div className={`${isConsultation ? 'w-16 h-16' : 'w-24 h-24'} rounded-full bg-[#3c4043] flex items-center justify-center shadow-lg border border-white/5`}>
                 <Icon icon="solar:user-rounded-bold" className={`${isConsultation ? 'w-8 h-8' : 'w-12 h-12'} text-gray-400`} />
              </div>
            )}

            {/* Media Toggles overlay */}
            <div className={`absolute ${isConsultation ? 'bottom-3' : 'bottom-6'} left-1/2 transform -translate-x-1/2 flex items-center gap-4 transition-all opacity-100`}>
              <button
                onClick={toggleMic}
                className={`${isConsultation ? 'w-9 h-9' : 'w-12 h-12'} flex items-center justify-center rounded-full shadow-xl transition-all border border-white/10 ${
                  isMicMuted ? 'bg-[#ea4335] text-white hover:bg-[#d93025]' : 'bg-[#3c4043]/80 text-white backdrop-blur-md hover:bg-[#4d5154]/90'
                }`}
              >
                <Icon icon={isMicMuted ? 'material-symbols:mic-off-rounded' : 'material-symbols:mic-rounded'} className={isConsultation ? 'w-4 h-4' : 'w-6 h-6'} />
              </button>
              
              <button
                onClick={toggleCam}
                className={`${isConsultation ? 'w-9 h-9' : 'w-12 h-12'} flex items-center justify-center rounded-full shadow-xl transition-all border border-white/10 ${
                  isCamMuted ? 'bg-[#ea4335] text-white hover:bg-[#d93025]' : 'bg-[#3c4043]/80 text-white backdrop-blur-md hover:bg-[#4d5154]/90'
                }`}
              >
                <Icon icon={isCamMuted ? 'material-symbols:videocam-off-rounded' : 'material-symbols:videocam-rounded'} className={isConsultation ? 'w-4 h-4' : 'w-6 h-6'} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Join Info */}
        <div className={`w-full ${isConsultation ? 'text-center' : 'md:w-80 md:text-left'} flex flex-col items-center pt-2 md:pt-0`}>
          {!isConsultation && <h1 className="text-3xl font-normal text-white mb-2 font-sans truncate w-full">{courseName || "Meeting"}</h1>}
          <p className={`${isConsultation ? 'text-xs' : 'text-sm'} text-gray-400 mb-6 font-light`}>
            {isInstructor 
              ? "Ready to start?" 
              : "Ready to join? Make sure you're set up!"}
          </p>
          
          <div className="flex flex-col gap-4 w-full">
            {isConsultation ? (
              <button
                onClick={onJoin}
                disabled={isJoining}
                className="w-full bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] px-8 py-4 rounded-2xl font-bold transition-all shadow-lg text-sm disabled:opacity-50"
              >
                {isJoining ? 'Joining...' : 'JOIN CONSULTATION'}
              </button>
            ) : isVideoCall ? (
              <button
                onClick={onJoin}
                disabled={isJoining}
                className="w-full bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] px-8 py-3 rounded-full font-medium transition-all shadow-lg text-[15px] disabled:opacity-50"
              >
                {isJoining ? 'Joining...' : 'Join now'}
              </button>
            ) : isInstructor ? (
              <div className="flex flex-col gap-3">
                 <button
                  onClick={onJoin}
                  disabled={isJoining}
                  className="w-full bg-[#3c4043] hover:bg-[#4d5154] text-white px-8 py-3 rounded-full font-medium transition-all border border-white/10 text-[15px] disabled:opacity-50"
                >
                  {isJoining ? 'Joining...' : 'Join Backstage'}
                </button>
                <button
                  onClick={goLive}
                  disabled={isJoining}
                  className="w-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-medium transition-all shadow-md mt-2 text-[15px] flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
                      Initializing...
                    </>
                  ) : (
                    'Go Live (Join & Start)'
                  )}
                </button>
              </div>
            ) : (
               <button
                  onClick={onJoin}
                  disabled={isJoining}
                  className="w-full bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] px-8 py-3 rounded-full font-medium transition-all shadow-lg text-[15px] disabled:opacity-50"
                >
                  {isJoining ? 'Joining...' : 'Join Session'}
                </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default JoinScreen;
