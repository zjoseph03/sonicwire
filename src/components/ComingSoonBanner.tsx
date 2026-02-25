import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

const ComingSoonBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary text-primary-foreground py-3 px-6 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="container mx-auto flex items-center justify-center gap-3 relative z-10">
        <Rocket className="w-5 h-5 animate-bounce" />
        <span className="font-mono text-sm md:text-base font-medium">
          <strong>Coming Soon:</strong> Pre-launch access available — Join the waitlist to be first in line when we launch
        </span>
      </div>
    </motion.div>
  );
};

export default ComingSoonBanner;
