import { AIProvider } from "./base";
import { aidirectorProvider } from "./gemini";
import {
  MockProvider,
  DeepSeekProvider,
  GroqProvider,
  OllamaProvider,
  HuggingFaceProvider,
  OpenRouterProvider
} from "./others";

export class ProviderManager {
  private providers: Map<string, AIProvider> = new Map();
  private activeProviderId: string | null = null;

  constructor() {
    this.registerProvider(new aidirectorProvider());
    this.registerProvider(new DeepSeekProvider());
    this.registerProvider(new GroqProvider());
    this.registerProvider(new OllamaProvider());
    this.registerProvider(new HuggingFaceProvider());
    this.registerProvider(new OpenRouterProvider());
    this.registerProvider(new MockProvider());
    
    // Set default
    this.activeProviderId = "gemini";
  }

  registerProvider(provider: AIProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  setActiveProvider(id: string) {
    if (!this.providers.has(id)) {
      throw new Error(`Provider ${id} not found`);
    }
    this.activeProviderId = id;
  }

  getActiveProvider(): AIProvider {
    if (!this.activeProviderId || !this.providers.has(this.activeProviderId)) {
      throw new Error("No active provider set");
    }
    return this.providers.get(this.activeProviderId)!;
  }
}

export const providerManager = new ProviderManager();
