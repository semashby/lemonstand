// Small logger so we can see what's going on in production.
export function log(event: string, data?: unknown) {
  console.log(`[lemonstand] ${new Date().toISOString()} ${event}`, data === undefined ? "" : JSON.stringify(data));
}
