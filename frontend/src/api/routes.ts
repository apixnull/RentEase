// file: src/api/routes.ts
// --------------------------------------
// Central helpers for building API routes
// --------------------------------------

type RouteBuilder = (suffix?: string) => string;

const createRouteBuilder = (base: string): RouteBuilder => {
  return (suffix = "") => `${base}${suffix}`;
};

export const apiRoutes = {
  auth: createRouteBuilder("/auth"),
  landlord: createRouteBuilder("/landlord"),
  tenant: createRouteBuilder("/tenant"),
  admin: createRouteBuilder("/admin"),
  chat: createRouteBuilder("/chat"),
  webhook: createRouteBuilder("/webhook"),
  notification: createRouteBuilder("/notification"),
};


