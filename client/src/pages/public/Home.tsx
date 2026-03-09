import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePosts } from "@/hooks/use-blog";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const { data: posts } = usePosts();
  const featuredPosts = posts?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <section className="relative pt-16 pb-20 lg:pt-28 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-8 relative"
              >
                <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto overflow-hidden rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background shadow-lg">
                  <img
                    src="/image/hiarill.jpg"
                    alt="Choiril Ahmad"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
                  <Sparkles size={16} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Available for work
              </motion.div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1] max-w-4xl mx-auto" data-testid="text-hero-heading">
                Building digital products,
                <span className="gradient-text"> brands</span>, and experience.
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                A Frontend Developer and Visual Designer with experience in web
                design, brand identity and product design.
              </p>

              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                  data-testid="link-cta-connect"
                >
                  Connect with me
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold border border-border hover:bg-accent transition-all rounded-full"
                  data-testid="link-cta-about"
                >
                  Learn more
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">From the blog</p>
                <h2 className="font-serif text-3xl lg:text-4xl font-bold">Latest Posts</h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                data-testid="link-view-all-posts"
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block" data-testid={`link-featured-post-${post.slug}`}>
                    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden hover-lift soft-shadow hover:shadow-lg transition-all">
                      <div className="aspect-[3/2] overflow-hidden bg-muted">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center font-serif text-muted-foreground/30 text-4xl italic">
                            B
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <h3 className="font-serif text-xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                View all posts <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
