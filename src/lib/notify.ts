export const SHOW_TOASTER_EVENT = "abe:show-toaster";

// Time for SiteToaster to mount after the first request; toasts sent earlier would be lost.
const TOASTER_MOUNT_MS = 100;

let toasterReady = false;

/** Shows a toast. Sonner downloads on first use, keeping it out of the page's initial JavaScript. */
export async function notify(message: string, action?: { label: string; onClick: () => void }) {
  window.dispatchEvent(new Event(SHOW_TOASTER_EVENT));
  const { toast } = await import("sonner");
  if (!toasterReady) {
    await new Promise((resolve) => setTimeout(resolve, TOASTER_MOUNT_MS));
    toasterReady = true;
  }
  toast(message, { action });
}
