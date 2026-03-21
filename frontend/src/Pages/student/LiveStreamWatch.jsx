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
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Icon } from "@iconify/react";
import MeetingLayout from "@/components/meeting/MeetingLayout";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

const WatcherView = ({ courseName, courseId, call, callType }) => {
  const [reactions, setReactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = call.on("call.reaction_new", (event) => {
      const { reaction } = event;
      if (reaction) {
        setReactions((prev) => [...prev, reaction]);
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

  return (
    <MeetingLayout
        courseName={courseName || "Live Class"}
        courseId={courseId}
        call={call}
        onLeave={handleLeave}
        isInstructor={false}
        reactions={reactions}
        callType={callType || 'default'}
        autoJoin={true}
    />
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
        <WatcherView courseName={courseName} courseId={courseId} call={call} callType={call.type} />
      </StreamCall>
    </StreamVideo>
  );
};

export default LiveStreamWatch;
