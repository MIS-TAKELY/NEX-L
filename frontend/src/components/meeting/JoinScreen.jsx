import React from 'react';
import { Icon } from '@iconify/react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';

const JoinScreen = ({ onJoin, courseName, isInstructor, goLive, isVideoCall, isJoining }) => {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { microphone, isMuted: isMicMuted } = useMicrophoneState();
  const { camera, isMuted: isCamMuted } = useCameraState();

  const toggleMic = () => microphone.toggle();
  const toggleCam = () => camera.toggle();

  return (
    <div className="fixed inset-0 z-[100] bg-[#202124] flex flex-col items-center justify-center font-sans text-white overflow-y-auto overflow-x-hidden">
      {/* Small top header just for style */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
         <span className="font-medium tracking-widest text-[#8ab4f8]">NEX-L MEET</span>
      </div>

      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-12 p-8 z-10 my-auto">
        
        {/* Left Side: Camera Preview */}
        <div className="flex-1 w-full max-w-2xl flex flex-col gap-6">
          <div className="relative aspect-video bg-[#3c4043] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-white/5 group">
            {!isCamMuted ? (
               <div className="w-full h-full bg-[#202124] flex items-center justify-center border border-white/5 flex-col gap-2">
                 <Icon icon="solar:camera-add-bold-duotone" className="w-12 h-12 text-gray-600" />
                 <span className="text-gray-400 text-sm font-medium">Camera Active</span>
               </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#3c4043] flex items-center justify-center shadow-lg border border-white/5">
                 <Icon icon="solar:user-rounded-bold" className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Media Toggles overlay */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 transition-all opacity-100 group-hover:opacity-100">
              <button
                onClick={toggleMic}
                className={`w-12 h-12 flex items-center justify-center rounded-full shadow-xl transition-all border border-white/10 ${
                  isMicMuted ? 'bg-[#ea4335] text-white hover:bg-[#d93025]' : 'bg-[#3c4043]/80 text-white backdrop-blur-md hover:bg-[#4d5154]/90'
                }`}
              >
                <Icon icon={isMicMuted ? 'solar:microphone-off-bold' : 'solar:microphone-bold'} className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleCam}
                className={`w-12 h-12 flex items-center justify-center rounded-full shadow-xl transition-all border border-white/10 ${
                  isCamMuted ? 'bg-[#ea4335] text-white hover:bg-[#d93025]' : 'bg-[#3c4043]/80 text-white backdrop-blur-md hover:bg-[#4d5154]/90'
                }`}
              >
                <Icon icon={isCamMuted ? 'solar:videocamera-off-bold' : 'solar:videocamera-bold'} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Join Info */}
        <div className="w-full md:w-80 flex flex-col items-center md:items-start text-center md:text-left pt-6 md:pt-0">
          <h1 className="text-3xl font-normal text-white mb-2 font-sans truncate w-full">{courseName || "Meeting"}</h1>
          <p className="text-gray-400 mb-8 font-light text-sm">
            {isInstructor 
              ? "Ready to start the session? Check your audio and video before you join." 
              : "Ready to join the session? Make sure you're properly set up!"}
          </p>
          
          <div className="flex flex-col gap-4 w-full">
            {isVideoCall ? (
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
                  className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8 py-3 rounded-full font-medium transition-all shadow-md mt-2 text-[15px]"
                >
                  Go Live (Join & Start)
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
