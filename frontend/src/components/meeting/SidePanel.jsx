import React from 'react';
import { CallParticipantsList } from '@stream-io/video-react-sdk';
import { Icon } from '@iconify/react';
import LiveStreamChat from '@/components/student/LiveStreamChat';

const SidePanel = ({ activePanel, onClose, courseId }) => {
  if (!activePanel) return null;

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-[#202124] flex flex-col shadow-2xl transition-transform duration-300 transform translate-x-0 absolute right-0 top-0 h-full z-40 border-l border-gray-200 dark:border-white/10">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
          {activePanel}
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
        >
          <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden h-full">
        {activePanel === 'participants' ? (
          <div className="h-full flex flex-col p-2 bg-gray-50 dark:bg-transparent overflow-y-auto override-stream-theme">
             <CallParticipantsList onClose={onClose} />
          </div>
        ) : (
          <div className="h-full flex flex-col dark:bg-[#202124]">
             <LiveStreamChat courseId={courseId} />
          </div>
        )}
      </div>
      
    </div>
  );
};

export default SidePanel;
