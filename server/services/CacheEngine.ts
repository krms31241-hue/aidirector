export class CacheEngine {
  private cache = new Map<string, { value: any; expiry: number }>();

  public set(key: string, value: any, ttlMs: number = 300000) {
    this.cache.set(key, { value, expiry: Date.now() + ttlMs });
  }

  public get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  public clear() {
    this.cache.clear();
  }
}

export const cacheEngine = new CacheEngine();
