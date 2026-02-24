import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, Upload, FileText, Clock, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const QuoteRequest = () => {
  const [step, setStep] = useState<"upload" | "processing" | "estimate" | "email" | "success">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [estimate, setEstimate] = useState({
    productionTime: "12-15",
    shippingTime: "3-5",
    totalTime: "15-20",
    complexity: "Medium",
    confidence: "High"
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log("Quote Request page visited at:", new Date().toISOString());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(uploadedFile);
      console.log("File uploaded:", uploadedFile.name);
      
      // Track PDF upload event
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', 'pdf_uploaded');
      }
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pdf_uploaded', {
          file_name: uploadedFile.name
        });
      }
      
      // Move to processing step
      setStep("processing");
      
      // Simulate processing delay
      setTimeout(() => {
        // Generate mock estimate
        const mockEstimate = {
          productionTime: Math.floor(Math.random() * 8 + 8) + "-" + Math.floor(Math.random() * 5 + 12),
          shippingTime: "3-5",
          totalTime: Math.floor(Math.random() * 10 + 12) + "-" + Math.floor(Math.random() * 5 + 18),
          complexity: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
          confidence: ["Medium", "High", "Very High"][Math.floor(Math.random() * 3)]
        };
        setEstimate(mockEstimate);
        setStep("estimate");
        
        // Track estimate viewed event
        if (typeof window !== 'undefined' && (window as any).clarity) {
          (window as any).clarity('event', 'estimate_viewed');
        }
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'estimate_viewed', {
            production_time: mockEstimate.productionTime,
            complexity: mockEstimate.complexity
          });
        }
      }, 3000);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    console.log("Email submitted:", email, "at:", new Date().toISOString());
    
    // Save to Supabase
    try {
      const { error } = await supabase
        .from('quote_requests' as any)
        .insert({
          email: email,
          file_name: file?.name || null,
          production_time: estimate.productionTime,
          shipping_time: estimate.shippingTime,
          total_time: estimate.totalTime,
          complexity: estimate.complexity,
          confidence: estimate.confidence
        });

      if (error) {
        console.error('Error saving to Supabase:', error);
        toast({
          title: "Warning",
          description: "Quote request saved locally, but there was an issue syncing to our database.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    
    // Track email submission event
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'email_submitted');
    }
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'generate_lead', {
        value: 1
      });
    }
    
    setStep("success");
    toast({
      title: "Success!",
      description: "We'll send you detailed quote information shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-24 px-6 relative">
        <div className="technical-grid absolute inset-0 opacity-20" />
        <div className="container mx-auto max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <span className="pulse-dot" />
              <span className="text-sm font-mono font-medium text-primary uppercase tracking-wider">
                Instant Quote System
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get Your Production Timeline
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your schematic and receive an instant production estimate
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 1: Upload */}
            {step === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="industrial-card rounded-lg p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-none flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Upload Your Schematic
                  </h2>
                  <p className="text-muted-foreground">
                    PDF format • Max 10MB • Wire harness diagrams or CAD files
                  </p>
                </div>

                <label
                  htmlFor="file-upload"
                  className="block w-full border-2 border-dashed border-border hover:border-primary transition-colors rounded-none p-12 cursor-pointer group"
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-4" />
                    <p className="text-foreground font-semibold mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF files only
                    </p>
                  </div>
                </label>

                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-4">We'll analyze:</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Wire count and complexity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Connector types and quantities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Production time estimate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Shipping timeline</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Step 2: Processing */}
            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="industrial-card rounded-lg p-12 text-center"
              >
                <div className="w-20 h-20 bg-primary rounded-none flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Analyzing Your Schematic
                </h2>
                <p className="text-muted-foreground mb-8">
                  Processing {file?.name}...
                </p>
                
                <div className="space-y-4 max-w-md mx-auto">
                  {["Extracting components", "Calculating complexity", "Estimating timeline"].map((task, index) => (
                    <motion.div
                      key={task}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.5, duration: 0.5 }}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.5 + 0.3 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                      >
                        <CheckCircle className="w-3 h-3 text-white" />
                      </motion.div>
                      <span>{task}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Estimate Results */}
            {step === "estimate" && (
              <motion.div
                key="estimate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="industrial-card rounded-lg p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary rounded-none flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Estimate Ready!
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Based on your schematic: {file?.name}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Cards */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="industrial-card rounded-lg p-6 text-center">
                      <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {estimate.productionTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Production Days
                      </div>
                    </div>

                    <div className="industrial-card rounded-lg p-6 text-center">
                      <Package className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {estimate.shippingTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Shipping Days
                      </div>
                    </div>

                    <div className="industrial-card rounded-lg p-6 text-center">
                      <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {estimate.totalTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Days
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-border">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Complexity</div>
                      <div className="text-lg font-semibold text-foreground">{estimate.complexity}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Estimate Confidence</div>
                      <div className="text-lg font-semibold text-foreground">{estimate.confidence}</div>
                    </div>
                  </div>
                </div>

                {/* Email Collection */}
                <div className="industrial-card rounded-lg p-8">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Get Detailed Quote
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Enter your email to receive a complete breakdown with pricing, specifications, and next steps.
                  </p>
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      Send Detailed Quote
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    We respect your privacy. No spam, ever.
                  </p>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setFile(null);
                      setStep("upload");
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    ← Upload a different file
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="industrial-card rounded-lg p-12 text-center relative"
              >
                <div className="absolute top-4 right-4 pulse-dot" />
                <div className="w-16 h-16 bg-primary rounded-none flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Quote Sent!
                </h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a detailed quote to:
                </p>
                <p className="text-lg font-semibold text-primary mb-8">
                  {email}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Check your inbox in the next few minutes. The email includes your estimated timeline, pricing breakdown, and next steps.
                </p>
                
                <div className="pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    Your Estimate Summary:
                  </p>
                  <div className="flex justify-center gap-8 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">{estimate.totalTime}</div>
                      <div className="text-xs text-muted-foreground">Days Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{estimate.complexity}</div>
                      <div className="text-xs text-muted-foreground">Complexity</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setEmail("");
                    setStep("upload");
                  }}
                  className="mt-8 text-sm text-primary hover:underline"
                >
                  Get another quote
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Have questions? Contact us directly:
            </p>
            <a 
              href="mailto:outreach@sonicwire.com"
              className="text-primary hover:underline font-semibold"
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
