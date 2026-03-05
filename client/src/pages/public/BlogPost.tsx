import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePost } from "@/hooks/use-blog";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: post, isLoading,  } = usePost(slug);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!post) return <div className="min-h-screen flex flex-col items-center justify-center font-serif text-2xl">The article you're looking for doesn't exist or has been removed.<Link href="/blog" className="text-sm font-sans mt-4 underline">Return to Blog</Link></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <Link href="/blog" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
        </Link>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <header className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
              {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-8">
              {post.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic font-serif">
              {post.excerpt}
            </p>
          </header>

          {post.imageUrl && (
            <div className="mb-16 border-2 border-primary editorial-shadow bg-muted aspect-video overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover grayscale" />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert prose-p:leading-loose prose-headings:font-serif prose-headings:font-bold max-w-none">
            {post.content.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </motion.article>
      </main>

      <Footer />
    </div>
  );
}