import React from 'react';
import { Icon } from '@iconify/react';
import LiveStreamChat from '@/components/student/LiveStreamChat';
import ParticipantsList from './ParticipantsList';

const SidePanel = ({ activePanel, onClose, courseId, isInstructor }) => {
  if (!activePanel) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#202124] transition-all duration-300">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 pb-2 lg:pb-2">
        <h2 className="text-lg font-normal text-gray-900 dark:text-gray-200 capitalize">
          {activePanel === 'participants' ? 'People' : activePanel}
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          title="Close"
        >
          <Icon icon="material-symbols:close" className="w-6 h-6" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden h-full">
        {activePanel === 'participants' ? (
          <div className="h-full flex flex-col overflow-hidden">
             <ParticipantsList isInstructor={isInstructor} />
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
