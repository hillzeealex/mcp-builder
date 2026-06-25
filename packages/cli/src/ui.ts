import pc from "picocolors";

/** Small, consistent console helpers so command output looks uniform. */
export const ui = {
  info(message: string): void {
    console.log(`${pc.cyan("›")} ${message}`);
  },
  success(message: string): void {
    console.log(`${pc.green("✔")} ${message}`);
  },
  warn(message: string): void {
    console.warn(`${pc.yellow("!")} ${message}`);
  },
  error(message: string): void {
    console.error(`${pc.red("✖")} ${message}`);
  },
  list(items: readonly string[]): void {
    for (const item of items) {
      console.log(`  ${pc.dim("•")} ${item}`);
    }
  },
  heading(message: string): void {
    console.log(`\n${pc.bold(message)}`);
  },
};
