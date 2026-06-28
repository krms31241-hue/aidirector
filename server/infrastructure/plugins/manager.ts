export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  hooks: Partial<PluginHooks>;
}

export interface PluginHooks {
  onTaskStart: (task: string) => Promise<void>;
  onAnalyze: (analysis: string) => Promise<string>;
  onGenerate: (code: string) => Promise<string>;
  onReview: (code: string, review: string) => Promise<string>;
  onTaskComplete: (result: string) => Promise<void>;
}

export class PluginManager {
  private plugins: Map<string, PluginManifest> = new Map();

  constructor() {
    this.registerInternalPlugins();
  }

  private registerInternalPlugins() {
    // Internal plugins can be registered here
    this.registerPlugin({
      id: "react-formatter",
      name: "React Formatter",
      version: "1.0",
      description: "Applies React standard formatting.",
      hooks: {
        onGenerate: async (code: string) => {
          // In a real scenario, this would format the code
          return code;
        }
      }
    });
  }

  registerPlugin(manifest: PluginManifest) {
    this.plugins.set(manifest.id, manifest);
  }

  getPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  async runHook<K extends keyof PluginHooks>(
    hookName: K, 
    ...args: Parameters<PluginHooks[K]>
  ): Promise<any> {
    let currentResult = args[0]; // Assume first arg is what gets transformed
    
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks[hookName]) {
        try {
          const fn = plugin.hooks[hookName] as any;
          if (hookName === "onAnalyze" || hookName === "onGenerate" || hookName === "onReview") {
            currentResult = await fn(currentResult, args[1]);
          } else {
            await fn(...args);
          }
        } catch (err) {
          console.error(`Error executing plugin ${plugin.id} hook ${hookName}:`, err);
        }
      }
    }
    
    return currentResult;
  }
}

export const pluginManager = new PluginManager();
