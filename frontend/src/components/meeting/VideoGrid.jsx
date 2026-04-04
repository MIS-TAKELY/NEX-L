import React from 'react';
import { 
  PaginatedGridLayout, 
  SpeakerLayout, 
  LivestreamLayout,
  ParticipantView,
} from '@stream-io/video-react-sdk';
import { Icon } from '@iconify/react';

const CustomParticipantView = (props) => {
  const { participant } = props;
  const isHandRaised = !!participant.raisedHandAt;
  const isSpeaking = participant.isSpeaking;

  return (
    <ParticipantView {...props}>
      {/* Hand Raised Indicator */}
      {isHandRaised && (
        <div className="absolute top-4 left-4 z-20 flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md shadow-lg border-2 border-white animate-bounce-subtle">
          <Icon icon="material-symbols:back-hand" className="w-5 h-5 text-white" />
        </div>
      )}
      
      {/* Custom Nameplate / Speaking Indicator */}
      {isSpeaking && !props.isLocalParticipant && (
        <div className="absolute inset-0 z-10 border-4 border-primary rounded-md pointer-events-none animate-pulse-slow" />
      )}
    </ParticipantView>
  );
};

const VideoGrid = ({ isLivestream, isInstructor, callType, layout = 'grid' }) => {
  if (layout === 'grid') {
    return (
      <div className="w-full h-full [&>div]:h-full [&>div]:w-full rounded-md overflow-hidden shadow-2xl bg-background">
         <PaginatedGridLayout 
             ParticipantView={CustomParticipantView}
             groupSize={12} 
             includeAudioOnly={true}
             theme="dark"
         />
      </div>
    );
  }

  if (callType === 'livestream') {
    return isInstructor ? (
       <SpeakerLayout 
         ParticipantView={CustomParticipantView}
         participantsBarPosition="bottom" 
       />
    ) : (
       <LivestreamLayout ParticipantView={CustomParticipantView} />
    );
  }

  if (layout === 'speaker') {
    return (
      <div className="w-full h-full [&>div]:h-full [&>div]:w-full rounded-md overflow-hidden shadow-2xl bg-background">
        <SpeakerLayout
          ParticipantView={CustomParticipantView}
          participantsBarPosition="bottom"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full [&>div]:h-full [&>div]:w-full rounded-md overflow-hidden shadow-2xl bg-background">
       <PaginatedGridLayout 
           ParticipantView={CustomParticipantView}
           groupSize={12} 
           includeAudioOnly={true}
           theme="dark"
       />
    </div>
  );
};

export default VideoGrid;

