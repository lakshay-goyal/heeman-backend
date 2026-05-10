import { httpServerHandler } from "cloudflare:node";
import { app } from "./app";
import { ENV } from "./config/env.config";

const port = Number(ENV.PORT) || 3000;

app.listen(port);

export default httpServerHandler({ port });
