import { trace, metrics, SpanStatusCode } from "@opentelemetry/api";
import type { RpcClient } from "./client.ts";

const tracer = trace.getTracer("vow-witness");
const meter = metrics.getMeter("vow-witness");

const durationHistogram = meter.createHistogram("vow.rpc.duration", {
  description: "RPC call duration in milliseconds",
  unit: "ms",
});

const errorsCounter = meter.createCounter("vow.rpc.errors", {
  description: "RPC call error count",
});

type RpcMethod = "getBlock" | "getLogs" | "getBlockNumber";

function wrapMethod<T extends (...args: any[]) => Promise<any>>(
  method: T,
  name: RpcMethod,
  attrs: { "rpc.url": string; "chain.id": number }
): T {
  return (async (...args: any[]) => {
    const spanAttrs = { "rpc.method": name, ...attrs };
    const start = Date.now();

    return tracer.startActiveSpan(`rpc.${name}`, { attributes: spanAttrs }, async (span) => {
      try {
        const result = await method(...args);
        durationHistogram.record(Date.now() - start, spanAttrs);
        return result;
      } catch (err: any) {
        durationHistogram.record(Date.now() - start, spanAttrs);
        errorsCounter.add(1, { ...spanAttrs, "error.type": err?.constructor?.name ?? "Error" });
        span.recordException(err);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw err;
      } finally {
        span.end();
      }
    });
  }) as T;
}

export function instrumentRpcClient(
  client: RpcClient,
  attrs: { url: string; chainId: number }
): RpcClient {
  const commonAttrs = { "rpc.url": attrs.url, "chain.id": attrs.chainId };
  return {
    getBlock: wrapMethod(client.getBlock.bind(client), "getBlock", commonAttrs),
    getLogs: wrapMethod(client.getLogs.bind(client), "getLogs", commonAttrs),
    getBlockNumber: wrapMethod(client.getBlockNumber.bind(client), "getBlockNumber", commonAttrs),
  };
}
