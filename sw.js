self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => e.respondWith(fetch(e.request).catch(() => new Response(''))));

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'DOWNLOAD_PROGRESS'){
    const pct = e.data.pct || 0;
    const title = e.data.title || 'تحميل';
    if(pct >= 100){
      self.registration.showNotification('✅ اكتمل التحميل', {
        body: title + ' - تم التحميل بنجاح',
        icon: 'https://i.suar.me/Epwvv',
        badge: 'https://i.suar.me/Epwvv',
        tag: 'dl-done',
        vibrate: [200, 100, 200]
      }).catch(()=>{});
    } else if(pct > 0 && pct % 25 === 0){
      self.registration.showNotification('📥 جاري التحميل... ' + pct + '%', {
        body: title,
        icon: 'https://i.suar.me/Epwvv',
        badge: 'https://i.suar.me/Epwvv',
        tag: 'dl-progress',
        silent: true
      }).catch(()=>{});
    }
  }
});

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch(_){}
  const title = data.title || '🎬 jawrab';
  const options = {
    body: data.body || 'محتوى جديد متاح',
    icon: data.icon || 'https://i.suar.me/Epwvv',
    badge: data.badge || 'https://i.suar.me/Epwvv',
    image: data.image || undefined,
    tag: data.tag || 'jawrab-push',
    requireInteraction: false,
    vibrate: [150, 80, 150],
    data: data.data || {},
    actions: [
      { action: 'open', title: '▶ شاهد الآن' },
      { action: 'close', title: '✕ إغلاق' },
    ],
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if(e.action === 'close') return;
  const nd = e.notification.data || {};
  const openUrl = nd.openUrl || nd.postUrl || self.location.origin;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for(const client of list){
        if(client.url.includes(self.location.hostname)){
          client.focus();
          client.postMessage({ type: 'OPEN_VIDEO', openUrl, data: nd });
          return;
        }
      }
      return clients.openWindow(openUrl);
    })
  );
});
