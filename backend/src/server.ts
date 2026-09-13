import mongoose from "mongoose";
import { app } from "./app";
import { env } from "./config/env";
import { startAutomationScheduler } from "./services/automation-scheduler.service";

async function start() {
  await mongoose.connect(env.mongodbUri);

  startAutomationScheduler();

  app.listen(env.port, () => {
    console.log(
      `Algorithmic trading backend listening on http://localhost:${env.port}`
    );
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
