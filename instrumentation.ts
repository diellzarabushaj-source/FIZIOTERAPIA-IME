import { captureException } from "@/lib/sentry-monitoring";

export async function register() {
  // Next.js instrumentation entrypoint. Error reporting is handled by onRequestError.
}

export const onRequestError = async (
  error: unknown,
  request: { path?: string; method?: string } | undefined,
  context: { routerKind?: string; routePath?: string; routeType?: string; renderSource?: string } | undefined,
) => {
  await captureException(error, {
    mechanism: "nextjs_request_error",
    route: context?.routePath || request?.path || "unknown-route",
    tags: {
      method: request?.method,
      router_kind: context?.routerKind,
      route_type: context?.routeType,
      render_source: context?.renderSource,
    },
  });
};
