import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useMusicTracks } from "@/hooks/use-music";
import type { MusicTrack } from "@shared/schema";

type RepeatMode = "none" | "one" | "all";

interface MusicPlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: MusicTrack[];
}

interface MusicPlayerActions {
  play: (track: MusicTrack) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const MusicPlayerContext = createContext<(MusicPlayerState & MusicPlayerActions) | null>(null);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const { data: tracks } = useMusicTracks();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("none");
  const [shuffledQueue, setShuffledQueue] = useState<MusicTrack[]>([]);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => handleEnded();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    if (tracks && tracks.length > 0 && !currentTrack) {
      const autoPlay = tracks.find(t => t.isAutoPlay) || tracks[0];
      loadTrack(autoPlay, false);
    }
  }, [tracks]);

  useEffect(() => {
    if (tracks) {
      if (shuffle) {
        const shuffled = [...tracks].sort(() => Math.random() - 0.5);
        setShuffledQueue(shuffled);
      } else {
        setShuffledQueue([...tracks]);
      }
    }
  }, [tracks, shuffle]);

  const queue = shuffle ? shuffledQueue : (tracks ?? []);

  function loadTrack(track: MusicTrack, autoplay = true) {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);
    audio.src = track.audioUrl;
    audio.load();
    if (autoplay) {
      audio.play().catch(() => {});
    }
  }

  function handleEnded() {
    const audio = audioRef.current;
    if (!audio) return;
    if (repeat === "one") {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }
    if (queue.length === 0) return;
    const idx = queue.findIndex(t => t.id === currentTrack?.id);
    if (repeat === "all") {
      const next = queue[(idx + 1) % queue.length];
      loadTrack(next, true);
    } else {
      if (idx < queue.length - 1) {
        loadTrack(queue[idx + 1], true);
      } else {
        setIsPlaying(false);
      }
    }
  }

  const play = useCallback((track: MusicTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack?.id === track.id) {
      if (isPlaying) audio.pause();
      else audio.play().catch(() => {});
    } else {
      loadTrack(track, true);
    }
  }, [currentTrack, isPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => {});
  }, [isPlaying]);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    const idx = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIdx = (idx + 1) % queue.length;
    loadTrack(queue[nextIdx], isPlaying);
  }, [queue, currentTrack, isPlaying]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;
    const idx = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIdx = (idx - 1 + queue.length) % queue.length;
    loadTrack(queue[prevIdx], isPlaying);
  }, [queue, currentTrack, currentTime, isPlaying]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);

  const toggleRepeat = useCallback(() => {
    setRepeat(r => r === "none" ? "all" : r === "all" ? "one" : "none");
  }, []);

  return (
    <MusicPlayerContext.Provider value={{
      currentTrack, isPlaying, currentTime, duration,
      shuffle, repeat, queue,
      play, togglePlay, next, prev, seek, toggleShuffle, toggleRepeat,
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  return ctx;
}
