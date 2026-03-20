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
  StreamCall,
  CallingState,
  useCallStateHooks
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Icon } from "@iconify/react";
import MeetingLayout from "@/components/meeting/MeetingLayout";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

// Inner component – has access to call context
const BroadcastControls = ({ call, courseId }) => {
  const [reactions, setReactions] = useState([]);
  const navigate = useNavigate();
  const { useIsCallLive } = useCallStateHooks();
  const isLive = useIsCallLive();

  useEffect(() => {
    const cleanup = call.on("call.reaction_new", (event) => {
      const { reaction } = event;
      if (reaction) {
        setReactions((prev) => [...prev, reaction]);
        // Remove reaction after 5 seconds
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r !== reaction));
        }, 5000);
      }
    });

    return () => cleanup();
  }, [call]);

  const [isJoining, setIsJoining] = useState(false);

  const goLive = async () => {
    if (isJoining) return;
    
    try {
      setIsJoining(true);
      const state = call.state.callingState;
      
      if (state === CallingState.JOINING) {
        return; // Wait for it to join
      }
      
      if (state !== CallingState.JOINED) {
        await call.join({ create: true });
      }
      await call.goLive();
    } catch (err) {
      console.error("Failed to go live:", err);
      if (err.message?.includes("shall be called only once") || err.message?.includes("already live")) {
        return;
      }
      alert("Failed to start live stream (Network or Server Issue): " + err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const endStream = async () => {
    try {
      if (isLive) {
         await call.stopHLS();
      }
      await call.endCall();
      navigate(-1);
    } catch (err) {
      console.error("Failed to end stream:", err);
      navigate(-1);
    }
  };

  return (
    <MeetingLayout
        courseName="Live Broadcast"
        courseId={courseId}
        call={call}
        onLeave={endStream}
        isInstructor={true}
        goLive={goLive}
        reactions={reactions}
        callType="livestream"
    />
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
        if (clientRef.current) return;

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
