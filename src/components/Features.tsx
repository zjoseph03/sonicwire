import { Zap, Layers, ShieldCheck, Clock, Cpu, Network } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Rapid Production",
    description: "[Description of your rapid production capabilities and benefits]",
    highlight: true,
    size: "large"
  },
  {
    icon: Layers,
    title: "Volume Flexibility",
    description: "[Description of your volume flexibility and range]",
    highlight: false,
    size: "medium"
  },
  {
    icon: ShieldCheck,
    title: "Certified Quality",
    description: "[Description of your quality certifications and standards]",
    highlight: true,
    size: "medium"
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "[X day] average production time with rush options available",
    highlight: false,
    size: "small"
  },
  {
    icon: Cpu,
    title: "Smart Manufacturing",
    description: "AI-powered optimization for precision and efficiency",
    highlight: true,
    size: "small"
  },
  {
    icon: Network,
    title: "Custom Integration",
    description: "Seamless integration with your existing systems",
    highlight: false,
    size: "medium"
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Traditional Harness Manufacturing is Broken.
          </h2>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-muted-foreground mb-4">
            <span>Long quote times. <strong className="text-foreground">Longer lead times.</strong></span>
            <span>Rigid manufacturing. <strong className="text-foreground">Unresponsive suppliers.</strong></span>
          </div>
          <p className="text-electric-blue font-semibold text-lg flex items-center justify-center gap-2">
            <div className="pulse-dot" />
            We're building the solution.
          </p>
        </motion.div>

        {/* Bento Box Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass-card border-glow-blue rounded-none p-6 relative overflow-hidden group ${
                feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''
              } ${
                feature.size === 'medium' ? 'md:col-span-1 md:row-span-1' : ''
              } ${
                feature.size === 'small' ? 'md:col-span-1' : ''
              }`}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-none ${feature.highlight ? 'bg-electric-blue' : 'bg-primary'} transition-all duration-300 group-hover:scale-110`}>
                    <feature.icon className={`${feature.size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
                  </div>
                  {feature.highlight && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-electric-blue uppercase tracking-wide">Live</span>
                      <div className="pulse-dot" />
                    </div>
                  )}
                </div>
                
                <h3 className={`${feature.size === 'large' ? 'text-2xl' : 'text-xl'} font-bold text-foreground mb-3 group-hover:text-electric-blue transition-colors duration-300`}>
                  {feature.title}
                </h3>
                
                <p className={`text-muted-foreground leading-relaxed ${feature.size === 'large' ? 'text-base' : 'text-sm'} flex-grow`}>
                  {feature.description}
                </p>

                {/* Additional stats for large cards */}
                {feature.size === 'large' && (
                  <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-electric-blue">[X]%</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Faster</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-electric-blue">[X]+</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Completed</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Corner accent */}
              <div className={`absolute top-0 right-0 w-12 h-12 ${feature.highlight ? 'bg-electric-blue' : 'bg-primary'} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </div>

        {/* Additional metrics row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-7xl mx-auto mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Projects", value: "[X]+", highlight: true },
            { label: "Uptime", value: "[X]%", highlight: false },
            { label: "Countries", value: "[X]+", highlight: false },
            { label: "Response Time", value: "[X]h", highlight: true },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
              className="glass-card rounded-none p-4 text-center relative overflow-hidden group hover:border-electric-blue transition-colors duration-300"
            >
              {metric.highlight && (
                <div className="absolute top-2 right-2 pulse-dot" />
              )}
              <div className={`text-3xl font-bold mb-1 ${metric.highlight ? 'text-electric-blue' : 'text-foreground'}`}>
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
