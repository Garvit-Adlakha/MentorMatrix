import React, { useEffect, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { IconLoader2, IconUserCircle, IconAlertCircle } from '../ui/Icons';

const JitsiMeetComponent = ({
  roomName,
  displayName,
  onApiReady,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  
  const handleApiReady = (api) => {
    setIsLoading(false);
    
    // Handle authentication issues
    api.addEventListener('participantRoleChanged', (event) => {
      if (event.role === 'moderator') {
        api.executeCommand('toggleLobby', true);
      }
    });

    api.addEventListener('videoConferenceJoined', () => {
      setAuthError(false);
    });

    api.addEventListener('passwordRequired', () => {
      setAuthError(true);
    });

    // Add a custom handler for authentication errors
    api.addEventListener('errorOccurred', (error) => {
      if (error.name === 'connection.passwordRequired' || 
          error.message?.includes('authenticated') || 
          error.message?.includes('authentication')) {
        setAuthError(true);
      }
    });

    if (onApiReady) {
      onApiReady(api);
    }
  };

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
      
      {authError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md text-center border border-gray-700">
            <IconAlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-100">Waiting for authentication</h3>
            <p className="text-gray-300 mb-4">
              The conference is waiting for an authenticated user or moderator to join.
              Please wait for the host to admit you or try refreshing the page.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-6">
              <IconUserCircle className="w-5 h-5" />
              <span>Joining as: {displayName}</span>
            </div>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
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
          // Add authentication settings
          enableUserRolesBasedOnToken: true,
          enableFeaturesBasedOnToken: true,
          // Make lobby more user-friendly
          enableLobbyChat: true,
          noticeMessage: 'Waiting for the host to let you in...',
          // Give users proper feedback
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

export default JitsiMeetComponent;