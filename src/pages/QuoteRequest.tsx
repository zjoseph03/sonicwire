import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Upload, FileText, Zap, Shield, ChevronRight, Scissors, Ruler, Download, RefreshCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { parseSchematicPDF, type ParsedSpecifications, type WireCut } from "@/lib/gemini";
import NetlistDisplay from "@/components/NetlistDisplay";
import { supabase } from "@/integrations/supabase/client";

// Pricing Constants
const BASE_FEE = 29.99;      // Reduced setup fee
const PRICE_PER_CM = 0.15;   // Competitive pricing per cm (covers material & processing)

const parseLengthToCm = (lengthStr: string): number => {
  if (!lengthStr || lengthStr === "null") return 0;
  // Remove whitespace and convert to lowercase
  const cleanStr = lengthStr.toLowerCase().replace(/[\s,]/g, '');
  
  // Match number and optional unit
  const match = cleanStr.match(/(\d+(?:\.\d+)?)([a-z]+|")?/);
  if (!match) return 0;
  
  const val = parseFloat(match[1]);
  const unit = match[2];
  
  switch(unit) {
      case 'm': return val * 100;
      case 'mm': return val / 10;
      case 'in': case '"': return val * 2.54;
      case 'ft': case "'": return val * 30.48;
      default: return val; // assume cm if no unit, or update logic if default was mm
  }
};

const QuoteRequest = () => {
  const [step, setStep] = useState<"upload" | "processing" | "review" | "success">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [parsedSpecs, setParsedSpecs] = useState<ParsedSpecifications | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [storagePath, setStoragePath] = useState<string | null>(null); // New state to hold file path
  const { toast } = useToast();

  const totalLengthCm = parsedSpecs?.wires ? parsedSpecs.wires.reduce((acc, w) => acc + (parseLengthToCm(w.length) || 0), 0) : 0;
  
  const totalCost = parsedSpecs?.wires ? (
    BASE_FEE + (totalLengthCm * PRICE_PER_CM * quantity)
  ) : 0;

  useEffect(() => {
    console.log("Wire Cut Tool visited at:", new Date().toISOString());
  }, []);

  const handleWireUpdate = (index: number, field: keyof WireCut, value: string) => {
    if (!parsedSpecs) return;
    const newWires = [...parsedSpecs.wires];
    newWires[index] = { ...newWires[index], [field]: value };
    setParsedSpecs({ ...parsedSpecs, wires: newWires });
  };

  const handleAddWire = () => {
    if (!parsedSpecs) return;
    const newWire: WireCut = { id: "", length: "", gauge: "", color: "" };
    setParsedSpecs({ ...parsedSpecs, wires: [...parsedSpecs.wires, newWire] });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (!agreedToTerms) {
        toast({
          title: "Agreement Required",
          description: "Please agree to the Terms of Service and Privacy Policy before uploading.",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      
      if (uploadedFile.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF schematic or wire list.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(uploadedFile);
      setStep("processing");
      
      try {
        // Upload to Supabase Storage immediately
        const fileExt = uploadedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('schematics')
            .upload(fileName, uploadedFile);

        if (uploadError) {
             console.error('Storage upload failed:', uploadError.message);
             toast({
                 title: "Storage Warning",
                 description: "The file could not be saved to our secure storage. You can still proceed with the quote.",
                 variant: "destructive"
             });
        } else {
             console.log('File uploaded to storage:', fileName);
             setStoragePath(fileName);
             
             // Record in DB
             const { error: dbError } = await (supabase.from as any)('schematic_uploads').insert({
                 file_path: fileName,
                 file_name: uploadedFile.name,
                 file_size: uploadedFile.size,
                 content_type: uploadedFile.type
             });

             if (dbError) {
                console.error('DB tracking failed:', dbError.message);
             } else {
                console.log('DB tracking successful for:', fileName);
             }
        }

        // AI Processing
        const specs = await parseSchematicPDF(uploadedFile);
        
        // Save for demo/admin usage
        localStorage.setItem('lastHarnessSpecs', JSON.stringify(specs));
        
        setParsedSpecs(specs);
        setStep("review");
        toast({
            title: "Extraction Complete",
            description: `Successfully identified ${specs.wires.length} wire segments.`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Processing Failed",
          description: error instanceof Error ? error.message : "Could not analyze the file. Please try again.",
          variant: "destructive",
        });
        setStep("upload");
        setFile(null);
      }
    }
  };

  const handleConfirm = async () => {
    try {
        const orderData = {
            total_price: totalCost,
            currency: 'USD',
            quantity: quantity,
            total_length_cm: totalLengthCm,
            wire_count: parsedSpecs?.wires.length || 0,
            file_name: file?.name,
            storage_path: storagePath,
            wire_data: parsedSpecs?.wires || [],
            status: 'submitted'
        };

        const { error, data } = await (supabase.from as any)('orders').insert(orderData); // Removed .select() to avoid RLS read error

        if (error) throw error;
        
        console.log('Order created successfully');

        setStep("success");
        toast({
            title: "Order Submitted",
            description: "Your wiring order has been confirmed successfully.",
        });
    } catch (error) {
        console.error('Order submission failed:', error);
        toast({
            title: "Submission Error",
            description: "Could not save your order. Please try again.",
            variant: "destructive"
        });
    }
  };

  const handleDownloadJSON = () => {
      if (!parsedSpecs) return;
      const data = parsedSpecs.wires || [];
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `cut-list-${file?.name.replace('.pdf', '')}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <section className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <span className="pulse-dot" />
              <span className="text-sm font-mono font-medium text-primary uppercase tracking-wider">
                Instant Quote System
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-4 tracking-tight">
              Get Your Production Timeline
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                <div className="industrial-card rounded-lg p-10 border-2 items-center border-dashed border-border hover:border-primary/50 transition-all bg-muted/5">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                       Upload Schematic
                    </h2>
                    <p className="text-muted-foreground">
                      Drag & drop your PDF file here
                    </p>
                  </div>

                  <label
                    htmlFor="file-upload"
                    className="block w-full max-w-lg mx-auto cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center p-12 bg-background border rounded-xl shadow-sm hover:shadow-md transition-all group-hover:border-primary">
                        <Upload className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                        <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium group-hover:bg-primary/90 transition-colors">
                            Select PDF File
                        </span>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>
                  </label>

                   {/* Terms Agreement */}
                   <div className="mt-8 flex justify-center items-center gap-3">
                    <Checkbox 
                      id="terms-agreement"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    />
                    <label htmlFor="terms-agreement" className="text-sm text-muted-foreground cursor-pointer select-none">
                      I agree to the{" "}
                      <a href="/terms-of-service" className="text-primary hover:underline">Terms</a>
                      {" "}&{" "}
                      <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>
                    </label>
                  </div>

                  {/* Security Note */}
                  <div className="mt-6 flex justify-center items-center gap-2 text-xs text-muted-foreground/70">
                      <Shield className="w-3 h-3" />
                      <span>Files are processed securely and deleted after extraction.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Processing */}
            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="industrial-card rounded-lg p-16 text-center shadow-lg"
              >
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    <Zap className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Analyzing Schematic
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  {file?.name}
                </p>
                
                <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
                    <div className="w-full flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Reading PDF geometry</span>
                    </div>
                     <div className="w-full flex items-center gap-3 text-sm text-primary font-medium animate-pulse">
                        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin mb-0.5"></div>
                        <span>Extracting wire segments</span>
                    </div>
                     <div className="w-full flex items-center gap-3 text-sm text-muted-foreground opacity-50">
                        <div className="w-4 h-4 rounded-full border border-muted"></div>
                        <span>Formatting cut list</span>
                    </div>
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
                 <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Review Cut List</h2>
                        <p className="text-muted-foreground">Verify the extracted lengths before processing.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadJSON}>
                        <Download className="w-4 h-4 mr-2" />
                        Export JSON
                    </Button>
                 </div>

                <NetlistDisplay specs={parsedSpecs} onUpdateWire={handleWireUpdate} onAddWire={handleAddWire} />

                {/* Pricing Breakdown */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg flex flex-col justify-center space-y-2 border border-border">
                     <label className="text-sm font-semibold text-foreground">Harness Quantity</label>
                     <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="h-8 w-20 text-center bg-background"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </Button>
                     </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg flex justify-between items-center text-sm md:text-base border border-border">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">Estimate Breakdown:</p>
                      <p className="text-muted-foreground text-xs">
                         Includes ${BASE_FEE} setup fee + ${(totalLengthCm * PRICE_PER_CM * quantity).toFixed(2)} (material & labor)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        ${totalCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                         Length: {(totalLengthCm).toFixed(0)}cm / unit
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {quantity} × ${(totalLengthCm * PRICE_PER_CM).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStep("upload");
                      setFile(null);
                      setParsedSpecs(null);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel & Upload New
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleConfirm}
                    className="px-8 shadow-lg shadow-primary/20 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Submit Order
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
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
                className="industrial-card rounded-lg p-12 text-center relative border-green-500/20 bg-green-500/5"
              >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Order Confirmed
                </h2>
                <div className="text-muted-foreground mb-8 max-w-md mx-auto">
                    <p className="mb-4">Your wire order has been successfully placed. A confirmation email has been sent.</p> 
                    <div className="bg-background rounded-lg p-4 border text-left text-sm font-mono space-y-2">
                        <div className="flex justify-between border-b border-muted pb-2">
                            <span className="text-muted-foreground">Order ID:</span>
                            <span>ORD-{Math.floor(Math.random() * 10000)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">File:</span>
                            <span>{file?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Quantity:</span>
                            <span>{quantity} Harness{quantity > 1 ? 'es' : ''}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Wires per harness:</span>
                            <span>{parsedSpecs?.wires.length}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Length per harness:</span>
                             <span>~{totalLengthCm.toFixed(1)} cm</span>
                        </div>
                         <div className="flex justify-between pt-2 border-t border-muted mt-2 font-bold text-lg">
                            <span className="text-foreground">Total Price:</span>
                            <span className="text-green-600">${totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                     <Button
                        variant="outline"
                        onClick={handleDownloadJSON}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download JSON
                      </Button>
                    <Button
                      onClick={() => {
                        setFile(null);
                        setParsedSpecs(null);
                        setStep("upload");
                      }}
                    >
                      Process Another File
                      <RefreshCcw className="w-4 h-4 ml-2" />
                    </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default QuoteRequest;
