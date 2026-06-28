import { logger } from "./LoggingEngine";
import { providerManager } from "../infrastructure/providers/manager";

export interface AgentTask {
  id: string;
  name: string;
  agentRole: string; // e.g., 'analyzer', 'planner', 'reviewer', 'security', 'performance'
  dependencies: string[];
  run: (context: Record<string, any>) => Promise<any>;
}

export class AgentScheduler {
  public async execute(tasks: AgentTask[], initialContext: Record<string, any> = {}): Promise<Record<string, any>> {
    const context = { ...initialContext };
    const pendingTasks = new Map<string, AgentTask>();
    const completedTasks = new Set<string>();
    const runningTasks = new Set<string>();
    const taskPromises = new Map<string, Promise<void>>();

    tasks.forEach(t => pendingTasks.set(t.id, t));

    logger.info(`[AgentScheduler] Starting execution of ${tasks.length} tasks.`);

    while (completedTasks.size < tasks.length) {
      const runnableTasks = Array.from(pendingTasks.values()).filter(t => {
        return !runningTasks.has(t.id) && t.dependencies.every(dep => completedTasks.has(dep));
      });

      if (runnableTasks.length === 0 && runningTasks.size === 0) {
        throw new Error("[AgentScheduler] Deadlock detected. Circular dependency or unfulfilled dependencies.");
      }

      for (const task of runnableTasks) {
        runningTasks.add(task.id);
        
        logger.info(`[AgentScheduler] Starting task: ${task.name} (${task.id})`);
        
        const promise = (async () => {
          let attempts = 0;
          const maxAttempts = 3;
          let success = false;
          
          while (attempts < maxAttempts && !success) {
            try {
              // Streaming/Real-time progress hook could go here
              const result = await task.run(context);
              context[task.id] = result; // Store output in context mapped by task id
              
              logger.info(`[AgentScheduler] Completed task: ${task.name} (${task.id})`);
              success = true;
            } catch (e: any) {
              attempts++;
              logger.error(`[AgentScheduler] Task ${task.id} failed (attempt ${attempts}/${maxAttempts}):`, e);
              if (attempts >= maxAttempts) {
                throw e;
              }
              await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
            }
          }
        })().finally(() => {
          completedTasks.add(task.id);
          runningTasks.delete(task.id);
          pendingTasks.delete(task.id);
        });

        taskPromises.set(task.id, promise);
      }

      // Wait for at least one task to finish before looking for new runnable tasks
      if (runningTasks.size > 0) {
        const promisesToWait = Array.from(runningTasks).map(id => taskPromises.get(id)!);
        await Promise.race(promisesToWait);
      }
    }

    logger.info(`[AgentScheduler] All tasks completed successfully.`);
    return context;
  }
}

export const agentScheduler = new AgentScheduler();
