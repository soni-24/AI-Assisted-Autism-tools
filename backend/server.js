const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  console.log("✅ Firebase Admin initialized");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error.message);
}

const db = admin.firestore();

// Validate API key
const rawKey = process.env.GEMINI_API_KEY;
if (!rawKey || !rawKey.trim()) {
  console.error("Missing GEMINI_API_KEY in .env");
}
const apiKey = rawKey ? rawKey.trim() : 'dummy-key'; 

// Initialize GenAI client
const ai = new GoogleGenAI({ apiKey }); 

// POST /analyze
app.post("/analyze", async (req, res) => {
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
`;

  try {
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
    
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      },
    });

    const jsonText = result.text.trim();
    
    if (!jsonText) {
        throw new Error("Empty JSON response from AI model.");
    }
    
    console.log("Raw AI JSON response:", jsonText);

    let parsed = JSON.parse(jsonText);

    return res.json(parsed);

  } catch (err) {
    console.error("Error in /analyze:", err);
    return res.status(500).json({ 
        error: "AI analysis failed", 
        message: "Could not generate analysis. Please ensure your API key is valid and restart the server.",
        detailedError: err?.message || "Unknown error"
    });
  }
});

// POST /save-conversation - Save analysis to Firebase
app.post("/save-conversation", async (req, res) => {
  try {
    const { childData, analysis } = req.body;
    
    if (!childData || !analysis) {
      return res.status(400).json({ error: "Missing childData or analysis" });
    }
    
    const docRef = await db.collection('autism-sessions').add({
      childAge: childData.childAge,
      eyeContact: childData.eyeContact,
      speechLevel: childData.speechLevel,
      socialResponse: childData.socialResponse,
      sensoryReactions: childData.sensoryReactions,
      therapyGoals: analysis.therapyGoals,
      suggestedActivities: analysis.suggestedActivities,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    console.log("✅ Saved to Firebase:", docRef.id);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('❌ Error saving to Firebase:', error);
    res.status(500).json({ 
      error: 'Failed to save data',
      message: error.message 
    });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));