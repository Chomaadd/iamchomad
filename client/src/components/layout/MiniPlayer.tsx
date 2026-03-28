import { useMusicPlayer } from "@/hooks/use-music-player";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Music2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, shuffle, repeat, togglePlay, next, prev, seek, toggleShuffle, toggleRepeat } = useMusicPlayer();
  const [dismissed, setDismissed] = useState(false);

  if (!currentTrack || dismissed) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl">
      {/* Progress bar - thin strip at top */}
      <div className="relative h-1 bg-muted cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          seek(ratio * duration);
        }}
      >
        <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow opacity-0 group-hover:opacity-100 transition-opacity -ml-1.5"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
        {/* Album art + info */}
        <Link href="/music" className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            {currentTrack.albumArt ? (
              <img src={currentTrack.albumArt} alt={currentTrack.title}
                className={`w-10 h-10 rounded-lg object-cover ${isPlaying ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Music2 size={16} className="text-primary/50" />
              </div>
            )}
            {isPlaying && (
              <span className="absolute -bottom-1 -right-1 flex gap-0.5 items-end h-3">
                {[1, 2, 3].map(i => (
                  <span key={i} className="w-0.5 bg-primary rounded-sm animate-bounce"
                    style={{ height: `${40 + i * 20}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-foreground leading-tight">{currentTrack.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        </Link>

        {/* Time */}
        <span className="text-xs font-mono text-muted-foreground shrink-0 tabular-nums hidden sm:block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={toggleShuffle}
            className={`p-2 rounded-lg transition-colors ${shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Shuffle"
          >
            <Shuffle size={15} />
          </button>
          <button onClick={prev} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack size={18} />
          </button>
          <button onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-md shadow-primary/30"
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
          <button onClick={next} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward size={18} />
          </button>
          <button onClick={toggleRepeat}
            className={`p-2 rounded-lg transition-colors ${repeat !== "none" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Repeat"
          >
            {repeat === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
          </button>
        </div>

        {/* Dismiss */}
        <button onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Tutup"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}
