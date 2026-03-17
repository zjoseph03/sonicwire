import { supabase } from "@/integrations/supabase/client";

export interface WireCut {
  id: string;      
  length: string;  
  gauge: string;   
  color: string;   
}

export type WireList = WireCut[];

export interface ParsedSpecifications {
  wires: WireCut[];
  missingInfo: string[];
  isSchematic: boolean;
}

export async function parseSchematicPDF(file: File): Promise<ParsedSpecifications> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // Toggle between dev and prod functions:
    const FUNCTION_NAME = 'parse-schematic';      // Production
    // const FUNCTION_NAME = 'parse-schematic-dev';  // Development
    
    console.log(`Invoking '${FUNCTION_NAME}' Edge Function...`);
    
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { 
        base64, 
        mimeType: file.type 
      }
    });

    if (error) {
       console.error("Supabase Function Error:", error);
       throw new Error(error.message || "Failed to process schematic via secure backend.");
    }
    
    // The Edge Function returns the ParsedSpecifications object directly as JSON
    // We can assume it matches the structure as we control the backend output
    const result = data as ParsedSpecifications;
    
    return result;

  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(
      error instanceof Error 
        ? `Failed to parse schematic: ${error.message}` 
        : "Failed to parse schematic. Please ensure the PDF contains clear wire harness specifications."
    );
  }
}
