/* Service Worker - SOS Shine Push Notifications */

self.addEventListener('push', function (event) {
  const defaultData = {
    title: 'SOS Shine',
    body: 'Tu as un nouveau message !',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/dashboard',
  }

  let data = defaultData
  try {
    if (event.data) {
      data = { ...defaultData, ...event.data.json() }
    }
  } catch (e) {
    if (event.data) {
      data = { ...defaultData, body: event.data.text() }
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      data: { url: data.url || '/dashboard' },
      vibrate: [200, 100, 200],
      tag: 'sos-shine-notification',
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})
