import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatResponse {
  message: string;
  confidence: number;
}

export async function generateHealthResponse(
  userMessage: string, 
  persona: string,
  chatHistory: Array<{ role: string; content: string }> = []
): Promise<ChatResponse> {
  try {
    const systemInstructions = getPersonaInstructions(persona);
    
    // Build conversation context
    const conversationContext = chatHistory
      .slice(-5) // Keep last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${systemInstructions}

Previous conversation:
${conversationContext}

Current user message: ${userMessage}

Please respond in character for the ${persona} persona, providing helpful healthcare guidance while being empathetic and appropriate for the user type.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const responseText = response.text || "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team.";

    return {
      message: responseText,
      confidence: 0.8
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      message: "I'm experiencing some technical difficulties. Please try again in a moment, or if this is urgent, please call our emergency number 108.",
      confidence: 0.1
    };
  }
}

function getPersonaInstructions(persona: string): string {
  const baseInstructions = `You are InteliMed, an AI healthcare assistant. You provide helpful, accurate health information but always remind users to consult healthcare professionals for medical decisions. You cannot diagnose or prescribe medications.`;

  switch (persona) {
    case 'senior':
      return `${baseInstructions}

You are speaking with a senior citizen. Use:
- Simple, clear language
- Larger conceptual explanations
- Patient, respectful tone
- References to traditional healthcare practices when appropriate
- Emphasis on medication management and regular check-ups
- Acknowledgment of their life experience and wisdom`;

    case 'child':
      return `${baseInstructions}

You are speaking with a child or their parent about pediatric health. Use:
- Simple, age-appropriate language
- Encouraging and positive tone
- Fun analogies and comparisons
- Focus on prevention and healthy habits
- Reassuring language to reduce anxiety
- Involve parents/guardians in health decisions`;

    case 'anxious':
      return `${baseInstructions}

You are speaking with someone who may have health anxiety. Use:
- Calm, reassuring tone
- Avoid alarming language
- Provide clear, factual information
- Acknowledge their concerns as valid
- Suggest breathing exercises or relaxation techniques when appropriate
- Emphasize when symptoms are common and manageable`;

    case 'caregiver':
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

export async function analyzeHealthRisk(responses: Record<string, any>): Promise<{
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  explanation: string;
}> {
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
      contents: prompt,
    });

    const result = JSON.parse(response.text || '{}');
    return {
      riskLevel: result.riskLevel || 'low',
      recommendations: result.recommendations || ['Maintain a healthy lifestyle', 'Regular check-ups with your doctor'],
      explanation: result.explanation || 'Assessment completed successfully'
    };
  } catch (error) {
    console.error('Risk analysis error:', error);
    return {
      riskLevel: 'low',
      recommendations: ['Consult with a healthcare professional', 'Maintain regular health check-ups'],
      explanation: 'Unable to complete detailed analysis. Please consult with a healthcare provider.'
    };
  }
}
