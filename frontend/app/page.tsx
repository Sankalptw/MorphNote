"use client"

import Link from "next/link"
import { ArrowRight, PenTool, Sparkles, Zap, Lock } from "lucide-react"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden ">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-40 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-morph"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-border/40 bg-background/80 backdrop-blur-md z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg animate-pulse-scale">
              <PenTool className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
             MorphNote
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            
            <Link
              href="/login"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div className="space-y-8 animate-slide-up">
           

            <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-balance leading-tight">
              Think,
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                Write, Create
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              A distraction-free sanctuary for your ideas. Fast, elegant, and yours to keep.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              href="/dashboard"
              className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50"
            >
              <span className="relative flex items-center gap-2">
                Start Writing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
            <Link
              href="/pdf"
              className="px-8 py-4 bg-card border border-border/50 text-foreground rounded-lg font-semibold hover:border-border transition-all duration-300 hover:bg-card/80 backdrop-blur-sm"
            >
              Query Pdf
            </Link>
          </div>

          
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-bold">Everything you need</h2>
            <p className="text-lg text-muted-foreground">Built for focused writing and organized thinking</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Lightning Speed",
                description: "Instant responsiveness with real-time sync. No lag, no delays, just pure flow.",
                delay: "0s",
                gradient: "from-blue-500/20 to-cyan-500/20",
              },
              {
                icon: Lock,
                title: "Complete Privacy",
                description: "Your notes stay yours. Stored locally with no tracking, no ads, no distractions.",
                delay: "0.1s",
                gradient: "from-purple-500/20 to-pink-500/20",
              },
              {
                icon: PenTool,
                title: "Beautifully Simple",
                description: "An interface so clean it disappears. Focus on what matters: your ideas.",
                delay: "0.2s",
                gradient: "from-emerald-500/20 to-teal-500/20",
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="group relative animate-slide-up"
                  style={{ animationDelay: feature.delay }}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  ></div>

                  <div className="relative bg-card/40 border border-border/40 rounded-2xl p-8 group-hover:border-border/80 transition-all duration-500 backdrop-blur-sm h-full flex flex-col">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl opacity-0 group-hover:opacity-20 blur group-hover:animate-rotate-slow transition-opacity duration-300"></div>
                      <div className="relative w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 border border-primary/20 group-hover:border-primary/40">
                        <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed flex-grow">{feature.description}</p>

                    <div className="mt-6 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="showcase" className="relative py-24 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-bold">Experience the flow</h2>
            <p className="text-lg text-muted-foreground">See how your ideas come to life</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left side - Loading animation showcase */}
            <div className="relative animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-50 group-hover:opacity-100"></div>
              <div className="relative bg-card/40 border border-border/40 rounded-2xl p-8 backdrop-blur-sm h-80 flex flex-col items-center justify-center">
                {/* Animated loading orbs */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute w-full h-full border border-primary/30 rounded-full animate-rotate-slow"></div>
                  <div
                    className="absolute w-32 h-32 border border-accent/30 rounded-full animate-rotate-slow"
                    style={{ animationDirection: "reverse", animationDuration: "15s" }}
                  ></div>
                  <div className="absolute w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse-scale shadow-2xl shadow-primary/30"></div>
                  <Sparkles className="w-8 h-8 text-primary relative z-10" />
                </div>
                <p className="mt-8 text-muted-foreground text-sm">Syncing your brilliance...</p>
              </div>
            </div>

            {/* Right side - Wave animation */}
            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-card/40 border border-border/40 rounded-2xl p-8 backdrop-blur-sm h-80 flex flex-col">
                <h3 className="text-xl font-bold mb-6">Auto-saving Notes</h3>
                <div className="flex-grow flex items-end justify-center gap-2 pb-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-3 bg-gradient-to-t from-primary to-accent rounded-full"
                      style={{
                        height: `${40 + i * 15}%`,
                        animation: `wave 2s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    ></div>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm text-center">Real-time synchronization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="relative border-t border-border/30 py-12 px-6 bg-card/20 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-muted-foreground text-sm">© 2025 Notes. Crafted with focus.</p>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors duration-300">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors duration-300">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors duration-300">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
