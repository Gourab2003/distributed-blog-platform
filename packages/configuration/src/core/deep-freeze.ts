export function deepFreeze<T>(value: T): Readonly<T> {
    if (
        value !== null &&
        (typeof value === 'object' ||
            typeof value === 'function')
    ) {
        Object.freeze(value);

        for (const key of Object.getOwnPropertyNames(value)) {
            const property = (
                value as Record<string, unknown>
            )[key];

            if (
                property !== null &&
                (typeof property === 'object' ||
                    typeof property === 'function') &&
                !Object.isFrozen(property)
            ) {
                deepFreeze(property);
            }
        }
    }

    return value;
}