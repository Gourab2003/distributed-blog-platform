import 'dotenv/config';
import { bootstrapApplication } from './bootstrap/application.js';

const main = async (): Promise<void> => {
    try {
        await bootstrapApplication();
        console.log('Auth service bootstrap completed successfully.\n');
    } catch (error) {
        console.error('Application startup failed:', error);
        process.exit(1);
    }
};

void main();