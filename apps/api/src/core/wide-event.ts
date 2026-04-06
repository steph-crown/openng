import type { Logger } from "pino";

type FieldValue = string | number | boolean | null | undefined;
type FieldMap = Record<string, FieldValue>;
type TimerEntry = { start: number };

export class WideEvent {
  private fields: FieldMap = {};
  private timers: Map<string, TimerEntry> = new Map();
  private errors: Array<{ name?: string; message: string; code?: string; stack?: string }> = [];

  set(key: string, value: FieldValue): this {
    this.fields[key] = value;
    return this;
  }

  setMany(entries: FieldMap): this {
    for (const [key, value] of Object.entries(entries)) {
      this.fields[key] = value;
    }
    return this;
  }

  startTimer(name: string): this {
    this.timers.set(name, { start: performance.now() });
    return this;
  }

  stopTimer(name: string): this {
    const timer = this.timers.get(name);
    if (timer) {
      this.fields[`${name}_ms`] = Math.round((performance.now() - timer.start) * 100) / 100;
      this.timers.delete(name);
    }
    return this;
  }

  addError(err: unknown): this {
    if (err instanceof Error) {
      this.errors.push({
        name: err.name,
        message: err.message,
        code: (err as unknown as Record<string, unknown>).code as string | undefined,
        stack: err.stack,
      });
    } else {
      this.errors.push({ message: String(err) });
    }
    return this;
  }

  emit(log: Logger): void {
    const payload: Record<string, unknown> = { ...this.fields };

    for (const [name, timer] of this.timers) {
      payload[`${name}_ms`] = Math.round((performance.now() - timer.start) * 100) / 100;
    }

    if (this.errors.length > 0) {
      payload.errors = this.errors;
    }

    const status = (payload.status as number) ?? 0;
    const hasErrors = this.errors.length > 0;

    if (status >= 500 || hasErrors) {
      log.error(payload, "request");
    } else if (status >= 400) {
      log.warn(payload, "request");
    } else {
      log.info(payload, "request");
    }
  }
}
