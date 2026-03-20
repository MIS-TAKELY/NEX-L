/**
 * LiveStreamWatch – Enrolled student watches the teacher's live stream.
 */
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  LivestreamLayout,
  useCallStateHooks,
  CallingState,
  CallParticipantsList,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Icon } from "@iconify/react";
import LiveStreamChat from "@/components/student/LiveStreamChat";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

const WatcherView = ({ courseName, courseId, call }) => {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
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

  const handleLeave = () => {
    navigate(-1);
  };

  const sendReaction = async (type, emoji_code) => {
    try {
      await call.sendReaction({ type, emoji_code });
    } catch (err) {
      console.error("Failed to send reaction:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 glass border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-inner group transition-all">
            <Icon icon="solar:tv-bold-duotone" className="w-7 h-7 text-destructive group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-foreground font-black text-xl truncate max-w-xs tracking-tight">{courseName}</h1>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                {callingState === CallingState.JOINED
                  ? `LIVE · ${participantCount} viewer${participantCount !== 1 ? "s" : ""}`
                  : "Waiting for stream…"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-[10px] uppercase tracking-widest font-black px-4 py-2 rounded-full border border-destructive/20 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-ping" />
          LIVE
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <div className="w-full h-full relative">
            {callingState === CallingState.JOINED ? (
              <LivestreamLayout />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-foreground gap-8 bg-background/50 backdrop-blur-3xl transition-colors duration-500">
                <div className="w-32 h-32 rounded-[2.5rem] bg-card flex items-center justify-center border border-border shadow-2xl relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] animate-pulse" />
                  <Icon icon="solar:tv-bold-duotone" className="w-16 h-16 text-muted-foreground animate-pulse relative z-10" />
                </div>
                <div className="text-center space-y-3 px-6">
                  <h2 className="text-foreground text-3xl font-black tracking-tight">Hang tight!</h2>
                  <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto leading-relaxed">The session will start automatically when the instructor arrives. Take a moment to prepare!</p>
                </div>
                <div className="flex items-center gap-3 bg-secondary/50 px-6 py-3 rounded-full border border-border">
                  <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing Stream</span>
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
        <div className="w-96 bg-card border-l border-border flex flex-col hidden lg:flex shadow-2xl transition-colors duration-500">
          <div className="flex p-1.5 bg-secondary m-6 rounded-2xl border border-border shadow-inner">
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "participants" 
                  ? 'bg-background text-primary shadow-lg border border-border' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Icon icon="solar:users-group-two-rounded-bold" className="w-4 h-4" />
              Participants
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "chat" 
                  ? 'bg-background text-primary shadow-lg border border-border' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
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

      {/* Controls / Footer */}
      <div className="px-8 py-6 glass border-t border-border flex items-center justify-between gap-6 z-50">
        <div className="flex items-center gap-3">
          {/* Reaction Buttons */}
          <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-[2rem] border border-border shadow-inner">
            {['❤️', '👍', '🔥', '👏', '😮', '😂'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction('reaction', emoji)}
                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-background hover:scale-110 hover:shadow-lg transition-all active:scale-95 text-2xl shadow-sm border border-transparent hover:border-border"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLeave}
          className="flex items-center gap-3 bg-secondary hover:bg-destructive/10 text-muted-foreground hover:text-destructive font-black text-xs uppercase tracking-[0.2em] px-10 py-5 rounded-[2rem] transition-all border border-border hover:border-destructive/20 active:scale-95 shadow-lg hover:shadow-destructive/5"
        >
          <Icon icon="solar:exit-bold" className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          LEAVE STREAM
        </button>
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
  const clientRef = useRef(null);

  useEffect(() => {
    if (!courseId || !API_KEY || API_KEY === "your_stream_api_key") {
      setError("Stream API key not configured.");
      return;
    }

    const setup = async () => {
      try {
        if (clientRef.current) return;

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

        clientRef.current = videoClient;
        await videoClient.connectUser({ id: userId }, token);
        const videoCall = videoClient.call(callType, callId);
        await videoCall.join();
        
        if (clientRef.current === videoClient) {
          setClient(videoClient);
          setCall(videoCall);
        }
      } catch (err) {
        console.error("LiveStreamWatch setup error:", err);
        const backendMessage = err.response?.data?.message;
        const streamError = err.message;
        
        if (streamError?.includes("JoinBackstage") || streamError?.includes("permission")) {
          setError("The live stream hasn't started yet. Please wait for the teacher to go live.");
        } else {
          setError(backendMessage || "Failed to join live stream. Please try again later.");
        }
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
      <div className="flex items-center justify-center min-h-screen bg-background text-destructive flex-col gap-8 transition-colors duration-500">
        <div className="w-24 h-24 rounded-[2rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-2xl relative">
          <div className="absolute inset-0 bg-destructive/5 animate-ping rounded-[2rem]" />
          <Icon icon="solar:danger-triangle-bold" className="w-12 h-12 relative z-10" />
        </div>
        <div className="text-center space-y-3 px-6">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Access Warning</h2>
          <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">{error}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Icon icon="solar:refresh-bold" className="w-4 h-4" />
            RETRY NOW
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all px-6 py-2"
          >
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-8 transition-colors duration-500">
        <div className="relative group">
          <div className="w-20 h-20 border-4 border-primary/10 rounded-[2rem] absolute animate-pulse" />
          <div className="w-20 h-20 border-t-4 border-primary rounded-[2rem] animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2 px-6">
          <p className="text-xl font-black text-foreground tracking-[0.2em] uppercase">CONNECTING</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Securing encrypted stream tunnel</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <WatcherView courseName={courseName} courseId={courseId} call={call} />
      </StreamCall>
    </StreamVideo>
  );
};

export default LiveStreamWatch;
