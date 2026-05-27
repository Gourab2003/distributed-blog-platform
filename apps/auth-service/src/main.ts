import 'dotenv/config';
import { bootstrapApplication } from './bootstrap/application.js';

const main = async (): Promise<void> => {
    await bootstrapApplication();
};

main().catch((error)=>{
    console.error('Fatal bootstrap failed', error);
    process.exit(1)
})