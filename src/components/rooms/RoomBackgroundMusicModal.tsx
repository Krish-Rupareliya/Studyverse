import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Plus,
  Radio,
  Sliders,
  CloudRain,
  Coffee,
  Flame,
  Trees,
  Headphones,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  Disc,
} from 'lucide-react';
import { ambientAudioService, AmbientSoundType } from '../../services/ambientAudioService';

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  soundType: AmbientSoundType;
  coverArt: string;
  duration: string;
  customUrl?: string;
}

export const CURATED_SONG_PLAYLIST: SongTrack[] = [
  {
    id: 'lofi_chill_1',
    title: 'Midnight Rainfall & Vinyl Chords',
    artist: 'StudySpace Lo-Fi Beats',
    genre: 'Lo-Fi Hip Hop',
    soundType: 'lofi',
    coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    duration: '3:45',
  },
  {
    id: 'cafe_jazz_2',
    title: 'Kyoto Rainy Afternoon Cafe',
    artist: 'Acoustic Study Trio',
    genre: 'Coffeehouse Jazz',
    soundType: 'cafe',
    coverArt: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80',
    duration: '4:12',
  },
  {
    id: 'piano_peace_3',
    title: 'Autumn Leaves Soft Piano',
    artist: 'Nocturne Soloist',
    genre: 'Classical & Ambient',
    soundType: 'library',
    coverArt: 'https://images.unsplash.com/photo-1520523839898-5071280388e6?w=300&auto=format&fit=crop&q=80',
    duration: '5:02',
  },
  {
    id: 'binaural_flow_4',
    title: 'Alpha Focus Wave (432Hz)',
    artist: 'Deep Theta Flow',
    genre: 'Binaural Focus',
    soundType: 'binaural',
    coverArt: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=300&auto=format&fit=crop&q=80',
    duration: '10:00',
  },
  {
    id: 'rain_window_5',
    title: 'Storm Over Tokyo Tower',
    artist: 'Atmospheric Noise',
    genre: 'Nature Rain',
    soundType: 'rain',
    coverArt: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&auto=format&fit=crop&q=80',
    duration: '8:30',
  },
  {
    id: 'forest_stream_6',
    title: 'Alpine Forest Morning Songbirds',
    artist: 'Green Woods Soundscape',
    genre: 'Nature Sanctuary',
    soundType: 'forest',
    coverArt: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80',
    duration: '6:15',
  },
];

interface RoomBackgroundMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  onSelectTrack: (index: number) => void;
  onTogglePlay: () => void;
  onVolumeChange: (vol: number) => void;
  customTrack?: SongTrack | null;
  onSetCustomTrack?: (track: SongTrack | null) => void;
}

export const RoomBackgroundMusicModal: React.FC<RoomBackgroundMusicModalProps> = ({
  isOpen,
  onClose,
  currentTrackIndex,
  isPlaying,
  volume,
  onSelectTrack,
  onTogglePlay,
  onVolumeChange,
  customTrack,
  onSetCustomTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'playlist' | 'mixer' | 'custom'>('playlist');
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [addedCustoms, setAddedCustoms] = useState<SongTrack[]>([]);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layered Ambience Mixer Volumes (0-100)
  const [rainVolume, setRainVolume] = useState(0);
  const [cafeVolume, setCafeVolume] = useState(0);
  const [fireplaceVolume, setFireplaceVolume] = useState(0);
  const [forestVolume, setForestVolume] = useState(0);

  const allTracks = [...CURATED_SONG_PLAYLIST, ...addedCustoms];
  const activeTrack = allTracks[currentTrackIndex] || CURATED_SONG_PLAYLIST[0];

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAudioUrl.trim()) return;

    const newSong: SongTrack = {
      id: `custom_${Date.now()}`,
      title: customTitle.trim() || 'Custom Study Stream',
      artist: customArtist.trim() || 'My Web Stream',
      genre: 'Custom Audio',
      soundType: 'lofi',
      coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
      duration: 'Live',
      customUrl: customAudioUrl.trim(),
    };

    setAddedCustoms((prev) => [newSong, ...prev]);
    if (onSetCustomTrack) onSetCustomTrack(newSong);
    setCustomAudioUrl('');
    setCustomTitle('');
    setCustomArtist('');
    setActiveTab('playlist');
    onSelectTrack(CURATED_SONG_PLAYLIST.length);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      setUploadError('Please select a valid audio file (MP3, WAV, OGG, M4A)');
      return;
    }

    setUploadError('');
    const objectUrl = URL.createObjectURL(file);
    const newSong: SongTrack = {
      id: `file_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Uploaded Local Song',
      genre: 'Local Audio',
      soundType: 'lofi',
      coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
      duration: 'Local File',
      customUrl: objectUrl,
    };

    setAddedCustoms((prev) => [newSong, ...prev]);
    if (onSetCustomTrack) onSetCustomTrack(newSong);
    setActiveTab('playlist');
    onSelectTrack(CURATED_SONG_PLAYLIST.length);
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % allTracks.length;
    onSelectTrack(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + allTracks.length) % allTracks.length;
    onSelectTrack(prevIdx);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#171431] border border-[#2E2856] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#26214A] bg-[#131129]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white shadow-lg shadow-purple-900/30">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>Room Background Music & Songs</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Live Synth
                </span>
              </h3>
              <p className="text-xs text-[#8E8AAB]">Choose focus songs, lofi chill, or custom streaming audio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Song Player Hero Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E1938] via-[#171431] to-[#1E1938] border-b border-[#26214A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Song Info & Thumbnail */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={activeTrack?.coverArt}
                  alt={activeTrack?.title}
                  className={`w-14 sm:w-16 h-14 sm:h-16 rounded-2xl object-cover ring-2 ring-[#8B5CF6]/50 shadow-lg ${
                    isPlaying ? 'animate-spin-slow' : ''
                  }`}
                />
                <div className="absolute inset-0 rounded-2xl bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Disc className="w-6 h-6 text-white/80" />
                </div>
              </div>

              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#A78BFA] tracking-wider block">
                  Now Playing • {activeTrack?.genre}
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-white truncate max-w-xs sm:max-w-md">
                  {activeTrack?.title}
                </h4>
                <p className="text-xs text-[#8E8AAB] truncate">{activeTrack?.artist}</p>
              </div>
            </div>

            {/* Playback Controls & Volume */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              {/* Skip Back */}
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-white flex items-center justify-center transition"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                onClick={onTogglePlay}
                className="w-11 h-11 rounded-2xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white flex items-center justify-center shadow-lg shadow-purple-900/50 hover:scale-105 transition"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Skip Next */}
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-white flex items-center justify-center transition"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#2E2856]">
                <button
                  onClick={() => onVolumeChange(volume === 0 ? 50 : 0)}
                  className="text-[#8E8AAB] hover:text-white"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#10B981]" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Number.isFinite(volume) ? volume : 50}
                  onChange={(e) => onVolumeChange(Number(e.target.value) || 0)}
                  className="w-16 sm:w-20 accent-[#8B5CF6] h-1.5 bg-[#2E2856] rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-[#8E8AAB] w-6">{volume}%</span>
              </div>
            </div>
          </div>

          {/* Equalizer Wave Simulation when playing */}
          {isPlaying && (
            <div className="flex items-center justify-center gap-1 pt-3">
              {[40, 75, 55, 90, 65, 80, 45, 95, 70, 50, 85, 60, 100, 70, 40].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-gradient-to-t from-[#6D28D9] to-[#C4B5FD] rounded-full animate-pulse"
                  style={{
                    height: `${Math.max(6, (h * volume) / 100 * 0.25)}px`,
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 pb-2 border-b border-[#26214A] bg-[#0D0B1D]">
          <button
            onClick={() => setActiveTab('playlist')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'playlist'
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : 'text-[#8E8AAB] hover:text-white hover:bg-[#1E1938]'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Curated Songs ({allTracks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mixer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'mixer'
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : 'text-[#8E8AAB] hover:text-white hover:bg-[#1E1938]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Ambience Mixer</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : 'text-[#8E8AAB] hover:text-white hover:bg-[#1E1938]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Song / URL</span>
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto max-h-80">
          {/* 1. PLAYLIST VIEW */}
          {activeTab === 'playlist' && (
            <div className="space-y-2.5">
              {allTracks.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      onSelectTrack(idx);
                      if (!isPlaying) onTogglePlay();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#6D28D9]/25 border-[#8B5CF6] text-white shadow-md'
                        : 'bg-[#0D0B1D] border-[#26214A] text-slate-300 hover:border-[#352F64] hover:bg-[#1C1938]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={track.coverArt}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10"
                        />
                        {isSelected && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-white' : 'text-slate-200'
                            }`}
                          >
                            {track.title}
                          </span>
                          {track.customUrl && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8E8AAB] block truncate">
                          {track.artist} • {track.genre}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-[#8E8AAB]">{track.duration}</span>
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-lg bg-[#6D28D9] text-white flex items-center justify-center">
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center">
                          <Play className="w-3 h-3 ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. AMBIENCE MIXER VIEW */}
          {activeTab === 'mixer' && (
            <div className="space-y-4">
              <p className="text-xs text-[#8E8AAB]">
                Layer soothing background atmospheric effects alongside your active study track:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Rainfall */}
                <div className="p-3.5 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">Rain & Thunder</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">{rainVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Number.isFinite(rainVolume) ? rainVolume : 0}
                    onChange={(e) => setRainVolume(Number(e.target.value) || 0)}
                    className="w-full accent-cyan-400 h-1.5 bg-[#231F45] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Cafe Noise */}
                <div className="p-3.5 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Cozy Cafe Chatter</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400">{cafeVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Number.isFinite(cafeVolume) ? cafeVolume : 0}
                    onChange={(e) => setCafeVolume(Number(e.target.value) || 0)}
                    className="w-full accent-amber-400 h-1.5 bg-[#231F45] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Fireplace */}
                <div className="p-3.5 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-white">Fireplace Crackle</span>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400">{fireplaceVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Number.isFinite(fireplaceVolume) ? fireplaceVolume : 0}
                    onChange={(e) => setFireplaceVolume(Number(e.target.value) || 0)}
                    className="w-full accent-rose-400 h-1.5 bg-[#231F45] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Forest Birds */}
                <div className="p-3.5 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trees className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Forest Sanctuary</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">{forestVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Number.isFinite(forestVolume) ? forestVolume : 0}
                    onChange={(e) => setForestVolume(Number(e.target.value) || 0)}
                    className="w-full accent-emerald-400 h-1.5 bg-[#231F45] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. ADD CUSTOM SONG / URL / FILE UPLOAD */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              {/* Option A: Direct Web Audio Stream URL */}
              <form onSubmit={handleAddCustomUrl} className="space-y-3 p-4 bg-[#0D0B1D] border border-[#26214A] rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <LinkIcon className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Option 1: Stream from Web Audio URL</span>
                </div>

                <input
                  type="url"
                  placeholder="Paste direct audio URL (e.g., https://.../stream.mp3)"
                  value={customAudioUrl}
                  onChange={(e) => setCustomAudioUrl(e.target.value)}
                  className="w-full bg-[#171431] border border-[#2E2856] focus:border-[#8B5CF6] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8AAB] focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Track Title (Optional)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="bg-[#171431] border border-[#2E2856] focus:border-[#8B5CF6] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8AAB] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Artist Name (Optional)"
                    value={customArtist}
                    onChange={(e) => setCustomArtist(e.target.value)}
                    className="bg-[#171431] border border-[#2E2856] focus:border-[#8B5CF6] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8AAB] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!customAudioUrl.trim()}
                  className="w-full py-2 bg-[#6D28D9] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Web Audio Track</span>
                </button>
              </form>

              {/* Option B: Local Audio File Upload */}
              <div className="p-4 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Option 2: Upload Local Study Audio File</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2E2856] hover:border-[#8B5CF6] rounded-xl p-4 text-center cursor-pointer transition bg-[#171431]/50 hover:bg-[#171431]"
                >
                  <Upload className="w-6 h-6 text-[#A78BFA] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-white">Click or drag & drop audio track</p>
                  <p className="text-[10px] text-[#8E8AAB] mt-0.5">MP3, WAV, OGG, or M4A supported</p>
                </div>

                {uploadError && <p className="text-[11px] text-rose-400 font-medium">{uploadError}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-[#26214A] bg-[#131129] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] text-[#8E8AAB]">Web Audio Synthesizer Active</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
