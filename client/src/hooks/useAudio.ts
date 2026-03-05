import { useRef, useCallback, useEffect, useState } from 'react';
import { Howl } from 'howler';

const AMBIENT_TRACKS: Record<string, string> = {
  default: '/sounds/ambient-village.mp3',
  konoha: '/sounds/ambient-village.mp3',
  forest: '/sounds/ambient-forest.mp3',
  combat: '/sounds/ambient-combat.mp3',
};

const SFX: Record<string, string> = {
  dice: '/sounds/sfx-dice.mp3',
  hit: '/sounds/sfx-hit.mp3',
  jutsu: '/sounds/sfx-jutsu.mp3',
  levelup: '/sounds/sfx-levelup.mp3',
  mission: '/sounds/sfx-mission.mp3',
  message: '/sounds/sfx-message.mp3',
};

export function useAudio() {
  const ambientRef = useRef<Howl | null>(null);
  const [muted, setMuted] = useState(() => localStorage.getItem('nin-muted') === 'true');
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('nin-volume') || '0.3'));
  const currentTrack = useRef<string>('');

  useEffect(() => {
    localStorage.setItem('nin-muted', String(muted));
    if (ambientRef.current) {
      ambientRef.current.mute(muted);
    }
  }, [muted]);

  useEffect(() => {
    localStorage.setItem('nin-volume', String(volume));
    if (ambientRef.current) {
      ambientRef.current.volume(volume);
    }
  }, [volume]);

  const playAmbient = useCallback((location: string) => {
    let track = AMBIENT_TRACKS.default;
    const loc = location.toLowerCase();

    if (loc.includes('floresta') || loc.includes('forest')) {
      track = AMBIENT_TRACKS.forest;
    } else if (loc.includes('konoha') || loc.includes('folha')) {
      track = AMBIENT_TRACKS.konoha;
    }

    if (currentTrack.current === track) return;
    currentTrack.current = track;

    if (ambientRef.current) {
      ambientRef.current.fade(volume, 0, 1000);
      setTimeout(() => {
        ambientRef.current?.unload();
        startNewAmbient(track);
      }, 1000);
    } else {
      startNewAmbient(track);
    }

    function startNewAmbient(src: string) {
      ambientRef.current = new Howl({
        src: [src],
        loop: true,
        volume: 0,
        mute: muted,
        html5: true,
        onplay: () => {
          ambientRef.current?.fade(0, volume, 2000);
        },
        onloaderror: () => {
          // Audio file not found - silently ignore
        },
      });
      ambientRef.current.play();
    }
  }, [muted, volume]);

  const playCombatMusic = useCallback(() => {
    if (currentTrack.current === AMBIENT_TRACKS.combat) return;
    currentTrack.current = AMBIENT_TRACKS.combat;

    if (ambientRef.current) {
      ambientRef.current.fade(volume, 0, 500);
      setTimeout(() => ambientRef.current?.unload(), 500);
    }

    ambientRef.current = new Howl({
      src: [AMBIENT_TRACKS.combat],
      loop: true,
      volume,
      mute: muted,
      html5: true,
      onloaderror: () => {},
    });
    ambientRef.current.play();
  }, [muted, volume]);

  const playSfx = useCallback((name: keyof typeof SFX) => {
    if (muted) return;
    const src = SFX[name];
    if (!src) return;

    const sfx = new Howl({
      src: [src],
      volume: Math.min(volume * 1.5, 1),
      onloaderror: () => {},
    });
    sfx.play();
  }, [muted, volume]);

  const stopAll = useCallback(() => {
    ambientRef.current?.stop();
    ambientRef.current?.unload();
    ambientRef.current = null;
    currentTrack.current = '';
  }, []);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  return { playAmbient, playCombatMusic, playSfx, stopAll, toggleMute, setVolume, muted, volume };
}
