// Service worker: network first (updates arrive right away), cache as offline fallback.
const CACHE = "n2n-road-v1";
const SHELL = ["./", "index.html", "style.css", "game.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || r.headers.has("range")) return;                       // audio/video ranges go straight to the network
  const u = new URL(r.url);
  if (u.origin !== location.origin && !/three(\.min)?\.js/.test(u.pathname)) return;
  e.respondWith(fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r)));
});
