import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Play, Pause, Music2, Headphones, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { SeoHead } from "@/components/seometa/SeoHead";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { useMusicTracks } from "@/hooks/use-music";

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Music() {
  const { data: tracks, isLoading } = useMusicTracks();
  const { t } = useLanguage();
  const {
    currentTrack, isPlaying, currentTime, duration,
    shuffle, repeat,
    play, togglePlay, next, prev, seek, toggleShuffle, toggleRepeat, triggerAutoPlay
  } = useMusicPlayer();

  // Auto-play ONLY when visiting this page, and only once per session
  const triggeredRef = useRef(false);
  useEffect(() => {
    if (tracks && tracks.length > 0 && !triggeredRef.current) {
      triggeredRef.current = true;
      triggerAutoPlay();
    }
  }, [tracks, triggerAutoPlay]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <SeoHead
        title="Sound"
        description="Music and audio collection by Choiril Ahmad — a personal selection of sounds and compositions."
        url="/music"
      />
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            <Headphones size={14} /> {t("music.badge")}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="text-music-heading">
            {t("music.heading")}
          </h1>
          <p className="text-lg text-muted-foreground mt-3 mx-auto max-w-2xl">
            {t("music.description")}
          </p>
        </motion.header>

        {/* Now Playing Card */}
        {currentTrack && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              {currentTrack.albumArt ? (
                <img src={currentTrack.albumArt} alt={currentTrack.title}
                  className={`w-14 h-14 rounded-xl object-cover shrink-0 ${isPlaying ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Music2 size={22} className="text-primary/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">
                  {isPlaying ? "▶ Now Playing" : "Paused"}
                </p>
                <h2 className="font-bold text-foreground truncate leading-tight">{currentTrack.title}</h2>
                <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div
                className="relative h-1.5 bg-muted rounded-full cursor-pointer group mb-1"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  seek(ratio * duration);
                }}
              >
                <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary shadow-md opacity-0 group-hover:opacity-100 transition-opacity -ml-1.5"
                  style={{ left: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-lg transition-colors ${shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="button-shuffle"
                title="Shuffle"
              >
                <Shuffle size={18} />
              </button>
              <button onClick={prev} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors" data-testid="button-prev">
                <SkipBack size={22} />
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
                data-testid="button-play-main"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>
              <button onClick={next} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors" data-testid="button-next">
                <SkipForward size={22} />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-lg transition-colors ${repeat !== "none" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="button-repeat"
                title={repeat === "none" ? "No repeat" : repeat === "all" ? "Repeat all" : "Repeat one"}
              >
                {repeat === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
              </button>
            </div>
          </motion.div>
        )}

        {/* Track List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card">
                <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                <Skeleton className="w-11 h-11 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-3.5 w-2/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-3 w-10 shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {tracks?.map((track, i) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => play(track)}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card border-border/60 hover:border-border hover:bg-accent/50"
                  }`}
                  data-testid={`card-track-${track.id}`}
                >
                  <div className={`w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-accent text-foreground"
                  }`}>
                    {isActive && isPlaying ? (
                      <span className="flex gap-0.5 items-end h-4">
                        {[1, 2, 3].map(j => (
                          <span key={j} className="w-0.5 bg-current rounded-sm animate-bounce"
                            style={{ height: `${40 + j * 20}%`, animationDelay: `${j * 0.12}s` }}
                          />
                        ))}
                      </span>
                    ) : isActive ? (
                      <Pause size={15} fill="currentColor" />
                    ) : (
                      <Play size={15} fill="currentColor" className="ml-0.5" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {track.albumArt ? (
                      <img src={track.albumArt} alt={track.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center shrink-0">
                        <Music2 size={16} className="text-primary/50" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-sm leading-tight truncate ${isActive ? "text-primary" : ""}`}>{track.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-muted-foreground shrink-0 tabular-nums">
                    {track.duration || "—"}
                  </span>
                </motion.div>
              );
            })}
            {tracks?.length === 0 && (
              <div className="text-center py-24 bg-card border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Music2 size={28} className="text-primary" />
                </div>
                <p className="font-serif text-xl font-bold">{t("music.empty.title")}</p>
                <p className="text-sm text-muted-foreground mt-2">{t("music.empty.desc")}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
