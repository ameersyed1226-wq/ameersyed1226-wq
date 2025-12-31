
import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  
  constructor() {
    // Initialize with the key from environment, or empty string to prevent crash on load
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  private handleError(error: any): never {
    console.error('Gemini API Error:', error);
    const errStr = JSON.stringify(error);
    const errMsg = error.message || '';

    // Handle Missing/Invalid Key
    if (!process.env['API_KEY'] || errStr.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
       throw new Error('⚠️ API Key is missing or invalid. Please configure the API_KEY environment variable.');
    }

    // Handle Quota Exceeded (429)
    if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota')) {
       throw new Error('⚠️ Quota exceeded. Please wait a minute and try again.');
    }
    
    // Generic Error
    throw new Error('An error occurred while connecting to AI. Please try again.');
  }

  // --- Chat ---
  createChat(systemInstruction?: string): Chat {
    try {
      return this.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction || 'You are Nexus, a helpful and intelligent AI assistant.',
        }
      });
    } catch (e) {
       // If chat creation fails immediately (e.g. bad key), handle it
       this.handleError(e);
       throw e; 
    }
  }

  // --- Text Generation (Writer, Code, Web) ---
  async generateText(prompt: string, systemInstruction: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        },
      });
      return response.text || 'No response generated.';
    } catch (error) {
      this.handleError(error);
    }
  }

  // --- Image Generation ---
  async generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
      });

      const base64 = response.generatedImages?.[0]?.image?.imageBytes;
      if (!base64) throw new Error('No image generated');
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      this.handleError(error);
    }
  }

  // --- Video Generation ---
  async generateVideo(prompt: string): Promise<string> {
    try {
      let operation = await this.ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: {
          numberOfVideos: 1
        }
      });

      // Polling loop
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        operation = await this.ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error('Video generation failed or no URI returned.');

      // Fetch the video content using the API key
      const videoRes = await fetch(`${downloadLink}&key=${process.env['API_KEY']}`);
      const blob = await videoRes.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      this.handleError(error);
    }
  }
}
