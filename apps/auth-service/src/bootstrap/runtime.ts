import { createLogger } from '@platform/logger';
import { initObservability } from '@platform/observability';
import { configuration } from '../config/index.js';

export const runtime = (()=>{
    const logger = createLogger({
        serviceName: configuration.service,
        environment: configuration.environment,
        level: configuration.logging.level,
    });

    const observability = initObservability({
        serviceName: configuration.service,
        environment: configuration.environment,
        logger,
    });

    return {
        logger,
        observability,
    }
})();