import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Quote = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Track page visit
    supabase.from("quote_page_clicks").insert({ referrer_url: document.referrer || null });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("email_signups").insert({ email: email.trim() });
    setSubmitting(false);

    if (error) {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
    toast({ title: "Thanks!", description: "We'll be in touch soon." });
  };

  return (
    <div className="min-h-screen bg-background hero-bg hero-grid">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">SonicWire</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">Get a Quote</h1>
            <p className="text-lg text-muted-foreground">
              We'll get back to you with pricing and next steps.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-card rounded-2xl border border-border p-8 shadow-sm"
          >
            {/* Placeholder area for future quote form content */}
            <div className="mb-8 p-6 border-2 border-dashed border-border rounded-xl text-center">
              <p className="text-muted-foreground text-sm">Quote form content coming soon</p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Stay in the loop</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Leave your email and we'll send you more information.
              </p>

              {submitted ? (
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Mail className="w-5 h-5" />
                  We'll be in touch at {email}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={submitting} className="gap-2">
                    <Send className="w-4 h-4" />
                    {submitting ? "Sending..." : "Submit"}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Quote;
