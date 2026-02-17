import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">SonicWire</span>
        </div>
        <motion.a
          href="/quote-request"
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
