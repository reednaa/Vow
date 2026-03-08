import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

let sdk: NodeSDK | undefined;

export function initTelemetry(): void {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return;

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    metricReaders: [new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 15_000,
    })],
  });

  sdk.start();
  console.log("OpenTelemetry SDK started");
}

export async function shutdownTelemetry(): Promise<void> {
  if (!sdk) return;
  try {
    await sdk.shutdown();
  } catch (e) {
    console.error("OpenTelemetry shutdown error:", e);
  }
}
