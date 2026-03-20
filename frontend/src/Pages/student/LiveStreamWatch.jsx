/**
 * LiveStreamWatch – Enrolled student watches the teacher's live stream.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  LivestreamLayout,
  useCallStateHooks,
  CallingState,
  ParticipantList,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Icon } from "@iconify/react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

const WatcherView = ({ courseName }) => {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Icon icon="solar:tv-bold-duotone" className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-foreground font-bold text-lg truncate max-w-xs">{courseName}</h1>
            <p className="text-gray-400 text-xs">
              {callingState === CallingState.JOINED
                ? `🔴 LIVE · ${participantCount} viewer${participantCount !== 1 ? "s" : ""}`
                : "Waiting for teacher to go live…"}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 bg-red-500 text-foreground text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
          <span className="w-2 h-2 bg-background rounded-full" /> LIVE
        </span>
      </div>

      {/* Stream content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          {callingState === CallingState.JOINED ? (
            <LivestreamLayout />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-foreground gap-4">
              <Icon icon="solar:tv-bold-duotone" className="w-20 h-20 text-gray-600 animate-pulse" />
              <p className="text-gray-400 text-lg">Waiting for teacher to go live…</p>
              <div className="w-8 h-8 border-2 border-gray-500 border-t-red-400 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Participants Sidebar */}
        <div className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-gray-800 flex items-center gap-2">
            <Icon icon="solar:users-group-two-rounded-bold" className="text-red-400" />
            <span className="font-bold text-sm text-foreground uppercase tracking-wider">Viewers</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ParticipantList />
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveStreamWatch = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [courseName, setCourseName] = useState("Live Class");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId || !API_KEY || API_KEY === "your_stream_api_key") {
      setError("Stream API key not configured.");
      return;
    }

    const setup = async () => {
      try {
        const [streamRes, tokenRes] = await Promise.all([
          axios.get(`${BACKEND}/api/v1/stream/livestream/${courseId}`, { withCredentials: true }),
          axios.post(`${BACKEND}/api/v1/stream/video-token`, {}, { withCredentials: true }),
        ]);

        const { callId, callType, courseName: name } = streamRes.data;
        const { token, userId } = tokenRes.data;
        if (name) setCourseName(name);

        const videoClient = new StreamVideoClient({
          apiKey: API_KEY,
          user: { id: userId },
          token,
        });

        await videoClient.connectUser({ id: userId }, token);
        const videoCall = videoClient.call(callType, callId);
        await videoCall.join();
        setClient(videoClient);
        setCall(videoCall);
      } catch (err) {
        console.error("LiveStreamWatch setup error:", err);
        const backendMessage = err.response?.data?.message;
        const streamError = err.message;
        
        if (streamError?.includes("JoinBackstage") || streamError?.includes("permission")) {
          setError("The live stream hasn't started yet or you don't have permission to wait in the backstage. Please wait for the teacher to go live.");
        } else {
          setError(backendMessage || "Failed to join live stream. Please try again later.");
        }
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
        <p className="text-center max-w-sm">{error}</p>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-medium transition-all"
          >
            <Icon icon="solar:refresh-bold" />
            Retry
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-foreground underline"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400 gap-3">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-red-400 rounded-full animate-spin" />
        Joining live stream…
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <WatcherView courseName={courseName} />
      </StreamCall>
    </StreamVideo>
  );
};

export default LiveStreamWatch;
