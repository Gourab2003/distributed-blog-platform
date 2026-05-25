import { z } from 'zod';

export class ConfigurationError extends Error {
    readonly code: string;

    readonly service: string;
    readonly environment: string;

    constructor(
        message: string,
        service: string,
        environment: string,
    ) {
        super(message);

        Object.setPrototypeOf(
            this,
            new.target.prototype,
        );

        this.name = 'ConfigurationError';

        this.code =
            'CONFIGURATION_ERROR';

        this.service = service;
        this.environment = environment;
    }
}

export class ConfigurationValidationError extends ConfigurationError {
    override readonly code: string;

    readonly issues: z.ZodIssue[];

    constructor(
        message: string,
        service: string,
        environment: string,
        issues: z.ZodIssue[],
    ) {
        super(
            message,
            service,
            environment,
        );

        Object.setPrototypeOf(
            this,
            new.target.prototype,
        );

        this.name =
            'ConfigurationValidationError';

        this.code =
            'CONFIGURATION_VALIDATION_ERROR';

        this.issues = issues;
    }
}