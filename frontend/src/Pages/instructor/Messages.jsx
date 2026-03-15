/**
 * Messages (Instructor) – Real-time chat with students powered by Stream Chat.
 * Lists all messaging channels where the teacher is a participant,
 * and renders the selected channel with stream-chat-react components.
 */
import { useEffect, useState } from "react";
import {
  Chat,
  Channel,
  ChannelList,
  ChannelPreviewMessenger,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { Icon } from "@iconify/react";
import { useStream } from "@/context/StreamContext";
import { useSelector } from "react-redux";

const Messages = () => {
  const { chatClient } = useStream();
  const { userData } = useSelector((s) => s.auth);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Stream filter: all messaging channels with this teacher
  const filters = chatClient
    ? { type: "messaging", members: { $in: [userData?.id] } }
    : null;
  const sort = { last_message_at: -1 };
  const options = { limit: 30 };

  if (!chatClient) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center text-gray-500 font-outfit">
        <div className="text-center">
          <Icon icon="solar:chat-round-dots-bold-duotone" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600">Connecting to chat…</p>
          <p className="text-sm text-gray-400 mt-1">
            Make sure <code className="bg-gray-100 px-1 rounded text-xs">VITE_STREAM_API_KEY</code> is set.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] font-outfit">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex overflow-hidden">
        <Chat client={chatClient} theme="str-chat__theme-light">
          {/* Threads / Channel List */}
          <div className="w-80 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              <p className="text-sm text-gray-400 mt-0.5">Your student conversations</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ChannelList
                filters={filters}
                sort={sort}
                options={options}
                Preview={(props) => (
                  <ChannelPreviewMessenger
                    {...props}
                    onSelect={() => setSelectedChannel(props.channel)}
                  />
                )}
              />
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedChannel ? (
              <Channel channel={selectedChannel}>
                <Window>
                  <MessageList />
                  <MessageInput focus />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Icon
                  icon="solar:chat-round-line-linear"
                  className="w-16 h-16 text-gray-200"
                />
                <p className="font-medium text-gray-500">Select a conversation</p>
                <p className="text-sm text-gray-400">
                  Choose a student thread from the left to start chatting
                </p>
              </div>
            )}
          </div>
        </Chat>
      </div>
    </div>
  );
};

export default Messages;
