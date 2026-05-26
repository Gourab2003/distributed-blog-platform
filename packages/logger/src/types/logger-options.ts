export interface LoggerOptions {
    readonly serviceName: string;
    readonly environment: string;

    readonly level:
    | 'trace'
    | 'debug'
    | 'info'
    | 'warn'
    | 'error'
    | 'fatal';

    readonly redaction?: {
        readonly enabled?: boolean;
        readonly fields?: readonly string[];
        readonly censor?: string;
    };
}