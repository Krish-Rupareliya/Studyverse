// Real WebRTC / MediaStream utilities and sandbox fallback simulator

export interface MediaDeviceState {
  hasCamera: boolean;
  hasMic: boolean;
  cameraActive: boolean;
  micActive: boolean;
  screenSharingActive: boolean;
  stream: MediaStream | null;
  screenStream: MediaStream | null;
  audioLevel: number;
  isSpeaking: boolean;
  error: string | null;
}

class MediaService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private simulatedCanvasStream: MediaStream | null = null;
  private simulatedIntervalId: any = null;

  // Request user camera and microphone
  async startCameraAndMic(
    preferReal = true,
    includeVideo = true,
    includeAudio = true
  ): Promise<{ stream: MediaStream; isSimulated: boolean; error?: string }> {
    this.stopCameraAndMic();

    if (preferReal && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      // Step 1: Try requested video + audio combined
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: includeVideo ? true : false,
          audio: includeAudio
            ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : false,
        });
        this.localStream = stream;
        if (includeAudio) {
          this.setupAudioAnalyser(stream);
        }
        return { stream, isSimulated: false };
      } catch (err1: any) {
        console.warn('Combined stream request failed, attempting independent track acquisition:', err1?.message || err1);

        // Step 2: Acquire video and audio tracks independently
        let videoTrack: MediaStreamTrack | null = null;
        let audioTrack: MediaStreamTrack | null = null;
        let errorMsg: string | null = null;

        if (includeVideo) {
          try {
            const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoTrack = vStream.getVideoTracks()[0] || null;
          } catch (vErr: any) {
            console.warn('Video track acquisition failed:', vErr?.message || vErr);
            errorMsg = vErr?.name === 'NotAllowedError' ? 'Camera permission denied' : 'Camera device unavailable';
          }
        }

        if (includeAudio) {
          try {
            const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioTrack = aStream.getAudioTracks()[0] || null;
          } catch (aErr: any) {
            console.warn('Audio/microphone track acquisition failed:', aErr?.message || aErr);
            if (!errorMsg) {
              errorMsg = aErr?.name === 'NotAllowedError' ? 'Microphone permission denied' : 'Microphone device unavailable';
            }
          }
        }

        const acquiredTracks: MediaStreamTrack[] = [];
        if (videoTrack) acquiredTracks.push(videoTrack);
        if (audioTrack) acquiredTracks.push(audioTrack);

        if (acquiredTracks.length > 0) {
          const stream = new MediaStream(acquiredTracks);
          this.localStream = stream;
          if (audioTrack) {
            this.setupAudioAnalyser(stream);
          }
          return { stream, isSimulated: false, error: errorMsg || undefined };
        }

        // If no real tracks acquired, generate simulated stream
        const simStream = this.createSimulatedStream('You (Camera Stream)');
        this.localStream = simStream;
        return { stream: simStream, isSimulated: true, error: errorMsg || 'Media device unavailable' };
      }
    }

    // Fallback simulated stream
    const simStream = this.createSimulatedStream('You (Camera Active)');
    this.localStream = simStream;
    return { stream: simStream, isSimulated: true };
  }

  // Request screen sharing
  async startScreenShare(preferReal = true): Promise<{ stream: MediaStream; isSimulated: boolean }> {
    this.stopScreenShare();

    if (preferReal && typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor',
          },
          audio: true,
        });

        // Listen for user clicking "Stop Sharing" from browser toolbar
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            this.stopScreenShare();
          };
        }

        this.screenStream = stream;
        return { stream, isSimulated: false };
      } catch (err: any) {
        console.warn('Real screen share failed or cancelled, using simulated screen share:', err.message);
      }
    }

    // Fallback simulated screen stream
    const simScreen = this.createSimulatedScreenStream('Shared Screen: VS Code & Study Notes');
    this.screenStream = simScreen;
    return { stream: simScreen, isSimulated: true };
  }

  // Stop camera and mic
  stopCameraAndMic(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
      this.analyser = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.simulatedIntervalId) {
      clearInterval(this.simulatedIntervalId);
      this.simulatedIntervalId = null;
    }
  }

  // Stop screen sharing
  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }
  }

  // Toggle video track
  toggleVideo(enabled: boolean): boolean {
    if (this.localStream) {
      const tracks = this.localStream.getVideoTracks();
      tracks.forEach((t) => {
        t.enabled = enabled;
      });
      return enabled;
    }
    return false;
  }

  // Toggle audio track
  toggleAudio(enabled: boolean): boolean {
    if (this.audioContext && this.audioContext.state === 'suspended' && enabled) {
      this.audioContext.resume().catch(() => {});
    }
    if (this.localStream) {
      const tracks = this.localStream.getAudioTracks();
      tracks.forEach((t) => {
        t.enabled = enabled;
      });
      return enabled;
    }
    return false;
  }

  // Setup real-time audio volume analyser for speaking indicator
  private setupAudioAnalyser(stream: MediaStream): void {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
    } catch (e) {
      console.warn('Audio analyser setup error:', e);
    }
  }

  // Monitor speaking levels with callback
  monitorAudioLevel(onLevelUpdate: (level: number, isSpeaking: boolean) => void): () => void {
    let running = true;

    const checkAudio = () => {
      if (!running) return;

      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      if (this.analyser) {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        const isSpeaking = normalized > 10;

        onLevelUpdate(normalized, isSpeaking);
      } else {
        // Simulated natural background fluctuation when silent or simulated
        const randomLevel = Math.floor(Math.random() * 6);
        onLevelUpdate(randomLevel, false);
      }

      this.animFrameId = requestAnimationFrame(checkAudio);
    };

    checkAudio();

    return () => {
      running = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
      }
    };
  }

  // Helper to generate a live canvas stream for simulated camera
  private createSimulatedStream(label: string): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    let frame = 0;
    const draw = () => {
      if (!ctx) return;
      frame++;

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Central avatar pulse
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - 20;
      const radius = 60 + Math.sin(frame * 0.05) * 5;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();

      // Camera icon / Initials
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LIVE', centerX, centerY);

      // Label & Timecode
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(label, centerX, canvas.height - 50);

      const timeStr = new Date().toLocaleTimeString();
      ctx.font = '12px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Stream Active • ${timeStr}`, centerX, canvas.height - 25);
    };

    draw();
    this.simulatedIntervalId = setInterval(draw, 100);

    const stream = canvas.captureStream ? canvas.captureStream(30) : new MediaStream();
    return stream;
  }

  // Helper to generate a live canvas stream for simulated screen share
  private createSimulatedScreenStream(title: string): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    let step = 0;
    const drawScreen = () => {
      if (!ctx) return;
      step++;

      // IDE editor background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top Tab Bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, 40);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10, 5, 200, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⚡ shortest_path.py', 24, 25);

      // Code editor line numbers and syntax
      ctx.fillStyle = '#475569';
      ctx.font = '15px monospace';
      const lines = [
        'import heapq',
        '',
        'def dijkstra(graph, start):',
        '    distances = {node: float("inf") for node in graph}',
        '    distances[start] = 0',
        '    pq = [(0, start)] # (distance, node)',
        '',
        '    while pq:',
        '        current_dist, current_node = heapq.heappop(pq)',
        '        if current_dist > distances[current_node]:',
        '            continue',
        '',
        '        for neighbor, weight in graph[current_node].items():',
        '            distance = current_dist + weight',
        '            if distance < distances[neighbor]:',
        '                distances[neighbor] = distance',
        '                heapq.heappush(pq, (distance, neighbor))',
        '',
        '    return distances # Optimal shortest paths computed'
      ];

      lines.forEach((line, index) => {
        const y = 80 + index * 26;
        ctx.fillStyle = '#64748b';
        ctx.fillText(String(index + 1).padStart(2, ' '), 20, y);

        if (line.includes('def') || line.includes('import') || line.includes('return')) {
          ctx.fillStyle = '#f43f5e';
        } else if (line.includes('#')) {
          ctx.fillStyle = '#10b981';
        } else if (line.includes('"inf"') || line.includes('start')) {
          ctx.fillStyle = '#38bdf8';
        } else {
          ctx.fillStyle = '#e2e8f0';
        }
        ctx.fillText(line, 60, y);
      });

      // Animated cursor
      if (Math.floor(step / 5) % 2 === 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(520, 80 + 17 * 26 - 16, 10, 18);
      }

      // Banner at bottom
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText(`🖥️ ${title} • Screen Sharing Active • 1080p 60fps`, 20, canvas.height - 12);
    };

    drawScreen();
    const interval = setInterval(drawScreen, 100);

    const stream = canvas.captureStream ? canvas.captureStream(30) : new MediaStream();
    return stream;
  }
}

export const mediaService = new MediaService();
