import { motion } from "framer-motion";

const Navbar = () => {
  const handleQuoteClick = () => {
    // Track in Clarity
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'quote_button_navbar');
    }
    // Track in GA4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quote_button_click', {
        button_location: 'navbar'
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight font-mono">SonicWire</span>
        </a>
        <motion.a
          href="/quote-request"
          onClick={handleQuoteClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
        >
          Get Quote
        </motion.a>
      </div>
    </nav>
  );
};

export default Navbar;
