import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePosts } from "@/hooks/use-blog";
import { Loader2 } from "lucide-react";

export default function Blog() {
  const { data: posts, isLoading } = usePosts();
  const publishedPosts = posts?.filter(post => post.published);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <header className="mb-20 border-b-2 border-border pb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-6xl md:text-8xl font-bold"
          >
            Blog.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mt-6 max-w-2xl"
          >
            An archive of thoughts, essays, and critical observations on design, technology, and art.
          </motion.p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-16 lg:space-y-24">
            {publishedPosts?.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group cursor-pointer"
              >
                <div className="lg:col-span-5 order-2 lg:order-1">
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="font-serif text-3xl lg:text-4xl font-bold group-hover:underline underline-offset-4 decoration-2 leading-tight">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="pt-4">
                      <Link href={`/blog/${post.slug}`} className="text-sm font-bold uppercase tracking-widest border-b-2 border-primary pb-1">
                        Read Essay
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 order-1 lg:order-2">
                  <Link href={`/blog/${post.slug}`} className="block overflow-hidden border-2 border-border aspect-[16/9]">
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center font-serif text-muted-foreground text-2xl italic">E.</div>
                    )}
                  </Link>
                </div>
              </motion.article>
            ))}

            {publishedPosts?.length === 0 && (
              <div className="text-center py-24 border-2 border-dashed border-border text-muted-foreground font-serif text-xl italic">
                There are no posts published yet.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}