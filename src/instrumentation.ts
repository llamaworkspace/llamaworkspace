import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

export function register() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: "nextjs-app",
    }),
    spanProcessor: new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: "https://api.axiom.co/v1/traces",
        headers: {
          // Authorization: `Bearer ${process.env.API_TOKEN}` ?? "",
          Authorization: `Bearer xaat-5387de9f-418e-4c66-a545-4edc12b6f0d2`,
          "X-Axiom-Dataset": process.env.DATASET_NAME ?? "joia_dataset",
        },
      }),
    ),
  });

  sdk.start();
}
