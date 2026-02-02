// Sound Manager for game audio feedback
// Uses Web Audio API for low-latency sound effects

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Generate a simple beep sound
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported or blocked
      console.log('Audio playback failed:', e);
    }
  }

  // Play success sound (ascending tones)
  playWin() {
    this.playTone(523.25, 0.15, 'sine', 0.2); // C5
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.3, 'sine', 0.2), 200); // G5
  }

  // Play loss sound (descending tones)
  playLoss() {
    this.playTone(392, 0.15, 'sawtooth', 0.15); // G4
    setTimeout(() => this.playTone(349.23, 0.15, 'sawtooth', 0.15), 100); // F4
    setTimeout(() => this.playTone(293.66, 0.3, 'sawtooth', 0.15), 200); // D4
  }

  // Play click sound
  playClick() {
    this.playTone(800, 0.05, 'square', 0.1);
  }

  // Play countdown tick
  playTick() {
    this.playTone(440, 0.05, 'sine', 0.1);
  }

  // Play urgent warning
  playWarning() {
    this.playTone(880, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(880, 0.1, 'square', 0.15), 150);
  }

  // Play income collected
  playIncome() {
    this.playTone(440, 0.1, 'sine', 0.15);
    setTimeout(() => this.playTone(554.37, 0.1, 'sine', 0.15), 80);
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.15), 160);
  }

  // Play game over
  playGameOver() {
    this.playTone(293.66, 0.3, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(246.94, 0.3, 'sawtooth', 0.2), 200);
    setTimeout(() => this.playTone(220, 0.5, 'sawtooth', 0.2), 400);
  }

  // Play victory fanfare
  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.2), i * 150);
    });
  }

  // Play commit confirmation
  playCommit() {
    this.playTone(600, 0.08, 'sine', 0.15);
    setTimeout(() => this.playTone(800, 0.12, 'sine', 0.2), 60);
  }
}

export const soundManager = new SoundManager();
