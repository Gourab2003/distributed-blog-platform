export type LogPrimitive =
    | string
    | number
    | boolean
    | null;

export type LogValue =
    | LogPrimitive
    | LogValue[]
    | { readonly [key: string]: LogValue };

export type LogMetadata = Record<string, LogValue>;