import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: Number(__ENV.K6_VUS || 3),
  duration: __ENV.K6_DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
    checks: ["rate>0.99"],
  },
};

const baseUrl = (__ENV.TARGET_URL || "https://fizioterapia-ime.vercel.app").replace(/\/$/, "");
const paths = ["/", "/api/health", "/patient-portal"];

export default function () {
  for (const path of paths) {
    const response = http.get(`${baseUrl}${path}`, {
      tags: { route: path },
      timeout: "10s",
    });
    check(response, {
      [`${path} responds without server error`]: (res) => res.status < 500,
    });
  }
  sleep(1);
}
