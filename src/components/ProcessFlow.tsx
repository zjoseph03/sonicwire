import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Upload, Cpu, Package, CheckCircle } from "lucide-react";

const steps = [
  {
    id: "input",
    icon: Upload,
    title: "1. Input Your Specifications",
    description: "Upload your PDF design files. Our system generates an instant quote.",
    features: [
      "PDF file upload support",
      "Instant quote generation",
      "Material selection",
    ],
  },
  {
    id: "processing",
    icon: Cpu,
    title: "2. Automated Processing",
    description: "Our AI-powered manufacturing system optimizes your design for production.",
    features: [
      "AI-optimized routing",
      "Automated production",
    ],
  },
  {
    id: "assembly",
    icon: Package,
    title: "3. Assembly & Testing",
    description: "Every harness undergoes rigorous testing before shipment.",
    features: [
      "Continuity testing",
      "Quality inspection",
      "Documentation generation",
    ],
  },
  {
    id: "output",
    icon: CheckCircle,
    title: "4. Ready for Delivery",
    description: "Your custom wire harness is packaged with complete documentation and shipped to your facility. Track every step from production to delivery.",
    features: [
      "Custom packaging",
      "Complete documentation",
      "[X day] delivery",
    ],
  },
];

const ProcessFlow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      stepRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveStep(index);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Manufacturing Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From specification to delivery in 4 simple steps
          </p>
        </motion.div>

        {/* Vertical Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2 hidden md:block">
            <motion.div
              style={{ height: lineHeight }}
              className="absolute top-0 left-0 w-full bg-electric-blue"
            />
          </div>

          {/* Steps */}
          <div className="space-y-32">
            {steps.map((step, index) => (
              <div
                key={step.id}
                ref={(el) => (stepRefs.current[index] = el)}
                className={`relative transition-all duration-500 ${
                  activeStep === index ? "opacity-100 scale-100" : "opacity-40 scale-95"
                }`}
              >
                <div
                  className={`grid md:grid-cols-2 gap-8 items-center ${
                    index % 2 === 0 ? "" : "md:grid-flow-dense"
                  }`}
                >
                  {/* Content Card */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={`glass-card border-glow-blue rounded-none p-8 ${
                      index % 2 === 0 ? "md:text-right" : "md:col-start-2"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-4 mb-6 ${
                        index % 2 === 0 ? "md:justify-end" : ""
                      }`}
                    >
                      <div
                        className={`w-16 h-16 rounded-none bg-electric-blue flex items-center justify-center ${
                          activeStep === index ? "scale-110" : ""
                        } transition-transform duration-300`}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      {activeStep === index && (
                        <div className="pulse-dot" />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    <ul
                      className={`space-y-2 ${
                        index % 2 === 0 ? "md:text-right" : ""
                      }`}
                    >
                      {step.features.map((feature, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-2 text-sm text-foreground ${
                            index % 2 === 0 ? "md:justify-end" : ""
                          }`}
                        >
                          <span className="text-electric-blue">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Center Dot Indicator */}
                  <div className="hidden md:flex justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div
                      className={`w-6 h-6 rounded-full border-4 border-background ${
                        activeStep === index
                          ? "bg-electric-blue scale-150"
                          : "bg-border"
                      } transition-all duration-300`}
                    />
                  </div>

                  {/* Visual Element */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={`${index % 2 === 0 ? "md:col-start-2" : "md:col-start-1"}`}
                  >
                    <div className="glass-card rounded-none p-12 flex items-center justify-center min-h-[300px]">
                      <step.icon
                        className={`w-32 h-32 ${
                          activeStep === index ? "text-electric-blue" : "text-muted-foreground"
                        } transition-all duration-500`}
                        strokeWidth={1.5}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 flex justify-center gap-3"
        >
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeStep
                  ? "w-12 bg-electric-blue"
                  : index < activeStep
                  ? "w-8 bg-electric-blue opacity-50"
                  : "w-8 bg-border"
              }`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessFlow;
