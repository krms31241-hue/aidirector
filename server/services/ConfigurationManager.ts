import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: EnvConfig;

  private constructor() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error("❌ Invalid environment variables:", parsed.error.format());
      this.config = envSchema.parse({}); // Fallback
    } else {
      this.config = parsed.data;
    }
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  public isDev(): boolean {
    return this.config.NODE_ENV === "development";
  }

  public isProd(): boolean {
    return this.config.NODE_ENV === "production";
  }
}

export const configManager = ConfigurationManager.getInstance();
