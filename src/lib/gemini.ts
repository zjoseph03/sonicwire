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

export type ParsedSpecifications = WireCut[];

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

    const prompt = `You are a precision data extraction tool for an automated wire harnessing system. I will provide images or PDFs of wire harness schematics.

Your task is to parse the document and extract the point-to-point wiring netlist into a strictly formatted JSON array.

Strict Rules:
1. Ignore spatial layout.
2. Extract ID, Length, Gauge, Color.
3. Use "null" for missing values.
4. Return ONLY raw JSON array. No markdown.

Expected JSON Structure:
[
  { 
    "id": "W1", 
    "length": "200mm", 
    "gauge": "18AWG", 
    "color": "RED" 
  }
]`;

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
    // Ensure we handle response.text property correctly
    const text = response.text || "";
    console.log("Raw response text:", text);
    
    // Clean up the response - remove markdown code blocks if present
    let jsonText = text.trim() || "[]";
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    
    // Attempt parsing
    try {
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) {
            return parsed as ParsedSpecifications;
        }
        // Handle edge case where it returns an object wrapper
        // @ts-ignore
        if (parsed.wires && Array.isArray(parsed.wires)) return parsed.wires;
        throw new Error("Parsed data is not a valid list of wire cuts");
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
