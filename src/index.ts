import { app } from "./app";
import { ENV } from "./config/env.config";
const port = Number(ENV.PORT) || 8000;

app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${port}`);
});
