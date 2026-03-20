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
  CallParticipantsList,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Icon } from "@iconify/react";
import LiveStreamChat from "@/components/student/LiveStreamChat";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

// Inner component – has access to call context
const BroadcastControls = ({ call, courseId }) => {
  const { useCallCallingState, useParticipantCount, useIsCallLive } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const isLive = useIsCallLive();
  const [reactions, setReactions] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("participants"); // "participants" or "chat"

  useEffect(() => {
    const cleanup = call.on("call.reaction_new", (event) => {
      const { reaction } = event;
      if (reaction) {
        setReactions((prev) => [...prev, reaction]);
        // Remove reaction after 5 seconds to keep the overlay clean
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r !== reaction));
        }, 5000);
      }
    });

    return () => cleanup();
  }, [call]);

  const goLive = async () => {
    try {
      if (callingState !== CallingState.JOINED) {
        await call.join({ create: true });
      }
      await call.goLive();
    } catch (err) {
      console.error("Failed to go live:", err);
      if (err.message?.includes("shall be called only once") || err.message?.includes("already live")) {
        return;
      }
      alert("Failed to start live stream: " + err.message);
    }
  };

  const endStream = async () => {
    try {
      await call.stopHLS();
      await call.endCall();
      navigate(-1);
    } catch (err) {
      console.error("Failed to end stream:", err);
      navigate(-1);
    }
  };

  const sendReaction = async (type, emoji_code) => {
    try {
      await call.sendReaction({ type, emoji_code });
    } catch (err) {
      console.error("Failed to send reaction:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
            <Icon icon="solar:play-stream-bold-duotone" className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h1 className="text-foreground font-bold text-lg tracking-tight">Live Broadcast</h1>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
              <p className="text-gray-400 text-xs font-medium">
                {isLive
                  ? `LIVE · ${participantCount} viewer${participantCount !== 1 ? "s" : ""}`
                  : "Ready to go live"}
              </p>
            </div>
          </div>
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 text-[10px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full border border-red-500/20">
            LIVE
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <div className="w-full h-full relative">
            {callingState === CallingState.JOINED ? (
              <LivestreamLayout />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-foreground gap-6 bg-gray-950/50 backdrop-blur-3xl">
                <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center border border-white/5 shadow-2xl">
                  <Icon icon="solar:camera-add-bold-duotone" className="w-12 h-12 text-gray-600" />
                </div>
                <div className="text-center">
                  <p className="text-gray-300 text-lg font-medium">Your camera preview will appear here</p>
                  <p className="text-gray-500 text-sm mt-1">Ready to share your knowledge with the world?</p>
                </div>
              </div>
            )}

            {/* Floating Reactions Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
              {reactions?.map((reaction, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-float-up text-4xl"
                  style={{
                    left: `${40 + Math.random() * 20}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                >
                  {reaction.emoji_code}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-white/5 flex flex-col hidden lg:flex shadow-2xl">
          <div className="flex p-1 bg-black/20 m-4 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "participants" 
                  ? 'bg-white/10 text-white shadow-xl' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon icon="solar:users-group-two-rounded-bold" className="w-4 h-4" />
              Participants
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "chat" 
                  ? 'bg-white/10 text-white shadow-xl' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon icon="solar:chat-round-dots-bold" className="w-4 h-4" />
              Chat
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === "participants" ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto px-2">
                  <CallParticipantsList onClose={() => {}} />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col bg-gray-900">
                <LiveStreamChat courseId={courseId} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="px-8 py-6 bg-gray-900 border-t border-white/5 flex items-center justify-between gap-6 z-50">
        <div className="flex items-center gap-3">
          {/* Reaction Buttons */}
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            {['❤️', '👍', '🔥', '👏', '😮', '😂'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction('reaction', emoji)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all active:scale-90 text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isLive ? (
            <button
              onClick={goLive}
              className="group flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white font-black px-10 py-4 rounded-2xl transition-all duration-300 shadow-2xl shadow-red-500/20 active:scale-95"
            >
              <Icon icon="solar:play-bold" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              GO LIVE NOW
            </button>
          ) : (
            <button
              onClick={endStream}
              className="flex items-center gap-3 bg-white/5 hover:bg-red-500/10 text-white/50 hover:text-red-400 font-bold px-10 py-4 rounded-2xl transition-all border border-white/5 hover:border-red-500/20 active:scale-95"
            >
              <Icon icon="solar:stop-bold" className="w-5 h-5" />
              END STREAM
            </button>
          )}
        </div>
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
  const clientRef = useRef(null);

  useEffect(() => {
    if (!courseId || !API_KEY || API_KEY === "your_stream_api_key") {
      setError("Stream API key not configured.");
      return;
    }

    const setup = async () => {
      try {
        if (clientRef.current) return; // Already initializing or initialized

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

        clientRef.current = videoClient;
        await videoClient.connectUser({ id: userId }, token);
        const videoCall = videoClient.call(callType, callId);
        
        // Important: check if still mounted
        if (clientRef.current === videoClient) {
          setClient(videoClient);
          setCall(videoCall);
        }
      } catch (err) {
        console.error("LiveStreamBroadcast setup error:", err);
        setError(err.response?.data?.message || "Failed to set up live stream");
      }
    };

    setup();

    return () => {
      if (clientRef.current) {
        const c = clientRef.current;
        clientRef.current = null;
        c.disconnectUser().catch(console.error);
      }
    };
  }, [courseId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-red-400 flex-col gap-6">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Icon icon="solar:danger-triangle-bold" className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Broadcast Error</h2>
          <p className="text-gray-400 max-w-sm">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl border border-white/10 transition-all font-bold"
        >
          RETRY
        </button>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-400 gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-red-500/20 rounded-full" />
          <div className="w-16 h-16 border-t-2 border-red-500 rounded-full animate-spin absolute top-0 left-0" />
        </div>
        <div className="text-center animate-pulse">
          <p className="text-lg font-bold text-white tracking-widest">INITIALIZING</p>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">Setting up your broadcast studio</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <BroadcastControls call={call} courseId={courseId} />
      </StreamCall>
    </StreamVideo>
  );
};

export default LiveStreamBroadcast;
