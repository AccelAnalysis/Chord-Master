export const midiToFrequency = (midi) => 440 * 2 ** ((midi - 69) / 12);

export class SimpleSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeVoices = new Map();
  }

  async init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is not supported in this browser.');
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.24;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') await this.ctx.resume();
    return this.ctx;
  }

  async noteOn(midi, velocity = 0.78, source = 'default') {
    await this.init();
    const voiceKey = `${source}:${midi}`;
    if (this.activeVoices.has(voiceKey)) return;

    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = midiToFrequency(midi);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.02, velocity), now + 0.018);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.015, velocity * 0.62), now + 0.28);

    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(now);
    this.activeVoices.set(voiceKey, { oscillator, gain });
  }

  noteOff(midi, source = 'default') {
    if (!this.ctx) return;
    const voiceKey = `${source}:${midi}`;
    const voice = this.activeVoices.get(voiceKey);
    if (!voice) return;

    const now = this.ctx.currentTime;
    const release = 0.28;
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(Math.max(0.0001, voice.gain.gain.value), now);
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + release);
      voice.oscillator.stop(now + release + 0.02);
    } catch {
      // Voice may already be stopping.
    }

    window.setTimeout(() => {
      try {
        voice.oscillator.disconnect();
        voice.gain.disconnect();
      } catch {
        // Nodes may already be disconnected.
      }
    }, (release + 0.05) * 1000);

    this.activeVoices.delete(voiceKey);
  }

  playClick(accent = false) {
    if (!this.ctx || !this.masterGain) return;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    oscillator.type = 'square';
    oscillator.frequency.value = accent ? 1320 : 900;
    gain.gain.setValueAtTime(accent ? 0.13 : 0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }

  stopSource(source) {
    for (const key of [...this.activeVoices.keys()]) {
      if (!key.startsWith(`${source}:`)) continue;
      const midi = Number(key.split(':').at(-1));
      this.noteOff(midi, source);
    }
  }

  stopAll() {
    for (const key of [...this.activeVoices.keys()]) {
      const parts = key.split(':');
      const midi = Number(parts.pop());
      const source = parts.join(':');
      this.noteOff(midi, source);
    }
  }
}
