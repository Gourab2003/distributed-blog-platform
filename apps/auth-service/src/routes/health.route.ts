import type { HttpApp } from "@platform/http";


export const registerHealthRoutes = ( app: HttpApp): void =>{
    app.get('/health', (c)=>{
        return c.json ({
            success: true,
            status: 'ok',
            service: 'auth-service'
        });
    });
};