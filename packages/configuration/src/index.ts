// packages/configuration/src/index.ts
export { createServiceConfiguration } from './core/factory.js';

export type {
    Environment,
    ServiceConfiguration,
    SecretsConfiguration,
    LoggingConfiguration,
    ObservabilityConfiguration,
    DatabaseConfiguration,
    RedisConfiguration,
} from './types.js';

export {
    environmentEnum,
} from './environment/schema.js';

export {
    deepFreeze,
} from './core/deep-freeze.js';

export {
    redactSecrets,
    safeSerializeConfiguration,
} from './core/redaction.js';

export {
    ConfigurationError,
    ConfigurationValidationError,
} from './core/errors.js';