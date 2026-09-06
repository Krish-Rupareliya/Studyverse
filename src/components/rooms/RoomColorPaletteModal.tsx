import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Palette,
  Check,
  X,
  Sparkles,
  Sun,
  Moon,
  Flame,
  Sliders,
  RotateCcw,
  Eye,
  Image as ImageIcon,
  Upload,
  Link,
  Layers,
  Wand2,
  RefreshCw,
} from 'lucide-react';

export interface RoomPaletteSettings {
  id: string;
  name: string;
  primaryColor: string; // e.g. #8B5CF6
  secondaryColor: string; // e.g. #6D28D9
  accentGlow: string; // rgba or hex for shadows/glows
  backdropTint: string; // background atmospheric color tint
  tintOpacity: number; // 0 - 100%
  bubbleBg: string; // chat bubble background
  timerGlow: boolean;
  customBgUrl?: string;
  bgBlur?: number; // 0 - 25px
  bgDim?: number; // 0 - 90%
}

export const ROOM_PALETTE_PRESETS: RoomPaletteSettings[] = [
  {
    id: 'cosmic-violet',
    name: 'Cosmic Violet (Default)',
    primaryColor: '#8B5CF6',
    secondaryColor: '#6D28D9',
    accentGlow: 'rgba(139, 92, 246, 0.5)',
    backdropTint: '#131129',
    tintOpacity: 35,
    bubbleBg: '#1C1938',
    timerGlow: true,
    bgBlur: 0,
    bgDim: 25,
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon Matrix',
    primaryColor: '#06B6D4',
    secondaryColor: '#3B82F6',
    accentGlow: 'rgba(6, 182, 212, 0.55)',
    backdropTint: '#0B1528',
    tintOpacity: 45,
    bubbleBg: '#10223D',
    timerGlow: true,
    bgBlur: 0,
    bgDim: 30,
  },
  {
    id: 'sunset-ember',
    name: 'Sunset Ember Glow',
    primaryColor: '#F97316',
    secondaryColor: '#E11D48',
    accentGlow: 'rgba(249, 115, 22, 0.5)',
    backdropTint: '#21111E',
    tintOpacity: 40,
    bubbleBg: '#2E1527',
    timerGlow: true,
    bgBlur: 0,
    bgDim: 25,
  },
  {
    id: 'emerald-zen',
    name: 'Emerald Zen Sanctuary',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    accentGlow: 'rgba(16, 185, 129, 0.5)',
    backdropTint: '#0B1D16',
    tintOpacity: 35,
    bubbleBg: '#132B21',
    timerGlow: true,
    bgBlur: 0,
    bgDim: 25,
  },
  {
    id: 'sakura-blossom',
    name: 'Sakura Velvet Petals',
    primaryColor: '#F43F5E',
    secondaryColor: '#FB7185',
    accentGlow: 'rgba(244, 63, 94, 0.5)',
    backdropTint: '#24101A',
    tintOpacity: 35,
    bubbleBg: '#331625',
    timerGlow: true,
    bgBlur: 0,
    bgDim: 20,
  },
  {
    id: 'warm-lofi',
    name: 'Warm Lo-Fi Study Nook',
    primaryColor: '#F59E0B',
    secondaryColor: '#D97706',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    backdropTint: '#20150B',
    tintOpacity: 40,
    bubbleBg: '#2D1F12',
    timerGlow: true,
    bgBlur: 0,
    bgDim: 25,
  },
  {
    id: 'obsidian-minimal',
    name: 'Obsidian Midnight Minimal',
    primaryColor: '#94A3B8',
    secondaryColor: '#64748B',
    accentGlow: 'rgba(148, 163, 184, 0.3)',
    backdropTint: '#09090D',
    tintOpacity: 60,
    bubbleBg: '#171721',
    timerGlow: false,
    bgBlur: 2,
    bgDim: 40,
  },
  {
    id: 'electric-indigo',
    name: 'Electric Synth Indigo',
    primaryColor: '#6366F1',
    secondaryColor: '#4F46E5',
    accentGlow: 'rgba(99, 102, 241, 0.55)',
    backdropTint: '#0F122B',
    tintOpacity: 40,
    bubbleBg: '#1A1E42',
    timerGlow: true,
    bgBlur: 0,
    bgDim: 25,
  },
];

export const SCENIC_CUSTOM_PRESETS = [
  {
    id: 'lofi_cafe',
    name: 'Lo-Fi Rain Coffee Shop',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&auto=format&fit=crop&q=80',
    tag: 'Cozy Rain',
  },
  {
    id: 'anime_room',
    name: 'Warm Sunset Study Nook',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1920&auto=format&fit=crop&q=80',
    tag: 'Golden Hour',
  },
  {
    id: 'cyber_room',
    name: 'Neon Cyber City Horizon',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&auto=format&fit=crop&q=80',
    tag: 'Cyberpunk',
  },
  {
    id: 'library_classic',
    name: 'Grand Gothic Library',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&auto=format&fit=crop&q=80',
    tag: 'Dark Academia',
  },
  {
    id: 'forest_zen',
    name: 'Mist Forest Sanctuary',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&auto=format&fit=crop&q=80',
    tag: 'Nature Zen',
  },
  {
    id: 'space_station',
    name: 'Deep Space Nebula View',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80',
    tag: 'Galaxy',
  },
];

interface RoomColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: RoomPaletteSettings;
  onApplyPalette: (palette: RoomPaletteSettings) => void;
  isHost?: boolean;
}

export const RoomColorPaletteModal: React.FC<RoomColorPaletteModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  onApplyPalette,
  isHost = true,
}) => {
  const { showToast } = useApp();
  const [selectedId, setSelectedId] = useState<string>(currentPalette.id || 'cosmic-violet');
  const [customPrimary, setCustomPrimary] = useState(currentPalette.primaryColor);
  const [customSecondary, setCustomSecondary] = useState(currentPalette.secondaryColor);
  const [backdropTint, setBackdropTint] = useState(currentPalette.backdropTint || '#131129');
  const [bubbleBg, setBubbleBg] = useState(currentPalette.bubbleBg || '#1C1938');
  const [tintIntensity, setTintIntensity] = useState(currentPalette.tintOpacity);
  const [timerGlow, setTimerGlow] = useState(currentPalette.timerGlow);

  // Background Customization State
  const [customBgInput, setCustomBgInput] = useState(currentPalette.customBgUrl || '');
  const [bgBlur, setBgBlur] = useState(currentPalette.bgBlur ?? 0);
  const [bgDim, setBgDim] = useState(currentPalette.bgDim ?? 25);

  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'background'>('presets');
  const [bgUploadError, setBgUploadError] = useState('');

  if (!isOpen) return null;

  // Real-time update helper
  const triggerLiveUpdate = (partialUpdates: Partial<RoomPaletteSettings>) => {
    const updated: RoomPaletteSettings = {
      id: selectedId === 'custom' ? 'custom' : selectedId,
      name: selectedId === 'custom' ? 'Custom Theme' : currentPalette.name,
      primaryColor: customPrimary,
      secondaryColor: customSecondary,
      accentGlow: `${customPrimary}66`,
      backdropTint: backdropTint,
      tintOpacity: tintIntensity,
      bubbleBg: bubbleBg,
      timerGlow: timerGlow,
      customBgUrl: customBgInput,
      bgBlur: bgBlur,
      bgDim: bgDim,
      ...partialUpdates,
    };
    onApplyPalette(updated);
  };

  const handleSelectPreset = (preset: RoomPaletteSettings) => {
    setSelectedId(preset.id);
    setCustomPrimary(preset.primaryColor);
    setCustomSecondary(preset.secondaryColor);
    setBackdropTint(preset.backdropTint);
    setBubbleBg(preset.bubbleBg);
    setTintIntensity(preset.tintOpacity);
    setTimerGlow(preset.timerGlow);
    setBgBlur(preset.bgBlur ?? 0);
    setBgDim(preset.bgDim ?? 25);

    const merged = {
      ...preset,
      customBgUrl: customBgInput || preset.customBgUrl,
    };
    onApplyPalette(merged);
    showToast('Theme Updated', `Room color theme "${preset.name}" applied successfully.`, 'success');
  };

  const handleCustomColorChange = (
    field: 'primary' | 'secondary' | 'backdrop' | 'bubble',
    value: string
  ) => {
    setSelectedId('custom');
    if (field === 'primary') {
      setCustomPrimary(value);
      triggerLiveUpdate({ primaryColor: value, accentGlow: `${value}66` });
    } else if (field === 'secondary') {
      setCustomSecondary(value);
      triggerLiveUpdate({ secondaryColor: value });
    } else if (field === 'backdrop') {
      setBackdropTint(value);
      triggerLiveUpdate({ backdropTint: value });
    } else if (field === 'bubble') {
      setBubbleBg(value);
      triggerLiveUpdate({ bubbleBg: value });
    }
  };

  const handleSliderChange = (type: 'tint' | 'blur' | 'dim', value: number) => {
    setSelectedId('custom');
    if (type === 'tint') {
      setTintIntensity(value);
      triggerLiveUpdate({ tintOpacity: value });
    } else if (type === 'blur') {
      setBgBlur(value);
      triggerLiveUpdate({ bgBlur: value });
    } else if (type === 'dim') {
      setBgDim(value);
      triggerLiveUpdate({ bgDim: value });
    }
  };

  const handleApplyCustomBgUrl = (url: string) => {
    setCustomBgInput(url);
    triggerLiveUpdate({ customBgUrl: url });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setBgUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setBgUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomBgInput(dataUrl);
        triggerLiveUpdate({ customBgUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomBg = () => {
    setCustomBgInput('');
    triggerLiveUpdate({ customBgUrl: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-[#131129] border border-[#2E2856] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#231F45] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${customPrimary}25`, borderColor: customPrimary }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center text-white"
            >
              <Palette className="w-5 h-5" style={{ color: customPrimary }} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Room Ambiance & Custom Background</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-[#8E8AAB]">Live dynamic color studio, wallpapers, and glowing accents</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection: Presets vs Custom Studio vs Background */}
        <div className="px-4 sm:px-5 pt-3 flex items-center gap-2 sm:gap-4 border-b border-[#1E1938] overflow-x-auto">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 text-xs font-bold transition whitespace-nowrap relative ${
              activeTab === 'presets' ? 'text-white' : 'text-[#8E8AAB] hover:text-white'
            }`}
          >
            Curated Themes
            {activeTab === 'presets' && (
              <span
                style={{ backgroundColor: customPrimary }}
                className="absolute bottom-0 inset-x-0 h-0.5 rounded-full"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 text-xs font-bold transition whitespace-nowrap relative flex items-center gap-1.5 ${
              activeTab === 'custom' ? 'text-white' : 'text-[#8E8AAB] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Dynamic Color Studio</span>
            {activeTab === 'custom' && (
              <span
                style={{ backgroundColor: customPrimary }}
                className="absolute bottom-0 inset-x-0 h-0.5 rounded-full"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`pb-2.5 text-xs font-bold transition whitespace-nowrap relative flex items-center gap-1.5 ${
              activeTab === 'background' ? 'text-white' : 'text-[#8E8AAB] hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Custom Background</span>
            {customBgInput && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
            {activeTab === 'background' && (
              <span
                style={{ backgroundColor: customPrimary }}
                className="absolute bottom-0 inset-x-0 h-0.5 rounded-full"
              />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 scrollbar-none">
          {/* TAB 1: CURATED THEMES */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROOM_PALETTE_PRESETS.map((preset) => {
                  const isSelected = selectedId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between ${
                        isSelected
                          ? 'border-white bg-[#1F1A40] shadow-lg shadow-purple-950/40 ring-1 ring-white/30'
                          : 'border-[#26214A] bg-[#171431] hover:border-[#4A4375] hover:bg-[#1C183B]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2.5">
                        {/* Color dots preview */}
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: preset.primaryColor }}
                            className="w-5 h-5 rounded-full shadow-md ring-2 ring-white/20"
                          />
                          <span
                            style={{ backgroundColor: preset.secondaryColor }}
                            className="w-4 h-4 rounded-full shadow-md"
                          />
                          <span
                            style={{ backgroundColor: preset.backdropTint }}
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                          />
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-white group-hover:text-slate-100">{preset.name}</h4>
                        <p className="text-[10px] text-[#8E8AAB] mt-0.5">
                          Primary: {preset.primaryColor} • Glow {preset.timerGlow ? 'Active' : 'Off'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DYNAMIC COLOR STUDIO (Live interactive pickers) */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Interactive Color Tuning (Updates Room Live)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Primary Accent Color */}
                  <div className="p-2.5 rounded-xl bg-[#171431] border border-[#2E2856] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Primary Accent</span>
                      <span className="text-[10px] text-[#8E8AAB]">Buttons, Timer & Halos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#A78BFA]">{customPrimary}</span>
                      <input
                        type="color"
                        value={customPrimary}
                        onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                  {/* Secondary Gradient Color */}
                  <div className="p-2.5 rounded-xl bg-[#171431] border border-[#2E2856] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Secondary Accent</span>
                      <span className="text-[10px] text-[#8E8AAB]">Badges & Gradients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#A78BFA]">{customSecondary}</span>
                      <input
                        type="color"
                        value={customSecondary}
                        onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                  {/* Atmospheric Backdrop Tint */}
                  <div className="p-2.5 rounded-xl bg-[#171431] border border-[#2E2856] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Room Backdrop Tint</span>
                      <span className="text-[10px] text-[#8E8AAB]">Atmosphere lighting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#A78BFA]">{backdropTint}</span>
                      <input
                        type="color"
                        value={backdropTint}
                        onChange={(e) => handleCustomColorChange('backdrop', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                  {/* Chat Bubble Background */}
                  <div className="p-2.5 rounded-xl bg-[#171431] border border-[#2E2856] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Widget Background</span>
                      <span className="text-[10px] text-[#8E8AAB]">Cards & Chat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#A78BFA]">{bubbleBg}</span>
                      <input
                        type="color"
                        value={bubbleBg}
                        onChange={(e) => handleCustomColorChange('bubble', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sliders: Tint Opacity & Timer Glow */}
              <div className="p-3 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Atmospheric Lighting Intensity</span>
                  <span className="text-xs font-bold text-[#A78BFA]">{tintIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={tintIntensity}
                  onChange={(e) => handleSliderChange('tint', Number(e.target.value))}
                  className="w-full accent-[#8B5CF6] h-1.5 bg-[#231F45] rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between pt-2 border-t border-[#1E1938]">
                  <span className="text-xs font-bold text-white">Neon Timer Glow</span>
                  <button
                    onClick={() => {
                      setTimerGlow(!timerGlow);
                      triggerLiveUpdate({ timerGlow: !timerGlow });
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      timerGlow ? 'bg-[#6D28D9] text-white shadow-xs' : 'bg-[#231F45] text-[#8E8AAB]'
                    }`}
                  >
                    {timerGlow ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM BACKGROUND IMAGE & WALLPAPER */}
          {activeTab === 'background' && (
            <div className="space-y-4">
              {/* URL or Upload Box */}
              <div className="p-4 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-[#A78BFA]" />
                    <span>Set Custom Image URL</span>
                  </span>
                  {customBgInput && (
                    <button
                      onClick={handleRemoveCustomBg}
                      className="text-[11px] text-rose-400 hover:underline font-semibold"
                    >
                      Remove Custom Wallpaper
                    </button>
                  )}
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBgInput}
                    onChange={(e) => setCustomBgInput(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 bg-[#171431] border border-[#2E2856] focus:border-[#8B5CF6] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8AAB] focus:outline-none"
                  />
                  <button
                    onClick={() => handleApplyCustomBgUrl(customBgInput)}
                    className="px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-md hover:scale-105"
                    style={{ backgroundColor: customPrimary }}
                  >
                    Apply
                  </button>
                </div>

                {/* Local Upload */}
                <div className="pt-2 border-t border-[#1E1938] flex items-center justify-between">
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-xs font-semibold text-[#A78BFA] cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image from Device</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <span className="text-[10px] text-[#8E8AAB]">PNG, JPG, WebP</span>
                </div>

                {bgUploadError && (
                  <p className="text-[10px] text-rose-400 font-medium">{bgUploadError}</p>
                )}
              </div>

              {/* Wallpaper Scenic Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">Curated Scenic Wallpapers</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SCENIC_CUSTOM_PRESETS.map((p) => {
                    const isSelected = customBgInput === p.url;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleApplyCustomBgUrl(p.url)}
                        className={`relative aspect-video rounded-xl overflow-hidden text-left border-2 group transition-all shadow-md ${
                          isSelected
                            ? 'border-white ring-2 ring-white/50'
                            : 'border-transparent hover:border-[#8B5CF6]'
                        }`}
                      >
                        <img
                          src={p.url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-1.5 left-1.5 right-1.5">
                          <span className="text-[10px] font-bold text-white truncate block">{p.name}</span>
                          <span className="text-[8px] text-[#A78BFA]">{p.tag}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wallpaper Blur and Dimming Sliders */}
              <div className="p-3.5 bg-[#0D0B1D] border border-[#26214A] rounded-2xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">Background Wallpaper Blur</span>
                    <span className="text-xs font-bold text-[#A78BFA]">{bgBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={bgBlur}
                    onChange={(e) => handleSliderChange('blur', Number(e.target.value))}
                    className="w-full accent-[#8B5CF6] h-1.5 bg-[#231F45] rounded-lg cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-[#1E1938]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">Background Darkness / Dimming</span>
                    <span className="text-xs font-bold text-[#A78BFA]">{bgDim}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={85}
                    value={bgDim}
                    onChange={(e) => handleSliderChange('dim', Number(e.target.value))}
                    className="w-full accent-[#8B5CF6] h-1.5 bg-[#231F45] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#231F45] flex items-center justify-between bg-[#171431]">
          <span className="text-[11px] text-[#8E8AAB]">
            Changes apply instantly to the active study room.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white font-bold text-xs transition shadow-lg hover:scale-105"
            style={{ backgroundColor: customPrimary }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
