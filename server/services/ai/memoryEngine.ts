import { db } from "../../infrastructure/db";

export interface MemoryItem {
  id: string;
  projectId: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export class MemoryEngine {
  async storeMemory(projectId: string, key: string, value: string) {
    const id = `${projectId}_${key}`;
    const stmt = db.prepare(`
      INSERT INTO memory (id, project_id, key, value) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(project_id, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(id, projectId, key, value);
  }

  getMemory(projectId: string, key: string): string | null {
    const row = db.prepare("SELECT value FROM memory WHERE project_id = ? AND key = ?").get(projectId, key) as any;
    return row ? row.value : null;
  }

  getAllMemory(projectId: string): Record<string, string> {
    const rows = db.prepare("SELECT key, value FROM memory WHERE project_id = ?").all(projectId) as any[];
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
  }

  searchMemory(projectId: string, query: string): Record<string, string> {
    const rows = db.prepare("SELECT key, value FROM memory WHERE project_id = ? AND (key LIKE ? OR value LIKE ?)").all(projectId, `%${query}%`, `%${query}%`) as any[];
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async extractAndStorePreferences(projectId: string, analysis: string) {
    // Simple mock extractor that might find "preferences" in an analysis
    // In reality this would use an LLM
    if (analysis.includes("react")) {
      this.storeMemory(projectId, "framework", "React");
    }
    if (analysis.includes("tailwind")) {
      this.storeMemory(projectId, "styling", "Tailwind");
    }
  }
}

export const memoryEngine = new MemoryEngine();
