import { ArrowRight, Zap, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 technical-grid opacity-40" />
      
      {/* Blue Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-6 text-center"
          >
            Precision Wire Harness{" "}
            <span className="text-primary">Manufacturing</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto leading-relaxed"
          >
            Industrial automation meets rapid turnaround. Upload your schematic, receive instant quotes,
            and get production-ready harnesses delivered to your facility.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-16"
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
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
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
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default Hero;
