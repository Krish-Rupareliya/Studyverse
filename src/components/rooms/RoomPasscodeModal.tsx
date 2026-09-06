import React, { useState } from 'react';
import { Lock, X, KeyRound, ShieldAlert } from 'lucide-react';
import { StudyRoom } from '../../types';

interface RoomPasscodeModalProps {
  room: StudyRoom;
  onClose: () => void;
  onSubmitPasscode: (passcode: string) => void;
  errorNotice?: string | null;
}

export const RoomPasscodeModal: React.FC<RoomPasscodeModalProps> = ({
  room,
  onClose,
  onSubmitPasscode,
  errorNotice,
}) => {
  const [passcode, setPasscode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    onSubmitPasscode(passcode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#171431] border border-[#2E2856] rounded-3xl p-6 w-full max-w-md space-y-5 text-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26214A] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Passcode Required</h3>
              <p className="text-xs text-[#8E8AAB]">This room is passcode protected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room Info Preview */}
        <div className="p-3.5 bg-[#0D0B1D] border border-[#26214A] rounded-2xl flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h4 className="text-sm font-bold text-white truncate">{room.title}</h4>
            <span className="text-[11px] font-semibold text-[#A78BFA]">{room.subject || room.category}</span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>LOCKED</span>
          </div>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#8E8AAB] uppercase tracking-wider">
              Enter 4-Digit Room PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8E8AAB] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                maxLength={8}
                autoFocus
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter PIN..."
                className="w-full bg-[#0D0B1D] border border-[#2E2856] focus:border-[#8B5CF6] rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest text-white placeholder-[#8E8AAB] focus:outline-none transition"
              />
            </div>
            {errorNotice && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26214A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8E8AAB] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/40 transition cursor-pointer"
            >
              Enter Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
