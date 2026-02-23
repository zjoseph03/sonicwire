import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  const benefits = ["Instant Quotes", "No Minimum Quantities", "Production Volumes: [X to X+]"];

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

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden pt-16">
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6"
        >
          Wire Harness Manufacturing
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
        >
          Watch your custom wire harness come to life through our automated manufacturing process
        </motion.p>

        {/* SVG Wire Routing Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <svg
            viewBox="0 0 800 400"
            className="w-full h-auto"
            style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
          >
            <defs>
              <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: "hsl(210, 29%, 24%)", stopOpacity: 0.3 }} />
                <stop offset="50%" style={{ stopColor: "hsl(210, 29%, 24%)", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "hsl(210, 29%, 24%)", stopOpacity: 0.3 }} />
              </linearGradient>
            </defs>

            {/* Machine Frame - Input Side */}
            <rect x="50" y="100" width="180" height="200" fill="hsl(210, 29%, 24%)" rx="4" />
            <rect x="70" y="120" width="140" height="40" fill="hsl(192, 9%, 76%)" rx="2" />
            <rect x="70" y="180" width="140" height="80" fill="hsl(192, 9%, 85%)" rx="2" />
            <circle cx="140" cy="220" r="20" fill="hsl(210, 29%, 24%)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <rect x="90" y="240" width="30" height="4" fill="hsl(210, 29%, 24%)" rx="2">
              <animate attributeName="width" values="30;100;30" dur="2s" repeatCount="indefinite" />
            </rect>
            
            {/* Machine Frame - Output Side */}
            <rect x="570" y="100" width="180" height="200" fill="hsl(210, 29%, 24%)" rx="4" />
            <rect x="590" y="120" width="140" height="40" fill="hsl(192, 9%, 76%)" rx="2" />
            <rect x="590" y="180" width="140" height="80" fill="hsl(192, 9%, 85%)" rx="2" />
            <circle cx="660" cy="220" r="20" fill="hsl(210, 29%, 24%)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin="1s" />
            </circle>
            <rect x="680" y="240" width="30" height="4" fill="hsl(210, 29%, 24%)" rx="2">
              <animate attributeName="width" values="30;100;30" dur="2s" repeatCount="indefinite" begin="1s" />
            </rect>

            {/* Wire Path Base */}
            <path
              d="M 230 200 Q 320 150, 400 200 T 570 200"
              fill="none"
              stroke="hsl(210, 29%, 24%)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.2"
            />

            {/* Animated Wire Flow */}
            <path
              d="M 230 200 Q 320 150, 400 200 T 570 200"
              fill="none"
              stroke="url(#wireGradient)"
              strokeWidth="8"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-dasharray"
                values="0 1000; 1000 0"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                values="0; -1000"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>

            {/* Processing Indicators */}
            <g>
              <circle cx="320" cy="170" r="6" fill="hsl(210, 29%, 24%)">
                <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="400" cy="200" r="6" fill="hsl(210, 29%, 24%)">
                <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
              </circle>
              <circle cx="480" cy="180" r="6" fill="hsl(210, 29%, 24%)">
                <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" begin="1s" />
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="1s" />
              </circle>
            </g>

            {/* Cutting/Crimping Animation */}
            <g opacity="0.6">
              <line x1="400" y1="160" x2="400" y2="140" stroke="hsl(210, 29%, 24%)" strokeWidth="3" strokeLinecap="round">
                <animate attributeName="y1" values="160;170;160" dur="2s" repeatCount="indefinite" />
              </line>
              <line x1="395" y1="165" x2="405" y2="165" stroke="hsl(210, 29%, 24%)" strokeWidth="3" strokeLinecap="round">
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
              </line>
            </g>

            {/* Labels */}
            <text x="140" y="330" textAnchor="middle" fill="hsl(210, 29%, 24%)" fontSize="18" fontWeight="bold">
              INPUT
            </text>
            <text x="660" y="330" textAnchor="middle" fill="hsl(210, 29%, 24%)" fontSize="18" fontWeight="bold">
              OUTPUT
            </text>
            <text x="400" y="280" textAnchor="middle" fill="hsl(210, 29%, 24%)" fontSize="16" fontWeight="600">
              PROCESSING
            </text>

            {/* Speed Indicator */}
            <g>
              <text x="400" y="120" textAnchor="middle" fill="hsl(210, 29%, 24%)" fontSize="14" fontWeight="600" opacity="0.8">
                REAL-TIME MONITORING
              </text>
              <rect x="350" y="128" width="100" height="3" fill="hsl(192, 9%, 85%)" rx="2" />
              <rect x="350" y="128" width="0" height="3" fill="hsl(210, 29%, 24%)" rx="2">
                <animate attributeName="width" values="0;100;0" dur="3s" repeatCount="indefinite" />
              </rect>
            </g>
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a
            href="/quote-request"
            onClick={handleQuoteClick}
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            Start Your Order
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-sm text-muted-foreground mt-8"
        >
          Scroll down to see how we transform your specifications into reality
        </motion.p>
      </div>
    </section>
  );
};

export default Hero;
