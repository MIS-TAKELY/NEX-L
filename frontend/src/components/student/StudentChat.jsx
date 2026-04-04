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
import { useSelector } from "react-redux";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const StudentChat = ({ courseId, onClose }) => {
  const { chatClient, loading } = useStream();
  const { theme } = useSelector((s) => s.ui);
  const streamTheme = `str-chat__theme-${theme || 'light'}`;
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
      <div className="flex items-center justify-center h-full text-muted-foreground">
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card transition-colors duration-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
            <Icon icon="solar:chat-round-dots-bold-duotone" className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="font-black text-foreground text-sm tracking-tight uppercase">Private Mentor</span>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">1-on-1 Session</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all">
            <Icon icon="solar:close-circle-bold" size={20} />
          </button>
        )}
      </div>

      {/* Stream Chat UI */}
      <div className="flex-1 overflow-hidden">
        <Chat client={chatClient} theme={streamTheme}>
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
