declare module "cloudflare:node" {
    export function httpServerHandler(options: { port: number }): {
        fetch: (request: Request, env: unknown, ctx: unknown) => Response | Promise<Response>;
    };

    export function handleAsNodeRequest(port: number, request: Request): Response | Promise<Response>;
}
