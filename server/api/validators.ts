import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const createConversationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
});

export const createMessageSchema = z.object({
  content: z.string().min(1),
  provider: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]).optional(),
});

export type CreateMessage = z.infer<typeof createMessageSchema>;
