import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useMusicTracks } from "@/hooks/use-music";
import { Loader2, Play, Pause } from "lucide-react";
import { useState } from "react";

export default function Music() {
  const { data: tracks, isLoading } = useMusicTracks();
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <header className="mb-20 border-b-2 border-border pb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-6xl md:text-8xl font-bold"
          >
            Soundscapes.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mt-6 mx-auto max-w-2xl"
          >
            Auditory explorations and curated selections.
          </motion.p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {tracks?.map((track, i) => (
              <motion.div 
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 border-2 border-border hover:border-primary transition-colors bg-card group"
              >
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => setPlaying(playing === track.id ? null : track.id)}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform"
                  >
                    {playing === track.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                  </button>
                  <div className="flex items-center space-x-4">
                    {track.albumArt && (
                      <img src={track.albumArt} alt={track.title} className="w-12 h-12 object-cover border border-border grayscale group-hover:grayscale-0 transition-all" />
                    )}
                    <div>
                      <h3 className="font-serif font-bold text-lg leading-tight">{track.title}</h3>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-mono text-muted-foreground">
                  {track.duration || "—"}
                </div>
              </motion.div>
            ))}
            {tracks?.length === 0 && (
              <div className="text-center py-24 text-muted-foreground font-serif italic">No tracks uploaded yet.</div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
