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
    <div className="flex flex-col h-full str-chat-livestream bg-background transition-colors duration-500 overflow-hidden">
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <Chat client={chatClient} theme="str-chat__theme-dark">
          <Channel channel={channel}>
            <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm">
              <MessageList 
                hideDeletedMessages 
                messageActions={['react', 'reply']}
                showAdmingActions={false}
              />
              <div className="p-4 bg-background/50 border-t border-border/50">
                <MessageInput 
                  focus 
                  grow 
                  noFiles
                  placeholder="Send a message to everyone"
                />
              </div>
            </div>
          </Channel>
        </Chat>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .str-chat {
          --str-chat__primary-color: var(--primary);
          --str-chat__background-color: transparent;
          --str-chat__secondary-background-color: var(--secondary);
          --str-chat__message-bubble-background-color: var(--secondary);
          --str-chat__message-bubble-text-color: var(--foreground);
          --str-chat__font-family: 'Outfit', sans-serif;
        }
        .str-chat__list {
          background: transparent !important;
        }
        .str-chat__message-simple {
          padding: 8px 16px !important;
        }
        .str-chat__message-inner {
          max-width: 85% !important;
        }
        .str-chat__message-bubble {
          border-radius: 12px !important;
          border: 1px solid var(--border) !important;
          box-shadow: none !important;
          background: var(--secondary) !important;
        }
        .str-chat__input-flat {
          background: var(--secondary) !important;
          border-radius: 24px !important;
          border: 1px solid var(--border) !important;
          padding: 4px 12px !important;
        }
        .str-chat__input-flat-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .str-chat__send-button {
          color: var(--primary) !important;
        }
        .str-chat__message-list {
          padding-top: 20px !important;
        }
      `}} />
    </div>
  );
};

export default LiveStreamChat;
