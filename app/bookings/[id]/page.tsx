import { Suspense } from "react";
import { BookingDetail } from "./BookingDetail";

export default function BookingPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <BookingDetail />
    </Suspense>
  );
}
