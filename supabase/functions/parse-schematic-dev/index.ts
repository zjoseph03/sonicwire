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