import { transports, format } from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

export const winstonLoggerOptions = {
  transports: [
    //console logs
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.ms(),
        format.colorize(),
        format.printf(({ level, message, timestamp, ms }) => {
          return `${timestamp} [${level}] ${message} (${ms})`;
        }),
      ),
    }),

    //for log files
    new DailyRotateFile({
      filename: 'logs/application.log',
      maxSize: '20mb',
      datePattern: '',
      zippedArchive: false,
      maxFiles: undefined,
      auditFile: 'logs/audit.json',
      format: format.combine(
        format.timestamp(),
        format.ms(),
        format.printf(({ level, message, timestamp, ms }) => {
          return `${timestamp} [${level}] ${message} (${ms})`;
        }),
      ),
    }),
  ],
};
