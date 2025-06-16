/**
 * AWS CloudWatch Logs integration for production monitoring
 * 
 * This module provides a comprehensive logging solution that sends structured logs
 * to AWS CloudWatch in production while maintaining console logging for development.
 * Features buffering, automatic flushing, and error handling.
 * 
 * @module cloudwatch-logger
 */

import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogGroupCommand, CreateLogStreamCommand, DescribeLogGroupsCommand } from '@aws-sdk/client-cloudwatch-logs';

/**
 * Structure for log events with metadata
 * 
 * @interface LogEvent
 * @property {'INFO' | 'WARN' | 'ERROR' | 'DEBUG'} level - Log severity level
 * @property {string} message - Main log message
 * @property {Record<string, unknown>} [metadata] - Additional structured data
 * @property {string} [userId] - Associated user ID for context
 * @property {string} [endpoint] - API endpoint being logged
 */
interface LogEvent {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  endpoint?: string;
}

/**
 * CloudWatch logging service with buffering and automatic flushing
 * 
 * Handles log aggregation, CloudWatch integration, and fallback to console logging.
 * Automatically creates log groups and streams as needed.
 */
class CloudWatchLogger {
  /** AWS CloudWatch Logs client instance */
  private client: CloudWatchLogsClient;
  
  /** CloudWatch log group name */
  private logGroupName: string;
  
  /** CloudWatch log stream name (includes date for daily rotation) */
  private logStreamName: string;
  
  /** CloudWatch sequence token for log ordering */
  private sequenceToken?: string;
  
  /** Buffer for batching log events before sending to CloudWatch */
  private logBuffer: LogEvent[] = [];
  
  /** Timeout handle for scheduled log flushing */
  private flushTimeout?: NodeJS.Timeout;

  /**
   * Initialize CloudWatch logger with AWS credentials and configuration
   * 
   * Creates CloudWatch client and sets up log group/stream naming based on environment.
   * Log streams are date-based for automatic daily rotation.
   */
  constructor() {
    this.client = new CloudWatchLogsClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    
    this.logGroupName = process.env.CLOUDWATCH_LOG_GROUP || 'spotify-avatar-app';
    this.logStreamName = `${process.env.NODE_ENV || 'development'}-${new Date().toISOString().split('T')[0]}`;
  }

  /**
   * Initialize CloudWatch log group and stream
   * 
   * Creates log group and daily log stream if they don't exist.
   * Gracefully handles errors and continues without CloudWatch if setup fails.
   */
  async init(): Promise<void> {
    try {
      // Check if log group exists, create if not
      const describeCommand = new DescribeLogGroupsCommand({
        logGroupNamePrefix: this.logGroupName
      });
      
      const groups = await this.client.send(describeCommand);
      const groupExists = groups.logGroups?.some(group => group.logGroupName === this.logGroupName);

      if (!groupExists) {
        await this.client.send(new CreateLogGroupCommand({
          logGroupName: this.logGroupName
        }));
      }

      // Create log stream for today
      try {
        await this.client.send(new CreateLogStreamCommand({
          logGroupName: this.logGroupName,
          logStreamName: this.logStreamName
        }));
      } catch (error: unknown) {
        // Stream might already exist, which is fine
        if (error instanceof Error && !error.message?.includes('already exists')) {
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to initialize CloudWatch logger:', error);
      // Continue without CloudWatch logging
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      const logEvents = this.logBuffer.splice(0, 50).map(event => ({
        timestamp: Date.now(),
        message: JSON.stringify({
          level: event.level,
          message: event.message,
          metadata: event.metadata,
          userId: event.userId,
          endpoint: event.endpoint,
          timestamp: new Date().toISOString()
        })
      }));

      const command = new PutLogEventsCommand({
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents,
        sequenceToken: this.sequenceToken
      });

      const response = await this.client.send(command);
      this.sequenceToken = response.nextSequenceToken;

      // Schedule next flush if there are more logs
      if (this.logBuffer.length > 0) {
        this.scheduleFlush();
      }
    } catch (error) {
      console.error('Failed to send logs to CloudWatch:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...this.logBuffer);
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    
    this.flushTimeout = setTimeout(() => {
      this.flushLogs();
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Log an event with structured data
   * 
   * @param {LogEvent} event - Log event with level, message, and metadata
   */
  log(event: LogEvent): void {
    // Always log to console for development
    const consoleMessage = `[${event.level}] ${event.message}`;
    console.log(consoleMessage, event.metadata);

    // Only send to CloudWatch in production
    if (process.env.NODE_ENV === 'production') {
      this.logBuffer.push(event);
      
      // Flush immediately for errors, or if buffer is getting full
      if (event.level === 'ERROR' || this.logBuffer.length >= 10) {
        this.flushLogs();
      } else {
        this.scheduleFlush();
      }
    }
  }

  info(message: string, metadata?: Record<string, unknown>, userId?: string, endpoint?: string): void {
    this.log({ level: 'INFO', message, metadata, userId, endpoint });
  }

  warn(message: string, metadata?: Record<string, unknown>, userId?: string, endpoint?: string): void {
    this.log({ level: 'WARN', message, metadata, userId, endpoint });
  }

  error(message: string, metadata?: Record<string, unknown>, userId?: string, endpoint?: string): void {
    this.log({ level: 'ERROR', message, metadata, userId, endpoint });
  }

  debug(message: string, metadata?: Record<string, unknown>, userId?: string, endpoint?: string): void {
    this.log({ level: 'DEBUG', message, metadata, userId, endpoint });
  }
}

// Singleton instance
let logger: CloudWatchLogger | null = null;

/**
 * Get or create singleton CloudWatch logger instance
 * 
 * @returns {CloudWatchLogger} Initialized logger instance
 * 
 * @example
 * const logger = getLogger();
 * logger.info('User logged in', { userId: '123' });
 * logger.error('API error', { error: 'Database timeout' });
 */
export function getLogger(): CloudWatchLogger {
  if (!logger) {
    logger = new CloudWatchLogger();
    logger.init().catch(console.error);
  }
  return logger;
}

export default getLogger;