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

  // Refs that always hold the latest values for use inside event listeners
  const currentTrackRef = useRef<MusicTrack | null>(null);
  const isPlayingRef = useRef(false);
  const currentTimeRef = useRef(0);
  const repeatRef = useRef<RepeatMode>("none");
  const queueRef = useRef<MusicTrack[]>([]);

  // Keep refs in sync with state
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  // Build queue (shuffled or normal)
  const queue = shuffle ? shuffledQueue : (tracks ?? []);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  // When shuffle changes, rebuild the shuffled queue
  useEffect(() => {
    if (tracks && tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setShuffledQueue(shuffled);
    }
  }, [shuffle, tracks]);

  // Init audio element once
  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      // Uses refs so always has latest values
      const r = repeatRef.current;
      const q = queueRef.current;
      const ct = currentTrackRef.current;

      if (r === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      if (q.length === 0) return;
      const idx = q.findIndex(t => t.id === ct?.id);
      if (r === "all" || idx < q.length - 1) {
        const nextIdx = (idx + 1) % q.length;
        if (r === "none" && idx >= q.length - 1) {
          setIsPlaying(false);
          return;
        }
        const nextTrack = q[nextIdx];
        setCurrentTrack(nextTrack);
        currentTrackRef.current = nextTrack;
        audio.src = nextTrack.audioUrl;
        audio.load();
        audio.play().catch(() => {});
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Load initial track and attempt autoplay
  useEffect(() => {
    if (tracks && tracks.length > 0 && !currentTrackRef.current) {
      const autoPlay = tracks.find(t => t.isAutoPlay) || tracks[0];
      const audio = audioRef.current;
      if (!audio) return;
      setCurrentTrack(autoPlay);
      currentTrackRef.current = autoPlay;
      audio.src = autoPlay.audioUrl;
      audio.load();
      audio.play().catch(() => {
        // Browser blocked autoplay — user needs to click play manually, that's OK
      });
    }
  }, [tracks]);

  const play = useCallback((track: MusicTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrackRef.current?.id === track.id) {
      if (isPlayingRef.current) audio.pause();
      else audio.play().catch(() => {});
    } else {
      setCurrentTrack(track);
      currentTrackRef.current = track;
      setCurrentTime(0);
      setDuration(0);
      audio.src = track.audioUrl;
      audio.load();
      audio.play().catch(() => {});
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingRef.current) audio.pause();
    else audio.play().catch(() => {});
  }, []);

  const next = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const q = queueRef.current;
    const ct = currentTrackRef.current;
    if (q.length === 0) return;
    const idx = q.findIndex(t => t.id === ct?.id);
    const nextTrack = q[(idx + 1) % q.length];
    setCurrentTrack(nextTrack);
    currentTrackRef.current = nextTrack;
    setCurrentTime(0);
    setDuration(0);
    audio.src = nextTrack.audioUrl;
    audio.load();
    audio.play().catch(() => {});
  }, []);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTimeRef.current > 3) {
      audio.currentTime = 0;
      return;
    }
    const q = queueRef.current;
    const ct = currentTrackRef.current;
    if (q.length === 0) return;
    const idx = q.findIndex(t => t.id === ct?.id);
    const prevTrack = q[(idx - 1 + q.length) % q.length];
    setCurrentTrack(prevTrack);
    currentTrackRef.current = prevTrack;
    setCurrentTime(0);
    setDuration(0);
    audio.src = prevTrack.audioUrl;
    audio.load();
    audio.play().catch(() => {});
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);

  const toggleRepeat = useCallback(() => {
    setRepeat(r => {
      const next = r === "none" ? "all" : r === "all" ? "one" : "none";
      repeatRef.current = next;
      return next;
    });
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
