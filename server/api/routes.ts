import { Router } from "express";
import { db } from "../infrastructure/db/index";
import crypto from "node:crypto";
import { logger } from "../services/LoggingEngine";
import { createProjectSchema, createConversationSchema, createMessageSchema } from "./validators";
import { orchestrator } from "../services/ai/orchestrator";
import { providerManager } from "../infrastructure/providers/manager";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "AI Director API is running" });
});

// Projects
router.get("/projects", (req, res) => {
  const projects = db
    .prepare("SELECT * FROM projects ORDER BY updated_at DESC")
    .all();
  res.json(projects);
});

router.post("/projects", (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description } = parsed.data;
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO projects (id, name, description) VALUES (?, ?, ?)",
  ).run(id, name, description || "");
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  res.status(201).json(project);
});

// Conversations
router.get("/projects/:projectId/conversations", (req, res) => {
  const conversations = db
    .prepare(
      "SELECT * FROM conversations WHERE project_id = ? ORDER BY updated_at DESC",
    )
    .all(req.params.projectId);
  res.json(conversations);
});

router.post("/projects/:projectId/conversations", (req, res) => {
  const parsed = createConversationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { title } = parsed.data;
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO conversations (id, project_id, title) VALUES (?, ?, ?)",
  ).run(id, req.params.projectId, title || "New Conversation");
  const conv = db.prepare("SELECT * FROM conversations WHERE id = ?").get(id);
  res.status(201).json(conv);
});

// Messages
router.get("/conversations/:conversationId/messages", (req, res) => {
  const messages = db
    .prepare(
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
    )
    .all(req.params.conversationId);
  res.json(messages);
});

// Files
router.get("/projects/:projectId/files", (req, res) => {
  const files = db
    .prepare(
      "SELECT id, project_id, path, language, created_at, updated_at FROM files WHERE project_id = ? ORDER BY path ASC",
    )
    .all(req.params.projectId);
  res.json(files);
});

router.get("/projects/:projectId/files/:fileId", (req, res) => {
  const file = db
    .prepare("SELECT * FROM files WHERE id = ? AND project_id = ?")
    .get(req.params.fileId, req.params.projectId);
  if (!file) return res.status(404).json({ error: "File not found" });
  res.json(file);
});

router.post("/projects/:projectId/files", (req, res) => {
  const { path, content, language } = req.body;
  const id = crypto.randomUUID();
  try {
    db.prepare(
      "INSERT INTO files (id, project_id, path, content, language) VALUES (?, ?, ?, ?, ?)",
    ).run(id, req.params.projectId, path, content || "", language || "text");
    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id);
    res.status(201).json(file);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/projects/:projectId/files/:fileId", (req, res) => {
  const { content } = req.body;
  try {
    db.prepare(
      "UPDATE files SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?",
    ).run(content, req.params.fileId, req.params.projectId);
    const file = db
      .prepare("SELECT * FROM files WHERE id = ?")
      .get(req.params.fileId);
    res.json(file);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/conversations/:conversationId/messages", async (req, res) => {
  const parsed = createMessageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { content, provider, role } = parsed.data;
  const conversationId = req.params.conversationId;

  // Save user message
  const userMsgId = crypto.randomUUID();
  db.prepare(
    "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)",
  ).run(userMsgId, conversationId, role || "user", content);

  try {
    const conversation = db.prepare("SELECT project_id FROM conversations WHERE id = ?").get(conversationId) as any;
    const projectId = conversation?.project_id;
    // Call orchestrator
    const selectedProvider = provider || "gemini";
    const result = await orchestrator.executeTask(content, selectedProvider, projectId);

    const assistantMsgId = crypto.randomUUID();
    db.prepare(
      "INSERT INTO messages (id, conversation_id, role, content, provider) VALUES (?, ?, ?, ?, ?)",
    ).run(
      assistantMsgId,
      conversationId,
      "assistant",
      result.result,
      result.provider,
    );

    res.status(201).json({
      userMessageId: userMsgId,
      assistantMessageId: assistantMsgId,
      result: result.result,
      provider: result.provider,
    });
  } catch (error: any) {
    logger.error("Error handling message:", error?.message || error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/providers", (req, res) => {
  const providers = providerManager.getAllProviders().map(p => ({
    id: p.id,
    name: p.name,
    stats: p.stats,
    capabilities: p.capabilities
  }));
  res.json(providers);
});

export default router;
