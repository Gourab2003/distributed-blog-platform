export type RuntimeState =
  | 'idle'
  | 'starting'
  | 'started'
  | 'shutting-down'
  | 'stopped';