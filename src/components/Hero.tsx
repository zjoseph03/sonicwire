import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  const benefits = ["Instant Quotes", "No Minimum Quantities", "Volumes of 1 to 10,000+"];

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-bg hero-grid overflow-hidden pt-16">
      {/* Large watermark logo */}
      <div className="absolute top-10 right-0 w-[500px] h-[500px] opacity-[0.06] pointer-events-none">
        <svg viewBox="0 0 200 200" fill="hsl(28, 100%, 50%)" className="w-full h-full">
          <path d="M100 20 L130 60 L170 40 L150 80 L190 100 L150 120 L170 160 L130 140 L100 180 L70 140 L30 160 L50 120 L10 100 L50 80 L30 40 L70 60 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 mb-8 shadow-sm"
        >
          <span className="text-sm text-muted-foreground font-medium">BACKED BY</span>
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">Y</span>
          <span className="text-sm font-semibold text-foreground">Combinator</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-foreground leading-tight mb-4"
        >
          Sonic Wire Harnesses
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl md:text-5xl font-black text-gradient-primary leading-tight mb-10"
        >
          Delivered in as little as 7 Days
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a
            href="#cta"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            Get Instant Pricing
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mt-10"
        >
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">{benefit}</span>
            </div>
          ))}
        </motion.div>

        <p className="text-sm text-muted-foreground mt-6">
          *Express orders dependent on part availability
        </p>
      </div>
    </section>
  );
};

export default Hero;
