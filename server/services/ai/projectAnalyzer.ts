import { db } from "../../infrastructure/db";

export interface ProjectAnalysis {
  language: string;
  framework: string;
  dependencies: string[];
  database: string;
  entryPoints: string[];
  packageManager: string;
  testFramework: string;
  docker: boolean;
  structure: any;
}

export class ProjectAnalyzer {
  analyzeProject(projectId: string): ProjectAnalysis {
    const files = db.prepare("SELECT path, content FROM files WHERE project_id = ?").all(projectId) as any[];
    
    let language = "Unknown";
    let framework = "None";
    let dependencies: string[] = [];
    let packageManager = "npm";
    let database = "None";
    let testFramework = "None";
    let docker = false;
    const entryPoints: string[] = [];
    const structure: any = { files: [] };

    for (const file of files) {
      structure.files.push(file.path);
      
      if (file.path.endsWith("package.json")) {
        try {
          const pkg = JSON.parse(file.content);
          const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
          dependencies = Object.keys(allDeps);
          
          if (allDeps["react"]) framework = "React";
          if (allDeps["vue"]) framework = "Vue";
          if (allDeps["next"]) framework = "Next.js";
          
          if (allDeps["typescript"]) language = "TypeScript";
          else if (!language || language === "Unknown") language = "JavaScript";
          
          if (allDeps["jest"]) testFramework = "Jest";
          if (allDeps["vitest"]) testFramework = "Vitest";
          
          if (allDeps["pg"] || allDeps["mysql"] || allDeps["sqlite3"] || allDeps["better-sqlite3"]) {
            database = "SQL";
          } else if (allDeps["mongoose"] || allDeps["mongodb"]) {
            database = "MongoDB";
          }
        } catch(e) {
          // ignore parsing error
        }
      }
      
      if (file.path === "yarn.lock") packageManager = "yarn";
      if (file.path === "pnpm-lock.yaml") packageManager = "pnpm";
      
      if (file.path === "Dockerfile" || file.path === "docker-compose.yml") {
        docker = true;
      }
      
      if (file.path.includes("index.ts") || file.path.includes("main.ts") || file.path.includes("App.tsx")) {
        entryPoints.push(file.path);
      }
    }
    
    return {
      language,
      framework,
      dependencies,
      database,
      entryPoints,
      packageManager,
      testFramework,
      docker,
      structure
    };
  }
}

export const projectAnalyzer = new ProjectAnalyzer();
