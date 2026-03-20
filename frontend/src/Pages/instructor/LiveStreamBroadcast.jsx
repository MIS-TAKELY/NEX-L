/**
 * LiveStreamBroadcast – Instructor broadcasts a live stream for a course.
 * Uses @stream-io/video-react-sdk
 */
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
  StreamCall,
  LivestreamLayout,
  CallingState,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Icon } from "@iconify/react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

// Inner component – has access to call context
const BroadcastControls = ({ call }) => {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isLive, setIsLive] = useState(false);
  const navigate = useNavigate();

  const goLive = async () => {
    try {
      // If not already joined, join now. (Handles "shall be called only once" error)
      if (callingState !== CallingState.JOINED) {
        await call.join({ create: true });
      }
      
      // goLive() is the standard method to start broadasting and stop backstage
      await call.goLive();
      setIsLive(true);
    } catch (err) {
      console.error("Failed to go live:", err);
      // If already live, just update UI
      if (err.message?.includes("shall be called only once") || err.message?.includes("already live")) {
        setIsLive(true);
        return;
      }
      alert("Failed to start live stream: " + err.message);
    }
  };

  const endStream = async () => {
    await call.stopHLS();
    await call.endCall();
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Icon icon="solar:play-stream-bold-duotone" className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-foreground font-bold text-lg">Live Broadcast</h1>
            <p className="text-gray-400 text-xs">
              {isLive
                ? `🔴 LIVE · ${participantCount} viewer${participantCount !== 1 ? "s" : ""}`
                : "Ready to go live"}
            </p>
          </div>
        </div>
        {isLive && (
          <span className="flex items-center gap-1.5 bg-red-500 text-foreground text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-background rounded-full" /> LIVE
          </span>
        )}
      </div>

      {/* Preview / Stream */}
      <div className="flex-1 relative overflow-hidden">
        {callingState === CallingState.JOINED ? (
          <LivestreamLayout />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-foreground gap-6">
            <Icon icon="solar:camera-add-bold-duotone" className="w-24 h-24 text-gray-600" />
            <p className="text-gray-400 text-lg">Your camera preview will appear here</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-5 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4">
        {!isLive ? (
          <button
            onClick={goLive}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-foreground font-bold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25"
          >
            <Icon icon="solar:play-bold" className="w-5 h-5" />
            Go Live
          </button>
        ) : (
          <button
            onClick={endStream}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-foreground font-semibold px-8 py-3 rounded-xl transition-all"
          >
            <Icon icon="solar:stop-bold" className="w-5 h-5" />
            End Stream
          </button>
        )}
      </div>
    </div>
  );
};

// Outer component – sets up the client & call
const LiveStreamBroadcast = () => {
  const { courseId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId || !API_KEY || API_KEY === "your_stream_api_key") {
      setError("Stream API key not configured. Please set VITE_STREAM_API_KEY in your .env file.");
      return;
    }

    const setup = async () => {
      try {
        // Create the call room on backend
        const [callRes, tokenRes] = await Promise.all([
          axios.post(`${BACKEND}/api/v1/stream/livestream/${courseId}`, {}, { withCredentials: true }),
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
        setClient(videoClient);
        setCall(videoCall);
      } catch (err) {
        console.error("LiveStreamBroadcast setup error:", err);
        setError(err.response?.data?.message || "Failed to set up live stream");
      }
    };

    setup();

    return () => {
      client?.disconnectUser();
    };
  }, [courseId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-red-400 flex-col gap-4">
        <Icon icon="solar:danger-triangle-bold" className="w-12 h-12" />
        <p className="text-center max-w-md">{error}</p>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400 gap-3">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        Setting up broadcast…
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <BroadcastControls call={call} />
      </StreamCall>
    </StreamVideo>
  );
};

export default LiveStreamBroadcast;
