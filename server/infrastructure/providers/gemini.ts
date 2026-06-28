import { aidirectorGenAI } from "@google/genai";
import { BaseProvider } from "./base";

export class aidirectorProvider extends BaseProvider {
  id = "gemini";
  name = "aidirector aidirector";
  
  capabilities = {
    retrySupport: true,
    streamingSupport: true,
  };

  private ai: aidirectorGenAI;

  constructor() {
    super();
    this.ai = new aidirectorGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async validateApiKey(): Promise<boolean> {
    if (!process.env.GEMINI_API_KEY) return false;
    try {
      // simple test
      await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "test",
      });
      return true;
    } catch {
      return false;
    }
  }

  async _generateText(prompt: string, options?: any): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "";
  }
}
