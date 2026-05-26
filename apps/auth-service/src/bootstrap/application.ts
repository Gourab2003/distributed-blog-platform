import { configuration } from "../config/index.js";

export const bootstrapApplication = async (): Promise<void> => {
    console.log(`Starting:  ${configuration.service}...`)
    console.log(`Environment: ${configuration.environment}`)
    console.log(`Logging Level: ${configuration.logging.level}`)
}



// Future initialization points:
// - Logger
// - Database
// - Redis
// - Observability