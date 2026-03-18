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
  CallControls,
  SpeakerLayout,
  StreamTheme,
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Icon } from "@iconify/react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

const CallUI = ({ onLeave }) => {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const count = useParticipantCount();

  if (callingState === CallingState.LEFT) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-foreground gap-4">
        <Icon icon="solar:phone-hang-up-bold-duotone" className="w-16 h-16 text-gray-500" />
        <p className="text-gray-400">Call ended</p>
        <button
          onClick={onLeave}
          className="bg-gray-700 hover:bg-gray-600 text-foreground px-6 py-2 rounded-xl transition-all mt-2"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className="flex flex-col h-screen bg-gray-950">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gray-900 border-b border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Icon icon="solar:video-frame-play-bold-duotone" className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-foreground font-bold text-lg">Video Call</h1>
            <p className="text-gray-400 text-xs">
              {callingState === CallingState.JOINED
                ? `${count} participant${count !== 1 ? "s" : ""} in call`
                : "Connecting…"}
            </p>
          </div>
        </div>

        {/* Video layout */}
        <div className="flex-1 relative overflow-hidden">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        {/* Controls */}
        <div className="py-4 bg-gray-900 border-t border-gray-800 flex justify-center">
          <CallControls onLeave={onLeave} />
        </div>
      </div>
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
        await videoCall.join({ create: true });
        setClient(videoClient);
        setCall(videoCall);
      } catch (err) {
        console.error("VideoCallPage setup error:", err);
        setError(err.response?.data?.message || "Failed to start video call");
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
      <div className="flex items-center justify-center h-screen bg-gray-950 text-red-400 flex-col gap-4">
        <Icon icon="solar:danger-triangle-bold" className="w-12 h-12" />
        <p className="text-center max-w-sm">{error}</p>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-foreground underline">
          ← Go back
        </button>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400 gap-3">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-blue-400 rounded-full animate-spin" />
        Connecting video call…
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI onLeave={handleLeave} />
      </StreamCall>
    </StreamVideo>
  );
};

export default VideoCallPage;
