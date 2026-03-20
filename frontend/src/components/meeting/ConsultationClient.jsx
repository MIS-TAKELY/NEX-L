import { useEffect, useState } from "react";
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
import { useSelector } from "react-redux";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

const CallUI = ({ onLeave, call, sessionId }) => {
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
        isInstructor={true}
        callType="consultation"
        autoJoin={false}
      />
    </StreamTheme>
  );
};

const ConsultationClient = ({ sessionId, onLeave }) => {
  const { userData } = useSelector((s) => s.auth);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId || !API_KEY || API_KEY === "your_stream_api_key") {
      setError("Stream configuration is missing.");
      return;
    }

    const setup = async () => {
      try {
        const [callRes, tokenRes] = await Promise.all([
          axios.get(`${BACKEND}/api/v1/stream/consultation/${sessionId}`, { withCredentials: true }),
          axios.post(`${BACKEND}/api/v1/stream/video-token`, {}, { withCredentials: true }),
        ]);

        const { callId, callType } = callRes.data;
        const { token, userId } = tokenRes.data;

        const videoClient = new StreamVideoClient({
          apiKey: API_KEY,
          user: { 
            id: userId,
            name: userData?.name || "Consultant",
            image: userData?.image || ""
          },
          token,
        });

        await videoClient.connectUser({ 
          id: userId,
          name: userData?.name || "Consultant",
          image: userData?.image || ""
        }, token);

        const videoCall = videoClient.call(callType, callId);
        
        setClient(videoClient);
        setCall(videoCall);
      } catch (err) {
        console.error("Consultation setup error:", err);
        setError(err.response?.data?.message || "Failed to join consultation.");
      }
    };

    setup();

    return () => {
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [sessionId]);

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

  if (!client || !call) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0c0c0e] text-gray-400 gap-4 rounded-3xl min-h-[500px]">
        <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
        <p className="font-bold tracking-widest uppercase text-xs">Initializing Consultation...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI onLeave={onLeave} call={call} sessionId={sessionId} />
      </StreamCall>
    </StreamVideo>
  );
};

export default ConsultationClient;
