export interface PromptVersion {
  version: string;
  template: string;
  updatedAt: string;
}

export interface PromptDefinition {
  id: string;
  role: string;
  description: string;
  versions: PromptVersion[];
  currentVersion: string;
}

class PromptLibrary {
  private prompts: Map<string, PromptDefinition> = new Map();

  constructor() {
    this.registerDefaultPrompts();
  }

  private registerDefaultPrompts() {
    this.addPrompt({
      id: "analyzer",
      role: "Task Analyzer",
      description: "Analyzes the user request to extract core intent, priority, language, framework, and target components.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Analyze the following user request and extract the core intent, priority, language, framework, and target components. Return as structured JSON.\nRequest: {{request}}",
          updatedAt: new Date().toISOString()
        }
      ]
    });

    this.addPrompt({
      id: "planner",
      role: "Planner",
      description: "Creates an implementation plan based on the analysis.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Based on this analysis:\n{{analysis}}\n\nCreate a step-by-step implementation plan for the task: {{request}}",
          updatedAt: new Date().toISOString()
        }
      ]
    });

    this.addPrompt({
      id: "architect",
      role: "Architect",
      description: "Designs the architecture based on the plan.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Based on this plan:\n{{plan}}\n\nOutline the specific files, design patterns, and architecture required.",
          updatedAt: new Date().toISOString()
        }
      ]
    });

    this.addPrompt({
      id: "generator",
      role: "Generator",
      description: "Generates the code based on plan and architecture.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Task: {{request}}\nPlan: {{plan}}\nArchitecture: {{architecture}}\n\nGenerate the complete code/solution. Return ONLY the code/solution.",
          updatedAt: new Date().toISOString()
        }
      ]
    });

    this.addPrompt({
      id: "reviewer",
      role: "Reviewer",
      description: "Reviews code for best practices.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Review the following code for syntax, logic, and standard best practices. \nCode:\n{{code}}\n\nIf it's perfect, reply exactly \"APPROVED\". Otherwise, list the issues.",
          updatedAt: new Date().toISOString()
        }
      ]
    });

    this.addPrompt({
      id: "debugger",
      role: "Debugger",
      description: "Analyzes code for bugs and exceptions.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Analyze this code for potential runtime exceptions or bugs.\nCode:\n{{code}}\n\nIf none, reply exactly \"APPROVED\". Otherwise, list the bugs.",
          updatedAt: new Date().toISOString()
        }
      ]
    });

    this.addPrompt({
      id: "security",
      role: "Security Expert",
      description: "Performs security review.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Perform a security review on this code (XSS, Injection, auth bypass, etc.).\nCode:\n{{code}}\n\nIf secure, reply exactly \"APPROVED\". Otherwise, list vulnerabilities.",
          updatedAt: new Date().toISOString()
        }
      ]
    });

    this.addPrompt({
      id: "performance",
      role: "Performance Expert",
      description: "Analyzes code for performance bottlenecks.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Analyze this code for performance bottlenecks (memory leaks, Big-O, N+1 queries).\nCode:\n{{code}}\n\nIf optimal, reply exactly \"APPROVED\". Otherwise, suggest optimizations.",
          updatedAt: new Date().toISOString()
        }
      ]
    });

    this.addPrompt({
      id: "fixer",
      role: "Fixer",
      description: "Fixes code based on review reports.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Current Code:\n{{code}}\n\nReview Issues: {{review}}\nBugs: {{debug}}\nSecurity Issues: {{security}}\nPerformance Issues: {{performance}}\n\nProvide the fixed complete code. Return ONLY the code.",
          updatedAt: new Date().toISOString()
        }
      ]
    });

    this.addPrompt({
      id: "documentation",
      role: "Documentation Writer",
      description: "Generates documentation for the completed task.",
      currentVersion: "1.0",
      versions: [
        {
          version: "1.0",
          template: "Generate a README/Documentation summary for this completed task:\n{{request}}\n\nFinal Solution:\n{{code}}",
          updatedAt: new Date().toISOString()
        }
      ]
    });
  }

  addPrompt(prompt: PromptDefinition) {
    this.prompts.set(prompt.id, prompt);
  }

  getPromptTemplate(id: string, version?: string): string {
    const prompt = this.prompts.get(id);
    if (!prompt) throw new Error(`Prompt ${id} not found`);

    const targetVersion = version || prompt.currentVersion;
    const promptVersion = prompt.versions.find(v => v.version === targetVersion);
    
    if (!promptVersion) throw new Error(`Version ${targetVersion} for prompt ${id} not found`);
    return promptVersion.template;
  }

  buildPrompt(id: string, variables: Record<string, string>, version?: string): string {
    let template = this.getPromptTemplate(id, version);
    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return template;
  }
}

export const promptLibrary = new PromptLibrary();
