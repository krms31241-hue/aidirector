import { AIProvider } from "../infrastructure/providers/base";
import { modelRouter } from "./ModelRouter";
import { logger } from "./LoggingEngine";

export class ConflictResolver {
  public async resolve(
    taskDescription: string,
    outputs: Record<string, string>
  ): Promise<{ resolvedOutput: string; reasoning: string }> {
    const keys = Object.keys(outputs);
    if (keys.length === 0) {
      throw new Error("No outputs to resolve.");
    }
    if (keys.length === 1) {
      return { resolvedOutput: outputs[keys[0]], reasoning: "Only one output provided." };
    }

    logger.info(`[ConflictResolver] Resolving conflicts between ${keys.join(", ")}`);

    const provider = modelRouter.route("reasoning");
    
    let prompt = `You are a Conflict Resolution Engine.
You have been provided with multiple solutions from different AI agents for the same task.
Compare them, identify the best solution (or merge them intelligently), and provide a final unified solution and your reasoning.

Task: ${taskDescription}

`;

    for (const [agentRole, output] of Object.entries(outputs)) {
      prompt += `--- Output from ${agentRole.toUpperCase()} ---\n${output}\n\n`;
    }

    prompt += `Provide your response in the following JSON format:
{
  "resolvedOutput": "The final best code/solution",
  "reasoning": "Why this was chosen or how it was merged"
}`;

    const resolutionResult = await provider.generateText(prompt);
    
    try {
      // Very basic extraction, expecting a JSON block
      const jsonMatch = resolutionResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         const parsed = JSON.parse(jsonMatch[0]);
         return { resolvedOutput: parsed.resolvedOutput, reasoning: parsed.reasoning };
      }
    } catch (e) {
      logger.warn(`[ConflictResolver] Failed to parse JSON, returning raw text.`);
    }

    return { resolvedOutput: resolutionResult, reasoning: "Fallback resolution." };
  }
}

export const conflictResolver = new ConflictResolver();
