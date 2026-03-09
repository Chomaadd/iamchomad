import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useMusicTracks } from "@/hooks/use-music";
import { Loader2, Play, Pause, Music2, Headphones } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Music() {
  const { data: tracks, isLoading } = useMusicTracks();
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (tracks && tracks.length > 0) {
      const autoPlayTrack = tracks.find(t => t.isAutoPlay) || tracks[0];
      setPlaying(autoPlayTrack.id);
    }
  }, [tracks]);

  useEffect(() => {
    if (audioRef.current && playing) {
      const track = tracks?.find(t => t.id === playing);
      if (track) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play().catch(e => console.log("Autoplay blocked by browser", e));
      }
    } else if (audioRef.current && !playing) {
      audioRef.current.pause();
    }
  }, [playing, tracks]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            <Headphones size={14} /> Music
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="text-music-heading">
            Soundscapes
          </h1>
          <p className="text-lg text-muted-foreground mt-3 mx-auto max-w-2xl">
            Choiril Ahmad's favorite that he listens to all the time.
          </p>
        </motion.header>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {tracks?.map((track, i) => {
              const isPlaying = playing === track.id;
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                    isPlaying
                      ? "bg-primary/5 border-primary/30 soft-shadow"
                      : "bg-card border-border/60 hover:border-border hover:bg-accent/50"
                  }`}
                  data-testid={`card-track-${track.id}`}
                >
                  <button
                    onClick={() => setPlaying(isPlaying ? null : track.id)}
                    className={`w-11 h-11 flex items-center justify-center rounded-full shrink-0 transition-all ${
                      isPlaying
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-accent text-foreground hover:bg-primary hover:text-primary-foreground"
                    }`}
                    data-testid={`button-play-${track.id}`}
                  >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                  </button>

                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {track.albumArt ? (
                      <img src={track.albumArt} alt={track.title} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center shrink-0">
                        <Music2 size={18} className="text-primary/50" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-sm leading-tight truncate ${isPlaying ? "text-primary" : ""}`}>{track.title}</h3>
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
                <p className="font-serif text-xl font-bold">No tracks yet</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
