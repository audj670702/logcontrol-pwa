const APP_CONFIG = {
  appName: "LogControl",
  ninoxUrl: "https://app.ninox.com",
  supportEmail: "soporte@logcontrol.mx"
};

const BROWSER_INSTRUCTIONS = {
  chrome: {
    label: "Google Chrome",
    summary:
      "En Chrome puedes instalar LogControl desde el botón de esta pantalla o desde el icono de instalación en la barra de direcciones, si aparece.",
    steps: [
      "Abre LogControl en Google Chrome.",
      "Si ves el botón “Instalar LogControl”, haz clic ahí.",
      "Si no aparece, revisa la barra de direcciones y busca el icono de instalación.",
      "También puedes abrir el menú de Chrome y buscar una opción similar a “Instalar aplicación” o “Guardar e instalar”.",
      "Después de instalar, abre LogControl desde el escritorio o desde la barra de tareas."
    ]
  },
  edge: {
    label: "Microsoft Edge",
    summary:
      "En Edge normalmente puedes instalar desde el botón interno de esta pantalla o desde el menú del navegador.",
    steps: [
      "Abre LogControl en Microsoft Edge.",
      "Si ves el botón “Instalar LogControl”, úsalo directamente.",
      "Si no aparece, abre el menú de Edge y busca la opción para instalar esta aplicación.",
      "Confirma la instalación cuando Edge lo solicite.",
      "Abre LogControl desde el escritorio, menú inicio o barra de tareas."
    ]
  },
  other: {
    label: "Navegador no identificado",
    summary:
      "Algunos navegadores muestran la instalación de manera distinta o no permiten el mismo flujo. Usa el botón de instalación si aparece; de lo contrario, utiliza el menú del navegador.",
    steps: [
      "Abre LogControl en tu navegador actual.",
      "Busca el botón “Instalar LogControl” en esta pantalla.",
      "Si no aparece, revisa el menú principal del navegador para encontrar una opción de instalar o crear acceso.",
      "Si tu navegador no admite instalación PWA, utiliza LogControl desde el navegador como portal de acceso a Ninox."
    ]
  }
};

let deferredInstallPrompt = null;

const openNinoxBtn = document.getElementById("openNinoxBtn");
const openNinoxBtnBottom = document.getElementById("openNinoxBtnBottom");
const installBtn = document.getElementById("installBtn");
const installBanner = document.getElementById("installBanner");
const installBannerBtn = document.getElementById("installBannerBtn");
const scrollInstallBtn = document.getElementById("scrollInstallBtn");
const browserValue = document.getElementById("browserValue");
const displayModeValue = document.getElementById("displayModeValue");
const browserPill = document.getElementById("browserPill");
const browserSummary = document.getElementById("browserSummary");
const instructionList = document.getElementById("instructionList");

function detectBrowser() {
  const ua = navigator.userAgent || "";

  if (/Edg/i.test(ua)) return "edge";
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "chrome";
  return "other";
}

function getBrowserContent() {
  const browserKey = detectBrowser();
  return BROWSER_INSTRUCTIONS[browserKey] || BROWSER_INSTRUCTIONS.other;
}

function renderInstructions() {
  const browserContent = getBrowserContent();

  browserValue.textContent = browserContent.label;
  browserPill.textContent = browserContent.label;
  browserSummary.textContent = browserContent.summary;

  instructionList.innerHTML = browserContent.steps
    .map(
      (step, index) => `
        <li class="instruction-item">
          <div class="instruction-number">${index + 1}</div>
          <p>${step}</p>
        </li>
      `
    )
    .join("");
}

function updateDisplayMode() {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  displayModeValue.textContent = isStandalone ? "Aplicación instalada" : "Navegador";
}

function openNinoxSameWindow() {
  window.location.href = APP_CONFIG.ninoxUrl;
}

function showInstallUi() {
  installBtn.hidden = false;
  installBanner.hidden = false;
}

function hideInstallUi() {
  installBtn.hidden = true;
  installBanner.hidden = true;
}

async function promptInstallation() {
  if (!deferredInstallPrompt) {
    const browserContent = getBrowserContent();
    alert(
      `La instalación directa no está disponible en este momento.\n\n` +
      `Navegador detectado: ${browserContent.label}\n\n` +
      `Revisa la guía en pantalla para instalar desde el menú del navegador.`
    );
    return;
  }

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;

  if (choice && choice.outcome) {
    console.log(`Resultado de instalación: ${choice.outcome}`);
  }

  deferredInstallPrompt = null;
  hideInstallUi();
}

function registerInstallEvents() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallUi();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    hideInstallUi();
    updateDisplayMode();
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register("sw.js").catch((error) => {
    console.error("No fue posible registrar el service worker:", error);
  });
}

function bindEvents() {
  openNinoxBtn.addEventListener("click", openNinoxSameWindow);
  openNinoxBtnBottom.addEventListener("click", openNinoxSameWindow);

  installBtn.addEventListener("click", promptInstallation);
  installBannerBtn.addEventListener("click", promptInstallation);

  scrollInstallBtn.addEventListener("click", () => {
    window.scrollTo({
      top: instructionList.getBoundingClientRect().top + window.scrollY - 110,
      behavior: "smooth"
    });
  });

  window.matchMedia("(display-mode: standalone)").addEventListener("change", updateDisplayMode);
}

function init() {
  renderInstructions();
  updateDisplayMode();
  bindEvents();
  registerInstallEvents();
  registerServiceWorker();
}

document.addEventListener("DOMContentLoaded", init);
