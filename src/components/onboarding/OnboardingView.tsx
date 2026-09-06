import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Sparkles, ArrowRight, Check } from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const { createAccount, isUsernameAvailable } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('Freshman');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [error, setError] = useState<string | null>(null);

  const usernameClean = username.trim().toLowerCase().replace(/^@/, '');
  const usernameAvailable = usernameClean.length >= 3 && isUsernameAvailable(usernameClean);
  const usernameChecked = usernameClean.length >= 3;

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(usernameClean || name || 'guest')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (usernameClean.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!isUsernameAvailable(usernameClean)) {
      setError('That username is already taken. Try another one.');
      return;
    }

    createAccount({
      username: usernameClean,
      name: name.trim(),
      avatar: avatarUrl,
      bio: bio.trim() || `Student at ${university.trim() || 'university'}.`,
      university: university.trim() || 'Not specified',
      major: major.trim() || 'Not specified',
      year: year,
      status: 'online',
      currentRoomId: null,
      currentRoomTitle: null,
      lastSeen: Date.now(),
      interests: interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="min-h-screen bg-[#0D0B1D] text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] flex items-center justify-center mb-4 shadow-lg shadow-purple-900/40">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">StudySpace</h1>
          <p className="text-sm text-[#8E8AAB] mt-1">Create your account to start studying together</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#171431] border border-[#26214A] rounded-3xl p-6 space-y-4 shadow-2xl"
        >
          {/* Avatar Preview */}
          <div className="flex justify-center pb-2">
            <img
              src={avatarUrl}
              alt="Your avatar"
              className="w-20 h-20 rounded-full bg-[#0D0B1D] border-2 border-[#6D28D9] object-cover"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[#8E8AAB] mb-1.5">Display Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3 py-2.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-sm text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] transition"
              autoFocus
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-[#8E8AAB] mb-1.5">Username *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8AAB] text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex_study"
                className="w-full pl-7 pr-10 py-2.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-sm text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] transition"
              />
              {usernameChecked && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameAvailable ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-xs text-rose-400">taken</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* University & Major */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8E8AAB] mb-1.5">University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="UC Berkeley"
                className="w-full px-3 py-2.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-sm text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8E8AAB] mb-1.5">Major</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Computer Science"
                className="w-full px-3 py-2.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-sm text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] transition"
              />
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-medium text-[#8E8AAB] mb-1.5">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition"
            >
              <option>Freshman</option>
              <option>Sophomore</option>
              <option>Junior</option>
              <option>Senior</option>
              <option>Graduate</option>
              <option>Other</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-[#8E8AAB] mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your friends what you're studying..."
              rows={2}
              className="w-full px-3 py-2.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-sm text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] transition resize-none"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-medium text-[#8E8AAB] mb-1.5">Interests (comma-separated)</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Algorithms, Machine Learning, Python"
              className="w-full px-3 py-2.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-sm text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] transition"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || !usernameAvailable}
            className="w-full py-3 bg-[#6D28D9] hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-purple-900/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Account & Start Studying</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[#8E8AAB] mt-4">
          Share this app with your friends so you can study together in real-time rooms.
        </p>
      </div>
    </div>
  );
};
