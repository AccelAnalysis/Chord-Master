export const midiToFrequency = (midi) => 440 * 2 ** ((midi - 69) / 12);

export class SimpleSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeVoices = new Map();
    this.voiceCounter = 0;
  }

  async init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is not supported in this browser.');
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state !== 'running') await this.ctx.resume();
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.3, now);
    return this.ctx;
  }

  get currentTime() {
    return this.ctx?.currentTime ?? 0;
  }

  createVoice({ midi, velocity, source, startTime, duration = null, sustained = false }) {
    if (!this.ctx || !this.masterGain) throw new Error('Audio engine is not initialized.');

    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const voiceKey = sustained ? `${source}:${midi}` : `${source}:scheduled-${this.voiceCounter += 1}:${midi}`;
    const voiceStart = Math.max(this.ctx.currentTime + 0.005, startTime);
    const attack = 0.018;
    const release = 0.22;
    const safeVelocity = Math.max(0.02, Math.min(1, velocity));
    const attackEnd = voiceStart + attack;
    const decayEnd = duration == null
      ? voiceStart + 0.25
      : Math.min(voiceStart + 0.25, voiceStart + Math.max(attack + 0.02, duration * 0.55));
    const sustainLevel = Math.max(0.015, safeVelocity * 0.58);

    oscillator.type = 'triangle';
    oscillator.frequency.value = midiToFrequency(midi);
    gain.gain.setValueAtTime(0.0001, voiceStart);
    gain.gain.exponentialRampToValueAtTime(safeVelocity, attackEnd);
    gain.gain.exponentialRampToValueAtTime(sustainLevel, decayEnd);

    if (duration != null) {
      const voiceEnd = voiceStart + Math.max(0.08, duration);
      const releaseStart = Math.max(decayEnd, voiceEnd - release);
      gain.gain.setValueAtTime(sustainLevel, releaseStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, voiceEnd);
      oscillator.stop(voiceEnd + 0.03);
    }

    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(voiceStart);

    const voice = {
      oscillator,
      gain,
      midi,
      source,
      startTime: voiceStart,
      duration,
      stopped: false,
    };
    this.activeVoices.set(voiceKey, voice);

    if (duration != null) {
      const cleanupDelay = Math.max(0, (voiceStart + duration + 0.1 - this.ctx.currentTime) * 1000);
      window.setTimeout(() => this.cleanupVoice(voiceKey), cleanupDelay);
    }

    return voiceKey;
  }

  cleanupVoice(voiceKey) {
    const voice = this.activeVoices.get(voiceKey);
    if (!voice) return;
    try {
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    } catch {
      // Nodes may already be disconnected.
    }
    this.activeVoices.delete(voiceKey);
  }

  async noteOn(midi, velocity = 0.78, source = 'default') {
    await this.init();
    const voiceKey = `${source}:${midi}`;
    if (this.activeVoices.has(voiceKey)) return;
    this.createVoice({ midi, velocity, source, startTime: this.ctx.currentTime, sustained: true });
  }

  stopVoice(voiceKey, release = 0.18) {
    if (!this.ctx) return;
    const voice = this.activeVoices.get(voiceKey);
    if (!voice || voice.stopped) return;
    voice.stopped = true;

    const now = this.ctx.currentTime;
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(Math.max(0.0001, voice.gain.gain.value), now);
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + release);
      voice.oscillator.stop(now + release + 0.02);
    } catch {
      // Voice may already be stopping, may not have started, or may have finished.
    }

    window.setTimeout(() => this.cleanupVoice(voiceKey), (release + 0.05) * 1000);
  }

  noteOff(midi, source = 'default') {
    this.stopVoice(`${source}:${midi}`, 0.26);
  }

  scheduleChord(notes, startTime, durationSeconds, velocity = 0.7, source = 'demo') {
    if (!this.ctx || !this.masterGain) {
      return Promise.reject(new Error('Audio engine is not initialized.'));
    }

    try {
      const playableNotes = Array.isArray(notes)
        ? notes.filter((midi) => Number.isFinite(midi))
        : [];
      if (!playableNotes.length) return Promise.resolve();

      const safeStartTime = Math.max(this.ctx.currentTime + 0.01, startTime);
      playableNotes.forEach((midi, index) => {
        this.createVoice({
          midi,
          velocity: Math.max(0.08, velocity - index * 0.015),
          source,
          startTime: safeStartTime,
          duration: Math.max(0.08, durationSeconds),
        });
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  scheduleClick(time, strength = 0.35, source = 'metronome') {
    if (!this.ctx || !this.masterGain) return;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const voiceKey = `${source}:click-${this.voiceCounter += 1}`;
    const strong = strength >= 0.9;
    const safeTime = Math.max(this.ctx.currentTime + 0.005, time);

    oscillator.type = 'square';
    oscillator.frequency.value = strong ? 1480 : strength >= 0.6 ? 1120 : 880;
    gain.gain.setValueAtTime(Math.max(0.025, 0.12 * strength), safeTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, safeTime + 0.055);
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(safeTime);
    oscillator.stop(safeTime + 0.065);

    this.activeVoices.set(voiceKey, {
      oscillator,
      gain,
      midi: null,
      source,
      startTime: safeTime,
      duration: 0.065,
      stopped: false,
    });
    const cleanupDelay = Math.max(0, (safeTime + 0.12 - this.ctx.currentTime) * 1000);
    window.setTimeout(() => this.cleanupVoice(voiceKey), cleanupDelay);
  }

  stopSource(source) {
    for (const [key, voice] of [...this.activeVoices.entries()]) {
      if (voice.source === source) this.stopVoice(key, 0.05);
    }
  }

  stopAll() {
    for (const key of [...this.activeVoices.keys()]) this.stopVoice(key, 0.05);
  }
}
