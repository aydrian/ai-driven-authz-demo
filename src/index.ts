import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { Oso } from "oso-cloud";
import { assessRisk } from "./risk-agent";

// To get autocompletion and tell TypeScript to treat variables as non-optional strings
declare module "bun" {
  interface Env {
    OSO_URL: string;
    OSO_AUTH: string;
  }
}

const methodToAction: { [key: string]: string } = {
  GET: "read",
  HEAD: "read",
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete"
};

const app = new Hono();

// Using basic auth for this example
app.use(
  basicAuth(
    {
      username: "alice",
      password: "password123"
    },
    {
      username: "bob",
      password: "password456"
    }
  )
);

// Middleware to check authorization
const authorizeProject = createMiddleware(async (c, next) => {
  const oso = new Oso(process.env.OSO_URL, process.env.OSO_AUTH);

  // Calculate risk score for the current request
  const riskScore = assessRisk(c);

  // Simulate user identity from headers
  const user = c.req.header("Authorization")?.split(" ")[1]
    ? atob(c.req.header("Authorization")?.split(" ")[1] || "").split(":")[0]
    : "unknown";
  const actor = { type: "User", id: user };

  const project = c.req.param("projectId") || "default";
  const resource = { type: "Project", id: project };

  const action =
    methodToAction[c.req.method] ||
    (() => {
      throw new HTTPException(405, { message: "Method not allowed" });
    })();

  console.log({ actor, action, resource, riskScore });
  const isAllowed = await oso.authorize(actor, action, resource, [
    ["risk_score", { type: "Number", id: riskScore.toString() }]
  ]);
  if (!isAllowed) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  await next();
});

// Project routes
app.get("/project/:projectId", authorizeProject, (c) => {
  return c.json({ message: "You have access to this resource!" });
});

export default app;
