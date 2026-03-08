import { initTelemetry, shutdownTelemetry } from "../telemetry/index.ts";
import { loadWorkerConfig } from "../config/env.ts";
import { createEnvSigner } from "../core/signing.ts";
import { createDb, closeDb } from "../db/client.ts";
import { setupWorker } from "../worker/setup.ts";

async function main() {
  initTelemetry();
  const config = loadWorkerConfig();
  const signer = createEnvSigner(config.witnessPrivateKey);
  const db = createDb(config.databaseUrl);
  const worker = await setupWorker({
    databaseUrl: config.databaseUrl,
    signer,
    db,
  });

  console.log("Worker signer address:", signer.address());

  let shuttingDown = false;
  async function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("Worker shutting down...");

    try {
      await worker.stop();
    } catch (error) {
      console.error("Worker stop error:", error);
    }

    await closeDb();
    await shutdownTelemetry();
    process.exit(0);
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch(async (error) => {
  console.error("Worker startup error:", error);
  await shutdownTelemetry();
  process.exit(1);
});
