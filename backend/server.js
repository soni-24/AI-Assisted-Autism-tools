const express = require("express");
const cors = require("cors");
require("dotenv").config();
// Changed to require the new SDK package and class
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Validate API key
const rawKey = process.env.GEMINI_API_KEY;
if (!rawKey || !rawKey.trim()) {
  console.error("Missing GEMINI_API_KEY in .env");
  // In a production app, you might choose to exit or handle this gracefully.
  // We'll proceed assuming the key will be provided in the runtime environment.
  // process.exit(1); 
}
const apiKey = rawKey ? rawKey.trim() : 'dummy-key'; 

// Initialize GenAI client using the new SDK class (GoogleGenAI)
// The API key is passed in the configuration object.
const ai = new GoogleGenAI({ apiKey }); 

// NOTE: The utility function extractTextFromResult is removed as we now enforce JSON output
// and use the standard result.text method, which is robust for structured output.

// POST /analyze
app.post("/analyze", async (req, res) => {
  // Check if the API Key is actually provided, otherwise skip the AI call for the demo environment.
  if (!rawKey || !rawKey.trim()) {
    console.error("Skipping AI call: No valid GEMINI_API_KEY provided.");
    return res.status(503).json({ 
        error: "Service Unavailable", 
        message: "GEMINI_API_KEY is missing or invalid. Please provide a key in your .env file."
    });
  }

  const { childAge, eyeContact, speechLevel, socialResponse, sensoryReactions } = req.body;

  if (!childAge || !eyeContact || !speechLevel || !socialResponse || !sensoryReactions) {
    return res.status(400).json({ error: "Missing required child data" });
  }

  const prompt = `
You are a professional child development therapist specializing in autism. Analyze the child's behavioral and developmental profile based on the following details:
- Age: ${childAge}
- Eye Contact: ${eyeContact}
- Speech Level: ${speechLevel}
- Social Response: ${socialResponse}
- Sensory Reactions: ${sensoryReactions}

Based on this profile, suggest exactly 3 short, measurable therapy goals and exactly 2 practical, structured activities.
`; // Simplified prompt since the model configuration handles the output structure.

  try {
    // Define the required JSON output schema
    const responseSchema = {
      type: "OBJECT",
      properties: {
        therapyGoals: {
          type: "ARRAY",
          description: "Exactly 3 short, measurable therapy goals.",
          items: { type: "STRING" }
        },
        suggestedActivities: {
          type: "ARRAY",
          description: "Exactly 2 practical, structured activities.",
          items: { type: "STRING" }
        }
      },
      required: ["therapyGoals", "suggestedActivities"]
    };
    
    // Updated API call structure to use ai.models.generateContent
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Model is a top-level parameter
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2 // Lower temperature for more focused, structured output
      },
    });

    const jsonText = result.text.trim();
    
    // Ensure the response is not empty before parsing
    if (!jsonText) {
        throw new Error("Empty JSON response from AI model.");
    }
    
    console.log("Raw AI JSON response:", jsonText);

    // Parse the guaranteed JSON response
    let parsed = JSON.parse(jsonText);

    // Send parsed JSON to frontend
    return res.json(parsed);

  } catch (err) {
    console.error("Error in /analyze:", err);
    // Return a more descriptive error structure
    return res.status(500).json({ 
        error: "AI analysis failed", 
        // Note: The message below is intentionally generic to avoid confusing the user with internal API errors.
        message: "Could not generate analysis. Please ensure your API key is valid and restart the server.",
        detailedError: err?.message || "Unknown error"
    });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
