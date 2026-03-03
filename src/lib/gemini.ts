import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Gemini API key not found. PDF parsing will not work.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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

    const prompt = `You are an expert at analyzing wire harness schematics and technical drawings.

Analyze this PDF schematic and extract the following wire harness specifications in JSON format:

REQUIRED FIELDS (must be present):
1. wireCount: Total number of individual wires (as string)
2. wireLengths: Array of wire lengths with units (e.g., ["150mm", "200mm"])
3. wireGauges: Array of wire gauges (e.g., ["18AWG", "22AWG"])
4. pinoutMapping: Description of which wires connect to which pins/points
5. totalQuantity: Number of identical harnesses needed (default to "1" if not specified)

OPTIONAL FIELDS (extract if present):
6. wireColors: Array of wire colors if specified
7. insulationType: Type of wire insulation (PVC, PTFE, silicone, etc.)
8. lengthTolerances: Acceptable length variance (e.g., "±5mm")
9. bundlingSpecs: How wires should be grouped or bundled
10. routingPaths: Specific routing requirements or bend specifications
11. environmentalReqs: Operating temperature range, moisture resistance, etc.
12. shielding: EMI shielding requirements if any
13. sleeving: Protective sleeving specifications
14. separationReqs: Wires that must be routed separately
15. labels: Wire identification labels or markers

METADATA:
- confidence: "high", "medium", or "low" based on how clear the specifications are
- notes: Any important observations, warnings, or unclear specifications

Return ONLY valid JSON. If information is not found, use empty string "" for strings or empty array [] for arrays.
Do not include any markdown formatting or code blocks, just the raw JSON object.

Example response format:
{
  "wireCount": "4",
  "wireLengths": ["150mm", "200mm", "175mm", "150mm"],
  "wireGauges": ["18AWG", "18AWG", "22AWG", "18AWG"],
  "pinoutMapping": "Wire 1 (red): Pin A1 to Pin B1, Wire 2 (black): Pin A2 to Pin B2",
  "totalQuantity": "10",
  "wireColors": ["red", "black", "white", "green"],
  "confidence": "high",
  "notes": "All specifications clearly marked"
}`;

    console.log("Sending request to Gemini model...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    const text = response.text;
    console.log("Raw response text:", text);
    
    // Clean up the response - remove markdown code blocks if present
    let jsonText = text?.trim() || "{}";
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    
    const parsed = JSON.parse(jsonText) as ParsedSpecifications;
    
    // Validate required fields
    if (!parsed.wireCount || !parsed.wireLengths || !parsed.wireGauges || !parsed.pinoutMapping || !parsed.totalQuantity) {
      throw new Error("Missing required specifications in parsed data");
    }
    
    return parsed;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(
      error instanceof Error 
        ? `Failed to parse schematic: ${error.message}` 
        : "Failed to parse schematic. Please ensure the PDF contains clear wire harness specifications."
    );
  }
}
