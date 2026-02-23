import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const QuoteRequest = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Track page visit
    console.log("Quote Request page visited at:", new Date().toISOString());
    
    // You can add analytics tracking here
    // Example: gtag('event', 'page_view', { page_path: '/quote-request' });
    // Or: analytics.track('Quote Page Visited');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Track email submission
    console.log("Email submitted:", email, "at:", new Date().toISOString());
    
    // Here you would typically send this to your backend/database
    // Example: fetch('/api/leads', { method: 'POST', body: JSON.stringify({ email }) })
    
    setSubmitted(true);
    toast({
      title: "Success!",
      description: "We'll send you quote information shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get Your Instant Quote
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your email and we'll send you detailed information about our wire harness services.
            </p>
          </motion.div>

          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card border-glow-blue rounded-none p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Get Quote Information
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  We respect your privacy. No spam, ever.
                </p>
              </form>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  What you'll receive:
                  <div className="pulse-dot" />
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" />
                    <span>Detailed pricing information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" />
                    <span>Lead time estimates for your project</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" />
                    <span>Technical specifications and capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" />
                    <span>Next steps to get started</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-card border-glow-blue rounded-none p-12 text-center relative"
            >
              <div className="absolute top-4 right-4 pulse-dot" />
              <div className="w-16 h-16 bg-electric-blue rounded-none flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Thank You!
              </h2>
              <p className="text-muted-foreground mb-6">
                We've received your request and will send quote information to:
              </p>
              <p className="text-lg font-semibold text-electric-blue mb-8">
                {email}
              </p>
              <p className="text-sm text-muted-foreground">
                Check your inbox in the next few minutes. If you don't see our email, check your spam folder.
              </p>
            </motion.div>
          )}

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Have questions? Contact us directly:
            </p>
            <a 
              href="mailto:zachjoseph@hotmail.com"
              className="text-electric-blue hover:underline font-semibold"
            >
              outreach@sonicwire.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuoteRequest;
