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
  const { userData, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated || !userData?.id || !API_KEY || API_KEY === "your_stream_api_key") return;

    let chatClientLocal;
    let videoClientLocal;

    const connect = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(
          `${BACKEND}/api/v1/stream/token`,
          {},
          { withCredentials: true }
        );

        // Chat Client Setup
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

        // Video Client Setup
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
        await vClient.connectUser(
          {
            id: data.userId,
            name: data.userName,
            image: userData.image || "",
          },
          data.token
        );
        videoClientLocal = vClient;

        setChatClient(cClient);
        setVideoClient(vClient);
        console.log("Stream connected successfully for user:", data.userId);
      } catch (err) {
        console.error("Stream connect error:", err);
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
  }, [isAuthenticated, userData?.id]);

  return (
    <StreamContext.Provider value={{ chatClient, videoClient, loading }}>
      {children}
    </StreamContext.Provider>
  );
};

export const useStream = () => useContext(StreamContext);
