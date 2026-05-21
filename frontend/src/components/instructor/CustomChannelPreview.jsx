/**
 * CustomChannelPreview – A channel preview for the instructor Messages page
 * that removes pin/archive action buttons and shows meaningful names
 * for consultation channels.
 */
import React, { useRef } from "react";
import clsx from "clsx";
import { Avatar as DefaultAvatar } from "stream-chat-react";

/**
 * Format a channel title for display.
 * If the name looks like "Consultation: [id]" (hex-like), show just "Consultation".
 * Otherwise use the channel's display title.
 */
const formatChannelTitle = (displayTitle, channel) => {
  if (!displayTitle && channel?.data?.name) {
    displayTitle = channel.data.name;
  }

  // If the name matches the old "Consultation: hexId" pattern, show something friendlier
  if (
    displayTitle &&
    /^Consultation:\s*[0-9a-f]{10,}$/i.test(displayTitle)
  ) {
    // Try to use the channel member names to build a meaningful title
    const members = Object.values(channel?.state?.members || {});
    const otherMembers = members.filter(
      (m) => m.user?.id !== channel?.getClient()?.user?.id
    );
    const otherName = otherMembers[0]?.user?.name || "Student";
    return `Consultation with ${otherName}`;
  }

  return displayTitle || channel?.data?.name || "Unknown Chat";
};

const UnmemoizedCustomChannelPreview = (props) => {
  const {
    active,
    Avatar = DefaultAvatar,
    channel,
    className: customClassName = "",
    displayImage,
    displayTitle,
    groupChannelDisplayInfo,
    latestMessagePreview,
    onSelect: customOnSelectChannel,
    setActiveChannel,
    unread,
    watchers,
  } = props;

  const channelPreviewButton = useRef(null);

  const avatarName =
    displayTitle ||
    channel.state.messages[channel.state.messages.length - 1]?.user?.id;

  const formattedTitle = formatChannelTitle(displayTitle, channel);

  const onSelectChannel = (e) => {
    if (customOnSelectChannel) {
      customOnSelectChannel(e);
    } else if (setActiveChannel) {
      setActiveChannel(channel, watchers);
    }
    if (channelPreviewButton?.current) {
      channelPreviewButton.current.blur();
    }
  };

  return (
    <div className="str-chat__channel-preview-container">
      {/* NOTE: No ChannelPreviewActionButtons – pin/archive intentionally removed */}
      <button
        aria-label={`Select Channel: ${formattedTitle || ""}`}
        aria-selected={active}
        className={clsx(
          "str-chat__channel-preview-messenger str-chat__channel-preview",
          active && "str-chat__channel-preview-messenger--active",
          unread && unread >= 1 && "str-chat__channel-preview-messenger--unread",
          customClassName
        )}
        data-testid="channel-preview-button"
        onClick={onSelectChannel}
        ref={channelPreviewButton}
        role="option"
      >
        <div className="str-chat__channel-preview-messenger--left">
          <Avatar
            className="str-chat__avatar--channel-preview"
            groupChannelDisplayInfo={groupChannelDisplayInfo}
            image={displayImage}
            name={avatarName}
          />
        </div>
        <div className="str-chat__channel-preview-end">
          <div className="str-chat__channel-preview-end-first-row">
            <div className="str-chat__channel-preview-messenger--name">
              <span>{formattedTitle}</span>
            </div>
            {!!unread && (
              <div
                className="str-chat__channel-preview-unread-badge"
                data-testid="unread-badge"
              >
                {unread}
              </div>
            )}
          </div>
          <div className="str-chat__channel-preview-messenger--last-message">
            {latestMessagePreview}
          </div>
        </div>
      </button>
    </div>
  );
};

const CustomChannelPreview = React.memo(UnmemoizedCustomChannelPreview);

export default CustomChannelPreview;
