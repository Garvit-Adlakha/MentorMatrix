import { useState } from 'react';
import PropTypes from 'prop-types';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { IconLoader2 } from '../ui/Icons';

const JitsiMeetComponent = ({
  roomName,
  displayName,
  onApiReady,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleApiReady = (api) => {
    setIsLoading(false);
    if (onApiReady) {
      onApiReady(api);
    }
  };

  console.log(roomName, displayName); 
  return (

    <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-700 min-h-[70vh]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10">
          <div className="flex flex-col items-center">
            <IconLoader2 className="w-12 h-12 text-blue-400 animate-spin mb-2" />
            <p className="text-gray-200">Joining meeting...</p>
          </div>
        </div>
      )}

      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: false,
          startScreenSharing: false,
          enableEmailInStats: false,
          prejoinPageEnabled: true,
          disableInitialGUM: false,
          enableInsecureRoomNameWarning: false,
          enableWelcomePage: false,
          toolbarButtons: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup',
            'profile', 'chat', 'recording', 'livestreaming',
            'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats',
            'shortcuts', 'tileview', 'download', 'help', 'mute-everyone', 'security'
          ],
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup',
            'profile', 'chat', 'recording', 'livestreaming',
            'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats',
            'shortcuts', 'tileview', 'download', 'help', 'mute-everyone', 'security'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          ENABLE_FEEDBACK_ANIMATION: false,
          RECENT_LIST_ENABLED: false,
          DISPLAY_WELCOME_FOOTER: false,
        }}
        userInfo={{
          displayName: displayName,
          email: localStorage.getItem('userEmail') || undefined,
        }}
        onApiReady={handleApiReady}
        getIFrameRef={(iframeRef) => {
          if (iframeRef) {
            iframeRef.style.height = '70vh';
            iframeRef.style.width = '100%';
          }
        }}
      />
    </div>
  );
};

JitsiMeetComponent.propTypes = {
  roomName: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  onApiReady: PropTypes.func,
};

export default JitsiMeetComponent;