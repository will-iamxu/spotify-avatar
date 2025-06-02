import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogGroupCommand, CreateLogStreamCommand, DescribeLogGroupsCommand } from '@aws-sdk/client-cloudwatch-logs';

interface LogEvent {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  endpoint?: string;
}

class CloudWatchLogger {
  private client: CloudWatchLogsClient;
  private logGroupName: string;
  private logStreamName: string;
  private sequenceToken?: string;
  private logBuffer: LogEvent[] = [];
  private flushTimeout?: NodeJS.Timeout;

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

export function getLogger(): CloudWatchLogger {
  if (!logger) {
    logger = new CloudWatchLogger();
    logger.init().catch(console.error);
  }
  return logger;
}

export default getLogger;