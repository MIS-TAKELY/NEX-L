/**
 * LiveStreamBroadcast – Instructor broadcasts a live stream for a course.
 * Uses @stream-io/video-react-sdk
 */
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/context/ToastContext";
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
import { 
  useGetCourseLiveClassesQuery, 
  useUpdateLiveClassMutation, 
  useEndAllCourseLiveClassesMutation,
  useScheduleLiveClassMutation
} from "../../store/slices/liveClassApi";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

// Inner component – has access to call context
const BroadcastControls = ({ call, courseId, callType }) => {
  const { showToast } = useToast();
  const [reactions, setReactions] = useState([]);
  const navigate = useNavigate();
  const { useIsCallLive } = useCallStateHooks();
  const isLive = useIsCallLive();

  const { data: liveClasses = [] } = useGetCourseLiveClassesQuery(courseId);
  const [updateLiveClass] = useUpdateLiveClassMutation();
  const [endAllLiveClasses] = useEndAllCourseLiveClassesMutation();
  const [scheduleLiveClass] = useScheduleLiveClassMutation();
  
  // Track the specific class ID we started
  const [currentClassId, setCurrentClassId] = useState(null);

  // If there's already a live class when we mount, track it
  useEffect(() => {
    if (!currentClassId && liveClasses.length > 0) {
      const live = liveClasses.find(lc => lc.status === 'live');
      if (live) setCurrentClassId(live._id);
    }
  }, [liveClasses, currentClassId]);

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

  // AUTO-SYNC: If Stream says we are live but we don't have a live class tracked in our DB, sync it.
  useEffect(() => {
    if (isLive && !currentClassId) {
      console.log("Auto-sync: Stream is live, ensuring DB status is 'live'");
      const syncDB = async () => {
        try {
          const scheduledClass = liveClasses.find(lc => lc.status === 'scheduled');
          if (scheduledClass) {
            await updateLiveClass({ 
              classId: scheduledClass._id, 
              courseId,
              payload: { status: 'live' } 
            }).unwrap();
            setCurrentClassId(scheduledClass._id);
          } else {
            // Ad-hoc session creation
            const adhocClass = await scheduleLiveClass({
              courseId,
              title: "Ad-hoc Live Session",
              description: "Teacher started an unscheduled live broadcast",
              startTime: new Date().toISOString(),
              duration: 60,
            }).unwrap();
            
            await updateLiveClass({
              classId: adhocClass.liveClass._id,
              courseId,
              payload: { status: 'live' }
            }).unwrap();
            setCurrentClassId(adhocClass.liveClass._id);
          }
        } catch (err) {
          console.error("Auto-sync failed:", err);
        }
      };
      syncDB();
    }
  }, [isLive, currentClassId, liveClasses, courseId, updateLiveClass, scheduleLiveClass]);

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
      
      if (callType === 'livestream') {
        await call.goLive();
      }

      // Update database status to 'live'
      const scheduledClass = liveClasses.find(lc => lc.status === 'scheduled');
      if (scheduledClass) {
        await updateLiveClass({ 
          classId: scheduledClass._id, 
          courseId,
          payload: { status: 'live' } 
        }).unwrap();
        setCurrentClassId(scheduledClass._id);
      } else {
        // Handle ad-hoc session: create a new live class record
        const adhocClass = await scheduleLiveClass({
          courseId,
          title: "Ad-hoc Live Session",
          description: "Teacher started an unscheduled live broadcast",
          startTime: new Date().toISOString(),
          duration: 60,
        }).unwrap();
        
        // The newly created class is usually 'scheduled' by default, update to 'live'
        // unless the backend was modified to accept status in creation
        await updateLiveClass({
          classId: adhocClass.liveClass._id,
          courseId,
          payload: { status: 'live' }
        }).unwrap();
        setCurrentClassId(adhocClass.liveClass._id);
      }
    } catch (err) {
      console.error("Failed to go live:", err);
      if (err.message?.includes("shall be called only once") || err.message?.includes("already live")) {
        return;
      }
      showToast("Failed to start live stream (Network or Server Issue): " + err.message, "error");
    } finally {
      setIsJoining(false);
    }
  };

  const endStream = async () => {
    try {
      // 1. Try to stop the stream and end the call with Stream SDK
      // We wrap these in their own try-catch so they don't block the DB update if they fail
      try {
        if (isLive) {
          await call.stopHLS();
        }
        await call.endCall();
      } catch (sdkErr) {
        console.warn("Stream SDK endCall/stopHLS failed (usually harmless if уже stopped):", sdkErr);
      }

      // 2. Robust ending in our database: 
      // This is the most critical part to ensure the UI stays in sync
      if (currentClassId) {
        try {
          await updateLiveClass({ 
            classId: currentClassId, 
            courseId,
            payload: { status: 'completed' } 
          }).unwrap();
        } catch (updateErr) {
          console.error("Failed to update specific class status in DB:", updateErr);
        }
      }
      
      // Safety: ensure no zombie live status remains for this course in our DB
      try {
        await endAllLiveClasses(courseId).unwrap();
      } catch (endAllErr) {
        console.error("Failed to end all live classes for course:", endAllErr);
      }

      // 3. Always navigate back
      navigate(-1);
    } catch (err) {
      console.error("Critical failure in endStream handler:", err);
      // Ensure we at least navigate away even on critical errors
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
        callType={callType}
    />
  );
};

// Outer component – sets up the client & call
const LiveStreamBroadcast = () => {
  const { courseId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [callTypeFromBackend, setCallTypeFromBackend] = useState("livestream");
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
          setCallTypeFromBackend(callType);
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
        <div className="w-20 h-20 rounded-md bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Icon icon="solar:danger-triangle-bold" className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Broadcast Error</h2>
          <p className="text-muted-foreground max-w-sm">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-card/5 hover:bg-card/10 text-white px-8 py-3 rounded-md border border-white/10 transition-all font-bold"
        >
          RETRY
        </button>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-muted-foreground gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-red-500/20 rounded-md" />
          <div className="w-16 h-16 border-t-2 border-red-500 rounded-md animate-spin absolute top-0 left-0" />
        </div>
        <div className="text-center animate-pulse">
          <p className="text-lg font-bold text-white tracking-widest">INITIALIZING</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Setting up your broadcast studio</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <BroadcastControls call={call} courseId={courseId} callType={callTypeFromBackend} />
      </StreamCall>
    </StreamVideo>
  );
};

export default LiveStreamBroadcast;
