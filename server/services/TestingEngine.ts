import { logger } from "./LoggingEngine";
import { sandbox } from "./ai/sandbox";
import { modelRouter } from "./ModelRouter";
import { db } from "../infrastructure/db";

export class TestingEngine {
  public async generateAndRunTests(projectId: string, targetPath: string): Promise<string> {
    logger.info(`[TestingEngine] Generating tests for ${targetPath} in project ${projectId}`);
    
    const fileRow = db.prepare("SELECT content FROM files WHERE project_id = ? AND path = ?").get(projectId, targetPath) as any;
    if (!fileRow) throw new Error("File not found for testing.");

    const provider = modelRouter.route("testing");
    const prompt = `Write a comprehensive unit test suite using Vitest/Jest for the following code. Return ONLY the test code.\n\nCode:\n${fileRow.content}`;
    
    let testCode = await provider.generateText(prompt);
    // Strip markdown formatting if any
    testCode = testCode.replace(/```(?:typescript|javascript|ts|js)?\s*?\n/g, "").replace(/```/g, "");

    logger.info(`[TestingEngine] Running tests in sandbox...`);
    const sandboxResult = await sandbox.runNodeCode(testCode);

    const output = sandboxResult.success 
      ? `Tests Passed:\n${sandboxResult.output}` 
      : `Tests Failed:\n${sandboxResult.errors}\n\nOutput:\n${sandboxResult.output}`;

    return output;
  }
}

export const testingEngine = new TestingEngine();
