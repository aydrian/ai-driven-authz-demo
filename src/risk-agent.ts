import type { Context } from "hono";
import { getConnInfo } from "hono/bun";

// A simple assess risk score calculation
export const assessRisk = (c: Context) => {
  const info = getConnInfo(c);

  // Simulate user identity from headers
  const user = c.req.header("Authorization")?.split(" ")[1]
    ? atob(c.req.header("Authorization")?.split(" ")[1] || "").split(":")[0]
    : "unknown";
  const time = new Date().getHours();
  const ip = c.req.header("x-forwarded-for") || info.remote.address;

  let riskScore = 0;

  // Example risk factors
  if (!user) riskScore += 50; // Missing user identity
  if (time < 6 || time > 22) riskScore += 20; // Access outside normal hours
  if (ip && ip.startsWith("192.168")) riskScore += 0; // Trusted IP range
  else riskScore += 30; // Untrusted IP

  return riskScore;
};
