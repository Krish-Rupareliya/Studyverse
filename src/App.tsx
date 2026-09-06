import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingView } from './components/onboarding/OnboardingView';
import { StudyverseSidebar, AppView } from './components/common/StudyverseSidebar';
import { StudyverseMobileBottomNav } from './components/common/StudyverseMobileBottomNav';
import { StudyverseRightSidebar } from './components/common/StudyverseRightSidebar';
import { HomeView } from './components/home/HomeView';
import { RoomsDirectoryView } from './components/rooms/RoomsDirectoryView';
import { ActiveStudyRoomView } from './components/rooms/ActiveStudyRoomView';
import { RoomPasscodeModal } from './components/rooms/RoomPasscodeModal';
import { StudyStatsView } from './components/stats/StudyStatsView';
import { FriendsView } from './components/friends/FriendsView';
import { DirectMessagesView } from './components/messages/DirectMessagesView';
import { WorkspaceView } from './components/workspace/WorkspaceView';
import { FeedView } from './components/feed/FeedView';
import { ProfileView } from './components/profile/ProfileView';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { ToastContainer } from './components/common/ToastContainer';
import { StudyRoom } from './types';

const AppGate: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return <OnboardingView />;
  return <MainAppContent />;
};

const MainAppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { rooms, activeRoom, joinRoom } = useApp();

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string>(currentUser?.username || '');
  const [selectedDmRecipientId, setSelectedDmRecipientId] = useState<string | null>(null);
  const [autoStartDmCall, setAutoStartDmCall] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Locked room access state
  const [passcodeModalRoom, setPasscodeModalRoom] = useState<StudyRoom | null>(null);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // Keyboard shortcut listener for Global Search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenProfile = (username: string) => {
    setSelectedProfileUsername(username);
    setCurrentView('profile');
  };

  const handleOpenDirectMessage = (userId: string, startVideoCall = false) => {
    setSelectedDmRecipientId(userId);
    setAutoStartDmCall(startVideoCall);
    setCurrentView('messages');
  };

  const handleJoinRoom = (roomId: string, passcode?: string) => {
    const targetRoom = (rooms || []).find(
      (r) =>
        r.id.toLowerCase() === roomId.toLowerCase() ||
        r.code.toLowerCase() === roomId.toLowerCase()
    );

    if (!targetRoom) return;

    const isHost = targetRoom.hostId === currentUser?.id;
    const isAlreadyMember = (targetRoom.participants || []).some((p) => p.userId === currentUser?.id);

    const effectiveAccessType = targetRoom.rules?.accessType || (targetRoom.isPrivate ? 'private_passcode' : 'public');
    const isPasscodeProtected =
      (targetRoom.isPrivate || effectiveAccessType === 'private_passcode') &&
      effectiveAccessType !== 'public' &&
      Boolean(targetRoom.passcode) &&
      targetRoom.passcode.trim() !== '';

    // Prompt for passcode modal if room is locked and user is not host or member
    if (isPasscodeProtected && !isHost && !isAlreadyMember && !passcode) {
      setPasscodeModalRoom(targetRoom);
      setPasscodeError(null);
      return;
    }

    const success = joinRoom(targetRoom.id, passcode);
    if (success) {
      setPasscodeModalRoom(null);
      setPasscodeError(null);
      setCurrentView('room_active');
    } else {
      if (isPasscodeProtected && !isHost && !isAlreadyMember) {
        setPasscodeError('Incorrect 4-digit PIN. Please try again.');
      }
    }
  };

  // If in active study room, render fullscreen view matching Screenshots 1, 2, 3, 4
  if (currentView === 'room_active') {
    if (!activeRoom) {
      // Fallback if activeRoom is not selected
      setCurrentView('rooms');
      return null;
    }

    return (
      <div className="min-h-screen bg-[#0D0B1D] text-slate-100 flex flex-col font-sans select-none">
        <ActiveStudyRoomView
          onLeaveRoom={() => setCurrentView('rooms')}
          onNavigateProfile={handleOpenProfile}
          onNavigateDirectMessage={handleOpenDirectMessage}
        />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0B1D] text-slate-100 flex flex-col font-sans selection:bg-[#6D28D9] selection:text-white">
      {/* Main Studyverse Layout: Left Navigation Rail + Central View + Right Widget Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Navigation Rail */}
        <StudyverseSidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenProfile={handleOpenProfile}
        />

        {/* Central Dynamic Content Area */}
        <main className="flex-1 flex overflow-y-auto">
          {currentView === 'home' && (
            <HomeView
              onJoinRoom={handleJoinRoom}
              onNavigateProfile={handleOpenProfile}
              onCreateRoomModal={() => setCurrentView('rooms')}
            />
          )}

          {currentView === 'rooms' && (
            <RoomsDirectoryView
              onJoinRoom={handleJoinRoom}
              onNavigateProfile={handleOpenProfile}
            />
          )}

          {currentView === 'stats' && <StudyStatsView />}

          {currentView === 'friends' && (
            <div className="flex-1 p-6 md:p-8 bg-[#0D0B1D] overflow-y-auto">
              <FriendsView
                onNavigateProfile={handleOpenProfile}
                onNavigateDirectMessage={handleOpenDirectMessage}
                onNavigateRoom={handleJoinRoom}
              />
            </div>
          )}

          {currentView === 'messages' && (
            <div className="flex-1 p-6 md:p-8 bg-[#0D0B1D] overflow-y-auto">
              <DirectMessagesView
                initialRecipientId={selectedDmRecipientId}
                autoStartCall={autoStartDmCall}
                onNavigateProfile={handleOpenProfile}
                onNavigateRoom={handleJoinRoom}
              />
            </div>
          )}

          {currentView === 'workspace' && (
            <div className="flex-1 p-6 md:p-8 bg-[#0D0B1D] overflow-y-auto">
              <WorkspaceView />
            </div>
          )}

          {currentView === 'feed' && (
            <div className="flex-1 p-6 md:p-8 bg-[#0D0B1D] overflow-y-auto">
              <FeedView
                onNavigateProfile={handleOpenProfile}
                onNavigateRoom={handleJoinRoom}
              />
            </div>
          )}

          {currentView === 'profile' && (
            <div className="flex-1 p-6 md:p-8 bg-[#0D0B1D] overflow-y-auto">
              <ProfileView
                username={selectedProfileUsername}
                onNavigateProfile={handleOpenProfile}
                onNavigateDirectMessage={handleOpenDirectMessage}
                onNavigateRoom={handleJoinRoom}
              />
            </div>
          )}
        </main>

        {/* Right Sidebar Widget (Achievements, Suggested Friends, My Friends) */}
        {(currentView === 'home' || currentView === 'rooms' || currentView === 'stats') && (
          <StudyverseRightSidebar
            onNavigateProfile={handleOpenProfile}
            onNavigateRoom={handleJoinRoom}
            onNavigateDirectMessage={handleOpenDirectMessage}
          />
        )}
      </div>

      {/* Responsive Mobile Bottom Navigation Rail */}
      <StudyverseMobileBottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenProfile={handleOpenProfile}
      />

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigateProfile={handleOpenProfile}
        onNavigateRoom={handleJoinRoom}
        onNavigateDirectMessage={handleOpenDirectMessage}
      />

      {/* Passcode / PIN Entry Modal for Locked Rooms */}
      {passcodeModalRoom && (
        <RoomPasscodeModal
          room={passcodeModalRoom}
          onClose={() => {
            setPasscodeModalRoom(null);
            setPasscodeError(null);
          }}
          onSubmitPasscode={(passcode) => handleJoinRoom(passcodeModalRoom.id, passcode)}
          errorNotice={passcodeError}
        />
      )}
      {/* Toast Feedback Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppGate />
      </AppProvider>
    </AuthProvider>
  );
}
