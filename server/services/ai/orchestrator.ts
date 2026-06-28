import { providerManager } from "../../infrastructure/providers/manager";
import { AIProvider } from "../../infrastructure/providers/base";
import { aiEngine } from "../AIEngine";
import { queueManager } from "../QueueManager";
import { cacheEngine } from "../CacheEngine";
import { logger } from "../LoggingEngine";

export class AIOrchestrator {
  getProvider(name: string): AIProvider {
    return providerManager.getProvider(name.toLowerCase()) || providerManager.getProvider("mock")!;
  }

  getAvailableProviders(): string[] {
    return providerManager.getAllProviders().map(p => p.id);
  }

  async executeTask(task: string, preferredProvider: string = "gemini", projectId?: string, workflowId: string = "default-orchestration") {
    const cacheKey = `task_${task}_${preferredProvider}_${workflowId}_${projectId}`;
    const cached = cacheEngine.get(cacheKey);
    if (cached) {
      logger.info(`[Orchestrator] Using cached result for task`);
      return cached;
    }

    // Process via queue
    const result = await queueManager.enqueue(async () => {
      return await aiEngine.executeTask(task, projectId);
    });

    // Cache the result for 5 minutes
    cacheEngine.set(cacheKey, result, 5 * 60 * 1000);
    return result;
  }
}

export const orchestrator = new AIOrchestrator();

