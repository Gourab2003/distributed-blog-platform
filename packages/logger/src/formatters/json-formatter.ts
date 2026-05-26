import winston from 'winston';

export const createJsonFormatter = () => {
    return winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({
            stack: true,
        }),
        winston.format.json(),
    );
};