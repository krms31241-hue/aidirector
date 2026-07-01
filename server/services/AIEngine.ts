import { logger } from "./LoggingEngine";
import { agentScheduler, AgentTask } from "./AgentScheduler";
import { modelRouter } from "./ModelRouter";
import { conflictResolver } from "./ConflictResolver";
import { promptLibrary } from "./ai/promptLibrary";
import { db } from "../infrastructure/db";
import crypto from "node:crypto";

export class AIEngine {
  public async executeTask(taskDescription: string, projectId?: string) {
    logger.info(`[AIEngine] Processing task: ${taskDescription.substring(0, 50)}...`);

    // Define the DAG of tasks
    const tasks: AgentTask[] = [
      {
        id: "analyze",
        name: "Analyze Request",
        agentRole: "analyzer",
        dependencies: [],
        run: async (context) => {
          const provider = modelRouter.route("analyze");
          const prompt = promptLibrary.buildPrompt("analyzer", { request: taskDescription });
          return await provider.generateText(prompt);
        }
      },
      {
        id: "plan",
        name: "Create Execution Plan",
        agentRole: "planner",
        dependencies: ["analyze"],
        run: async (context) => {
          const provider = modelRouter.route("plan");
          const prompt = promptLibrary.buildPrompt("planner", { request: taskDescription, analysis: context.analyze });
          return await provider.generateText(prompt);
        }
      },
      {
        id: "architect",
        name: "Design Architecture",
        agentRole: "architect",
        dependencies: ["plan"],
        run: async (context) => {
          const provider = modelRouter.route("architect");
          const prompt = promptLibrary.buildPrompt("architect", { request: taskDescription, plan: context.plan });
          return await provider.generateText(prompt);
        }
      },
      {
        id: "generate",
        name: "Code Generation",
        agentRole: "generator",
        dependencies: ["architect"],
        run: async (context) => {
          const provider = modelRouter.route("generate");
          const prompt = promptLibrary.buildPrompt("generator", { request: taskDescription, architecture: context.architect });
          return await provider.generateText(prompt);
        }
      },
      // PARALLEL EXECUTION starts here: Security, Performance, and basic Review can run parallel
      {
        id: "review_security",
        name: "Security Review",
        agentRole: "security",
        dependencies: ["generate"],
        run: async (context) => {
          const provider = modelRouter.route("security");
          const prompt = `Review the following code for security vulnerabilities. Provide only fixes and reasoning.\nCode:\n${context.generate}`;
          return await provider.generateText(prompt);
        }
      },
      {
        id: "review_performance",
        name: "Performance Review",
        agentRole: "performance",
        dependencies: ["generate"],
        run: async (context) => {
          const provider = modelRouter.route("performance");
          const prompt = `Review the following code for performance bottlenecks. Provide only fixes and reasoning.\nCode:\n${context.generate}`;
          return await provider.generateText(prompt);
        }
      },
      {
        id: "review_general",
        name: "General Code Review",
        agentRole: "reviewer",
        dependencies: ["generate"],
        run: async (context) => {
          const provider = modelRouter.route("review");
          const prompt = promptLibrary.buildPrompt("reviewer", { code: context.generate });
          return await provider.generateText(prompt);
        }
      },
      // CONFLICT RESOLUTION & MERGE
      {
        id: "merge_reviews",
        name: "Merge and Resolve Reviews",
        agentRole: "resolver",
        dependencies: ["review_security", "review_performance", "review_general"],
        run: async (context) => {
          const outputs = {
            security: context.review_security,
            performance: context.review_performance,
            general: context.review_general,
            originalCode: context.generate
          };
          const resolution = await conflictResolver.resolve(taskDescription, outputs);
          return resolution.resolvedOutput;
        }
      },
      {
        id: "document",
        name: "Documentation",
        agentRole: "documenter",
        dependencies: ["merge_reviews"],
        run: async (context) => {
          const provider = modelRouter.route("document");
          const prompt = promptLibrary.buildPrompt("documentation", { code: context.merge_reviews });
          return await provider.generateText(prompt);
        }
      }
    ];

    // Execute the DAG
    const finalContext = await agentScheduler.execute(tasks);

    const finalCode = finalContext.merge_reviews;
    const finalDocs = finalContext.document;
    const finalOutput = `### Generated Solution\n${finalCode}\n\n### Documentation\n${finalDocs}`;

    if (projectId) {
      this.saveFilesToDb(projectId, finalCode);
    }

    return finalOutput;
  }

  private saveFilesToDb(projectId: string, code: string) {
    try {
      const fileRegex = /```(?:typescript|javascript|tsx|jsx|ts|js|json|html|css)?\s*?\n([\s\S]*?)```/g;
      let match;
      let fileIndex = 1;
      while ((match = fileRegex.exec(code)) !== null) {
        const content = match[1];
        const path = `/generated_${fileIndex}.ts`;
        const id = crypto.randomUUID();
        db.prepare(`
          INSERT INTO files (id, project_id, path, content, language)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(project_id, path) DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP
        `).run(id, projectId, path, content, "typescript");
        fileIndex++;
      }
    } catch (e) {
      logger.error(`[AIEngine] Failed to save files:`, e);
    }
  }
}

export const aiEngine = new AIEngine();
