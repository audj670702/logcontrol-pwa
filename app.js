const APP_CONFIG = {
  platformUrl: "https://app.ninox.com"
};

let deferredInstallPrompt = null;

const openPlatformBtn = document.getElementById("openPlatformBtn");
const installBtn = document.getElementById("installBtn");

function openPlatform() {
  window.location.href = APP_CONFIG.platformUrl;
}

function showInstallButton() {
  if (installBtn) {
    installBtn.hidden = false;
  }
}

function hideInstallButton() {
  if (installBtn) {
    installBtn.hidden = true;
  }
}

async function promptInstallation() {
  if (!deferredInstallPrompt) return;

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;

  deferredInstallPrompt = null;
  hideInstallButton();
}

function registerInstallEvents() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    hideInstallButton();
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register("sw.js").catch((error) => {
    console.error("No fue posible registrar el service worker:", error);
  });
}

function bindEvents() {
  if (openPlatformBtn) {
    openPlatformBtn.addEventListener("click", openPlatform);
  }

  if (installBtn) {
    installBtn.addEventListener("click", promptInstallation);
  }
}

function init() {
  bindEvents();
  registerInstallEvents();
  registerServiceWorker();
}

document.addEventListener("DOMContentLoaded", init);
