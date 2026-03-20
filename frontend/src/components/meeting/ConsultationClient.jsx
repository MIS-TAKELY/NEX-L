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

const CallUI = ({ onLeave, call, sessionId, isInstructor, isExpanded }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState === CallingState.LEFT) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background text-foreground gap-4 rounded-3xl overflow-hidden min-h-[500px]">
        <Icon icon="solar:phone-hang-up-bold-duotone" className="w-20 h-20 text-destructive" />
        <h2 className="text-2xl font-bold">Consultation Ended</h2>
        <p className="text-muted-foreground">The session has been concluded.</p>
        <button
          onClick={onLeave}
          className="bg-secondary/50 hover:bg-secondary text-foreground px-8 py-3 rounded-2xl transition-all mt-4 font-bold border border-border/50"
        >
          Close Room
        </button>
      </div>
    );
  }

  return (
    <StreamTheme className="h-full w-full flex flex-col flex-1">
      <MeetingLayout
        courseName="One-on-One Consultation"
        courseId={sessionId}
        call={call}
        onLeave={onLeave}
        isInstructor={isInstructor}
        callType="consultation"
        autoJoin={false}
        isCompact={!isExpanded}
      />
    </StreamTheme>
  );
};

const ConsultationClient = ({ sessionId, onLeave, isInstructor, isExpanded }) => {
  const { videoClient } = useStream();
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    if (!sessionId || !videoClient) return;

    let isMounted = true;
    let localCall = null;

    const setup = async () => {
      try {
        console.log("Starting consultation setup for session:", sessionId);
        setStatus("Fetching consultation details...");
        const { data } = await axios.get(`${BACKEND}/api/v1/stream/consultation/${sessionId}`, { withCredentials: true });
        if (!isMounted) return;

        const { callId, callType, studentId, teacherId } = data;
        const members = [studentId, teacherId];
        console.log("Consultation data fetched:", { callId, callType, members });

        const videoCall = videoClient.call(callType, callId);
        localCall = videoCall;
        
        if (isInstructor) {
          // Ensure call is created with members before joining
          console.log("Creating/Getting call...");
          setStatus("Preparing call tunnel...");
          await videoCall.getOrCreate({
            data: {
              members: members.map(id => ({ user_id: id })),
              custom: { type: 'consultation' }
            }
          });
          if (!isMounted) return;
        }

        // Join the call
        console.log("Joining call...");
        setStatus("Connecting to call...");
        await videoCall.join();
        if (!isMounted) {
            videoCall.leave();
            return;
        }
        console.log("Joined call successfully");

        // If instructor, ring the call to notify the student
        if (isInstructor) {
          console.log("Instructor mode: Ringing student...");
          setStatus("Notifying student...");
          try {
            await videoCall.ring();
            console.log("Ring sent successfully");
          } catch (ringErr) {
            console.warn("Failed to ring student (they might be offline):", ringErr);
            // Don't throw, we still want to enter the call
          }
        }
        
        if (!isMounted) {
            videoCall.leave();
            return;
        }

        setStatus("Finalizing...");
        setCall(videoCall);
      } catch (err) {
        if (!isMounted) return;
        console.error("Consultation setup error:", err);
        setError(err.response?.data?.message || "Failed to join consultation.");
      }
    };

    setup();

    return () => {
      isMounted = false;
      if (localCall && localCall.state?.callingState === CallingState.JOINED) {
         if (isInstructor) {
             localCall.endCall().catch(err => console.error("Error ending call on unmount:", err));
         } else {
             localCall.leave().catch(err => console.error("Error leaving call on unmount:", err));
         }
      } else if (localCall && isInstructor) {
          // If the instructor closes before fully joining, try to end the call anyway
          localCall.endCall().catch(() => {});
      }
    };
  }, [sessionId, videoClient, isInstructor]);

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
        <p className="font-bold tracking-widest uppercase text-xs">{status || "Initializing Consultation..."}</p>
        {!videoClient && <p className="text-[10px] text-gray-600">Waiting for Stream Client...</p>}
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
          isExpanded={isExpanded}
        />
      </StreamCall>
    </StreamVideo>
  );
};

export default ConsultationClient;
