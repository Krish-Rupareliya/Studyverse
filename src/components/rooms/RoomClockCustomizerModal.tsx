import React, { useState, useEffect } from 'react';
import {
  Clock,
  Timer,
  User,
  Users,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  X,
  Play,
  RotateCcw,
  Sliders,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import { useApp, playChime } from '../../context/AppContext';

export type ClockPriority = 'group' | 'personal';
export type ClockDisplayStyle = 'digital' | 'minimal' | 'ring' | 'flip' | 'analog';
export type AlertSoundChoice = 'zen_gong' | 'soft_chime' | 'digital_beep' | 'bell' | 'silent';

export interface ClockSettings {
  priority: ClockPriority;
  style: ClockDisplayStyle;
  alertSound: AlertSoundChoice;
  showLocalTime: boolean;
  showMicroSeconds: boolean;
  personalWorkMinutes: number;
  personalBreakMinutes: number;
  autoStartBreaks: boolean;
  ambientGlow: boolean;
}

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  priority: 'group',
  style: 'digital',
  alertSound: 'soft_chime',
  showLocalTime: true,
  showMicroSeconds: false,
  personalWorkMinutes: 25,
  personalBreakMinutes: 5,
  autoStartBreaks: false,
  ambientGlow: true,
};

export interface RoomClockCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClockSettings;
  onSaveSettings?: (settings: ClockSettings) => void;
  onUpdateSettings?: (settings: ClockSettings) => void;
  groupTimeLeft?: number;
  groupMode?: 'focus' | 'break';
  isLead?: boolean;
  onTriggerSoundTest?: (sound: AlertSoundChoice) => void;
}

export const RoomClockCustomizerModal: React.FC<RoomClockCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onUpdateSettings,
  groupTimeLeft = 1500,
  groupMode = 'focus',
  isLead = true,
  onTriggerSoundTest,
}) => {
  const { showToast } = useApp();
  const [current, setCurrent] = useState<ClockSettings>({ ...settings });

  // Update current state if modal opens
  useEffect(() => {
    if (isOpen && settings) {
      setCurrent({ ...settings });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestSound = (sound: AlertSoundChoice) => {
    if (sound === 'silent') return;
    if (onTriggerSoundTest) {
      onTriggerSoundTest(sound);
    } else {
      playChime('timer_complete');
    }
  };

  const handleSave = () => {
    if (onSaveSettings) {
      onSaveSettings(current);
    } else if (onUpdateSettings) {
      onUpdateSettings(current);
    }
    showToast('Timer Settings Saved', 'Your timer preferences and alert settings were updated successfully.', 'success');
    onClose();
  };

  const styleOptions: { id: ClockDisplayStyle; name: string; desc: string; icon: string }[] = [
    { id: 'digital', name: 'Digital LED', desc: 'High-visibility illuminated numeric clock', icon: '📟' },
    { id: 'minimal', name: 'Minimalist Clean', desc: 'Serene low-distraction typographic display', icon: '✨' },
    { id: 'ring', name: 'Zen Circular Ring', desc: 'Animated progress circle with radial countdown', icon: '⭕' },
    { id: 'flip', name: 'Flip Clock Board', desc: 'Classic mechanical split-flap aesthetic', icon: '🔄' },
    { id: 'analog', name: 'Analog Dial', desc: 'Smooth clock hands with hour markers', icon: '🕒' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#171431] border border-[#2E2856] rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#26214A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6D28D9]/30 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA]">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Clock & Timer Settings</h2>
              <p className="text-xs text-[#8E8AAB]">Choose your timer priority & visual clock theme</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. PRIORITY SELECTION: Group Room Timer vs. Personal Timer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Timer Authority & Priority
              </label>
              <span className="text-[11px] text-[#8E8AAB]">
                {current.priority === 'group' ? 'Syncing with Room' : 'Independent Personal Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Group Room Timer */}
              <div
                onClick={() => setCurrent({ ...current, priority: 'group' })}
                className={`p-4 rounded-2xl border cursor-pointer transition relative ${
                  current.priority === 'group'
                    ? 'bg-[#6D28D9]/20 border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                    : 'bg-[#0D0B1D] border-[#26214A] hover:border-[#3B346B]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#A78BFA]" />
                    <span className="font-bold text-sm text-white">Room Group Timer</span>
                  </div>
                  {current.priority === 'group' && (
                    <div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#8E8AAB] leading-relaxed">
                  Synchronizes time with the room host and other members for unified group focus sprints.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Room: {Math.floor(groupTimeLeft / 60)}:{(groupTimeLeft % 60).toString().padStart(2, '0')} ({groupMode})
                </div>
              </div>

              {/* Option B: Personal Independent Timer */}
              <div
                onClick={() => setCurrent({ ...current, priority: 'personal' })}
                className={`p-4 rounded-2xl border cursor-pointer transition relative ${
                  current.priority === 'personal'
                    ? 'bg-[#6D28D9]/20 border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                    : 'bg-[#0D0B1D] border-[#26214A] hover:border-[#3B346B]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">My Personal Clock</span>
                  </div>
                  {current.priority === 'personal' && (
                    <div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#8E8AAB] leading-relaxed">
                  Follow your own private pace and custom study intervals regardless of the group's timer.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-[#A78BFA] font-semibold bg-[#231F45] px-2.5 py-1 rounded-lg w-fit">
                  Custom: {current.personalWorkMinutes}m Focus / {current.personalBreakMinutes}m Break
                </div>
              </div>
            </div>
          </div>

          {/* 2. PERSONAL TIMER CUSTOMIZATION (If personal selected or configured) */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#0D0B1D] border border-[#26214A]">
            <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Custom Pomodoro Durations
            </span>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: '25 / 5 (Classic)', work: 25, brk: 5 },
                { label: '50 / 10 (Deep Flow)', work: 50, brk: 10 },
                { label: '90 / 20 (Ultradian)', work: 90, brk: 20 },
                { label: '15 / 3 (Quick Sprint)', work: 15, brk: 3 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setCurrent({
                      ...current,
                      personalWorkMinutes: p.work,
                      personalBreakMinutes: p.brk,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    current.personalWorkMinutes === p.work && current.personalBreakMinutes === p.brk
                      ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                      : 'bg-[#171431] text-[#8E8AAB] border-[#2E2856] hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Manual Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>Focus Sprint</span>
                  <span className="font-bold text-[#A78BFA]">{current.personalWorkMinutes} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={Number.isFinite(current.personalWorkMinutes) && current.personalWorkMinutes > 0 ? current.personalWorkMinutes : 25}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setCurrent({ ...current, personalWorkMinutes: Number.isNaN(val) ? 25 : val });
                  }}
                  className="w-full accent-[#8B5CF6] h-1.5 bg-[#231F45] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>Rest Break</span>
                  <span className="font-bold text-emerald-400">{current.personalBreakMinutes || 5} mins</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="45"
                  step="1"
                  value={Number.isFinite(current.personalBreakMinutes) && current.personalBreakMinutes > 0 ? current.personalBreakMinutes : 5}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setCurrent({ ...current, personalBreakMinutes: Number.isNaN(val) ? 5 : val });
                  }}
                  className="w-full accent-emerald-500 h-1.5 bg-[#231F45] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. VISUAL CLOCK STYLES */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Clock Display Theme & Visuals
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {styleOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setCurrent({ ...current, style: opt.id })}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    current.style === opt.id
                      ? 'bg-[#6D28D9]/25 border-[#8B5CF6] text-white ring-2 ring-[#8B5CF6]/30'
                      : 'bg-[#0D0B1D] border-[#26214A] text-[#8E8AAB] hover:border-[#3B346B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{opt.icon}</span>
                    {current.style === opt.id && (
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{opt.name}</h4>
                    <p className="text-[10px] text-[#8E8AAB] mt-0.5 line-clamp-1">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. SOUND ALERTS & AMBIENCE TOGGLES */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              Completion Sound & Alerts
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'soft_chime', name: 'Crystal Chime' },
                { id: 'zen_gong', name: 'Tibetan Gong' },
                { id: 'digital_beep', name: 'Digital Beep' },
                { id: 'silent', name: 'Silent Flash' },
              ].map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => {
                    setCurrent({ ...current, alertSound: snd.id as AlertSoundChoice });
                    handleTestSound(snd.id as AlertSoundChoice);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
                    current.alertSound === snd.id
                      ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                      : 'bg-[#0D0B1D] text-[#8E8AAB] border-[#26214A] hover:text-white'
                  }`}
                >
                  <span>{snd.name}</span>
                  {snd.id !== 'silent' ? (
                    <Volume2 className="w-3 h-3 shrink-0 opacity-70" />
                  ) : (
                    <VolumeX className="w-3 h-3 shrink-0 opacity-70" />
                  )}
                </button>
              ))}
            </div>

            {/* Extra Toggles */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0D0B1D] border border-[#26214A] cursor-pointer">
                <span className="text-slate-300">Show Local Time Clock</span>
                <input
                  type="checkbox"
                  checked={current.showLocalTime}
                  onChange={(e) => setCurrent({ ...current, showLocalTime: e.target.checked })}
                  className="rounded accent-[#8B5CF6] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0D0B1D] border border-[#26214A] cursor-pointer">
                <span className="text-slate-300">Ambient Glow Aura</span>
                <input
                  type="checkbox"
                  checked={current.ambientGlow}
                  onChange={(e) => setCurrent({ ...current, ambientGlow: e.target.checked })}
                  className="rounded accent-[#8B5CF6] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#26214A] flex items-center justify-between bg-[#131129]">
          <button
            onClick={() => setCurrent(DEFAULT_CLOCK_SETTINGS)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-[#8E8AAB] hover:text-white transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-xs font-bold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-xs font-bold text-white transition shadow-lg shadow-purple-900/40"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
