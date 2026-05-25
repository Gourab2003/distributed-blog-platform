import { z } from 'zod';

export const environmentSchema = z.enum([
    'development',
    'test',
    'staging',
    'production',
]);

export type Environment =
    typeof environmentSchema._type;