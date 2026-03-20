/**
 * LiveStreamChat – A minimal chat component for the live stream sidebar.
 * Connects to the course's group channel.
 */
import { useEffect, useState } from "react";
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Window,
  LoadingIndicator,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useStream } from "@/context/StreamContext";
import { Icon } from "@iconify/react";

const LiveStreamChat = ({ courseId }) => {
  const { chatClient, loading: contextLoading } = useStream();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatClient || !courseId) return;

    const init = async () => {
      try {
        const channelId = `course-${courseId}`;
        const ch = chatClient.channel("messaging", channelId);
        
        // Watch the channel to get updates
        await ch.watch();
        setChannel(ch);
      } catch (err) {
        console.error("LiveStreamChat init error:", err);
        setError("Failed to connect to chat");
      }
    };

    init();
  }, [chatClient, courseId]);

  if (contextLoading || (!channel && !error)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
        <LoadingIndicator size={20} />
        <span className="text-xs font-bold tracking-widest uppercase opacity-50">Connecting to Chat</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500/50 p-6 text-center gap-4">
        <Icon icon="solar:danger-circle-bold-duotone" className="w-10 h-10" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full str-chat-livestream bg-gray-900">
      <div className="flex-1 overflow-hidden relative">
        <Chat client={chatClient} theme="str-chat__theme-dark">
          <Channel channel={channel}>
            <Window>
              <MessageList hideDeletedMessages />
              <MessageInput 
                focus 
                grow 
                noFiles
              />
            </Window>
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default LiveStreamChat;
