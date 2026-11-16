import { execSync } from 'node:child_process';

export class Logger {
  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}`, meta ?? '');
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, meta ?? '');
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, meta ?? '');
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[DEBUG] ${message}`, meta ?? '');
  }

  success(message: string, meta?: Record<string, unknown>): void {
    console.log(`[OK] ${message}`, meta ?? '');
  }
}

export const logger = new Logger();

export function formatShellCommand(command: string): string {
  try {
    return execSync(`printf '%s' "${command.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
  } catch {
    return command;
  }
}
