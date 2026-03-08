import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePosts } from "@/hooks/use-blog";

export default function Home() {
  const { data: posts } = usePosts();
  const featuredPosts = posts?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-10 pb-16 lg:pt-24 lg:pb-20 overflow-hidden border-b-2 border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="mb-8 relative">
                <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto overflow-hidden rounded-full border-4 border-primary bg-muted flex items-center justify-center">
                  <img
                    src="/image/hiarill.jpg"
                    alt="Choiril Ahmad"
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                </div>
              </div>

              <h2 className="text-lg sm:text-2xl font-medium mb-3">
                Hi I'm Choiril Ahmad
              </h2>

              <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-balance leading-[1.1] max-w-4xl mx-auto">
                Building digital products, brands, and experience.
              </h1>

              <p className="mt-8 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                A Frontend Developer and Visual Designer with experience in web
                design, brand identity and product design.
              </p>

              <div className="mt-12">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full"
                >
                  CONNECT WITH ME
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Journal */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-end mb-16 border-b-2 border-border pb-8">
              <div>
                <h2 className="font-serif text-4xl font-bold">Latest Blog</h2>
                <p className="text-muted-foreground mt-2">
                  All information related to CHOOMAD and business or development
                  will be notified on the Blog.
                </p>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex text-sm font-bold uppercase tracking-widest hover:underline underline-offset-8"
              >
                Read All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {featuredPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <Link href={`/blog/${post.id}`} className="block">
                    <div className="aspect-[3/2] mb-6 overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center font-serif text-muted-foreground text-xl italic">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <h3 className="font-serif text-2xl font-bold group-hover:underline underline-offset-4 decoration-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}