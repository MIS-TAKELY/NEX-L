import { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSelector } from "react-redux";
import axios from "axios";

const StreamContext = createContext(null);

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

export const StreamContextProvider = ({ children }) => {
  const [chatClient, setChatClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userData, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated || !userData?.id || !API_KEY || API_KEY === "your_stream_api_key") return;

    let client;

    const connect = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(
          `${BACKEND}/api/v1/stream/token`,
          {},
          { withCredentials: true }
        );

        client = StreamChat.getInstance(API_KEY);

        await client.connectUser(
          {
            id: data.userId,
            name: data.userName,
            image: userData.image || "",
          },
          data.token
        );

        setChatClient(client);
      } catch (err) {
        console.error("Stream connect error:", err);
      } finally {
        setLoading(false);
      }
    };

    connect();

    return () => {
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [isAuthenticated, userData?.id]);

  return (
    <StreamContext.Provider value={{ chatClient, loading }}>
      {children}
    </StreamContext.Provider>
  );
};

export const useStream = () => useContext(StreamContext);
