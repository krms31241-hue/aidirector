export interface ProviderStats {
  status: "online" | "offline" | "degraded";
  latency: number;
  availability: number;
  requestCount: number;
  successRate: number;
  errorCount: number;
}

export interface ProviderCapabilities {
  retrySupport: boolean;
  streamingSupport: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  
  stats: ProviderStats;
  capabilities: ProviderCapabilities;
  
  validateApiKey(): Promise<boolean>;
  generateText(prompt: string, options?: any): Promise<string>;
  generateStream?(prompt: string, options?: any): AsyncGenerator<string>;
}

export abstract class BaseProvider implements AIProvider {
  abstract id: string;
  abstract name: string;
  abstract capabilities: ProviderCapabilities;

  stats: ProviderStats = {
    status: "online",
    latency: 0,
    availability: 100,
    requestCount: 0,
    successRate: 100,
    errorCount: 0,
  };

  protected recordRequest(success: boolean, durationMs: number) {
    this.stats.requestCount++;
    if (!success) {
      this.stats.errorCount++;
    }
    
    // Simple moving average for latency
    if (this.stats.requestCount === 1) {
      this.stats.latency = durationMs;
    } else {
      this.stats.latency = (this.stats.latency * 0.9) + (durationMs * 0.1);
    }
    
    this.stats.successRate = ((this.stats.requestCount - this.stats.errorCount) / this.stats.requestCount) * 100;
    
    if (this.stats.successRate < 90) {
      this.stats.status = "degraded";
    }
    if (this.stats.successRate < 50 && this.stats.requestCount > 5) {
      this.stats.status = "offline";
    }
  }

  abstract validateApiKey(): Promise<boolean>;
  abstract _generateText(prompt: string, options?: any): Promise<string>;

  async generateText(prompt: string, options?: any): Promise<string> {
    const startTime = Date.now();
    let attempt = 0;
    const maxRetries = 3;
    const baseDelay = 1000;

    while (attempt < maxRetries) {
      try {
        const result = await this._generateText(prompt, options);
        this.recordRequest(true, Date.now() - startTime);
        return result;
      } catch (error: any) {
        attempt++;
        this.recordRequest(false, Date.now() - startTime);
        
        // Check if it's a transient error (e.g. 503 or 429)
        const isTransient = error?.message?.includes("503") || error?.message?.includes("429") || error?.message?.includes("UNAVAILABLE");
        
        if (!isTransient || attempt >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`[${this.name}] Transient error. Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error("Max retries exceeded");
  }
}
