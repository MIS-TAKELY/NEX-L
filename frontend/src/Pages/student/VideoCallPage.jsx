/**
 * VideoCallPage – 1-on-1 video call between a student and the course teacher.
 * Either party can initiate; they share the same call room per course.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Icon } from "@iconify/react";
import MeetingLayout from "@/components/meeting/MeetingLayout";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

const CallUI = ({ onLeave, call, courseId }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState === CallingState.LEFT) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#202124] text-white gap-4 w-screen">
        <Icon icon="solar:phone-hang-up-bold-duotone" className="w-16 h-16 text-[#ea4335]" />
        <p className="text-muted-foreground">Call ended</p>
        <button
          onClick={onLeave}
          className="bg-[#3c4043] hover:bg-[#4d5154] text-white px-6 py-2 rounded-md transition-all mt-2 border border-white/10"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <StreamTheme>
        <MeetingLayout
            courseName="Video Call"
            courseId={courseId}
            call={call}
            onLeave={onLeave}
            isInstructor={false}
            callType="videocall"
            autoJoin={false}
        />
    </StreamTheme>
  );
};

const VideoCallPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId || !API_KEY || API_KEY === "your_stream_api_key") {
      setError("Stream API key not configured. Please set VITE_STREAM_API_KEY in your .env.");
      return;
    }

    const setup = async () => {
      try {
        const [callRes, tokenRes] = await Promise.all([
          axios.post(`${BACKEND}/api/v1/stream/videocall/${courseId}`, {}, { withCredentials: true }),
          axios.post(`${BACKEND}/api/v1/stream/video-token`, {}, { withCredentials: true }),
        ]);

        const { callId, callType } = callRes.data;
        const { token, userId } = tokenRes.data;

        const videoClient = new StreamVideoClient({
          apiKey: API_KEY,
          user: { id: userId },
          token,
        });

        await videoClient.connectUser({ id: userId }, token);
        const videoCall = videoClient.call(callType, callId);
        
        // Removed auto-join, letting JoinScreen handle it
        
        setClient(videoClient);
        setCall(videoCall);
      } catch (err) {
        console.error("VideoCallPage setup error:", err);
        const backendMessage = err.response?.data?.message;
        const streamError = err.message;

        if (streamError?.includes("permission")) {
          setError("You don't have permission to start or join this video call. If this is a course call, ensure you are enrolled and the teacher has started the session.");
        } else {
          setError(backendMessage || "Failed to start or join video call. Please try again later.");
        }
      }
    };

    setup();

    return () => {
      client?.disconnectUser();
    };
  }, [courseId]);

  const handleLeave = () => {
    client?.disconnectUser();
    navigate(-1);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#202124] text-[#ea4335] flex-col gap-4 w-screen">
        <Icon icon="solar:danger-triangle-bold" className="w-12 h-12" />
        <p className="text-center max-w-sm">{error}</p>
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-white underline">
          ← Go back
        </button>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#202124] text-muted-foreground gap-3 w-screen">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-[#8ab4f8] rounded-md animate-spin" />
        Connecting video call…
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI onLeave={handleLeave} call={call} courseId={courseId} />
      </StreamCall>
    </StreamVideo>
  );
};

export default VideoCallPage;
