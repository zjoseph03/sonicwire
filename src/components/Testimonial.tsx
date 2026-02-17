import { motion } from "framer-motion";

const Testimonial = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border p-10 shadow-sm text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-sm font-semibold text-foreground">Customer Testimonial</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">Coming Soon</span>
            </div>

            <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-medium">
              "Your testimonial here. Share your experience with our wire harness services."
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                --
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Your Name</p>
                <p className="text-sm text-muted-foreground">Your Company</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonial;
