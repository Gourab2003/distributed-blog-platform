export { createDatabaseRuntime } from './runtime/database-runtime.js';
export type { DatabaseRuntime, DatabaseSchema } from './runtime/database-runtime.js';

export type { DatabaseRuntimeOptions } from './types/database-options.js';

export * as userSchema from './schema/users/index.js';
export * as sharedSchema from './schema/shared/index.js';