import { handleAsNodeRequest } from "cloudflare:node";
import { app } from "./app";
import { ENV } from "./config/env.config";
import { setDatabaseUrl } from "./lib/prisma";

type WorkerEnv = {
    HYPERDRIVE?: {
        connectionString: string;
    };
};

const port = Number(ENV.PORT) || 3000;

app.listen(port);

export default {
    fetch(request: Request, env: WorkerEnv) {
        setDatabaseUrl(env.HYPERDRIVE?.connectionString);
        return handleAsNodeRequest(port, request);
    },
};
