import React, { useState } from 'react';
import { useCallStateHooks, useCall, OwnCapability } from '@stream-io/video-react-sdk';
import { Icon } from '@iconify/react';

const ParticipantRow = ({ participant, isLocal, canMute, canKick, call }) => {
  const [showActions, setShowActions] = useState(false);
  const [confirmKick, setConfirmKick] = useState(false);

  const hasAudio = participant.publishedTracks?.some(
    (t) => t === 1 || t === 'TRACK_TYPE_AUDIO' || t === 'audio'
  );
  const hasVideo = participant.publishedTracks?.some(
    (t) => t === 2 || t === 'TRACK_TYPE_VIDEO' || t === 'video'
  );
  const isHandRaised = !!participant.raisedHandAt;
  const isSpeaking = participant.isSpeaking;

  const handleMuteAudio = async () => {
    try {
      await call.muteUser(participant.userId, 'audio');
    } catch (err) {
      console.error('Failed to mute audio:', err);
    }
  };

  const handleMuteVideo = async () => {
    try {
      await call.muteUser(participant.userId, 'video');
    } catch (err) {
      console.error('Failed to mute video:', err);
    }
  };

  const handleKick = async () => {
    try {
      await call.kickUser({ user_id: participant.userId });
      setConfirmKick(false);
    } catch (err) {
      console.error('Failed to kick user:', err);
    }
  };

  const handleRowClick = () => {
    if (!isLocal && (canMute || canKick)) {
      setShowActions((prev) => !prev);
      if (showActions) setConfirmKick(false);
    }
  };

  return (
    <div
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
      onClick={handleRowClick}
      onMouseEnter={() => { if (canMute || canKick) setShowActions(true); }}
      onMouseLeave={() => { setShowActions(false); setConfirmKick(false); }}
    >
      {/* Avatar */}
      <div className={`relative flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold overflow-hidden ${
        isSpeaking ? 'ring-2 ring-primary' : ''
      }`}
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
      >
        {participant.image ? (
          <img src={participant.image} alt={participant.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white">{participant.name?.charAt(0)?.toUpperCase() || '?'}</span>
        )}
        {isHandRaised && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-md flex items-center justify-center border border-white">
            <span className="text-[8px]">✋</span>
          </div>
        )}
      </div>

      {/* Name & Status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">
            {participant.name || participant.userId}
          </span>
          {isLocal && (
            <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              You
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Icon
            icon={hasAudio ? 'material-symbols:mic' : 'material-symbols:mic-off'}
            className={`w-3.5 h-3.5 ${hasAudio ? 'text-muted-foreground' : 'text-destructive'}`}
          />
          <Icon
            icon={hasVideo ? 'material-symbols:videocam' : 'material-symbols:videocam-off'}
            className={`w-3.5 h-3.5 ${hasVideo ? 'text-muted-foreground' : 'text-destructive'}`}
          />
          {isSpeaking && (
            <span className="text-[10px] font-bold text-primary">Speaking</span>
          )}
        </div>
      </div>

      {/* Host Actions (only for remote participants) */}
      {!isLocal && (canMute || canKick) && showActions && !confirmKick && (
        <div className="flex items-center gap-1 animate-in fade-in duration-150">
          {canMute && hasAudio && (
            <button
              onClick={handleMuteAudio}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Mute audio"
            >
              <Icon icon="material-symbols:mic-off" className="w-4 h-4" />
            </button>
          )}
          {canMute && hasVideo && (
            <button
              onClick={handleMuteVideo}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Turn off camera"
            >
              <Icon icon="material-symbols:videocam-off" className="w-4 h-4" />
            </button>
          )}
          {canKick && (
            <button
              onClick={() => setConfirmKick(true)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Remove from call"
            >
              <Icon icon="material-symbols:person-remove-outline" className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Kick Confirmation */}
      {confirmKick && (
        <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
          <span className="text-[10px] text-destructive font-bold">Remove?</span>
          <button
            onClick={handleKick}
            className="px-2.5 py-1 rounded-md bg-destructive text-white text-[10px] font-bold hover:bg-destructive/90 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmKick(false)}
            className="px-2.5 py-1 rounded-md bg-secondary text-foreground text-[10px] font-bold hover:bg-secondary/70 transition-colors"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
};

const ParticipantsList = ({ isInstructor }) => {
  const call = useCall();
  const { useParticipants, useLocalParticipant, useHasPermissions } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const canMute = useHasPermissions(OwnCapability.MUTE_USERS);
  const canKick = useHasPermissions(OwnCapability.KICK_USER);

  const showHostControls = isInstructor && (canMute || canKick);

  const sortedParticipants = [...(participants || [])].sort((a, b) => {
    if (a.userId === localParticipant?.userId) return -1;
    if (b.userId === localParticipant?.userId) return 1;
    if (a.raisedHandAt && !b.raisedHandAt) return -1;
    if (!a.raisedHandAt && b.raisedHandAt) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          In this call ({participants?.length || 0})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-0.5">
        {sortedParticipants.map((participant) => (
          <ParticipantRow
            key={participant.sessionId || participant.userId}
            participant={participant}
            isLocal={participant.userId === localParticipant?.userId}
            canMute={showHostControls && canMute}
            canKick={showHostControls && canKick}
            call={call}
          />
        ))}

        {(!participants || participants.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Icon icon="material-symbols:group-outline" className="w-10 h-10 mb-2 opacity-30" />
            <span className="text-sm">No participants yet</span>
          </div>
        )}
      </div>

      {showHostControls && (
        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Icon icon="material-symbols:shield-outline" className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider">Host controls enabled</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsList;
