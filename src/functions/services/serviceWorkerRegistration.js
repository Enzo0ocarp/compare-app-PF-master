// src/serviceWorkerRegistration.js
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.log('✅ Service Worker registrado:', registration);
          
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('🔄 Nueva versión disponible');
                  // Mostrar notificación al usuario
                  showUpdateNotification();
                } else {
                  console.log('✅ Contenido cacheado para offline');
                }
              }
            };
          };
        })
        .catch(error => {
          console.error('❌ Error registrando Service Worker:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

function showUpdateNotification() {
  // Dispatch custom event para que la app lo maneje
  window.dispatchEvent(new CustomEvent('swUpdate'));
}