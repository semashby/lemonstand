// Bookable start times: the next 7 days at 10:00, 12:00, 14:00 and 16:00 (server time).
export const SLOT_HOURS = [10, 12, 14, 16];

export function upcomingSlots(days = 7, now = new Date()) {
  const slots: Date[] = [];
  for (let d = 1; d <= days; d++) {
    for (const h of SLOT_HOURS) {
      const slot = new Date(now);
      slot.setDate(now.getDate() + d);
      slot.setHours(h, 0, 0, 0);
      slots.push(slot);
    }
  }
  return slots;
}

export function euros(cents: number) {
  return new Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function when(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(iso));
}
