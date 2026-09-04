// Service Worker do Brutal
// Toda vez que você alterar o brutal.html (ou qualquer arquivo listado abaixo),
// mude o número da versão aqui embaixo (ex: 'brutal-v2' -> 'brutal-v3').
// Isso força os celulares dos jogadores a baixarem a versão nova.
const CACHE_NAME = 'brutal-v2';

const ASSETS_TO_CACHE = [
  './',
  './brutal.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon-32.png'
];

// Instala o SW e guarda os arquivos do jogo em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Remove caches de versões antigas quando uma nova versão assume
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Estratégia: tenta a rede primeiro (pra pegar atualizações); se falhar (offline), usa o cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
