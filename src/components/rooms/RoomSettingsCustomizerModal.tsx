import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Lock,
  Globe,
  Mic,
  Video,
  MessageSquare,
  Share2,
  Users,
  Sliders,
  Check,
  X,
  Sparkles,
  Palette,
  Timer,
  Tag,
  Image,
  Music,
  Info,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { StudyRoom, RoomCustomRules } from '../../types';
import { SCENIC_ROOM_BACKGROUNDS } from '../../data/roomThemes';

const ROOM_PALETTE_PRESETS = [
  { id: 'neon_purple', name: 'Cyber Purple', accent: '#8B5CF6' },
  { id: 'emerald_zen', name: 'Emerald Zen', accent: '#10B981' },
  { id: 'sunset_amber', name: 'Sunset Amber', accent: '#F59E0B' },
  { id: 'ocean_cyan', name: 'Ocean Cyan', accent: '#06B6D4' },
  { id: 'rose_quartz', name: 'Rose Quartz', accent: '#F43F5E' },
];

export interface RoomSettingsCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: StudyRoom;
  onSave?: (updates: Partial<StudyRoom>) => void;
  onUpdateSettings?: (updates: Partial<StudyRoom>) => void;
  onSaveSettings?: (updates: Partial<StudyRoom>) => void;
  onDeleteRoom?: (roomId: string) => void;
  isLead?: boolean;
  onOpenPaletteModal?: () => void;
  onOpenBackgroundModal?: () => void;
}

type TabType = 'general' | 'timer' | 'aesthetics' | 'rules';

export const RoomSettingsCustomizerModal: React.FC<RoomSettingsCustomizerModalProps> = ({
  isOpen,
  onClose,
  room,
  onSave,
  onUpdateSettings,
  onSaveSettings,
  onDeleteRoom,
  isLead = true,
  onOpenPaletteModal,
  onOpenBackgroundModal,
}) => {
  const { deleteRoom } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const defaultRules: RoomCustomRules = {
    micRule: 'always_allowed',
    cameraRule: 'optional',
    chatRule: 'free_chat',
    screenShareRule: 'anyone',
    accessType: room?.rules?.accessType || (room?.isPrivate ? 'private_passcode' : 'public'),
    autoMuteOnJoin: false,
    targetFocusHours: 4,
    sessionMilestoneTopic: room?.subject || 'General Study',
    ...(room?.rules || {}),
  };

  const { showToast } = useApp();
  const [title, setTitle] = useState(room?.title || 'Study Room');
  const [description, setDescription] = useState(room?.description || '');
  const [subject, setSubject] = useState(room?.subject || '');
  const [category, setCategory] = useState(room?.category || 'General Focus');
  const [maxParticipants, setMaxParticipants] = useState(room?.maxParticipants || 15);
  const [passcode, setPasscode] = useState(room?.passcode || '');
  const [tags, setTags] = useState<string[]>(room?.tags || ['focus', 'pomodoro']);
  const [tagInput, setTagInput] = useState('');
  const [rules, setRules] = useState<RoomCustomRules>(defaultRules);

  // Timer defaults safely computed without NaN
  const getInitialFocus = () => {
    const w = room?.timer?.workDuration;
    if (typeof w === 'number' && Number.isFinite(w) && w > 0) return w;
    const f = room?.timer?.focusDuration;
    if (typeof f === 'number' && Number.isFinite(f) && f > 0) return Math.round(f / 60);
    return 50;
  };

  const getInitialBreak = () => {
    const b = room?.timer?.shortBreakDuration;
    if (typeof b === 'number' && Number.isFinite(b) && b > 0) return b;
    const brk = room?.timer?.breakDuration;
    if (typeof brk === 'number' && Number.isFinite(brk) && brk > 0) return Math.round(brk / 60);
    return 10;
  };

  const [focusMinutes, setFocusMinutes] = useState<number>(getInitialFocus);
  const [breakMinutes, setBreakMinutes] = useState<number>(getInitialBreak);

  // Wallpaper & Theme state
  const [customBgUrl, setCustomBgUrl] = useState('');
  const [selectedPresetBg, setSelectedPresetBg] = useState(SCENIC_ROOM_BACKGROUNDS[0]?.imageUrl || '');
  const [selectedAccentColor, setSelectedAccentColor] = useState('#8B5CF6');

  useEffect(() => {
    if (isOpen && room) {
      setTitle(room.title || 'Study Room');
      setDescription(room.description || '');
      setSubject(room.subject || '');
      setCategory(room.category || 'General Focus');
      setMaxParticipants(room.maxParticipants || 15);
      setPasscode(room.passcode || '');
      setTags(room.tags || ['focus', 'pomodoro']);
      if (room.timer) {
        const w = room.timer.workDuration;
        const f = room.timer.focusDuration;
        const validFocus = typeof w === 'number' && Number.isFinite(w) && w > 0 ? w : typeof f === 'number' && Number.isFinite(f) && f > 0 ? Math.round(f / 60) : 50;

        const sb = room.timer.shortBreakDuration;
        const bd = room.timer.breakDuration;
        const validBreak = typeof sb === 'number' && Number.isFinite(sb) && sb > 0 ? sb : typeof bd === 'number' && Number.isFinite(bd) && bd > 0 ? Math.round(bd / 60) : 10;

        setFocusMinutes(validFocus);
        setBreakMinutes(validBreak);
      }
      setRules({
        micRule: 'always_allowed',
        cameraRule: 'optional',
        chatRule: 'free_chat',
        screenShareRule: 'anyone',
        accessType: room.rules?.accessType || (room.isPrivate ? 'private_passcode' : 'public'),
        autoMuteOnJoin: false,
        targetFocusHours: 4,
        sessionMilestoneTopic: room.subject || 'General Study',
        ...(room.rules || {}),
      });
    }
  }, [isOpen, room?.id]);

  if (!isOpen) return null;

  const handlePerformDelete = () => {
    if (onDeleteRoom) {
      onDeleteRoom(room.id);
    } else {
      deleteRoom(room.id);
    }
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const isPrivateComputed = rules.accessType === 'private_passcode' || rules.accessType === 'unlisted';
    const passcodeComputed = rules.accessType === 'private_passcode' ? (passcode.trim() || room?.passcode || '1234') : undefined;

    const updatedRules: RoomCustomRules = {
      ...rules,
      accessType: rules.accessType,
    };

    const updates: Partial<StudyRoom> = {
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim() || 'General Focus',
      category: category as StudyRoom['category'],
      maxParticipants,
      tags,
      isPrivate: isPrivateComputed,
      passcode: passcodeComputed,
      rules: updatedRules,
      timer: {
        ...(room?.timer || { isRunning: false, mode: 'focus', timeLeft: focusMinutes * 60, lastUpdated: Date.now() }),
        focusDuration: focusMinutes * 60,
        breakDuration: breakMinutes * 60,
      },
    };

    if (onSave) {
      onSave(updates);
    } else if (onUpdateSettings) {
      onUpdateSettings(updates);
    } else if (onSaveSettings) {
      onSaveSettings(updates);
    }
    showToast('Room Settings Saved', 'Your study room configuration and access settings were saved.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#171431] border border-[#2E2856] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#26214A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6D28D9]/30 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">Room Settings & Customizer</h2>
                {isLead ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    HOST CONTROLS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-[#A78BFA] border border-purple-500/30 text-[10px] font-bold">
                    VIEW ONLY
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8E8AAB]">
                {isLead
                  ? 'Configure room atmosphere, timer intervals, media policies & access'
                  : 'Active rules and configuration for this study session'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 sm:px-6 pt-3 border-b border-[#26214A] bg-[#110E26]/60 overflow-x-auto scrollbar-none">
          {[
            { id: 'general', label: 'Room Info', icon: Info },
            { id: 'timer', label: 'Timer & Pace', icon: Timer },
            { id: 'aesthetics', label: 'Theme & Wallpapers', icon: Palette },
            { id: 'rules', label: 'Access & Moderation', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 ${
                  active
                    ? 'text-white border-[#8B5CF6] bg-[#1F1A42]'
                    : 'text-[#8E8AAB] border-transparent hover:text-slate-200 hover:bg-[#1A1638]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#A78BFA]' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Title</label>
                <input
                  type="text"
                  disabled={!isLead}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
                  placeholder="e.g. CA Final Silent Focus Room"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Topic</label>
                  <input
                    type="text"
                    disabled={!isLead}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
                    placeholder="e.g. Computer Science, MCAT"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    disabled={!isLead}
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Medical & Bio">Medical & Bio</option>
                    <option value="Math & Physics">Math & Physics</option>
                    <option value="Law & Humanities">Law & Humanities</option>
                    <option value="Language & Arts">Language & Arts</option>
                    <option value="General Focus">General Focus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Room Goals</label>
                <textarea
                  rows={2}
                  disabled={!isLead}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] resize-none disabled:opacity-60"
                  placeholder="Goals for this study room session..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#A78BFA]" />
                  Study Room Tags
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#0D0B1D] border border-[#2E2856]">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-[#231F45] text-[11px] font-bold text-slate-200 border border-[#3A3369] flex items-center gap-1"
                    >
                      #{t}
                      {isLead && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-400 text-slate-400 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {isLead && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type tag & hit Enter..."
                      className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2 py-0.5 min-w-[120px]"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Maximum Capacity
                </label>
                <select
                  disabled={!isLead}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
                >
                  <option value="4">4 Members (Quiet Study Pair / Duo)</option>
                  <option value="8">8 Members (Small Group Focus)</option>
                  <option value="15">15 Members (Standard Hall)</option>
                  <option value="30">30 Members (Lecture Hall)</option>
                  <option value="50">50 Members (Grand Auditorium)</option>
                </select>
              </div>

              {isLead && (
                <div className="pt-4 border-t border-rose-500/20 mt-4 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Danger Zone
                  </span>
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-white">Delete Study Room</p>
                      <p className="text-[11px] text-slate-400">Permanently remove this study room and end the live session for all members.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Room</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMER & POMODORO DEFAULTS */}
          {activeTab === 'timer' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#0D0B1D] border border-[#2E2856] space-y-4">
                <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
                  <Timer className="w-4 h-4" />
                  Group Pomodoro Synchronized Intervals
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Focus Period Duration (Minutes)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="120"
                        disabled={!isLead}
                        value={Number.isFinite(focusMinutes) && focusMinutes > 0 ? focusMinutes : ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setFocusMinutes(Number.isNaN(val) ? 25 : val);
                        }}
                        className="w-full bg-[#171431] border border-[#2E2856] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
                      />
                      <span className="text-xs text-slate-400">mins</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Break Interval Duration (Minutes)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        disabled={!isLead}
                        value={Number.isFinite(breakMinutes) && breakMinutes > 0 ? breakMinutes : ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setBreakMinutes(Number.isNaN(val) ? 5 : val);
                        }}
                        className="w-full bg-[#171431] border border-[#2E2856] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
                      />
                      <span className="text-xs text-slate-400">mins</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { f: 25, b: 5, label: 'Classic 25/5' },
                    { f: 50, b: 10, label: 'Deep Focus 50/10' },
                    { f: 90, b: 15, label: 'Ultradian 90/15' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={!isLead}
                      onClick={() => {
                        setFocusMinutes(preset.f);
                        setBreakMinutes(preset.b);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-xs font-semibold text-slate-200 border border-[#3A3369] transition disabled:opacity-50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEME & WALLPAPERS */}
          {activeTab === 'aesthetics' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Palette & Themes shortcut */}
              <div className="p-4 rounded-2xl bg-[#0D0B1D] border border-[#2E2856] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#A78BFA]" />
                    <h4 className="text-xs font-bold text-white uppercase">Room Accent Colors & Glow</h4>
                  </div>
                  {onOpenPaletteModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPaletteModal();
                      }}
                      className="text-xs text-[#A78BFA] hover:text-white font-bold underline"
                    >
                      Open Full Palette Studio →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROOM_PALETTE_PRESETS.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedAccentColor(p.accent)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                        selectedAccentColor === p.accent
                          ? 'bg-[#6D28D9]/30 border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                          : 'bg-[#171431] border-[#2E2856] hover:border-[#3E3672]'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full shadow-sm shrink-0" style={{ backgroundColor: p.accent }} />
                      <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wallpaper Scene */}
              <div className="p-4 rounded-2xl bg-[#0D0B1D] border border-[#2E2856] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase">Room Background Scene</h4>
                  </div>
                  {onOpenBackgroundModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenBackgroundModal();
                      }}
                      className="text-xs text-emerald-400 hover:text-white font-bold underline"
                    >
                      Browse All Backgrounds →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SCENIC_ROOM_BACKGROUNDS.slice(0, 3).map((bg) => (
                    <div
                      key={bg.id}
                      onClick={() => setSelectedPresetBg(bg.imageUrl)}
                      className={`relative h-18 rounded-xl overflow-hidden border cursor-pointer group ${
                        selectedPresetBg === bg.imageUrl
                          ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                          : 'border-[#2E2856]'
                      }`}
                    >
                      <img src={bg.imageUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-end p-1.5">
                        <span className="text-[10px] font-bold text-white truncate">{bg.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS & RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Access Mode */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Room Access & Privacy
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'public', name: 'Public', desc: 'Listed in directory for anyone', icon: Globe },
                    { id: 'unlisted', name: 'Link Only', desc: 'Only users with room link', icon: Share2 },
                    { id: 'private_passcode', name: 'Passcode PIN', desc: 'Requires 4-digit code', icon: Lock },
                  ].map((acc) => {
                    const Icon = acc.icon;
                    const active = rules.accessType === acc.id;
                    return (
                      <button
                        type="button"
                        key={acc.id}
                        onClick={() => {
                          const newAccess = acc.id as any;
                          setRules((prev) => ({ ...prev, accessType: newAccess }));
                          if (newAccess === 'private_passcode' && !passcode.trim()) {
                            setPasscode(room?.passcode || '1234');
                          }
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer text-left transition flex flex-col justify-between ${
                          active
                            ? 'bg-[#6D28D9]/25 border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                            : 'bg-[#0D0B1D] border-[#26214A] hover:border-[#3B346B]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 w-full">
                          <Icon className={`w-4 h-4 ${active ? 'text-[#A78BFA]' : 'text-slate-400'}`} />
                          {active && <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{acc.name}</h4>
                          <p className="text-[10px] text-[#8E8AAB] line-clamp-1">{acc.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {rules.accessType === 'private_passcode' && (
                  <div className="p-3 rounded-xl bg-[#0D0B1D] border border-[#2E2856] flex items-center gap-3">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Room PIN Code</label>
                      <input
                        type="text"
                        disabled={!isLead}
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="e.g. 7788"
                        className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none mt-0.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Media Policies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#26214A]">
                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Mic className="w-3.5 h-3.5 text-[#A78BFA]" />
                    Microphone Policy
                  </label>
                  <select
                    disabled={!isLead}
                    value={rules.micRule}
                    onChange={(e) => setRules({ ...rules, micRule: e.target.value as any })}
                    className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
                  >
                    <option value="always_allowed">Always Allowed (Open Mic)</option>
                    <option value="break_only">Breaks Only (Strict Silence during Focus)</option>
                    <option value="host_only">Host & Moderators Only</option>
                    <option value="push_to_talk">Push-To-Talk Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                    Camera Policy
                  </label>
                  <select
                    disabled={!isLead}
                    value={rules.cameraRule}
                    onChange={(e) => setRules({ ...rules, cameraRule: e.target.value as any })}
                    className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
                  >
                    <option value="optional">Optional (Camera / Avatar)</option>
                    <option value="recommended">Recommended Cam-On</option>
                    <option value="strictly_required">Strictly Required (Accountability)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    Room Chat Policy
                  </label>
                  <select
                    disabled={!isLead}
                    value={rules.chatRule}
                    onChange={(e) => setRules({ ...rules, chatRule: e.target.value as any })}
                    className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"
                  >
                    <option value="free_chat">Free Real-Time Chat</option>
                    <option value="break_only">Breaks Only (Chat paused during focus)</option>
                    <option value="slow_mode">Slow Mode (10s cooldown)</option>
                    <option value="disabled">Disabled (Pure Silence)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center justify-between w-full p-3 rounded-xl bg-[#0D0B1D] border border-[#26214A] cursor-pointer text-xs">
                    <span className="text-slate-300 font-semibold">Auto-mute on join</span>
                    <input
                      type="checkbox"
                      disabled={!isLead}
                      checked={rules.autoMuteOnJoin}
                      onChange={(e) => setRules({ ...rules, autoMuteOnJoin: e.target.checked })}
                      className="rounded accent-[#8B5CF6] w-4 h-4 cursor-pointer disabled:opacity-50"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#26214A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {isLead && (
                showDeleteConfirm ? (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Delete room?
                    </span>
                    <button
                      type="button"
                      onClick={handlePerformDelete}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 rounded-lg bg-[#231F45] text-slate-300 text-xs font-semibold hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Room</span>
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-xs font-bold text-slate-300 transition"
              >
                Cancel
              </button>

              {isLead && (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-xs font-bold text-white transition shadow-lg shadow-purple-900/40"
                >
                  Save Room Settings
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
