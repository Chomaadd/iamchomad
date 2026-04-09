import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Clock } from "lucide-react";

export default function LinkExpired() {
  const { language } = useLanguage();
  const isID = language === "id";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-destructive" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-wider mb-4">
              {isID ? "Kedaluwarsa" : "Expired"}
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold mb-3">
              {isID ? "Tautan Ini Sudah Tidak Aktif" : "This Link Has Expired"}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isID
                ? "Tautan pendek ini telah melewati masa berlakunya dan tidak dapat lagi digunakan."
                : "This short URL has passed its expiry date and is no longer available."}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-testid="link-back-home-expired"
          >
            {isID ? "Kembali ke Beranda" : "Back to Home"}
          </Link>

          <p className="text-xs text-muted-foreground">
            {isID ? "Tautan pendek oleh" : "Short URL by"}{" "}
            <a href="/" className="text-primary hover:underline">
              iamchomad.my.id
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
