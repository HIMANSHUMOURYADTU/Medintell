import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHealthGoalSchema, 
  insertMedicationSchema, 
  insertChatMessageSchema, 
  insertHealthAssessmentSchema, 
  insertEmergencyContactSchema 
} from "@shared/schema";
import { generateHealthResponse, analyzeHealthRisk } from "./services/gemini";

// Helper function to generate realistic nearby facilities
function generateNearbyFacilities(userLat: number, userLng: number, radius: number, type: string) {
  const facilityTypes = ['hospital', 'clinic', 'emergency', 'pharmacy', 'diagnostic'];
  const facilities = [];
  
  // Generate 8-15 facilities within radius
  const numFacilities = Math.floor(Math.random() * 8) + 8;
  
  for (let i = 0; i < numFacilities; i++) {
    // Generate random point within radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    const deltaLat = (distance / 111) * Math.cos(angle); // ~111 km per degree latitude
    const deltaLng = (distance / (111 * Math.cos(userLat * Math.PI / 180))) * Math.sin(angle);
    
    const facilityLat = userLat + deltaLat;
    const facilityLng = userLng + deltaLng;
    
    const facilityType = type === 'all' ? facilityTypes[Math.floor(Math.random() * facilityTypes.length)] : type;
    
    // Skip if type filter doesn't match
    if (type !== 'all' && facilityType !== type) continue;
    
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
        phone: `+91-11-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`
      },
      distance: (distance).toFixed(1),
      opening_hours: Math.random() > 0.3 ? 'Open 24 hours' : 'Mon-Fri 9AM-6PM',
      rating: (3.5 + Math.random() * 1.5).toFixed(1)
    };
    
    facilities.push(facility);
  }
  
  return facilities.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

function generateFacilityName(type: string): string {
  const names = {
    hospital: ['City General Hospital', 'Metro Medical Center', 'Regional Health Hospital', 'Community Hospital', 'Medical Center'],
    clinic: ['Family Health Clinic', 'Quick Care Clinic', 'Primary Care Center', 'Health Plus Clinic', 'Wellness Clinic'],
    emergency: ['Emergency Medical Center', 'Urgent Care', 'Emergency Hospital', 'Crisis Care Center', 'Emergency Services'],
    pharmacy: ['Health Pharmacy', 'MedPlus Pharmacy', 'Care Pharmacy', 'Wellness Pharmacy', 'Quick Pharmacy'],
    diagnostic: ['Diagnostic Center', 'Lab Services', 'Medical Diagnostics', 'Health Lab', 'Scan Center']
  };
  
  const typeNames = names[type as keyof typeof names] || names.hospital;
  return typeNames[Math.floor(Math.random() * typeNames.length)];
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health Goals
  app.get("/api/health-goals/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const goals = await storage.getHealthGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health goals" });
    }
  });

  app.post("/api/health-goals", async (req, res) => {
    try {
      const goalData = insertHealthGoalSchema.parse(req.body);
      const goal = await storage.createHealthGoal(goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid health goal data" });
    }
  });

  app.patch("/api/health-goals/:id", async (req, res) => {
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

  // Medications
  app.get("/api/medications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const medicationData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(medicationData);
      res.json(medication);
    } catch (error) {
      res.status(400).json({ message: "Invalid medication data" });
    }
  });

  app.patch("/api/medications/:id", async (req, res) => {
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

  // Chat Messages & AI Response
  app.get("/api/chat-messages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { userId, message, persona } = req.body;
      
      // Save user message
      const userMessageData = insertChatMessageSchema.parse({
        userId,
        message,
        isUser: true,
        persona
      });
      await storage.createChatMessage(userMessageData);

      // Get chat history for context
      const chatHistory = await storage.getChatMessages(userId);
      const historyForAI = chatHistory.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.message
      }));

      // Generate AI response
      const aiResponse = await generateHealthResponse(message, persona, historyForAI);
      
      // Save AI response
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
      console.error('Chat error:', error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Health Assessments
  app.get("/api/health-assessments/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const assessments = await storage.getHealthAssessments(userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health assessments" });
    }
  });

  app.post("/api/health-assessments", async (req, res) => {
    try {
      const { userId, responses } = req.body;
      
      // Analyze responses using AI
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
      console.error('Assessment error:', error);
      res.status(500).json({ message: "Failed to create health assessment" });
    }
  });

  // Emergency Contacts
  app.get("/api/emergency-contacts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const contacts = await storage.getEmergencyContacts(userId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  app.post("/api/emergency-contacts", async (req, res) => {
    try {
      const contactData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(contactData);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid emergency contact data" });
    }
  });

  // Mock Medical Facilities API
  app.get("/api/facilities", async (req, res) => {
    const { lat, lng, type } = req.query;
    
    // Mock facilities data - in real app this would be from external API
    const mockFacilities = [
      {
        id: '1',
        name: 'City General Hospital',
        type: 'hospital',
        address: '123 Main Street, Central District',
        phone: '+91-11-2345-6789',
        distance: '2.3 km',
        rating: 4.5,
        available24h: true,
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      {
        id: '2', 
        name: 'Heart Care Clinic',
        type: 'clinic',
        address: '456 Healthcare Avenue, Medical Plaza',
        phone: '+91-11-9876-5432',
        distance: '1.8 km',
        rating: 4.2,
        available24h: false,
        coordinates: { lat: 28.6129, lng: 77.2080 }
      },
      {
        id: '3',
        name: 'Emergency Medical Center',
        type: 'emergency',
        address: '789 Emergency Lane, Quick Response Zone',
        phone: '+91-11-1111-0000',
        distance: '0.9 km',
        rating: 4.8,
        available24h: true,
        coordinates: { lat: 28.6149, lng: 77.2100 }
      }
    ];

    // Filter by type if specified
    let filteredFacilities = mockFacilities;
    if (type && type !== 'all') {
      filteredFacilities = mockFacilities.filter(f => f.type === type);
    }

    res.json(filteredFacilities);
  });

  // Nearby Facilities Search API (for map integration)
  app.get("/api/nearby-facilities", async (req, res) => {
    try {
      const { lat, lng, radius = 5, type = 'all' } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const searchRadius = parseFloat(radius as string);

      // Generate more realistic mock facilities based on user location
      const mockFacilities = generateNearbyFacilities(userLat, userLng, searchRadius, type as string);
      
      res.json({ 
        facilities: mockFacilities,
        count: mockFacilities.length,
        radius: searchRadius,
        center: { lat: userLat, lng: userLng }
      });
    } catch (error) {
      console.error('Nearby facilities error:', error);
      res.status(500).json({ error: "Failed to fetch nearby facilities" });
    }
  });

  // Facility Details API (for modal popup)
  app.get("/api/facility-details/:placeId", async (req, res) => {
    try {
      const { placeId } = req.params;
      
      // Mock detailed facility data
      const facilityDetails = {
        place_id: placeId,
        name: 'Sample Healthcare Facility',
        formatted_address: '123 Healthcare Street, Medical District, City 12345',
        formatted_phone_number: '+91-11-2345-6789',
        website: 'https://example-hospital.com',
        rating: 4.3,
        user_ratings_total: 127,
        opening_hours: {
          weekday_text: [
            'Monday: 8:00 AM – 8:00 PM',
            'Tuesday: 8:00 AM – 8:00 PM', 
            'Wednesday: 8:00 AM – 8:00 PM',
            'Thursday: 8:00 AM – 8:00 PM',
            'Friday: 8:00 AM – 8:00 PM',
            'Saturday: 9:00 AM – 6:00 PM',
            'Sunday: 10:00 AM – 4:00 PM'
          ]
        },
        photos: [
          { photo_reference: 'sample1' },
          { photo_reference: 'sample2' }
        ]
      };

      res.json({ facility: facilityDetails });
    } catch (error) {
      console.error('Facility details error:', error);
      res.status(500).json({ error: "Failed to fetch facility details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
