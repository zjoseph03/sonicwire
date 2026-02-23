import { motion } from "framer-motion";

const Navbar = () => {
  const handleQuoteClick = () => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'quote_button_navbar');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">SonicWire</span>
        </div>
        <motion.a
          href="/quote-request"
          onClick={handleQuoteClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          Get Instant Quote
        </motion.a>
      </div>
    </nav>
  );
};

export default Navbar;
