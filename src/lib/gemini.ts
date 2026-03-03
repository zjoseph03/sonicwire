import { supabase } from "@/integrations/supabase/client";

export interface ParsedSpecifications {
  wireCount: string;
  wireLengths: string[];
  wireGauges: string[];
  pinoutMapping: string;
  totalQuantity: string;
  // Optional fields
  wireColors?: string[];
  insulationType?: string;
  lengthTolerances?: string;
  bundlingSpecs?: string;
  routingPaths?: string;
  environmentalReqs?: string;
  shielding?: string;
  sleeving?: string;
  separationReqs?: string;
  labels?: string;
  // Metadata
  confidence: "high" | "medium" | "low";
  notes?: string;
}

export async function parseSchematicPDF(file: File, captchaToken: string): Promise<ParsedSpecifications> {
  if (!captchaToken) {
    throw new Error("Security verification missing. Please try again.");
  }
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    
    console.log("Sending PDF to secure backend for processing...");
    
    const { data, error } = await supabase.functions.invoke('parse-schematic', {
       body: {
         base64Data: base64,
         mimeType: file.type,
         captchaToken: captchaToken
       },
    });

    if (error) {
      console.error("Supabase Edge Function Error:", error);
      throw new Error(error.message || "Backend parsing failed");
    }

    if (data.error) {
       throw new Error(data.error);
    }
    
    console.log("Received parsed specifications from backend");
    
    const parsed = data as ParsedSpecifications;
    return parsed;

  } catch (error) {
    console.error("Error parsing PDF via backend:", error);
    throw new Error(
      error instanceof Error 
        ? error.message
        : "Failed to parse schematic safely. Please ensure you are connected."
    );
  }
}
