import { literal } from "../codegen/util.js";
import type { ResourceDefinition } from "../schema.js";

/**
 * Render `src/resources/<name>.ts`: a read callback stub that returns the
 * resource contents for its URI.
 */
export function renderResourceModule(resource: ResourceDefinition): string {
  return `/**
 * ${resource.description}
 *
 * Exposed at \`${resource.uri}\`.
 * TODO: replace this placeholder with the real contents.
 */
export async function read(uri: URL) {
  return {
    contents: [
      {
        uri: uri.href,
        mimeType: ${literal(resource.mimeType)},
        text: \`TODO: contents of ${resource.name}\`,
      },
    ],
  };
}
`;
}
