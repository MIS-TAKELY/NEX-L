import React from 'react';
import { Icon } from '@iconify/react';

const PERMISSION_LABELS = {
  'screen-share': { label: 'Screen Share', icon: 'material-symbols:present-to-all' },
  'screenshare':  { label: 'Screen Share', icon: 'material-symbols:present-to-all' },
  'send-audio':   { label: 'Microphone',   icon: 'material-symbols:mic' },
  'send-video':   { label: 'Camera',       icon: 'material-symbols:videocam' },
};

const PermissionRequestToast = ({ requests, onGrant, onDeny }) => {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {requests.map((req) => {
        const permLabels = req.permissions.map(
          (p) => PERMISSION_LABELS[p]?.label || p
        );
        const permIcons = req.permissions.map(
          (p) => PERMISSION_LABELS[p]?.icon || 'material-symbols:lock-open'
        );

        return (
          <div
            key={req.userId}
            className="pointer-events-auto flex items-start gap-3 bg-popover border border-border rounded-xl shadow-2xl px-4 py-3 w-80 animate-in slide-in-from-right-4 duration-300"
          >
            {/* Icon */}
            <div className="mt-0.5 w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon icon={permIcons[0]} className="w-5 h-5" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {req.userName || req.userId}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Wants to share: <span className="font-medium text-foreground">{permLabels.join(', ')}</span>
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={() => onGrant(req.userId, req.permissions)}
                  className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDeny(req.userId)}
                  className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/70 transition-colors active:scale-95"
                >
                  Deny
                </button>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => onDeny(req.userId)}
              className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              title="Dismiss"
            >
              <Icon icon="material-symbols:close" className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PermissionRequestToast;
