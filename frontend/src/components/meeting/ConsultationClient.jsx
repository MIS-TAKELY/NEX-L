import { useEffect, useState } from "react";
import axios from "axios";
import {
  StreamCall,
  StreamTheme,
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Icon } from "@iconify/react";
import MeetingLayout from "@/components/meeting/MeetingLayout";
import { StreamVideo } from "@stream-io/video-react-sdk";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

import { useStream } from "@/context/StreamContext";

const CallUI = ({ onLeave, call, sessionId, isInstructor }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState === CallingState.LEFT) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0c0c0e] text-white gap-4 rounded-3xl overflow-hidden min-h-[500px]">
        <Icon icon="solar:phone-hang-up-bold-duotone" className="w-20 h-20 text-red-500" />
        <h2 className="text-2xl font-bold">Consultation Ended</h2>
        <p className="text-gray-400">The session has been concluded.</p>
        <button
          onClick={onLeave}
          className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl transition-all mt-4 font-bold border border-white/10"
        >
          Close Room
        </button>
      </div>
    );
  }

  return (
    <StreamTheme>
      <MeetingLayout
        courseName="One-on-One Consultation"
        courseId={sessionId}
        call={call}
        onLeave={onLeave}
        isInstructor={isInstructor}
        callType="consultation"
        autoJoin={false}
      />
    </StreamTheme>
  );
};

const ConsultationClient = ({ sessionId, onLeave, isInstructor }) => {
  const { videoClient } = useStream();
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId || !videoClient) return;

    const setup = async () => {
      try {
        console.log("Starting consultation setup for session:", sessionId);
        const { data } = await axios.get(`${BACKEND}/api/v1/stream/consultation/${sessionId}`, { withCredentials: true });
        const { callId, callType, studentId, teacherId } = data;
        const members = [studentId, teacherId];
        console.log("Consultation data fetched:", { callId, callType, members });

        const videoCall = videoClient.call(callType, callId);
        
        // Ensure call is created with members before joining
        console.log("Creating/Getting call...");
        await videoCall.getOrCreate({
          data: {
            members: members.map(id => ({ user_id: id })),
            custom: { type: 'consultation' }
          }
        });

        // Join the call
        console.log("Joining call...");
        await videoCall.join();
        console.log("Joined call successfully");

        // If instructor, ring the call to notify the student
        if (isInstructor) {
          console.log("Instructor mode: Ringing student...");
          try {
            await videoCall.ring();
            console.log("Ring sent successfully");
          } catch (ringErr) {
            console.warn("Failed to ring student (they might be offline):", ringErr);
            // Don't throw, we still want to enter the call
          }
        }
        
        setCall(videoCall);
      } catch (err) {
        console.error("Consultation setup error:", err);
        setError(err.response?.data?.message || "Failed to join consultation.");
      }
    };

    setup();

    return () => {
      // Don't disconnect global client, just leave the call if needed
      // but MeetingLayout usually handles leaving the call
    };
  }, [sessionId, videoClient]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0c0c0e] text-red-400 gap-4 rounded-3xl p-8 min-h-[500px]">
        <Icon icon="solar:danger-triangle-bold-duotone" className="w-16 h-16" />
        <p className="text-center font-bold text-lg max-w-sm">{error}</p>
        <button 
          onClick={onLeave} 
          className="text-sm text-gray-400 hover:text-white underline mt-2"
        >
          Close
        </button>
      </div>
    );
  }

  if (!videoClient || !call) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0c0c0e] text-gray-400 gap-4 rounded-3xl min-h-[500px]">
        <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
        <p className="font-bold tracking-widest uppercase text-xs">Initializing Consultation...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <CallUI 
          onLeave={onLeave} 
          call={call} 
          sessionId={sessionId} 
          isInstructor={isInstructor} 
        />
      </StreamCall>
    </StreamVideo>
  );
};

export default ConsultationClient;
