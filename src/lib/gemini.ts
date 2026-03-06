import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Gemini API key not found. PDF parsing will not work.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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
  if (!ai) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    const prompt = `You are a precision data extraction tool for an automated wire harnessing system. I will provide images or PDFs of schematics.

Your task is to:
1. Determine if the document is likely a wire harness schematic or wire list (isSchematic: boolean). If not, return isSchematic=false and empty wires.
2. If it is a schematic, extract the point-to-point wiring netlist.
3. Identify any REQUIRED columns that are completely missing (e.g. if no gauge is listed at all).

Strict Rules:
1. Ignore spatial layout.
2. Extract ID, Length, Gauge, Color.
3. Use "null" for missing values in wire rows.
4. Return ONLY raw JSON. No markdown.

Expected JSON Structure:
{
  "isSchematic": true,
  "missingInfo": ["color", "gauge"], // List any columns that are ENTIRELY missing from the doc
  "wires": [
    { 
      "id": "W1", 
      "length": "200mm", 
      "gauge": "18AWG", 
      "color": "RED" 
    }
  ]
}`;

    console.log("Sending request to Gemini model...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: base64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    console.log("Received response from Gemini");
    const text = response.text || "";
    console.log("Raw response text:", text);
    
    let jsonText = text.trim() || "{}";
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    
    try {
        const parsed = JSON.parse(jsonText);
        
        // Normalize output
        const result: ParsedSpecifications = {
          isSchematic: typeof parsed.isSchematic === 'boolean' ? parsed.isSchematic : true,
          missingInfo: Array.isArray(parsed.missingInfo) ? parsed.missingInfo : [],
          wires: Array.isArray(parsed.wires) ? parsed.wires : (Array.isArray(parsed) ? parsed : [])
        };
        
        return result;
    } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("Failed to parse AI response as JSON");
    }

  } catch (error) {


    console.error("Error parsing PDF:", error);
    throw new Error(
      error instanceof Error 
        ? `Failed to parse schematic: ${error.message}` 
        : "Failed to parse schematic. Please ensure the PDF contains clear wire harness specifications."
    );
  }
}
