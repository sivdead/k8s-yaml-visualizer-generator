import { GoogleGenAI, Type, Schema } from "@google/genai";
import { K8sResource, AiResponse } from '../types';

const apiKey = process.env.API_KEY || '';

// Define the schema for the AI response to ensure structured JSON
const k8sResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    explanation: {
      type: Type.STRING,
      description: "A short explanation of what was generated."
    },
    resource: {
      type: Type.OBJECT,
      description: "The Kubernetes resource object.",
      properties: {
        apiVersion: { type: Type.STRING },
        kind: { type: Type.STRING },
        metadata: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            namespace: { type: Type.STRING },
            labels: { type: Type.OBJECT, additionalProperties: true }
          },
          required: ["name", "namespace"]
        },
        spec: { 
          type: Type.OBJECT,
          description: "Spec object, structure varies by kind. Return a generic object here that matches standard K8s schema.",
          additionalProperties: true
        },
        data: {
            type: Type.OBJECT,
            description: "Data object for ConfigMaps/Secrets",
            additionalProperties: true
        }
      },
      required: ["apiVersion", "kind", "metadata"]
    }
  },
  required: ["explanation", "resource"]
};

export const generateK8sResource = async (prompt: string, currentResourceType: string): Promise<AiResponse | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const fullPrompt = `
      You are a Senior Kubernetes Engineer. 
      Generate a VALID Kubernetes JSON object based on this request: "${prompt}".
      
      Focus on the resource type: ${currentResourceType}.
      If the user prompt is vague, use best practices defaults.
      Ensure image tags are specific if not provided (avoid 'latest').
      
      Return ONLY the JSON matching the schema provided.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: k8sResponseSchema,
        temperature: 0.2, // Low temperature for deterministic code generation
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as AiResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
