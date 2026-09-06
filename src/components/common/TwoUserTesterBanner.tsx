import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Sparkles, X } from 'lucide-react';

export const TwoUserTesterBanner: React.FC = () => {
  const { currentUser, users, switchUser } = useAuth();
  const { notifications, getUnreadMessagesCount } = useApp();
  const [showGuide, setShowGuide] = useState(false);

  const getUnreadFor = (userId: string) => {
    const notifs = notifications.filter((n) => n.recipientId === userId && !n.isRead).length;
    const dms = getUnreadMessagesCount(userId);
    return notifs + dms;
  };

  const aUnread = getUnreadFor('user_alex');
  const bUnread = getUnreadFor('user_bella');
  const cUnread = getUnreadFor('user_marcus');

  return (
    <div id="two-user-tester-banner" className="bg-slate-900 border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between text-xs gap-2">
        {/* Left: Active Simulation Status */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-1.5 font-medium text-slate-200">
            <span className="text-emerald-400 font-semibold hidden md:inline">Multi-User Sync: Live</span>
            <span className="text-slate-400 hidden xs:inline">• Persona:</span>
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              className="w-4 sm:w-5 h-4 sm:h-5 rounded-full object-cover ring-1 ring-indigo-500 shrink-0"
            />
            <span className="font-semibold text-indigo-300 truncate max-w-[70px] sm:max-w-none">{currentUser?.name || 'Alex'}</span>
            <span className="text-slate-400 hidden sm:inline">(@{currentUser?.username || 'alex'})</span>
          </div>
        </div>

        {/* Center: Instant 1-Click User Switcher */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-slate-400 hidden md:inline font-medium">Quick Switch:</span>

          {/* Button for User A */}
          <button
            id="switch-to-user-a-btn"
            onClick={() => switchUser('user_alex')}
            className={`px-2 sm:px-2.5 py-1 rounded-md flex items-center gap-1 transition text-[11px] sm:text-xs shrink-0 ${
              currentUser?.id === 'user_alex'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Alex</span>
            {aUnread > 0 && (
              <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-bold">
                {aUnread}
              </span>
            )}
          </button>

          {/* Button for User B */}
          <button
            id="switch-to-user-b-btn"
            onClick={() => switchUser('user_bella')}
            className={`px-2 sm:px-2.5 py-1 rounded-md flex items-center gap-1 transition text-[11px] sm:text-xs shrink-0 ${
              currentUser?.id === 'user_bella'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Bella</span>
            {bUnread > 0 && (
              <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-bold">
                {bUnread}
              </span>
            )}
          </button>

          {/* Button for User C */}
          <button
            id="switch-to-user-c-btn"
            onClick={() => switchUser('user_marcus')}
            className={`px-2 sm:px-2.5 py-1 rounded-md flex items-center gap-1 transition text-[11px] sm:text-xs hidden sm:flex shrink-0 ${
              currentUser?.id === 'user_marcus'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Marcus</span>
            {cUnread > 0 && (
              <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-bold">
                {cUnread}
              </span>
            )}
          </button>
        </div>

        {/* Right: Two-User Journey Guide Modal Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="open-two-user-guide-btn"
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1 text-slate-300 hover:text-indigo-300 bg-slate-800/80 hover:bg-slate-800 px-2 sm:px-2.5 py-1 rounded-md transition border border-slate-700/60 text-[11px] sm:text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium hidden sm:inline">2-User Guide</span>
            <span className="font-medium sm:hidden">Guide</span>
          </button>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <ShieldCheck className="w-5 h-5" />
                <span>Two-User Core Journey Verification</span>
              </div>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              StudySpace is engineered for seamless social-studying collaboration. Use the top switcher to flip between <strong>User A (Alex)</strong> and <strong>User B (Bella)</strong> (or open a 2nd tab) to verify each step:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-slate-900 block font-semibold">Search & Profile Discovery</strong>
                  <span className="text-slate-600">As Alex, search <code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-800 font-mono">bella_codes</code> in the top search bar, click her profile, and send a Friend Request.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-slate-900 block font-semibold">Instant Notification & Accept</strong>
                  <span className="text-slate-600">Switch to User B (Bella). Notice the notification badge. Open Notifications or Friends tab, and click <strong>Accept</strong>.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-slate-900 block font-semibold">Direct Messaging</strong>
                  <span className="text-slate-600">Open DMs between Alex & Bella. Send messages and verify instant receipt.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">4</span>
                <div>
                  <strong className="text-slate-900 block font-semibold">Study Room Creation & Invite</strong>
                  <span className="text-slate-600">As Alex, create a study room or enter CS61A, click <strong>Invite Friends</strong>, and invite Bella. Switch to Bella and click <strong>Join Room</strong> directly from the invite card!</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">5</span>
                <div>
                  <strong className="text-slate-900 block font-semibold">Camera, Mic & Screen Sharing</strong>
                  <span className="text-slate-600">Toggle camera and mic in room. Click <strong>Share Screen</strong> to project browser tabs or code editor. Use synchronized Pomodoro timer & collaborative study notes!</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="close-two-user-guide-btn"
                onClick={() => setShowGuide(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition shadow-xs"
              >
                Got it, let's study!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
