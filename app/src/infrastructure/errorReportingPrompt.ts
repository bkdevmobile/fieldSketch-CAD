import { AccessLimitError } from '../domain/access';

export interface ErrorReportRequest { id: number; error: Error }
interface Dependencies {
  state(): { available: boolean; ready: boolean; enabled: boolean; asked: boolean };
  save(decision: { errorReporting: boolean; errorReportingAsked: true }): Promise<void>;
  send(error: Error): void;
  publish(request: ErrorReportRequest | null): void;
}

/** Keep at most one error in memory; never send it before a saved opt-in. */
export class ErrorReportingPrompt {
  private pending: ErrorReportRequest | null = null;
  private askedThisSession = false;
  private sequence = 0;
  constructor(private dependencies: Dependencies) {}

  handle(error: unknown) {
    if (!(error instanceof Error) || error instanceof AccessLimitError) return;
    const state = this.dependencies.state();
    if (state.enabled) { this.dependencies.send(error); return; }
    if (!state.available || !state.ready || state.asked || this.askedThisSession) return;
    this.askedThisSession = true;
    this.pending = { id: ++this.sequence, error };
    this.dependencies.publish(this.pending);
  }

  async answer(id: number, allow: boolean) {
    if (this.pending?.id !== id) return;
    const request = this.pending;
    this.pending = null;
    this.dependencies.publish(null);
    await this.dependencies.save({ errorReporting: allow, errorReportingAsked: true });
    if (allow) this.dependencies.send(request.error);
  }
}
