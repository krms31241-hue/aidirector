import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { logger } from "../LoggingEngine";

const execAsync = promisify(exec);

export interface SandboxResult {
  success: boolean;
  output: string;
  errors: string;
}

export class CodeSandbox {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), "temp_sandbox");
  }

  async init() {
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  async runNodeCode(code: string): Promise<SandboxResult> {
    await this.init();
    const fileName = `sandbox_${crypto.randomBytes(4).toString("hex")}.js`;
    const filePath = path.join(this.tempDir, fileName);

    try {
      await fs.writeFile(filePath, code);
      
      // We run in a restricted timeout and using a plain node process
      const { stdout, stderr } = await execAsync(`node ${filePath}`, { timeout: 5000 });
      return {
        success: true,
        output: stdout,
        errors: stderr
      };
    } catch (err: any) {
      return {
        success: false,
        output: err.stdout || "",
        errors: err.stderr || err.message || "Unknown error"
      };
    } finally {
      // Clean up
      try {
        await fs.unlink(filePath);
      } catch (e) {
        logger.error(`Failed to cleanup sandbox file ${filePath}`);
      }
    }
  }
}

export const sandbox = new CodeSandbox();
