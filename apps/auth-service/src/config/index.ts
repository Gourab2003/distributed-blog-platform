import { createServiceConfiguration } from '@platform/configuration';
import { authServiceSchema } from './schema.js';

export const configuration = createServiceConfiguration({
    service: 'auth-service',
    schema: authServiceSchema
})