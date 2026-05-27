import { Hono } from "hono";
import { createHttpRuntime, HttpVariables } from "@platform/http";
import { runtime } from "./runtime.js";

import { registerHealthRoutes } from "../routes/health.route.js";

export const createHttpApp = () => {
    const app = new Hono <{
        Variables: HttpVariables
    }>();

    createHttpRuntime({
        app,
        logger: runtime.logger,
        serviceName: 'auth-service',
    });

    registerHealthRoutes(app);

    return app;
}