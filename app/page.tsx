"use client"

import { motion } from "framer-motion"
import { Dumbbell, Heart, TrendingUp, Zap, Trophy, Users, ArrowRight, Star, Shield, Clock } from "lucide-react"
import Link from "next/link"

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } }

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ZUZU</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Pricing</Link>
            <Link href="/blog" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Blog</Link>
            <Link href="/blog" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Blog</Link>
          </div>
          <Link href="#download" className="bg-[var(--primary)] text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
            Get App
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 relative overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/50 via-violet-100/30 to-transparent rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <motion.div animate={{ scale: [1, 1.15, 1], x: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-100/40 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-purple-50 text-[var(--primary)] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              💪 AI-Powered Fitness
            </motion.div>
            <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Train Smarter
              <br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">Get Stronger</span>
            </motion.h1>
            <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[var(--muted)] mb-10 max-w-xl mx-auto leading-relaxed">
              Personalized workouts, real-time coaching, and progress tracking. Your pocket personal trainer that adapts to you.
            </motion.p>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex justify-center gap-6 mb-10">
              {[{ icon: Zap, label: "Smart Plans" }, { icon: Heart, label: "Health Tracking" }, { icon: Trophy, label: "Achievements" }].map((b, i) => (
                <motion.div key={i} whileHover={{ y: -4, scale: 1.05 }}
                  className="flex items-center gap-2 bg-white border border-[var(--border)] rounded-full px-4 py-2 shadow-sm">
                  <b.icon className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-sm font-medium">{b.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.4 }} id="download" className="flex flex-wrap justify-center gap-4">
              <Link href="#" className="inline-flex items-center gap-2 bg-[var(--foreground)] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                App Store
              </Link>
              <Link href="#" className="inline-flex items-center gap-2 bg-[var(--foreground)] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
                Google Play
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">Features</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">Everything You Need</h2>
            <p className="text-[var(--muted)] text-lg max-w-lg mx-auto">Built for every fitness level — from beginner to advanced.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Dumbbell, title: "Smart Workouts", desc: "AI generates personalized workout plans based on your goals and fitness level.", color: "from-purple-500 to-violet-500" },
              { icon: TrendingUp, title: "Progress Tracking", desc: "Track reps, sets, weight, and see your strength grow over time with detailed charts.", color: "from-blue-500 to-cyan-500" },
              { icon: Heart, title: "Health Metrics", desc: "Monitor heart rate, calories burned, and recovery to train at optimal intensity.", color: "from-red-500 to-pink-500" },
              { icon: Trophy, title: "Achievements", desc: "Earn badges, complete challenges, and stay motivated with gamified milestones.", color: "from-amber-500 to-orange-500" },
              { icon: Users, title: "Community", desc: "Join challenges with friends, share workouts, and compete on leaderboards.", color: "from-green-500 to-emerald-500" },
              { icon: Clock, title: "Quick Sessions", desc: "Short on time? Get effective 10-20 minute HIIT and circuit workouts.", color: "from-indigo-500 to-purple-500" },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }} whileHover={{ y: -8 }}
                className="group bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-200 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[var(--card)]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "50K+", label: "Active Users" },
            { value: "1M+", label: "Workouts Done" },
            { value: "4.8", label: "App Rating" },
            { value: "200+", label: "Exercises" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05 }} className="text-center p-6">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent mb-1">{s.value}</div>
              <div className="text-sm text-[var(--muted)] font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">Start Free, Go Pro</h2>
            <p className="text-[var(--muted)] text-lg max-w-lg mx-auto">No commitment. Cancel anytime.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              { name: "Free", price: "$0", period: "forever", features: ["Basic workouts", "Progress tracking", "5 exercises/day", "Community access"], cta: "Get Started", popular: false },
              { name: "Pro", price: "$9.99", period: "/month", features: ["Unlimited workouts", "AI coaching", "Advanced analytics", "Custom plans", "No ads", "Priority support"], cta: "Go Pro", popular: true },
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }} whileHover={{ y: -6 }}
                className={`relative bg-white border-2 rounded-3xl p-8 ${plan.popular ? "border-[var(--primary)] shadow-xl shadow-purple-500/10" : "border-[var(--border)]"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-xs font-bold px-4 py-2 rounded-full uppercase">
                      <Star className="w-3.5 h-3.5" /> Most Popular
                    </span>
                  </div>
                )}
                <p className="text-sm font-medium text-[var(--muted)] mb-3">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
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
                <button className={`w-full py-3 rounded-full font-semibold transition-all hover:scale-[1.02] ${plan.popular ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--foreground)]"}`}>
                  {plan.cta} <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">ZUZU</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-[var(--muted)]">
            <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</Link>
            <Link href="/delete-data" className="hover:text-[var(--foreground)] transition-colors">Delete Data</Link>
            <Link href="/support" className="hover:text-[var(--foreground)] transition-colors">Support</Link>
            <Link href="/blog" className="hover:text-[var(--foreground)] transition-colors">Blog</Link>
          </div>
          <p className="text-sm text-[var(--muted)]">© {new Date().getFullYear()} ZUZU. Made by <a href="https://holylabs.net" className="text-[var(--primary)] hover:underline">Holylabs</a></p>
        </div>
      </footer>
    </main>
  )
}
