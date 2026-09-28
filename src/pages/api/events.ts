import type { APIRoute } from "astro";
import type { Booking } from "../../lib/db";
import { bus } from "../../lib/events";

// This stream is public and unauthenticated — anyone can connect, not just
// the browser that made a booking. `ownerToken` is the bearer credential
// that gates cancelling and moving a booking (see db.ts), so broadcasting it
// here would hand every listener the exact value they'd need to impersonate
// whoever just booked or cancelled something. Strip it before it ever
// reaches JSON.stringify, rather than trusting every current and future
// bus.emit call site to remember to omit it.
function toPublicBooking(booking: Booking) {
  const { ownerToken: _ownerToken, ...publicBooking } = booking;
  return publicBooking;
}

// The minimal server-sent-events (SSE) pattern: a long-lived streaming
// response the browser consumes with `new EventSource("/api/events")`.
// SSE is one-directional (server → browser) and plain HTTP, which makes it
// the simplest live channel that works everywhere — reach for WebSockets
// only when the client needs to push over the same connection.
export const GET: APIRoute = () => {
  let onBooking: (booking: Booking) => void;
  let onCancelled: (booking: Booking) => void;
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<string>({
    start(controller) {
      // an opening comment so the client (and the post-deploy CI probe) sees
      // bytes immediately, and a periodic one so proxies don't drop the
      // connection as idle
      controller.enqueue(": connected\n\n");
      heartbeat = setInterval(() => controller.enqueue(": ping\n\n"), 30_000);
      onBooking = (booking) => {
        controller.enqueue(`event: booking\ndata: ${JSON.stringify(toPublicBooking(booking))}\n\n`);
      };
      onCancelled = (booking) => {
        controller.enqueue(`event: cancelled\ndata: ${JSON.stringify(toPublicBooking(booking))}\n\n`);
      };
      bus.on("booking", onBooking);
      bus.on("cancelled", onCancelled);
    },
    cancel() {
      clearInterval(heartbeat);
      bus.off("booking", onBooking);
      bus.off("cancelled", onCancelled);
    },
  });

  return new Response(stream.pipeThrough(new TextEncoderStream()), {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    },
  });
};
