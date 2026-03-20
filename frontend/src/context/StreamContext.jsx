import { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { useSelector } from "react-redux";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

const StreamContext = createContext(null);

export const StreamContextProvider = ({ children }) => {
  const [chatClient, setChatClient] = useState(null);
  const [videoClient, setVideoClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userData, isLoggedIn } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isLoggedIn || !userData?.id || !API_KEY || API_KEY === "your_stream_api_key") return;

    let chatClientLocal;
    let videoClientLocal;

    const connect = async () => {
      try {
        console.log("StreamContext: Starting connection process...");
        console.log("StreamContext: API_KEY present:", !!API_KEY && API_KEY !== "your_stream_api_key");
        
        setLoading(true);
        console.log("StreamContext: Fetching token from", `${BACKEND}/api/v1/stream/token`);
        const { data } = await axios.post(
          `${BACKEND}/api/v1/stream/token`,
          {},
          { withCredentials: true }
        );
        console.log("StreamContext: Token received for user:", data.userId);

        // Chat Client Setup
        console.log("StreamContext: Initializing Chat Client...");
        const cClient = StreamChat.getInstance(API_KEY);
        await cClient.connectUser(
          {
            id: data.userId,
            name: data.userName,
            image: userData.image || "",
          },
          data.token
        );
        chatClientLocal = cClient;
        console.log("StreamContext: Chat Client connected");

        // Video Client Setup
        console.log("StreamContext: Initializing Video Client...");
        const vClient = new StreamVideoClient({
          apiKey: API_KEY,
          user: {
            id: data.userId,
            name: data.userName,
            image: userData.image || "",
          },
          token: data.token,
        });
        
        // Explicitly connect the video client
        console.log("StreamContext: Connecting Video Client...");
        await vClient.connectUser(
          {
            id: data.userId,
            name: data.userName,
            image: userData.image || "",
          },
          data.token
        );
        videoClientLocal = vClient;
        console.log("StreamContext: Video Client connected");

        setChatClient(cClient);
        setVideoClient(vClient);
        console.log("StreamContext: Both clients set to state");
      } catch (err) {
        console.error("StreamContext: Connection error:", err);
      } finally {
        setLoading(false);
      }
    };

    connect();

    return () => {
      if (chatClientLocal) {
        chatClientLocal.disconnectUser()
          .then(() => console.log("Chat client disconnected"))
          .catch(err => console.error("Chat disconnect error:", err));
      }
      if (videoClientLocal) {
        videoClientLocal.disconnectUser()
          .then(() => console.log("Video client disconnected"))
          .catch(err => console.error("Video disconnect error:", err));
      }
    };
  }, [isLoggedIn, userData?.id]);


  return (
    <StreamContext.Provider value={{ chatClient, videoClient, loading }}>
      {children}
    </StreamContext.Provider>
  );
};

export const useStream = () => useContext(StreamContext);
