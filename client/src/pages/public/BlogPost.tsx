import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePost } from "@/hooks/use-blog";
import { Loader2, ArrowLeft, Clock, Calendar } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: post, isLoading } = usePost(slug);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!post) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="font-serif text-2xl mb-4">Article not found</p>
        <Link href="/blog" className="text-sm font-medium text-primary hover:underline">Return to Blog</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-10 transition-colors" data-testid="link-back-to-blog">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <header className="mb-12">
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {estimateReadTime(post.content)} min read
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-5" data-testid="text-post-title">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground italic leading-relaxed">
              {post.excerpt}
            </p>
          </header>

          {post.imageUrl && (
            <div className="mb-12 rounded-xl overflow-hidden border border-border aspect-video bg-muted">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert prose-p:leading-loose prose-headings:font-serif prose-headings:font-bold prose-a:text-primary max-w-none">
            {post.content.split('\n\n').map((paragraph: string, idx: number) => {
              if (paragraph.startsWith('# ')) {
                return <h2 key={idx} className="text-2xl mt-10 mb-4">{paragraph.slice(2)}</h2>;
              }
              if (paragraph.startsWith('## ')) {
                return <h3 key={idx} className="text-xl mt-8 mb-3">{paragraph.slice(3)}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                const listItems = paragraph.split('\n').filter(l => l.startsWith('- '));
                return (
                  <ul key={idx} className="list-disc pl-6 space-y-1">
                    {listItems.map((li, j) => <li key={j}>{li.slice(2)}</li>)}
                  </ul>
                );
              }
              return <p key={idx}>{paragraph}</p>;
            })}
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft size={16} /> More articles
            </Link>
          </div>
        </motion.article>
      </main>

      <Footer />
    </div>
  );
}
