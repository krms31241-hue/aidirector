import { configManager } from "./ConfigurationManager";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export class LoggingEngine {
  private static instance: LoggingEngine;

  private constructor() {}

  public static getInstance(): LoggingEngine {
    if (!LoggingEngine.instance) {
      LoggingEngine.instance = new LoggingEngine();
    }
    return LoggingEngine.instance;
  }

  private log(level: LogLevel, message: string, ...meta: any[]) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    if (level === LogLevel.DEBUG && configManager.isProd()) {
      return; // Skip debug logs in production
    }

    switch (level) {
      case LogLevel.INFO:
        console.info(formattedMessage, ...meta);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...meta);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, ...meta);
        break;
      case LogLevel.DEBUG:
      default:
        console.debug(formattedMessage, ...meta);
        break;
    }
  }

  public info(message: string, ...meta: any[]) {
    this.log(LogLevel.INFO, message, ...meta);
  }

  public warn(message: string, ...meta: any[]) {
    this.log(LogLevel.WARN, message, ...meta);
  }

  public error(message: string, ...meta: any[]) {
    this.log(LogLevel.ERROR, message, ...meta);
  }

  public debug(message: string, ...meta: any[]) {
    this.log(LogLevel.DEBUG, message, ...meta);
  }
}

export const logger = LoggingEngine.getInstance();
