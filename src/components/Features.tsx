import { Zap, Settings, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Automated Production",
    description: "Advanced robotics and AI-driven quality control ensure precision at every step.",
    metric: "Auto",
    metricLabel: "Production"
  },
  {
    icon: Clock,
    title: "Rapid Turnaround",
    description: "From quote to delivery in as little as 7-14 business days with priority options.",
    metric: "7-14",
    metricLabel: "Days"
  },
  {
    icon: Shield,
    title: "IPC/WHMA Certified",
    description: "Full traceability and compliance with international wire harness quality standards.",
    metric: "IPC/WHMA-A-620",
    metricLabel: "Certified"
  },
  {
    icon: Settings,
    title: "Custom Solutions",
    description: "Flexible manufacturing for prototypes through high-volume production runs.",
    metric: "Custom",
    metricLabel: "Solutions"
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-muted/20 relative">
      {/* Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <span className="pulse-dot" />
            <span className="text-sm font-mono font-medium text-primary uppercase tracking-wider">
              System Capabilities
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 max-w-3xl mx-auto">
            Industrial automation meets manufacturing excellence
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Streamlined processes, advanced technology, and uncompromising quality standards.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="industrial-card p-8 rounded-lg group hover:shadow-xl"
            >
              {/* Icon and Metric */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-primary">
                    {feature.metric}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {feature.metricLabel}
                  </div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>

              {/* Bottom Accent */}
              <div className="mt-6 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500 ease-out rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default Features;
