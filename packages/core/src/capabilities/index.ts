import { promptKind } from "./prompt.js";
import { resourceKind } from "./resource.js";
import { toolKind } from "./tool.js";

export type { CapabilityKind } from "./kind.js";

/**
 * The registry of capability kinds. Order is the generated server's registration
 * order (tools, then resources, then prompts); generated files are re-sorted by
 * path, so this only affects the order of registrations and README rows.
 */
export const CAPABILITY_KINDS = [toolKind, resourceKind, promptKind];
