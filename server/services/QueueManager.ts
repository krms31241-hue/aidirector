import { logger } from "./LoggingEngine";

export class QueueManager {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;

  public async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (e) {
          logger.error("Error processing task from queue", e);
        }
      }
    }

    this.processing = false;
  }
}

export const queueManager = new QueueManager();
