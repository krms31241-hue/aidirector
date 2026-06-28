import { db } from "../../infrastructure/db";

export interface KnowledgeItem {
  id: string;
  category: "standard" | "template" | "framework" | "best_practice" | "security";
  title: string;
  content: string;
  tags: string[];
}

export class KnowledgeBase {
  constructor() {
    this.initDatabase();
    this.seedDefaultKnowledge();
  }

  private initDatabase() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private seedDefaultKnowledge() {
    const existing = db.prepare("SELECT count(*) as count FROM knowledge").get() as any;
    if (existing.count === 0) {
      const stmt = db.prepare("INSERT INTO knowledge (id, category, title, content, tags) VALUES (?, ?, ?, ?, ?)");
      
      stmt.run(
        "kb_1", 
        "standard", 
        "Clean Architecture", 
        "Separate business logic from UI. Use dependency injection.",
        JSON.stringify(["architecture", "clean-code"])
      );

      stmt.run(
        "kb_2", 
        "security", 
        "React Security", 
        "Avoid dangerouslySetInnerHTML. Sanitize user inputs.",
        JSON.stringify(["react", "security"])
      );
    }
  }

  search(query: string): KnowledgeItem[] {
    const rows = db.prepare("SELECT * FROM knowledge WHERE content LIKE ? OR title LIKE ?").all(`%${query}%`, `%${query}%`) as any[];
    return rows.map(r => ({
      ...r,
      tags: JSON.parse(r.tags)
    }));
  }

  getAll(): KnowledgeItem[] {
    const rows = db.prepare("SELECT * FROM knowledge").all() as any[];
    return rows.map(r => ({
      ...r,
      tags: JSON.parse(r.tags)
    }));
  }
}

export const knowledgeBase = new KnowledgeBase();
