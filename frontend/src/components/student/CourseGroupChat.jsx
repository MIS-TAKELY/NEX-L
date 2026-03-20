/**
 * CourseGroupChat – all enrolled students + teacher in one channel per course.
 */
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chat,
  Channel,
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
import CreateChannelModal from "../instructor/CreateChannelModal";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const CourseGroupChat = ({ courseId, onClose }) => {
  const { chatClient } = useStream();
  const { userData } = useSelector((s) => s.auth);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isTeacher = userData?.role === 'teacher' || userData?.role === 'instructor';

  const fetchChannels = async () => {
    if (!chatClient || !courseId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BACKEND}/api/v1/stream/channels/${courseId}`,
        { withCredentials: true }
      );
      
      if (data.success && data.channels.length > 0) {
        setChannels(data.channels);
        
        // Watch the first channel by default if none active
        if (!activeChannel) {
          const ch = chatClient.channel('messaging', data.channels[0].channelId);
          await ch.watch();
          setActiveChannel(ch);
        }
      } else {
        // Fallback or initial state: create/get default group channel if none exist
        const { data: groupData } = await axios.get(
          `${BACKEND}/api/v1/stream/group/${courseId}`,
          { withCredentials: true }
        );
        const ch = chatClient.channel(groupData.channelType, groupData.channelId);
        await ch.watch();
        setActiveChannel(ch);
        // Refresh list to include the newly created default channel
        const { data: refreshData } = await axios.get(
          `${BACKEND}/api/v1/stream/channels/${courseId}`,
          { withCredentials: true }
        );
        if (refreshData.success) setChannels(refreshData.channels);
      }
    } catch (err) {
      console.error("GroupChat init error:", err);
      setError(err.response?.data?.message || "Failed to load chat channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [chatClient, courseId]);

  const handleChannelSelect = async (channelId) => {
    try {
      const ch = chatClient.channel('messaging', channelId);
      await ch.watch();
      setActiveChannel(ch);
    } catch (err) {
      console.error("Channel select error:", err);
    }
  };

  if (loading && !activeChannel) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading channels…</span>
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
    <div className="flex h-full overflow-hidden">
      {/* Sidebar for Channels */}
      <div className="w-64 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm">CHANNELS</span>
          {isTeacher && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-all"
              title="Add Channel"
            >
              <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((ch) => (
            <button
              key={ch.channelId}
              onClick={() => handleChannelSelect(ch.channelId)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all group ${
                activeChannel?.id === ch.channelId
                  ? 'bg-primary text-foreground shadow-sm shadow-primary/20'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon icon="solar:hashtag-bold" className={activeChannel?.id === ch.channelId ? 'text-white' : 'text-gray-400 group-hover:text-primary'} />
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background shadow-sm z-10">
          <div className="flex items-center gap-2 overflow-hidden">
            <Icon icon="solar:hashtag-bold" className="w-5 h-5 text-primary shrink-0" />
            <span className="font-extrabold text-gray-900 text-sm truncate italic">
              {activeChannel?.data?.name || 'Loading...'}
            </span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 ml-2">
              <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stream Chat UI */}
        <div className="flex-1 overflow-hidden relative">
          <Chat client={chatClient} theme="str-chat__theme-light">
            <Channel channel={activeChannel}>
              <Window>
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        </div>
      </div>

      <CreateChannelModal 
        courseId={courseId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onChannelCreated={() => fetchChannels()} 
      />
    </div>
  );
};

export default CourseGroupChat;
