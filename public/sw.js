// Cleanup worker — an old version of this app registered a service worker that
// keeps serving stale cached chunks. When the browser's update check picks up
// this script, it activates, clears every SW cache, unregisters itself, and
// reloads open pages so they run purely from the network.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
