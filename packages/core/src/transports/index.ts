import type { ServerDefinition } from "../schema.js";
import { httpTransport } from "./http.js";
import { stdioTransport } from "./stdio.js";
import type { Transport } from "./transport.js";

export type { Transport } from "./transport.js";

/** Every transport the generator can emit, keyed by its definition value. */
export const TRANSPORTS: Record<ServerDefinition["transport"], Transport> = {
  stdio: stdioTransport,
  http: httpTransport,
};
