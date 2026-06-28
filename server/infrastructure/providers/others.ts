import { BaseProvider } from "./base";

export class MockProvider extends BaseProvider {
  id = "mock";
  name = "Mock Provider";
  
  capabilities = {
    retrySupport: false,
    streamingSupport: false,
  };

  async validateApiKey(): Promise<boolean> {
    return true;
  }

  async _generateText(prompt: string, options?: any): Promise<string> {
    return `[Mock Response]: ${prompt.substring(0, 50)}...`;
  }
}

export class DeepSeekProvider extends MockProvider {
  id = "deepseek";
  name = "DeepSeek";
}

export class GroqProvider extends MockProvider {
  id = "groq";
  name = "Groq";
}

export class OllamaProvider extends MockProvider {
  id = "ollama";
  name = "Ollama";
}

export class HuggingFaceProvider extends MockProvider {
  id = "huggingface";
  name = "Hugging Face";
}

export class OpenRouterProvider extends MockProvider {
  id = "openrouter";
  name = "OpenRouter";
}
