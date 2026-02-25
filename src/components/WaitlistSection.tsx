import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const WaitlistSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('email_signups' as any)
        .insert({
          email: email,
        });

      if (error) {
        console.error('Error saving to Supabase:', error);
        toast({
          title: "Error",
          description: "There was an issue signing up. Please try again.",
          variant: "destructive",
        });
      } else {
        setIsSuccess(true);
        
        // Track waitlist signup
        if (typeof window !== 'undefined' && (window as any).clarity) {
          (window as any).clarity('event', 'waitlist_signup');
        }
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'generate_lead', {
            value: 1,
            event_category: 'waitlist'
          });
        }
        
        toast({
          title: "You're on the list!",
          description: "We'll notify you when we launch.",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="technical-grid absolute inset-0 opacity-30" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <span className="pulse-dot" />
            <span className="text-sm font-mono font-medium text-primary uppercase tracking-wider">
              Launching Soon
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Be First in Line
          </h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Join our waitlist to get early access when we launch. We'll notify you as soon as 
            we're ready to start manufacturing your custom wire harnesses.
          </p>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-base"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Join Waitlist
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/10 border-2 border-primary rounded-lg p-8 max-w-md mx-auto mb-8"
            >
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                You're on the waitlist!
              </h3>
              <p className="text-muted-foreground">
                We'll send you an email at <strong>{email}</strong> when we launch.
              </p>
            </motion.div>
          )}

          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:outreach@sonicwire.com" className="text-primary hover:underline">
              outreach@sonicwire.com
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default WaitlistSection;
