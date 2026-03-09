import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePosts } from "@/hooks/use-blog";
import { Loader2, ArrowRight, Clock } from "lucide-react";

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function Blog() {
  const { data: posts, isLoading } = usePosts();
  const publishedPosts = posts?.filter(post => post.published);

  const featuredPost = publishedPosts?.[0];
  const remainingPosts = publishedPosts?.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight" data-testid="text-blog-heading">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-xl">
            Thoughts, essays, and observations on design, technology, and the creative process.
          </p>
          <div className="h-px bg-border mt-8" />
        </motion.header>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <>
            {featuredPost && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <Link href={`/blog/${featuredPost.slug}`} className="group block">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border">
                      {featuredPost.imageUrl ? (
                        <img
                          src={featuredPost.imageUrl}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-muted-foreground/30 text-6xl italic">B</div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-medium uppercase tracking-wider">
                          {new Date(featuredPost.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="flex items-center gap-1"><Clock size={12} /> {estimateReadTime(featuredPost.content)} min read</span>
                      </div>
                      <h2 className="font-serif text-3xl lg:text-4xl font-bold leading-tight group-hover:text-primary/80 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground text-base leading-relaxed line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                        Read article <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {remainingPosts && remainingPosts.length > 0 && (
              <>
                {featuredPost && <div className="h-px bg-border mb-12" />}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingPosts.map((post, i) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/blog/${post.slug}`} className="group block h-full" data-testid={`link-blog-${post.slug}`}>
                        <div className="border border-border rounded-xl overflow-hidden h-full flex flex-col hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card">
                          <div className="aspect-[16/10] overflow-hidden bg-muted">
                            {post.imageUrl ? (
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-serif text-muted-foreground/20 text-4xl italic">B</div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
                              <span className="uppercase tracking-wider">
                                {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                              <span>{estimateReadTime(post.content)} min</span>
                            </div>
                            <h3 className="font-serif text-lg font-bold leading-snug group-hover:text-primary/80 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2 flex-1">
                              {post.excerpt}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mt-4 group-hover:gap-2.5 transition-all">
                              Read more <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </>
            )}

            {publishedPosts?.length === 0 && (
              <div className="text-center py-24 border border-dashed border-border rounded-xl text-muted-foreground">
                <p className="font-serif text-xl italic">No published posts yet.</p>
                <p className="text-sm mt-2">Check back soon for new content.</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
