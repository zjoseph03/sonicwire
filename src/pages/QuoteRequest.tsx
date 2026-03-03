import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, Upload, FileText, Clock, Package, Zap, ChevronDown, Shield, Edit2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { parseSchematicPDF, type ParsedSpecifications } from "@/lib/gemini";

const QuoteRequest = () => {
  const [step, setStep] = useState<"upload" | "processing" | "review" | "estimate" | "email" | "success">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [parsedSpecs, setParsedSpecs] = useState<ParsedSpecifications | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
      if (!agreedToTerms) {
        toast({
          title: "Agreement Required",
          description: "Please agree to the Terms of Service and Privacy Policy before uploading.",
          variant: "destructive",
        });
        // Reset the file input
        e.target.value = '';
        return;
      }
      
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
      
      // Parse PDF via secure backend edge function
      parseSchematicPDF(uploadedFile)
        .then((specs) => {
          setParsedSpecs(specs);
          setStep("review");
          
          // Track successful parsing
          if (typeof window !== 'undefined' && (window as any).clarity) {
            (window as any).clarity('event', 'pdf_parsed_success');
          }
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'pdf_parsed', {
              confidence: specs.confidence,
              wire_count: specs.wireCount
            });
          }
        })
        .catch((error) => {
          console.error("PDF parsing error:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          console.error("Error stack:", error?.stack);
          toast({
            title: "Parsing Error",
            description: error instanceof Error ? error.message : "Failed to parse schematic. Please try again or contact support.",
            variant: "destructive",
          });
          setStep("upload");
          setFile(null);
          
          // Track parsing failure
          if (typeof window !== 'undefined' && (window as any).clarity) {
            (window as any).clarity('event', 'pdf_parsed_error');
          }
        });
    }
  };

  const handleSpecsConfirmed = () => {
    if (!parsedSpecs) return;
    
    // Move to estimate with confirmed specs
    setStep("processing");
    
    // Simulate generating estimate based on specs
    setTimeout(() => {
      // Generate estimate based on complexity
      const wireCount = parseInt(parsedSpecs.wireCount) || 0;
      const baseTime = Math.max(7, Math.floor(wireCount / 5));
      
      const mockEstimate = {
        productionTime: `${baseTime}-${baseTime + 3}`,
        shippingTime: "3-5",
        totalTime: `${baseTime + 3}-${baseTime + 8}`,
        complexity: wireCount > 20 ? "High" : wireCount > 10 ? "Medium" : "Low",
        confidence: parsedSpecs.confidence === "high" ? "High" : parsedSpecs.confidence === "medium" ? "Medium" : "Low"
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
      }, 2000);
  };

  const updateParsedSpec = (field: keyof ParsedSpecifications, value: any) => {
    if (!parsedSpecs) return;
    setParsedSpecs({ ...parsedSpecs, [field]: value });
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
                className="space-y-6"
              >
                {/* Requirements Accordion */}
                <div className="industrial-card rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowOptional(!showOptional)}
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary" />
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-foreground">
                          Schematic Requirements
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Ensure your schematic includes these specifications
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showOptional ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showOptional && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-6 space-y-6">
                          {/* Required Section */}
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              <h4 className="font-semibold text-foreground uppercase text-xs tracking-wider">
                                Required
                              </h4>
                            </div>
                            <ul className="space-y-3">
                              <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">Wire Count</div>
                                  <div className="text-xs text-muted-foreground">Total number of individual wires</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">Wire Lengths</div>
                                  <div className="text-xs text-muted-foreground">Specified length for each wire segment</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">Wire Gauge (AWG)</div>
                                  <div className="text-xs text-muted-foreground">Gauge for each wire (e.g., 18 AWG, 22 AWG)</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">Pinout Mapping</div>
                                  <div className="text-xs text-muted-foreground">Which wire connects to which point/pin</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">Total Quantity</div>
                                  <div className="text-xs text-muted-foreground">Number of identical harnesses needed</div>
                                </div>
                              </li>
                            </ul>
                          </div>

                          {/* Optional Section */}
                          <div className="pt-6 border-t border-border">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                              <h4 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                                Optional (Recommended)
                              </h4>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-3">
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Wire Colors</div>
                                  <div className="text-xs text-muted-foreground">Color coding for identification</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Wire Insulation Type</div>
                                  <div className="text-xs text-muted-foreground">PVC, PTFE, silicone</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Length Tolerances</div>
                                  <div className="text-xs text-muted-foreground">Acceptable variance (e.g., ±5mm)</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Bundling Specifications</div>
                                  <div className="text-xs text-muted-foreground">How wires should be grouped</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Routing Paths</div>
                                  <div className="text-xs text-muted-foreground">Specific routing requirements</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Environmental Requirements</div>
                                  <div className="text-xs text-muted-foreground">Temperature, moisture resistance</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Shielding</div>
                                  <div className="text-xs text-muted-foreground">EMI shielding requirements</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Protective Sleeving</div>
                                  <div className="text-xs text-muted-foreground">Heat shrink, braided sleeve</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Separation Requirements</div>
                                  <div className="text-xs text-muted-foreground">Wires routed separately</div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 border-2 border-muted-foreground/50 rounded-full" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">Labels/Markers</div>
                                  <div className="text-xs text-muted-foreground">Wire identification labels</div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Upload Section */}
                <div className="industrial-card rounded-lg p-8">
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

                  {/* Privacy & Security Banner */}
                  <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-foreground mb-1">Your IP is Protected</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          All files are encrypted and confidential. We never share your intellectual property or data with third parties. Your designs remain exclusively yours.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="mt-6 flex items-start gap-3">
                    <Checkbox 
                      id="terms-agreement"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                      className="mt-1"
                    />
                    <label htmlFor="terms-agreement" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Terms of Service
                      </a>
                      {" "}and{" "}
                      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
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
                  Analyzing Your Schematic with AI
                </h2>
                <p className="text-muted-foreground mb-8">
                  Processing {file?.name}...
                </p>
                
                <div className="space-y-4 max-w-md mx-auto">
                  {["Reading PDF document", "Extracting wire specifications", "Analyzing pinout mapping", "Generating timeline estimate"].map((task, index) => (
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

            {/* Step 3: Review Specifications */}
            {step === "review" && parsedSpecs && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="industrial-card rounded-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-none flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Review Extracted Specifications
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          AI Confidence: <span className={`font-semibold ${parsedSpecs.confidence === 'high' ? 'text-green-600' : parsedSpecs.confidence === 'medium' ? 'text-yellow-600' : 'text-orange-600'}`}>{parsedSpecs.confidence.toUpperCase()}</span>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {isEditing ? "Done Editing" : "Edit"}
                    </Button>
                  </div>

                  {parsedSpecs.notes && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">AI Notes:</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{parsedSpecs.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Required Specifications */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Required Specifications
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Wire Count</label>
                        {isEditing ? (
                          <Input
                            value={parsedSpecs.wireCount}
                            onChange={(e) => updateParsedSpec('wireCount', e.target.value)}
                            className="h-10"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-foreground">{parsedSpecs.wireCount}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Total Quantity</label>
                        {isEditing ? (
                          <Input
                            value={parsedSpecs.totalQuantity}
                            onChange={(e) => updateParsedSpec('totalQuantity', e.target.value)}
                            className="h-10"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-foreground">{parsedSpecs.totalQuantity}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Wire Lengths</label>
                      {isEditing ? (
                        <Textarea
                          value={parsedSpecs.wireLengths?.join(', ') || ''}
                          onChange={(e) => updateParsedSpec('wireLengths', e.target.value.split(',').map(s => s.trim()))}
                          placeholder="Separate lengths with commas"
                          className="min-h-20"
                        />
                      ) : (
                        <p className="text-sm text-foreground">{parsedSpecs.wireLengths?.join(', ') || 'Not specified'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Wire Gauges (AWG)</label>
                      {isEditing ? (
                        <Textarea
                          value={parsedSpecs.wireGauges?.join(', ') || ''}
                          onChange={(e) => updateParsedSpec('wireGauges', e.target.value.split(',').map(s => s.trim()))}
                          placeholder="Separate gauges with commas"
                          className="min-h-20"
                        />
                      ) : (
                        <p className="text-sm text-foreground">{parsedSpecs.wireGauges?.join(', ') || 'Not specified'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Pinout Mapping</label>
                      {isEditing ? (
                        <Textarea
                          value={parsedSpecs.pinoutMapping}
                          onChange={(e) => updateParsedSpec('pinoutMapping', e.target.value)}
                          placeholder="Describe wire to pin connections"
                          className="min-h-24"
                        />
                      ) : (
                        <p className="text-sm text-foreground whitespace-pre-wrap">{parsedSpecs.pinoutMapping}</p>
                      )}
                    </div>
                  </div>

                  {/* Optional Specifications */}
                  {(parsedSpecs.wireColors || parsedSpecs.insulationType || parsedSpecs.lengthTolerances) && (
                    <div className="pt-6 border-t border-border space-y-4">
                      <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                        Optional Specifications Found
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        {parsedSpecs.wireColors && parsedSpecs.wireColors.length > 0 && (
                          <div>
                            <p className="font-medium text-foreground mb-1">Wire Colors:</p>
                            <p className="text-muted-foreground">{parsedSpecs.wireColors.join(', ')}</p>
                          </div>
                        )}
                        {parsedSpecs.insulationType && (
                          <div>
                            <p className="font-medium text-foreground mb-1">Insulation Type:</p>
                            <p className="text-muted-foreground">{parsedSpecs.insulationType}</p>
                          </div>
                        )}
                        {parsedSpecs.lengthTolerances && (
                          <div>
                            <p className="font-medium text-foreground mb-1">Length Tolerances:</p>
                            <p className="text-muted-foreground">{parsedSpecs.lengthTolerances}</p>
                          </div>
                        )}
                        {parsedSpecs.bundlingSpecs && (
                          <div>
                            <p className="font-medium text-foreground mb-1">Bundling:</p>
                            <p className="text-muted-foreground">{parsedSpecs.bundlingSpecs}</p>
                          </div>
                        )}
                        {parsedSpecs.environmentalReqs && (
                          <div>
                            <p className="font-medium text-foreground mb-1">Environmental:</p>
                            <p className="text-muted-foreground">{parsedSpecs.environmentalReqs}</p>
                          </div>
                        )}
                        {parsedSpecs.shielding && (
                          <div>
                            <p className="font-medium text-foreground mb-1">Shielding:</p>
                            <p className="text-muted-foreground">{parsedSpecs.shielding}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("upload");
                      setFile(null);
                      setParsedSpecs(null);
                    }}
                  >
                    ← Upload Different File
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleSpecsConfirmed}
                    className="px-8"
                  >
                    Confirm & Generate Quote
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Estimate Results */}
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

                  <div className="mt-4 p-3 bg-muted/20 border border-border rounded">
                    <p className="text-xs text-muted-foreground text-center">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Your information is secure and confidential. We never share your data or intellectual property.
                    </p>
                  </div>
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
              href="mailto:outreach@sonicwire.ca"
              className="text-primary hover:underline font-semibold"
            >
              outreach@sonicwire.ca
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default QuoteRequest;
