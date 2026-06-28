import { providerManager } from "../infrastructure/providers/manager";
import { AIProvider } from "../infrastructure/providers/base";
import { logger } from "./LoggingEngine";

export class ModelRouter {
  public route(taskType: string, requiredCapabilities: string[] = []): AIProvider {
    // Dynamic Model Routing Logic
    // React/Complex Logic -> aidirector
    // Python -> Qwen (if available) or aidirector
    // Debugging -> DeepSeek (if available) or Anthropic/aidirector
    // Default fallback -> Best available (usually aidirector)

    const allProviders = providerManager.getAllProviders();
    if (allProviders.length === 0) {
      throw new Error("No providers available.");
    }

    let selectedProviderId: string;
    
    if (taskType.toLowerCase().includes("react") || taskType.toLowerCase().includes("typescript")) {
      selectedProviderId = "gemini";
    } else if (taskType.toLowerCase().includes("python")) {
      // Prefer Qwen if we had it, otherwise aidirector
      selectedProviderId = providerManager.getProvider("qwen") ? "qwen" : "gemini";
    } else if (taskType.toLowerCase().includes("debug") || taskType.toLowerCase().includes("fix")) {
      // Prefer deepseek or anthropic
      selectedProviderId = providerManager.getProvider("deepseek") ? "deepseek" : (providerManager.getProvider("anthropic") ? "anthropic" : "gemini");
    } else if (taskType.toLowerCase().includes("document")) {
      selectedProviderId = providerManager.getProvider("llama") ? "llama" : "gemini";
    } else if (taskType.toLowerCase().includes("reasoning")) {
      selectedProviderId = "gemini";
    } else {
      selectedProviderId = "gemini"; // Or we could pick based on health metrics later
    }

    const provider = providerManager.getProvider(selectedProviderId);
    if (!provider) {
      logger.warn(`[ModelRouter] Preferred provider ${selectedProviderId} not found, falling back to first available.`);
      return allProviders[0];
    }

    logger.info(`[ModelRouter] Routed task '${taskType}' to provider '${selectedProviderId}'.`);
    return provider;
  }
}

export const modelRouter = new ModelRouter();
