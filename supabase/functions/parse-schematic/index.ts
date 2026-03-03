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
    const { base64Data, mimeType, captchaToken } = await req.json();

    if (!base64Data || !captchaToken) {
      throw new Error("Missing required parameters: file payload or captcha token.");
    }

    // 1. Verify Turnstile Captcha Token
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (!turnstileSecret) {
      console.warn("WARNING: TURNSTILE_SECRET_KEY not set in Edge Function secrets. Bypassing Turnstile temporarily...");
    } else {
      const formData = new FormData();
      formData.append('secret', turnstileSecret);
      formData.append('response', captchaToken);
      
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData
      });
      const verifyJson = await verifyRes.json();
      
      if (!verifyJson.success) {
        console.error("Turnstile failed:", verifyJson);
        throw new Error("Captcha verification failed. Are you a bot?");
      }
    }

    // 2. Initialize Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured on server.");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    // 3. Generate Content
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || "application/pdf",
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    
    // Clean JSON
    let jsonText = text?.trim() || "{}";
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    
    const parsed = JSON.parse(jsonText);
    
    return new Response(JSON.stringify(parsed), {
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
