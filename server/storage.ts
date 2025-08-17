import { 
  type User, type InsertUser, 
  type HealthGoal, type InsertHealthGoal,
  type Medication, type InsertMedication,
  type ChatMessage, type InsertChatMessage,
  type HealthAssessment, type InsertHealthAssessment,
  type EmergencyContact, type InsertEmergencyContact
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Health Goals
  getHealthGoals(userId: string): Promise<HealthGoal[]>;
  createHealthGoal(goal: InsertHealthGoal): Promise<HealthGoal>;
  updateHealthGoal(id: string, updates: Partial<HealthGoal>): Promise<HealthGoal | undefined>;
  deleteHealthGoal(id: string): Promise<boolean>;

  // Medications
  getMedications(userId: string): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, updates: Partial<Medication>): Promise<Medication | undefined>;
  deleteMedication(id: string): Promise<boolean>;

  // Chat Messages
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Health Assessments
  getHealthAssessments(userId: string): Promise<HealthAssessment[]>;
  createHealthAssessment(assessment: InsertHealthAssessment): Promise<HealthAssessment>;

  // Emergency Contacts
  getEmergencyContacts(userId: string): Promise<EmergencyContact[]>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact | undefined>;
  deleteEmergencyContact(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private healthGoals: Map<string, HealthGoal> = new Map();
  private medications: Map<string, Medication> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private healthAssessments: Map<string, HealthAssessment> = new Map();
  private emergencyContacts: Map<string, EmergencyContact> = new Map();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      persona: insertUser.persona || "general", 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Health Goals
  async getHealthGoals(userId: string): Promise<HealthGoal[]> {
    return Array.from(this.healthGoals.values()).filter(goal => goal.userId === userId);
  }

  async createHealthGoal(insertGoal: InsertHealthGoal): Promise<HealthGoal> {
    const id = randomUUID();
    const goal: HealthGoal = {
      ...insertGoal,
      description: insertGoal.description || null,
      targetValue: insertGoal.targetValue || null,
      currentValue: insertGoal.currentValue || 0,
      unit: insertGoal.unit || null,
      completed: insertGoal.completed || false,
      id,
      createdAt: new Date()
    };
    this.healthGoals.set(id, goal);
    return goal;
  }

  async updateHealthGoal(id: string, updates: Partial<HealthGoal>): Promise<HealthGoal | undefined> {
    const goal = this.healthGoals.get(id);
    if (!goal) return undefined;
    
    const updated = { ...goal, ...updates };
    this.healthGoals.set(id, updated);
    return updated;
  }

  async deleteHealthGoal(id: string): Promise<boolean> {
    return this.healthGoals.delete(id);
  }

  // Medications
  async getMedications(userId: string): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(med => med.userId === userId && med.active);
  }

  async createMedication(insertMed: InsertMedication): Promise<Medication> {
    const id = randomUUID();
    const medication: Medication = {
      ...insertMed,
      times: insertMed.times || null,
      endDate: insertMed.endDate || null,
      active: insertMed.active ?? true,
      id,
      createdAt: new Date()
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updated = { ...medication, ...updates };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: string): Promise<boolean> {
    return this.medications.delete(id);
  }

  // Chat Messages
  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Health Assessments
  async getHealthAssessments(userId: string): Promise<HealthAssessment[]> {
    return Array.from(this.healthAssessments.values())
      .filter(assessment => assessment.userId === userId)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
  }

  async createHealthAssessment(insertAssessment: InsertHealthAssessment): Promise<HealthAssessment> {
    const id = randomUUID();
    const assessment: HealthAssessment = {
      ...insertAssessment,
      riskLevel: insertAssessment.riskLevel || null,
      recommendations: insertAssessment.recommendations || null,
      id,
      completedAt: new Date()
    };
    this.healthAssessments.set(id, assessment);
    return assessment;
  }

  // Emergency Contacts
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    return Array.from(this.emergencyContacts.values()).filter(contact => contact.userId === userId);
  }

  async createEmergencyContact(insertContact: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = randomUUID();
    const contact: EmergencyContact = {
      ...insertContact,
      isPrimary: insertContact.isPrimary || false,
      id,
      createdAt: new Date()
    };
    this.emergencyContacts.set(id, contact);
    return contact;
  }

  async updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact | undefined> {
    const contact = this.emergencyContacts.get(id);
    if (!contact) return undefined;
    
    const updated = { ...contact, ...updates };
    this.emergencyContacts.set(id, updated);
    return updated;
  }

  async deleteEmergencyContact(id: string): Promise<boolean> {
    return this.emergencyContacts.delete(id);
  }
}

export const storage = new MemStorage();
