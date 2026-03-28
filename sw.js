const CACHE = 'memorydeck-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Получаем push-уведомление с сервера (если будет)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'MemoryDeck', {
      body: data.body || 'Пора повторить карточки!',
      icon: data.icon || './icon-192.png',
      badge: './icon-192.png',
      tag: 'memorydeck-reminder',
      renotify: true,
      data: { url: data.url || './index.html' }
    })
  );
});

// Клик по уведомлению — открываем приложение
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('./index.html');
    })
  );
});

// Плановые уведомления через setTimeout (локальные)
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title || 'MemoryDeck', {
        body: body || 'Пора повторить карточки!',
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: 'memorydeck-reminder',
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: './index.html' }
      });
    }, delay || 0);
  }
});
