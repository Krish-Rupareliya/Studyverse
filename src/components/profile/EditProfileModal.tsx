import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  AtSign,
  Check,
  X,
  AlertCircle,
  Sparkles,
  User,
  Image as ImageIcon,
  GraduationCap,
  BookOpen,
  Upload,
  RefreshCw,
  Camera,
} from 'lucide-react';

export const AVATAR_PRESETS = [
  {
    id: 'avatar_1',
    name: 'Alex (Scholar)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_2',
    name: 'Bella (Anime Vibe)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_3',
    name: 'Marcus (Dev Focus)',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_4',
    name: 'Chloe (Lo-Fi Study)',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_5',
    name: 'Devin (Tech Geek)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_6',
    name: 'Sophia (Bio-Med)',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newUsername: string) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, updateCurrentUserProfile, isUsernameAvailable, users } = useAuth();
  const { showToast } = useApp();

  const [usernameInput, setUsernameInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const [universityInput, setUniversityInput] = useState('');
  const [majorInput, setMajorInput] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [interestsList, setInterestsList] = useState<string[]>([]);
  const [newInterestTag, setNewInterestTag] = useState('');
  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'idle'; text: string }>({
    type: 'idle',
    text: '',
  });

  useEffect(() => {
    if (currentUser && isOpen) {
      setUsernameInput(currentUser.username || '');
      setDisplayNameInput(currentUser.name || '');
      setBioInput(currentUser.bio || '');
      setAvatarUrlInput(currentUser.avatar || '');
      setBannerUrlInput(currentUser.banner || '');
      setUniversityInput(currentUser.university || 'Stanford University');
      setMajorInput(currentUser.major || 'Computer Science');
      setYearInput(currentUser.year || 'Senior');
      setInterestsList(currentUser.interests || ['Computer Science', 'Algorithms', 'AI/ML']);
      setStatusMessage({ type: 'idle', text: '' });
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const cleanUsername = usernameInput.trim().toLowerCase().replace(/^@/, '');
  const isValidFormat = /^[a-z0-9_]{3,20}$/.test(cleanUsername);
  const isChanged = cleanUsername !== currentUser.username.toLowerCase();
  const isAvailable =
    !isChanged ||
    (typeof isUsernameAvailable === 'function'
      ? isUsernameAvailable(cleanUsername, currentUser.id)
      : !users.some((u) => u.username.toLowerCase() === cleanUsername && u.id !== currentUser.id));

  const handleAvatarPreset = (url: string) => {
    setAvatarUrlInput(url);
    setSelectedAvatarPreset(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrlInput(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayNameInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Display name cannot be empty.' });
      return;
    }

    if (!isValidFormat) {
      setStatusMessage({
        type: 'error',
        text: 'Username must be 3-20 characters long and contain only letters, numbers, or underscores.',
      });
      return;
    }

    if (isChanged && !isAvailable) {
      setStatusMessage({
        type: 'error',
        text: `Username @${cleanUsername} is already claimed by another user.`,
      });
      return;
    }

    // Apply updates
    updateCurrentUserProfile({
      name: displayNameInput.trim(),
      username: cleanUsername,
      bio: bioInput.trim(),
      avatar: avatarUrlInput.trim() || currentUser.avatar,
      banner: bannerUrlInput.trim() || currentUser.banner,
      university: universityInput.trim() || 'Stanford University',
      major: majorInput.trim() || 'Computer Science',
      year: yearInput.trim() || 'Senior',
      joinedDate: currentUser.joinedDate || 'September 2024',
      interests: interestsList,
    });

    showToast('Profile Updated', 'Your profile details and changes were saved successfully.', 'success');
    setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    setTimeout(() => {
      onSuccess?.(cleanUsername);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-[#131129] border border-[#2E2856] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#231F45] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6D28D9]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                <span>Edit Profile & Username</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-[#8E8AAB]">Customize your photo, handle, university, and bio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 scrollbar-none">
          {/* Avatar Section */}
          <div className="p-3.5 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Profile Avatar</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatarUrlInput || currentUser.avatar}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#8B5CF6] shadow-lg"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 bg-[#171431] border border-[#2E2856] text-white px-3 py-1.5 rounded-xl text-xs placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6]"
                  />
                  <label className="px-3 py-1.5 bg-[#231F45] hover:bg-[#352F64] text-[#A78BFA] hover:text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Avatar Preset Bubbles */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                  <span className="text-[10px] text-[#8E8AAB] shrink-0">Presets:</span>
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleAvatarPreset(preset.url)}
                      className={`w-7 h-7 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        avatarUrlInput === preset.url
                          ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/50'
                          : 'border-transparent hover:border-[#6D28D9]'
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8E8AAB]" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full bg-[#1C1938] border border-[#2E2856] focus:border-[#8B5CF6] text-white px-3.5 py-2.5 rounded-xl text-xs placeholder-[#8E8AAB] focus:outline-none transition"
            />
          </div>

          {/* Username Handle Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Username Handle</span>
              </span>
              <span className="text-[11px] text-[#8E8AAB]">
                {cleanUsername.length}/20 chars
              </span>
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8AAB] font-bold text-xs">
                @
              </span>
              <input
                type="text"
                value={usernameInput.replace(/^@/, '')}
                onChange={(e) => {
                  setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  setStatusMessage({ type: 'idle', text: '' });
                }}
                placeholder="username"
                className={`w-full bg-[#1C1938] border pl-8 pr-10 py-2.5 rounded-xl text-xs font-medium text-white focus:outline-none transition ${
                  !cleanUsername
                    ? 'border-[#2E2856]'
                    : !isValidFormat
                    ? 'border-rose-500/70 focus:border-rose-500'
                    : isAvailable
                    ? 'border-emerald-500/70 focus:border-emerald-500'
                    : 'border-rose-500/70 focus:border-rose-500'
                }`}
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {cleanUsername &&
                  (isValidFormat && isAvailable ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  ))}
              </div>
            </div>

            <div className="pt-0.5">
              {!cleanUsername ? (
                <p className="text-[10px] text-[#8E8AAB]">
                  Must be 3-20 letters, numbers, and underscores (a-z, 0-9, _).
                </p>
              ) : !isValidFormat ? (
                <p className="text-[10px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Only lowercase letters, numbers, and underscores (3-20 chars).</span>
                </p>
              ) : isAvailable ? (
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3 shrink-0" />
                  <span>@{cleanUsername} is available!</span>
                </p>
              ) : (
                <p className="text-[10px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>@{cleanUsername} is already taken. Try another handle.</span>
                </p>
              )}
            </div>
          </div>

          {/* University, Major, Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#8E8AAB]" />
                <span>University / Institution</span>
              </label>
              <input
                type="text"
                value={universityInput}
                onChange={(e) => setUniversityInput(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full bg-[#1C1938] border border-[#2E2856] focus:border-[#8B5CF6] text-white px-3.5 py-2.5 rounded-xl text-xs placeholder-[#8E8AAB] focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#8E8AAB]" />
                <span>Major / Program</span>
              </label>
              <input
                type="text"
                value={majorInput}
                onChange={(e) => setMajorInput(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full bg-[#1C1938] border border-[#2E2856] focus:border-[#8B5CF6] text-white px-3.5 py-2.5 rounded-xl text-xs placeholder-[#8E8AAB] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Academic Year & Banner URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#8E8AAB]" />
                <span>Academic Standing</span>
              </label>
              <select
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                className="w-full bg-[#1C1938] border border-[#2E2856] focus:border-[#8B5CF6] text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition"
              >
                <option value="Freshman">Freshman (1st Year)</option>
                <option value="Sophomore">Sophomore (2nd Year)</option>
                <option value="Junior">Junior (3rd Year)</option>
                <option value="Senior">Senior (4th Year)</option>
                <option value="Graduate">Graduate / Master's</option>
                <option value="PhD Candidate">PhD Candidate</option>
                <option value="Self-Taught Scholar">Self-Taught Scholar</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#8E8AAB]" />
                <span>Cover Banner URL</span>
              </label>
              <input
                type="text"
                value={bannerUrlInput}
                onChange={(e) => setBannerUrlInput(e.target.value)}
                placeholder="https://... (Optional banner URL)"
                className="w-full bg-[#1C1938] border border-[#2E2856] focus:border-[#8B5CF6] text-white px-3.5 py-2.5 rounded-xl text-xs placeholder-[#8E8AAB] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Bio / Study Goals */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#8E8AAB]" />
              <span>Short Bio & Study Focus</span>
            </label>
            <textarea
              rows={2}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="e.g. Daily focus on algorithms & system design. Pomodoro fan!"
              className="w-full bg-[#1C1938] border border-[#2E2856] focus:border-[#8B5CF6] text-white px-3.5 py-2 rounded-xl text-xs placeholder-[#8E8AAB] focus:outline-none transition resize-none"
            />
          </div>

          {/* Interest Tags */}
          <div className="space-y-2 p-3 bg-[#0D0B1D] border border-[#26214A] rounded-2xl">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Focus Subjects & Interests</span>
              </span>
              <span className="text-[10px] text-[#8E8AAB]">Type tag + Enter</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newInterestTag}
                onChange={(e) => setNewInterestTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newInterestTag.trim() && !interestsList.includes(newInterestTag.trim())) {
                      setInterestsList([...interestsList, newInterestTag.trim()]);
                      setNewInterestTag('');
                    }
                  }
                }}
                placeholder="Add subject (e.g. AI/ML, MCAT, Calculus)..."
                className="flex-1 bg-[#171431] border border-[#2E2856] focus:border-[#8B5CF6] text-white px-3 py-1.5 rounded-xl text-xs placeholder-[#8E8AAB] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (newInterestTag.trim() && !interestsList.includes(newInterestTag.trim())) {
                    setInterestsList([...interestsList, newInterestTag.trim()]);
                    setNewInterestTag('');
                  }
                }}
                className="px-3 py-1.5 bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl cursor-pointer transition shrink-0"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {interestsList.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#1C1938] border border-[#2E2856] text-[#A78BFA] text-xs font-medium flex items-center gap-1.5"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => setInterestsList(interestsList.filter((_, i) => i !== idx))}
                    className="hover:text-rose-400 text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage.text && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'error'
                  ? 'bg-rose-950/50 border border-rose-800 text-rose-200'
                  : 'bg-emerald-950/50 border border-emerald-800 text-emerald-200'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#231F45] hover:bg-[#352F64] text-[#8E8AAB] hover:text-white rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValidFormat || (!isAvailable && isChanged)}
              className="px-5 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-900/40"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditUsernameModal = EditProfileModal;
