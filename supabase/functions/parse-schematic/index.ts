import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "npm:@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Note: 'base64Data' is used in the old function, but 'base64' is common. 
    // I will check the frontend code again to see what I will be sending. 
    // src/lib/gemini.ts converted file to base64 string. 
    // I'll stick to 'base64Data' to minimize friction if I can, but I'll update the frontend to match.
    // Let's use 'base64Data' to be consistent with the previous variable name context if useful, 
    // but the frontend isn't calling this yet.
    
    // Using 'base64' is more standard for the property name in my proposed frontend change.
    const { base64, mimeType } = await req.json();

    if (!base64) {
      throw new Error("Missing required parameters: base64 data.");
    }

    // 1. Initialize Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured on server.");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    // 2. Generate Content using EXACT logic from src/lib/gemini.ts
    const prompt = `CRITICAL PRIORITY: WIREVIZ SCHEMATIC PARSING
Your primary goal is to parse "WireViz" style wire harness diagrams and extract the connections into structured JSON. 

UNDERSTANDING WIREVIZ VISUAL LAYOUT:
- Connectors: Drawn as tabular boxes. Pin numbers and Pin Names (Signals) are listed INSIDE these boxes.
- Cables: Wires are grouped into a central "Cable" box. Overall length and gauge are written here.
- Wires: Lines connecting the connector boxes.

EXTRACTION RULES:

1. Signal Names (JSON "id" field) - CRITICAL:
   - DO NOT use the Pin Number as the JSON "id".
   - Look INSIDE the connector box at the row where the wire terminates. Extract the text labeled as the Pin Name or Signal (e.g., "VCC", "GND", "CAN_H", "24V", "VBAT").
   - Fallback: If blank, use "W_[PinNumber]".

2. Colors (JSON "color" field) - DUAL VERIFICATION:
   - STRATEGY A (Hidden Text Format): Look closely inside the middle connector boxes where length is specified, or in any accompanying tables. WireViz frequently formats the wire number and color together separated by a colon (e.g., "1:RD", "2:BK", "3:GN", "4:YE"). If you see "1:RD", extract "RD".
   - STRATEGY B (Visual Confirmation): If no text abbreviation exists, look at the physical rendered ink color of the line connecting the pins.
     - Red line = "RD"
     - Black line = "BK"
     - Green line = "GN"
     - Yellow line = "YE"
     - Blue line = "BU"
     - White line = "WH"
   - SHIELD EXCEPTION: Shield wires (often labeled "Shield", "SH", or "S") frequently lack explicit color labels but are drawn in black ink. Automatically assign "BK" as the color for shield wires if no other text color is specified.
   - ALWAYS return the IEC standard 2-letter abbreviation.

3. Gauge and Length (JSON "gauge" and "length" fields):
   - Look for a central "Cable" box or bundle label.
   - Length is usually formatted like "1.2 m" or "200mm". Apply this length to ALL wires within that cable bundle.
   - Gauge is typically written as "0.5mm²" or "22 AWG" in the cable box. 
   - MULTIPLIER FORMAT: If the gauge is written with a multiplier (e.g., "4x 22 AWG + S"), apply the "22 AWG" gauge to the standard wires. 
   - SHIELD GAUGE EXCEPTION: If a shield ("+ S") is present in a bundle, apply the main bundle's gauge to the shield as well.
   - NO HALLUCINATION: For all other attributes, if it is not explicitly written in the drawing, return \`null\`. Do not guess.

4. Full Wire Extraction:
   - Trace every single line between connectors.
   - Include Shields/Drains as distinct wires. These often terminate at pins labeled "S", "SH", or "Shield".

OUTPUT FORMAT:
Return ONLY valid JSON. Do not include markdown formatting blocks (\`\`\`json).

Expected JSON Structure:
{
  "isSchematic": true,
  "missingInfo": [], 
  "wires": [
    { 
      "id": "VBAT", 
      "length": "1.2 m", 
      "gauge": "22 AWG", 
      "color": "RD" 
    },
    {
      "id": "SHIELD",
      "length": "1.2 m",
      "gauge": "22 AWG",
      "color": "BK"
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
                mimeType: mimeType || "application/pdf",
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
    
    let parsed: any;
    try {
        parsed = JSON.parse(jsonText);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("Failed to parse AI response as JSON");
    }

    // Normalize output (matching src/lib/gemini.ts logic)
    const result = {
      isSchematic: typeof parsed.isSchematic === 'boolean' ? parsed.isSchematic : true,
      missingInfo: Array.isArray(parsed.missingInfo) ? parsed.missingInfo : [],
      wires: Array.isArray(parsed.wires) ? parsed.wires : (Array.isArray(parsed) ? parsed : [])
    };
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});