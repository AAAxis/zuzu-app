"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Dumbbell, Heart, TrendingUp, Trophy, Users, ArrowRight, Star, Clock, ChevronRight, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getSupabase } from "@/lib/supabase"
import { he } from "@/lib/messages-he"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } }

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  category: string
  published_at: string
  read_time: number
  translations?: {
    he?: { title?: string; excerpt?: string }
    en?: { title?: string; excerpt?: string }
  }
  original_language?: string
}

/** Post has Hebrew content (main or translation). */
function hasHebrew(post: BlogPost): boolean {
  if (post.original_language === "he") return true
  const he = post.translations?.he
  return !!(he?.title || he?.excerpt)
}

/** Get Hebrew title/excerpt for display. */
function getHebrew(post: BlogPost): { title: string; excerpt: string } {
  if (post.original_language === "he")
    return { title: post.title || "", excerpt: post.excerpt || "" }
  const he = post.translations?.he
  return {
    title: he?.title || post.title || "",
    excerpt: he?.excerpt || post.excerpt || "",
  }
}

const featureList = [
  { key: "1", title: he.feature1Title, desc: he.feature1Desc, color: "from-purple-500 to-violet-500" },
  { key: "2", title: he.feature2Title, desc: he.feature2Desc, color: "from-blue-500 to-cyan-500" },
  { key: "3", title: he.feature3Title, desc: he.feature3Desc, color: "from-red-500 to-pink-500" },
  { key: "4", title: he.feature4Title, desc: he.feature4Desc, color: "from-amber-500 to-orange-500" },
  { key: "5", title: he.feature5Title, desc: he.feature5Desc, color: "from-green-500 to-emerald-500" },
  { key: "6", title: he.feature6Title, desc: he.feature6Desc, color: "from-indigo-500 to-purple-500" },
]

const iconMap = [Dumbbell, TrendingUp, Heart, Trophy, Users, Clock] as const

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await getSupabase()
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, category, published_at, read_time, translations, original_language")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20)
      if (data) {
        // Hebrew site: only show posts that have Hebrew content
        setPosts(data.filter(hasHebrew))
      }
    }
    fetchPosts()
  }, [])

  return (
    <main className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ZUZU</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#about" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">{he.navAbout}</Link>
            <Link href="#features" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">{he.navFeatures}</Link>
            <Link href="#blog" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">{he.navBlog}</Link>
            <Link href="#pricing" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">{he.navPricing}</Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="#download" className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
            {he.navGetApp}
          </Link>
          </div>
        </nav>
      </header>

      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-[var(--light)] to-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white border border-[var(--border)] rounded-full px-4 py-2 text-sm font-medium text-[var(--primary)] mb-8 shadow-sm">
              💪 {he.heroBadge}
            </motion.div>
            <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              {he.heroTitle1}
              <br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">{he.heroTitle2}</span>
            </motion.h1>
            <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-[var(--muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
              {he.heroSubtitle}
            </motion.p>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} id="download" className="flex flex-wrap justify-center gap-4 mb-12">
              <Link href="#" className="inline-flex items-center gap-2 bg-[var(--foreground)] text-white px-7 py-3.5 rounded-2xl font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                {he.appStore}
              </Link>
              <Link href="#" className="inline-flex items-center gap-2 bg-[var(--foreground)] text-white px-7 py-3.5 rounded-2xl font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
                {he.googlePlay}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">{he.aboutLabel}</span>
              <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">{he.aboutTitle}</h2>
              <div className="section-divider mb-8"></div>
              <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">{he.aboutP1}</p>
              <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">{he.aboutP2}</p>
              <p className="text-lg text-[var(--muted)] leading-relaxed">{he.aboutP3}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-28 bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">{he.featuresLabel}</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">{he.featuresTitle}</h2>
            <div className="section-divider mb-6"></div>
            <p className="text-[var(--muted)] text-lg max-w-lg mx-auto">{he.featuresSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureList.map((f, i) => {
              const Icon = iconMap[i]
              return (
                <motion.div key={f.key} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }} whileHover={{ y: -6 }}
                  className="group bg-white border border-[var(--border)] rounded-2xl p-7 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-200 transition-all">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-[var(--muted)] leading-relaxed">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[var(--primary)] to-purple-700">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "50K+", label: he.statUsers },
            { value: "1M+", label: he.statWorkouts },
            { value: "4.8", label: he.statRating },
            { value: "200+", label: he.statExercises },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} className="text-center p-4">
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-sm text-purple-200 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="blog" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">{he.blogLabel}</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">{he.blogTitle}</h2>
            <div className="section-divider mb-6"></div>
            <p className="text-[var(--muted)] text-lg max-w-lg mx-auto">{he.blogSubtitle}</p>
          </div>
          {posts.length > 0 ? (
            <>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
                <Link href={`/blog/${posts[0].slug}`} className="group block">
                  <div className="bg-white border border-[var(--border)] rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all md:flex">
                    {posts[0].featured_image && (
                      <div className="relative md:w-1/2 aspect-video md:aspect-auto overflow-hidden">
                        <Image src={posts[0].featured_image} alt={getHebrew(posts[0]).title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        {posts[0].category && (
                          <span className="absolute top-4 right-4 bg-[var(--primary)] text-white text-xs font-semibold px-3 py-1.5 rounded-full">{posts[0].category}</span>
                        )}
                      </div>
                    )}
                    <div className="p-8 md:w-1/2 flex flex-col justify-center">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-[var(--primary)] transition-colors">{getHebrew(posts[0]).title}</h3>
                      <p className="text-[var(--muted)] leading-relaxed mb-4 line-clamp-3">{getHebrew(posts[0]).excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                        {posts[0].published_at && <span>{new Date(posts[0].published_at).toLocaleDateString("he-IL", { month: "short", day: "numeric", year: "numeric" })}</span>}
                        {posts[0].read_time && <span>· {posts[0].read_time} {he.minRead}</span>}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[var(--primary)] font-semibold mt-4 text-sm group-hover:gap-2 transition-all">
                        {he.readMore} <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {posts.slice(1, 7).map((post, i) => {
                  const { title: heTitle, excerpt: heExcerpt } = getHebrew(post)
                  return (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <Link href={`/blog/${post.slug}`} className="group block h-full">
                      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-200 transition-all h-full flex flex-col">
                        {post.featured_image && (
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <Image src={post.featured_image} alt={heTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            {post.category && (
                              <span className="absolute top-3 right-3 bg-[var(--primary)] text-white text-xs font-semibold px-2.5 py-1 rounded-full">{post.category}</span>
                            )}
                          </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">{heTitle}</h3>
                          <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3 flex-1">{heExcerpt}</p>
                          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                            <span>{post.published_at && new Date(post.published_at).toLocaleDateString("he-IL", { month: "short", day: "numeric" })}</span>
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {post.read_time} דק׳</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )})}
              </div>
              <div className="text-center">
                <Link href="/blog" className="inline-flex items-center gap-2 bg-[var(--light)] text-[var(--primary)] px-8 py-3.5 rounded-full font-semibold hover:bg-[var(--primary)] hover:text-white transition-all">
                  {he.viewAllArticles} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[var(--muted)]">{he.loadingArticles}</p>
            </div>
          )}
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-28 bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">{he.pricingLabel}</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">{he.pricingTitle}</h2>
            <div className="section-divider mb-6"></div>
            <p className="text-[var(--muted)] text-lg max-w-lg mx-auto">{he.pricingSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              { name: he.planFree, price: "$0", period: he.forever, features: [he.planFreeFeature1, he.planFreeFeature2, he.planFreeFeature3, he.planFreeFeature4], cta: he.getStarted, popular: false },
              { name: he.planPro, price: "$9.99", period: he.perMonth, features: [he.planProFeature1, he.planProFeature2, he.planProFeature3, he.planProFeature4, he.planProFeature5, he.planProFeature6], cta: he.goPro, popular: true },
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }} whileHover={{ y: -6 }}
                className={`relative bg-white border-2 rounded-3xl p-8 ${plan.popular ? "border-[var(--primary)] shadow-xl shadow-purple-500/10" : "border-[var(--border)]"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-xs font-bold px-4 py-2 rounded-full uppercase">
                      <Star className="w-3.5 h-3.5" /> {he.mostPopular}
                    </span>
                  </div>
                )}
                <p className="text-sm font-medium text-[var(--muted)] mb-3">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                  <span className="text-[var(--muted)] text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 my-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[var(--muted)]">
                      <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3.5 rounded-full font-semibold transition-all hover:scale-[1.02] ${plan.popular ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-lg" : "bg-[var(--light)] text-[var(--foreground)]"}`}>
                  {plan.cta} <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-br from-[var(--primary)] via-purple-600 to-purple-800 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{he.ctaTitle}</h2>
            <p className="text-lg text-purple-200 mb-10 max-w-xl mx-auto leading-relaxed">{he.ctaSubtitle}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#" className="inline-flex items-center gap-2 bg-white text-[var(--primary)] px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg">
                {he.downloadFree} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-12 bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">ZUZU</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--muted)]">
              <Link href="/blog" className="hover:text-[var(--primary)] transition-colors">{he.navBlog}</Link>
              <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">{he.footerPrivacy}</Link>
              <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">{he.footerTerms}</Link>
              <Link href="/delete-data" className="hover:text-[var(--primary)] transition-colors">{he.footerDeleteData}</Link>
              <Link href="/support" className="hover:text-[var(--primary)] transition-colors">{he.footerSupport}</Link>
              <LanguageSwitcher />
            </div>
            <p className="text-sm text-[var(--muted)]">{he.footerCopyright} <a href="https://holylabs.net" className="text-[var(--primary)] hover:underline font-medium">Holylabs</a></p>
          </div>
        </div>
      </footer>
    </main>
  )
}
