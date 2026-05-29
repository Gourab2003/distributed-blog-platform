import type { RuntimeState } from '../types/runtime-state.js';

export interface RuntimeResource {
  readonly name: string;
  readonly state: RuntimeState;

  readonly start?: () => Promise<void>;

  readonly shutdown: () => Promise<void>;
}
