/** A single file to be written, with a project-relative POSIX path. */
export interface GeneratedFile {
  readonly path: string;
  readonly contents: string;
}
