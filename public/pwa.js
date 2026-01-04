let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  window.dispatchEvent(new Event("pwa-install-available"));
});

window.getDeferredPrompt = () => deferredPrompt;
window.clearDeferredPrompt = () => (deferredPrompt = null);
