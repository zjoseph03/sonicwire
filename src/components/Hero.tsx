import { ArrowRight, Zap, Clock, Shield, FileText, Play, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

import articlePreviewImage from "../../media_content/WHN1PageSS.png";

const Hero = () => {
  const handleQuoteClick = () => {
    // Track in Clarity
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'quote_button_hero');
    }
    // Track in GA4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quote_button_click', {
        button_location: 'hero'
      });
    }
  };

  const stats = [
    { icon: Zap, label: "Lead Time", value: "7-14 Days" },
    { icon: Shield, label: "Quality", value: "IPC/WHMA-A-620" },
    { icon: Clock, label: "Response", value: "< 2 Hours" }
  ];

  const articleUrl = "https://wiringharnessnews.com/wp-content/uploads/issues/2026/mar-apr/";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 technical-grid opacity-40" />
      
      {/* Blue Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center lg:items-start">
            {/* Left: Main Content */}
            <div>
              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-6 text-center lg:text-left"
              >
                Precision Wire Harness{" "}
                <span className="text-primary">Manufacturing</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 text-center lg:text-left max-w-3xl mx-auto lg:mx-0 leading-relaxed"
              >
                Industrial automation meets rapid turnaround. Upload your schematic, receive instant quotes,
                and get production-ready harnesses delivered to your facility.
              </motion.p>

              {/* Coming Soon Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center lg:justify-start mb-8"
              >
                <a
                  href="#waitlist"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/50 px-6 py-3 rounded-full relative overflow-hidden group cursor-pointer hover:border-primary transition-colors"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="relative text-base md:text-lg font-bold text-foreground tracking-wide">
                    Coming Soon — Join the Waitlist
                  </span>
                </a>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center lg:justify-start mb-12"
              >
                <a
                  href="/quote-request"
                  onClick={handleQuoteClick}
                  className="btn-primary inline-flex items-center gap-3 text-lg group"
                >
                  <span>Get Instant Quote</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto lg:mx-0"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="metric-card p-6 rounded-lg text-center"
                  >
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="font-mono text-2xl font-semibold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium tracking-wide">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: Media / Press Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="industrial-card rounded-2xl overflow-hidden shadow-2xl border-border/80"
            >
              <div className="p-5 border-b border-border/70 bg-muted/20">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                    <Play className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                      Demo Video
                    </span>
                  </div>
                  <a
                    href={articleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Read the feature
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  See SonicWire in action
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Watch the workflow and read the Wire Harness News feature for more context.
                </p>
              </div>

              <div className="relative bg-black border-y border-border/70 overflow-hidden group">
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur px-3 py-1.5 border border-white/10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-white/90">
                    Watch the demo
                  </span>
                </div>
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src="https://player.vimeo.com/video/1179764459?title=0&byline=0&portrait=0&badge=0&autopause=0&dnt=1"
                    className="absolute inset-0 h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                    allowFullScreen
                    title="SonicWire demo video"
                  />
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="rounded-xl border border-border bg-gradient-to-r from-muted/40 to-background px-4 py-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">
                        <FileText className="w-3.5 h-3.5" />
                        Press feature
                      </div>
                      <div className="text-sm font-semibold text-foreground">Wire Harness News</div>
                      <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Read the full article online below.
                      </div>
                    </div>
                    <a
                      href={articleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline shrink-0"
                    >
                      Open article
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden bg-white shadow-lg border border-slate-200">
                  <div className="bg-slate-100 p-3 sm:p-4">
                    <div className="overflow-hidden rounded-lg bg-white shadow-[0_12px_36px_rgba(15,23,42,0.12)] border border-slate-200 pointer-events-none">
                      <img
                        src={articlePreviewImage}
                        alt="Wire Harness News feature article preview"
                        className="block w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={articleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:border-primary/50 hover:text-primary transition-colors shadow-sm"
                  >
                    Read more
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default Hero;
