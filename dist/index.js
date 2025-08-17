// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users = /* @__PURE__ */ new Map();
  healthGoals = /* @__PURE__ */ new Map();
  medications = /* @__PURE__ */ new Map();
  chatMessages = /* @__PURE__ */ new Map();
  healthAssessments = /* @__PURE__ */ new Map();
  emergencyContacts = /* @__PURE__ */ new Map();
  // Users
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      persona: insertUser.persona || "general",
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  // Health Goals
  async getHealthGoals(userId) {
    return Array.from(this.healthGoals.values()).filter((goal) => goal.userId === userId);
  }
  async createHealthGoal(insertGoal) {
    const id = randomUUID();
    const goal = {
      ...insertGoal,
      description: insertGoal.description || null,
      targetValue: insertGoal.targetValue || null,
      currentValue: insertGoal.currentValue || 0,
      unit: insertGoal.unit || null,
      completed: insertGoal.completed || false,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.healthGoals.set(id, goal);
    return goal;
  }
  async updateHealthGoal(id, updates) {
    const goal = this.healthGoals.get(id);
    if (!goal) return void 0;
    const updated = { ...goal, ...updates };
    this.healthGoals.set(id, updated);
    return updated;
  }
  async deleteHealthGoal(id) {
    return this.healthGoals.delete(id);
  }
  // Medications
  async getMedications(userId) {
    return Array.from(this.medications.values()).filter((med) => med.userId === userId && med.active);
  }
  async createMedication(insertMed) {
    const id = randomUUID();
    const medication = {
      ...insertMed,
      times: insertMed.times || null,
      endDate: insertMed.endDate || null,
      active: insertMed.active ?? true,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.medications.set(id, medication);
    return medication;
  }
  async updateMedication(id, updates) {
    const medication = this.medications.get(id);
    if (!medication) return void 0;
    const updated = { ...medication, ...updates };
    this.medications.set(id, updated);
    return updated;
  }
  async deleteMedication(id) {
    return this.medications.delete(id);
  }
  // Chat Messages
  async getChatMessages(userId) {
    return Array.from(this.chatMessages.values()).filter((msg) => msg.userId === userId).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  async createChatMessage(insertMessage) {
    const id = randomUUID();
    const message = {
      ...insertMessage,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
  // Health Assessments
  async getHealthAssessments(userId) {
    return Array.from(this.healthAssessments.values()).filter((assessment) => assessment.userId === userId).sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }
  async createHealthAssessment(insertAssessment) {
    const id = randomUUID();
    const assessment = {
      ...insertAssessment,
      riskLevel: insertAssessment.riskLevel || null,
      recommendations: insertAssessment.recommendations || null,
      id,
      completedAt: /* @__PURE__ */ new Date()
    };
    this.healthAssessments.set(id, assessment);
    return assessment;
  }
  // Emergency Contacts
  async getEmergencyContacts(userId) {
    return Array.from(this.emergencyContacts.values()).filter((contact) => contact.userId === userId);
  }
  async createEmergencyContact(insertContact) {
    const id = randomUUID();
    const contact = {
      ...insertContact,
      isPrimary: insertContact.isPrimary || false,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.emergencyContacts.set(id, contact);
    return contact;
  }
  async updateEmergencyContact(id, updates) {
    const contact = this.emergencyContacts.get(id);
    if (!contact) return void 0;
    const updated = { ...contact, ...updates };
    this.emergencyContacts.set(id, updated);
    return updated;
  }
  async deleteEmergencyContact(id) {
    return this.emergencyContacts.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  persona: text("persona").notNull().default("general"),
  // senior, child, anxious, caregiver
  createdAt: timestamp("created_at").defaultNow()
});
var healthGoals = pgTable("health_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: integer("target_value"),
  currentValue: integer("current_value").default(0),
  unit: text("unit"),
  // steps, hours, mg, etc.
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  // daily, twice_daily, weekly, etc.
  times: text("times").array(),
  // ["09:00", "21:00"]
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(),
  persona: text("persona").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var healthAssessments = pgTable("health_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  responses: jsonb("responses").notNull(),
  // Store Q&A responses
  riskLevel: text("risk_level"),
  // low, medium, high
  recommendations: text("recommendations").array(),
  completedAt: timestamp("completed_at").defaultNow()
});
var emergencyContacts = pgTable("emergency_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone").notNull(),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  persona: true
});
var insertHealthGoalSchema = createInsertSchema(healthGoals).omit({
  id: true,
  createdAt: true
});
var insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true
});
var insertHealthAssessmentSchema = createInsertSchema(healthAssessments).omit({
  id: true,
  completedAt: true
});
var insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
  createdAt: true
});

// server/services/gemini.ts
import { GoogleGenAI } from "@google/genai";
var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
async function generateHealthResponse(userMessage, persona, chatHistory = []) {
  try {
    const systemInstructions = getPersonaInstructions(persona);
    const conversationContext = chatHistory.slice(-5).map((msg) => `${msg.role}: ${msg.content}`).join("\n");
    const fullPrompt = `${systemInstructions}

Previous conversation:
${conversationContext}

Current user message: ${userMessage}

Please respond in character for the ${persona} persona, providing helpful healthcare guidance while being empathetic and appropriate for the user type.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt
    });
    const responseText = response.text || "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team.";
    return {
      message: responseText,
      confidence: 0.8
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      message: "I'm experiencing some technical difficulties. Please try again in a moment, or if this is urgent, please call our emergency number 108.",
      confidence: 0.1
    };
  }
}
function getPersonaInstructions(persona) {
  const baseInstructions = `You are InteliMed, an AI healthcare assistant. You provide helpful, accurate health information but always remind users to consult healthcare professionals for medical decisions. You cannot diagnose or prescribe medications.`;
  switch (persona) {
    case "senior":
      return `${baseInstructions}

You are speaking with a senior citizen. Use:
- Simple, clear language
- Larger conceptual explanations
- Patient, respectful tone
- References to traditional healthcare practices when appropriate
- Emphasis on medication management and regular check-ups
- Acknowledgment of their life experience and wisdom`;
    case "child":
      return `${baseInstructions}

You are speaking with a child or their parent about pediatric health. Use:
- Simple, age-appropriate language
- Encouraging and positive tone
- Fun analogies and comparisons
- Focus on prevention and healthy habits
- Reassuring language to reduce anxiety
- Involve parents/guardians in health decisions`;
    case "anxious":
      return `${baseInstructions}

You are speaking with someone who may have health anxiety. Use:
- Calm, reassuring tone
- Avoid alarming language
- Provide clear, factual information
- Acknowledge their concerns as valid
- Suggest breathing exercises or relaxation techniques when appropriate
- Emphasize when symptoms are common and manageable`;
    case "caregiver":
      return `${baseInstructions}

You are speaking with a caregiver (family member, nurse, etc.). Use:
- Professional yet compassionate tone
- Detailed information about care management
- Resources for caregiver support
- Information about patient advocacy
- Stress management for caregivers
- Coordination with healthcare teams`;
    default:
      return `${baseInstructions}

Provide general healthcare guidance with a professional yet friendly tone.`;
  }
}
async function analyzeHealthRisk(responses) {
  try {
    const prompt = `Analyze the following health assessment responses and provide a risk assessment:

${JSON.stringify(responses, null, 2)}

Please provide:
1. Risk level (low, medium, high)
2. 3-5 specific recommendations
3. Brief explanation of the assessment

Respond in JSON format:
{
  "riskLevel": "low|medium|high",
  "recommendations": ["recommendation1", "recommendation2", ...],
  "explanation": "explanation text"
}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            riskLevel: { type: "string", enum: ["low", "medium", "high"] },
            recommendations: { type: "array", items: { type: "string" } },
            explanation: { type: "string" }
          },
          required: ["riskLevel", "recommendations", "explanation"]
        }
      },
      contents: prompt
    });
    const result = JSON.parse(response.text || "{}");
    return {
      riskLevel: result.riskLevel || "low",
      recommendations: result.recommendations || ["Maintain a healthy lifestyle", "Regular check-ups with your doctor"],
      explanation: result.explanation || "Assessment completed successfully"
    };
  } catch (error) {
    console.error("Risk analysis error:", error);
    return {
      riskLevel: "low",
      recommendations: ["Consult with a healthcare professional", "Maintain regular health check-ups"],
      explanation: "Unable to complete detailed analysis. Please consult with a healthcare provider."
    };
  }
}

// server/routes.ts
function generateNearbyFacilities(userLat, userLng, radius, type) {
  const facilityTypes = ["hospital", "clinic", "emergency", "pharmacy", "diagnostic"];
  const facilities = [];
  const numFacilities = Math.floor(Math.random() * 8) + 8;
  for (let i = 0; i < numFacilities; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    const deltaLat = distance / 111 * Math.cos(angle);
    const deltaLng = distance / (111 * Math.cos(userLat * Math.PI / 180)) * Math.sin(angle);
    const facilityLat = userLat + deltaLat;
    const facilityLng = userLng + deltaLng;
    const facilityType = type === "all" ? facilityTypes[Math.floor(Math.random() * facilityTypes.length)] : type;
    if (type !== "all" && facilityType !== type) continue;
    const facility = {
      place_id: `facility_${i}_${Date.now()}`,
      name: generateFacilityName(facilityType),
      category: facilityType,
      vicinity: `Street ${i + 1}, Medical District`,
      address_line1: `${Math.floor(Math.random() * 999) + 1} Healthcare Ave`,
      geometry: {
        location: {
          lat: facilityLat,
          lng: facilityLng
        }
      },
      contact: {
        phone: `+91-11-${Math.floor(Math.random() * 9e3) + 1e3}-${Math.floor(Math.random() * 9e3) + 1e3}`
      },
      distance: distance.toFixed(1),
      opening_hours: Math.random() > 0.3 ? "Open 24 hours" : "Mon-Fri 9AM-6PM",
      rating: (3.5 + Math.random() * 1.5).toFixed(1)
    };
    facilities.push(facility);
  }
  return facilities.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}
function generateFacilityName(type) {
  const names = {
    hospital: ["City General Hospital", "Metro Medical Center", "Regional Health Hospital", "Community Hospital", "Medical Center"],
    clinic: ["Family Health Clinic", "Quick Care Clinic", "Primary Care Center", "Health Plus Clinic", "Wellness Clinic"],
    emergency: ["Emergency Medical Center", "Urgent Care", "Emergency Hospital", "Crisis Care Center", "Emergency Services"],
    pharmacy: ["Health Pharmacy", "MedPlus Pharmacy", "Care Pharmacy", "Wellness Pharmacy", "Quick Pharmacy"],
    diagnostic: ["Diagnostic Center", "Lab Services", "Medical Diagnostics", "Health Lab", "Scan Center"]
  };
  const typeNames = names[type] || names.hospital;
  return typeNames[Math.floor(Math.random() * typeNames.length)];
}
async function registerRoutes(app2) {
  app2.get("/api/health-goals/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const goals = await storage.getHealthGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health goals" });
    }
  });
  app2.post("/api/health-goals", async (req, res) => {
    try {
      const goalData = insertHealthGoalSchema.parse(req.body);
      const goal = await storage.createHealthGoal(goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid health goal data" });
    }
  });
  app2.patch("/api/health-goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const goal = await storage.updateHealthGoal(id, updates);
      if (!goal) {
        return res.status(404).json({ message: "Health goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update health goal" });
    }
  });
  app2.get("/api/medications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const medications2 = await storage.getMedications(userId);
      res.json(medications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });
  app2.post("/api/medications", async (req, res) => {
    try {
      const medicationData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(medicationData);
      res.json(medication);
    } catch (error) {
      res.status(400).json({ message: "Invalid medication data" });
    }
  });
  app2.patch("/api/medications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const medication = await storage.updateMedication(id, updates);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update medication" });
    }
  });
  app2.get("/api/chat-messages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });
  app2.post("/api/chat", async (req, res) => {
    try {
      const { userId, message, persona } = req.body;
      const userMessageData = insertChatMessageSchema.parse({
        userId,
        message,
        isUser: true,
        persona
      });
      await storage.createChatMessage(userMessageData);
      const chatHistory = await storage.getChatMessages(userId);
      const historyForAI = chatHistory.slice(-10).map((msg) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.message
      }));
      const aiResponse = await generateHealthResponse(message, persona, historyForAI);
      const aiMessageData = insertChatMessageSchema.parse({
        userId,
        message: aiResponse.message,
        isUser: false,
        persona
      });
      const savedAiMessage = await storage.createChatMessage(aiMessageData);
      res.json({
        userMessage: userMessageData,
        aiMessage: savedAiMessage,
        confidence: aiResponse.confidence
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });
  app2.get("/api/health-assessments/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const assessments = await storage.getHealthAssessments(userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health assessments" });
    }
  });
  app2.post("/api/health-assessments", async (req, res) => {
    try {
      const { userId, responses } = req.body;
      const analysis = await analyzeHealthRisk(responses);
      const assessmentData = insertHealthAssessmentSchema.parse({
        userId,
        responses,
        riskLevel: analysis.riskLevel,
        recommendations: analysis.recommendations
      });
      const assessment = await storage.createHealthAssessment(assessmentData);
      res.json({ ...assessment, analysis });
    } catch (error) {
      console.error("Assessment error:", error);
      res.status(500).json({ message: "Failed to create health assessment" });
    }
  });
  app2.get("/api/emergency-contacts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const contacts = await storage.getEmergencyContacts(userId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });
  app2.post("/api/emergency-contacts", async (req, res) => {
    try {
      const contactData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(contactData);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid emergency contact data" });
    }
  });
  app2.get("/api/facilities", async (req, res) => {
    const { lat, lng, type } = req.query;
    const mockFacilities = [
      {
        id: "1",
        name: "City General Hospital",
        type: "hospital",
        address: "123 Main Street, Central District",
        phone: "+91-11-2345-6789",
        distance: "2.3 km",
        rating: 4.5,
        available24h: true,
        coordinates: { lat: 28.6139, lng: 77.209 }
      },
      {
        id: "2",
        name: "Heart Care Clinic",
        type: "clinic",
        address: "456 Healthcare Avenue, Medical Plaza",
        phone: "+91-11-9876-5432",
        distance: "1.8 km",
        rating: 4.2,
        available24h: false,
        coordinates: { lat: 28.6129, lng: 77.208 }
      },
      {
        id: "3",
        name: "Emergency Medical Center",
        type: "emergency",
        address: "789 Emergency Lane, Quick Response Zone",
        phone: "+91-11-1111-0000",
        distance: "0.9 km",
        rating: 4.8,
        available24h: true,
        coordinates: { lat: 28.6149, lng: 77.21 }
      }
    ];
    let filteredFacilities = mockFacilities;
    if (type && type !== "all") {
      filteredFacilities = mockFacilities.filter((f) => f.type === type);
    }
    res.json(filteredFacilities);
  });
  app2.get("/api/nearby-facilities", async (req, res) => {
    try {
      const { lat, lng, radius = 5, type = "all" } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const searchRadius = parseFloat(radius);
      const mockFacilities = generateNearbyFacilities(userLat, userLng, searchRadius, type);
      res.json({
        facilities: mockFacilities,
        count: mockFacilities.length,
        radius: searchRadius,
        center: { lat: userLat, lng: userLng }
      });
    } catch (error) {
      console.error("Nearby facilities error:", error);
      res.status(500).json({ error: "Failed to fetch nearby facilities" });
    }
  });
  app2.get("/api/facility-details/:placeId", async (req, res) => {
    try {
      const { placeId } = req.params;
      const facilityDetails = {
        place_id: placeId,
        name: "Sample Healthcare Facility",
        formatted_address: "123 Healthcare Street, Medical District, City 12345",
        formatted_phone_number: "+91-11-2345-6789",
        website: "https://example-hospital.com",
        rating: 4.3,
        user_ratings_total: 127,
        opening_hours: {
          weekday_text: [
            "Monday: 8:00 AM \u2013 8:00 PM",
            "Tuesday: 8:00 AM \u2013 8:00 PM",
            "Wednesday: 8:00 AM \u2013 8:00 PM",
            "Thursday: 8:00 AM \u2013 8:00 PM",
            "Friday: 8:00 AM \u2013 8:00 PM",
            "Saturday: 9:00 AM \u2013 6:00 PM",
            "Sunday: 10:00 AM \u2013 4:00 PM"
          ]
        },
        photos: [
          { photo_reference: "sample1" },
          { photo_reference: "sample2" }
        ]
      };
      res.json({ facility: facilityDetails });
    } catch (error) {
      console.error("Facility details error:", error);
      res.status(500).json({ error: "Failed to fetch facility details" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
