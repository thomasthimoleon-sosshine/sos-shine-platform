/* Service Worker - SOS Shine Push Notifications */

/* Badge count tracking */
let badgeCount = 0

/* Content type configuration for notifications */
const NOTIFICATION_CONFIG = {
  new_video: {
    tag: 'sos-shine-video',
    icon: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
  },
  new_audio: {
    tag: 'sos-shine-audio',
    icon: '/icon-192.png',
    vibrate: [200, 100, 200],
  },
  new_book: {
    tag: 'sos-shine-book',
    icon: '/icon-192.png',
    vibrate: [300, 100, 300],
  },
  new_protocol: {
    tag: 'sos-shine-protocol',
    icon: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
  },
  new_douleur: {
    tag: 'sos-shine-douleur',
    icon: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
  },
  new_event: {
    tag: 'sos-shine-event',
    icon: '/icon-192.png',
    vibrate: [200, 100, 200],
  },
  new_post: {
    tag: 'sos-shine-post',
    icon: '/icon-192.png',
    vibrate: [200, 100, 200],
  },
  new_soin: {
    tag: 'sos-shine-soin',
    icon: '/icon-192.png',
    vibrate: [300, 100, 300, 100, 300],
  },
  warning: {
    tag: 'sos-shine-warning',
    icon: '/icon-192.png',
    vibrate: [400, 200, 400],
  },
}

self.addEventListener('push', function (event) {
  var defaultData = {
    title: 'Nouveau message',
    body: 'Tu as un nouveau message !',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/dashboard',
    type: 'new_post',
  }

  var data = defaultData
  try {
    if (event.data) {
      data = Object.assign({}, defaultData, event.data.json())
    }
  } catch (e) {
    if (event.data) {
      data = Object.assign({}, defaultData, { body: event.data.text() })
    }
  }

  var config = NOTIFICATION_CONFIG[data.type] || NOTIFICATION_CONFIG.new_post

  badgeCount++

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || config.icon,
      badge: data.badge || '/icon-192.png',
      data: { url: data.url || '/dashboard', type: data.type },
      vibrate: config.vibrate,
      tag: config.tag,
      renotify: true,
      actions: data.type === 'new_video' || data.type === 'new_audio' || data.type === 'new_book' || data.type === 'new_protocol'
        ? [{ action: 'open', title: 'Découvrir' }]
        : [],
    }).then(function () {
      if (self.navigator && self.navigator.setAppBadge) {
        return self.navigator.setAppBadge(badgeCount)
      }
    }).then(function () {
      // Notify all open clients about the new notification for real-time badge update
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    }).then(function (clientList) {
      if (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          clientList[i].postMessage({
            type: 'PUSH_RECEIVED',
            notificationType: data.type,
            badgeCount: badgeCount,
          })
        }
      }
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  badgeCount = Math.max(0, badgeCount - 1)

  if (self.navigator && self.navigator.clearAppBadge) {
    if (badgeCount === 0) {
      self.navigator.clearAppBadge()
    } else if (self.navigator.setAppBadge) {
      self.navigator.setAppBadge(badgeCount)
    }
  }

  var url = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i]
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Notify client that notification was clicked (to refresh badge count)
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            badgeCount: badgeCount,
          })
          client.navigate(url)
          return client.focus()
        }
      }
      return self.openWindow(url)
    })
  )
})

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  badgeCount = 0
  event.waitUntil(self.clients.claim())
})
