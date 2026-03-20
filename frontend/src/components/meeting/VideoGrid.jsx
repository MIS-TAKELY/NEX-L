import React from 'react';
import { PaginatedGridLayout, SpeakerLayout, LivestreamLayout } from '@stream-io/video-react-sdk';

const VideoGrid = ({ isLivestream, isInstructor, callType }) => {
  // Use appropriate layout based on call type
  
  if (callType === 'livestream') {
    // For livestreaming, instructor uses standard layout, student uses Livestream layout for immersive view
    return isInstructor ? (
       <SpeakerLayout participantsBarPosition="bottom" />
    ) : (
       <LivestreamLayout />
    );
  }

  // Google Meet style Video Call Grid
  // Removes default borders and makes it immersive
  return (
    <div className="w-full h-full [&>div]:h-full [&>div]:w-full">
       <PaginatedGridLayout 
           groupSize={8} 
           includeAudioOnly={true} 
       />
    </div>
  );
};

export default VideoGrid;

