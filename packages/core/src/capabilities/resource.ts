import { alias, configObject, literal } from "../codegen/util.js";
import type { ResourceDefinition } from "../schema.js";
import type { CapabilityKind } from "./kind.js";

const DIR = "resources";
const SUFFIX = "Resource";

/** Render `src/resources/<name>.ts`: a read callback stub for its URI. */
function renderModule(resource: ResourceDefinition): string {
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

function renderRegistration(resource: ResourceDefinition): string {
  const ns = alias(resource.name, SUFFIX);
  const config = configObject([
    ["title", resource.title === undefined ? undefined : literal(resource.title)],
    ["description", literal(resource.description)],
    ["mimeType", literal(resource.mimeType)],
  ]);
  return `server.registerResource(${literal(resource.name)}, ${literal(resource.uri)}, ${config}, ${ns}.read);`;
}

export const resourceKind: CapabilityKind = {
  dir: DIR,
  files: (def) =>
    def.resources.map((resource) => ({
      path: `src/${DIR}/${resource.name}.ts`,
      contents: renderModule(resource),
    })),
  imports: (def) =>
    def.resources.map(
      (resource) =>
        `import * as ${alias(resource.name, SUFFIX)} from "./${DIR}/${resource.name}.js";`,
    ),
  registrations: (def) => def.resources.map(renderRegistration),
  readmeRows: (def) =>
    def.resources.map(
      (resource) => `| resource | \`${resource.name}\` | ${resource.description} |`,
    ),
};
