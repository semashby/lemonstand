// Tells you when something breaks. It says what broke, never who it happened to:
// alerts go to a phone and through someone else's servers.
export async function sendAlert(message: string) {
  const url = process.env.ALERT_URL;
  if (!url) {
    console.error("[lemonstand] ALERT_URL is not set:", message);
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { Title: "Lemonstand", Priority: "high" },
      body: message,
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // A broken alert must never break the booking. The log still has it.
    console.error("[lemonstand] could not send alert:", message);
  }
}
