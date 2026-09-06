// Web Audio API based ambient sound generator and timer chime (100% self-contained, no external audio files required)

export type AmbientSoundType = 'none' | 'lofi' | 'rain' | 'cafe' | 'library' | 'forest' | 'binaural';

class AmbientAudioService {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'none';
  private gainNode: GainNode | null = null;
  private volume: number = 0.5;
  private nodes: (AudioNode | number)[] = [];
  private isPlaying: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.volume * 0.3, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentSound(): AmbientSoundType {
    return this.currentType;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private audioElement: HTMLAudioElement | null = null;

  // Custom audio stream or uploaded audio file playback
  public playCustomAudio(url: string, volume?: number) {
    this.stop();
    if (typeof volume === 'number') {
      this.setVolume(volume > 1 ? volume / 100 : volume);
    }
    this.isPlaying = true;
    this.currentType = 'lofi';

    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.loop = true;
      }
      this.audioElement.src = url;
      this.audioElement.volume = this.volume;
      this.audioElement.play().catch(() => {});
    } catch (err) {
      console.warn('Custom audio playback failed:', err);
    }
  }

  public stop() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
      } catch {}
    }
    this.cleanupNodes();
    this.isPlaying = false;
    this.currentType = 'none';
  }

  public stopSound() {
    this.stop();
  }

  public playSound(type: AmbientSoundType, volume?: number) {
    if (typeof volume === 'number') {
      this.setVolume(volume > 1 ? volume / 100 : volume);
    }
    this.play(type);
  }

  private cleanupNodes() {
    this.nodes.forEach((node) => {
      if (typeof node === 'number') {
        clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          node.disconnect();
        } catch {}
      }
    });
    this.nodes = [];
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
  }

  public play(type: AmbientSoundType) {
    if (type === 'none') {
      this.stop();
      return;
    }

    this.stop();
    const ctx = this.getContext();
    this.currentType = type;
    this.isPlaying = true;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.gainNode = masterGain;

    switch (type) {
      case 'rain':
        this.startRain(ctx, masterGain);
        break;
      case 'cafe':
        this.startCafe(ctx, masterGain);
        break;
      case 'library':
        this.startLibrary(ctx, masterGain);
        break;
      case 'forest':
        this.startForest(ctx, masterGain);
        break;
      case 'binaural':
        this.startBinaural(ctx, masterGain);
        break;
      case 'lofi':
      default:
        this.startLofi(ctx, masterGain);
        break;
    }
  }

  // Rain sound generator using noise buffer + lowpass filter
  private startRain(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(150, ctx.currentTime);

    noise.connect(filter);
    filter.connect(highpass);
    highpass.connect(destination);

    noise.start();
    this.nodes.push(noise, filter, highpass);
  }

  // Binaural Alpha Beats (432Hz & 442Hz for 10Hz Focus Flow)
  private startBinaural(ctx: AudioContext, destination: AudioNode) {
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    const merger = ctx.createChannelMerger(2);

    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(432, ctx.currentTime);

    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(442, ctx.currentTime);

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(destination);

    oscL.start();
    oscR.start();
    this.nodes.push(oscL, oscR, merger);
  }

  // Library Silence (Gentle low room hum)
  private startLibrary(ctx: AudioContext, destination: AudioNode) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start();
    this.nodes.push(osc, filter, gain);
  }

  // Coffee Shop Ambient
  private startCafe(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    noise.connect(filter);
    filter.connect(destination);

    noise.start();
    this.nodes.push(noise, filter);
  }

  // Forest Breeze & Birds
  private startForest(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);

    noise.connect(filter);
    filter.connect(destination);
    noise.start();
    this.nodes.push(noise, filter);

    // Sporadic bird chirps
    const interval = window.setInterval(() => {
      if (!this.isPlaying) return;
      try {
        const chirpOsc = ctx.createOscillator();
        const chirpGain = ctx.createGain();
        chirpOsc.type = 'sine';
        chirpOsc.frequency.setValueAtTime(2400 + Math.random() * 800, ctx.currentTime);
        chirpOsc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.15);

        chirpGain.gain.setValueAtTime(0.08, ctx.currentTime);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        chirpOsc.connect(chirpGain);
        chirpGain.connect(destination);

        chirpOsc.start();
        chirpOsc.stop(ctx.currentTime + 0.15);
      } catch {}
    }, 4000);

    this.nodes.push(interval);
  }

  // Lofi Chill Chords
  private startLofi(ctx: AudioContext, destination: AudioNode) {
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.isPlaying) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, ctx.currentTime);

          gain.gain.setValueAtTime(0.001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(destination);

          osc.start();
          osc.stop(ctx.currentTime + 3.8);
        } catch {}
      });
    };

    playChord();
    const interval = window.setInterval(playChord, 4000);
    this.nodes.push(interval);
  }

  // Bell chime when Pomodoro completes, mode switches, or room notifications trigger
  public playChime(_type?: 'join' | 'notification' | 'timer_complete' | 'leave' | 'chat') {
    try {
      const ctx = this.getContext();
      const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 1.2);
      });
    } catch (e) {
      console.warn('Chime playback failed:', e);
    }
  }
}

export const ambientAudioService = new AmbientAudioService();
