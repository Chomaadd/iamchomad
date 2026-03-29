import { useMusicPlayer } from "@/hooks/use-music-player";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Music2,
  ChevronDown,
  ListMusic,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const { t } = useLanguage();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    queue,
    hasInteracted,
    play,
    togglePlay,
    next,
    prev,
    seek,
    toggleShuffle,
    toggleRepeat,
  } = useMusicPlayer();

  const [dismissed, setDismissed] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Re-show mini player when music starts playing again after dismiss
  useEffect(() => {
    if (isPlaying && dismissed) {
      setDismissed(false);
    }
  }, [isPlaying]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Only show after user has interacted with music (not on page load across all pages)
  if (!currentTrack || !hasInteracted || dismissed) return null;

  const handleDismiss = () => {
    if (isPlaying) togglePlay();
    setShowQueue(false);
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Queue panel — slides up above the player */}
      {showQueue && (
        <div className="bg-card/98 backdrop-blur-md border-t border-x border-border shadow-2xl max-w-4xl mx-auto rounded-t-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ListMusic size={13} /> {t("miniplayer.list")}
            </span>
            <button
              onClick={() => setShowQueue(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {queue.map((track, i) => {
              const isActive = track.id === currentTrack.id;
              return (
                <button
                  key={track.id}
                  onClick={() => play(track)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/60 text-foreground"
                  }`}
                >
                  {/* Number / playing indicator */}
                  <span className="text-xs font-mono w-4 text-center shrink-0 text-muted-foreground">
                    {isActive && isPlaying ? (
                      <span className="flex gap-0.5 items-end h-3 justify-center">
                        {[1, 2, 3].map((j) => (
                          <span
                            key={j}
                            className="w-0.5 bg-primary rounded-sm animate-bounce"
                            style={{
                              height: `${40 + j * 20}%`,
                              animationDelay: `${j * 0.12}s`,
                            }}
                          />
                        ))}
                      </span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  {/* Album art */}
                  {track.albumArt ? (
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-8 h-8 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Music2 size={13} className="text-primary/50" />
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate leading-tight ${isActive ? "text-primary" : ""}`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>
                  {/* Duration */}
                  <span className="text-xs font-mono text-muted-foreground shrink-0">
                    {track.duration || "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main mini player bar */}
      <div className="bg-card/95 backdrop-blur-md border-t border-border shadow-2xl">
        {/* Progress bar */}
        <div
          className="relative h-1 bg-muted cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - rect.left) / rect.width) * duration);
          }}
        >
          <div
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow opacity-0 group-hover:opacity-100 transition-opacity -ml-1.5"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
          {/* Album art + info — tap to go to music page */}
          <Link
            href="/music"
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="relative shrink-0">
              {currentTrack.albumArt ? (
                <img
                  src={currentTrack.albumArt}
                  alt={currentTrack.title}
                  className={`w-10 h-10 rounded-lg object-cover ${isPlaying ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music2 size={16} className="text-primary/50" />
                </div>
              )}
              {isPlaying && (
                <span className="absolute -bottom-1 -right-1 flex gap-0.5 items-end h-3">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="w-0.5 bg-primary rounded-sm animate-bounce"
                      style={{
                        height: `${40 + i * 20}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground leading-tight">
                {currentTrack.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>
          </Link>

          {/* Time */}
          <span className="text-xs font-mono text-muted-foreground shrink-0 tabular-nums hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-colors ${shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              title="Shuffle"
            >
              <Shuffle size={15} />
            </button>
            <button
              onClick={prev}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-md shadow-primary/30"
            >
              {isPlaying ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" className="ml-0.5" />
              )}
            </button>
            <button
              onClick={next}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward size={18} />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-lg transition-colors ${repeat !== "none" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              title={
                repeat === "none"
                  ? "Repeat off"
                  : repeat === "all"
                    ? "Repeat all"
                    : "Repeat one"
              }
            >
              {repeat === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
            </button>
          </div>

          {/* Queue toggle */}
          <button
            onClick={() => setShowQueue((q) => !q)}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${showQueue ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Daftar lagu"
          >
            <ListMusic size={16} />
          </button>

          {/* Dismiss — pauses music */}
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 transition-colors shrink-0"
            title="Tutup & hentikan musik"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
