/**
 * StudentChat – 1-on-1 chat between a student and the course teacher.
 * Uses stream-chat-react components with a custom minimal theme.
 */
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  LoadingIndicator,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useStream } from "@/context/StreamContext";
import { Icon } from "@iconify/react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const StudentChat = ({ courseId, onClose }) => {
  const { chatClient, loading } = useStream();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatClient || !courseId) return;

    const init = async () => {
      try {
        const { data } = await axios.get(
          `${BACKEND}/api/v1/stream/dm/${courseId}`,
          { withCredentials: true }
        );
        const ch = chatClient.channel(data.channelType, data.channelId);
        await ch.watch();
        setChannel(ch);
      } catch (err) {
        console.error("StudentChat init error:", err);
        setError(err.response?.data?.message || "Failed to load chat");
      }
    };

    init();
  }, [chatClient, courseId]);

  if (loading || (!channel && !error)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <LoadingIndicator />
        <span className="ml-2 text-sm">Connecting…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">
        <Icon icon="solar:danger-circle-bold" className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full str-chat-custom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <Icon icon="solar:chat-round-dots-bold-duotone" className="w-5 h-5 text-primary" />
          <span className="font-semibold text-gray-900 text-sm">Chat with Teacher</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Stream Chat UI */}
      <div className="flex-1 overflow-hidden">
        <Chat client={chatClient} theme="str-chat__theme-light">
          <Channel channel={channel}>
            <Window>
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default StudentChat;
