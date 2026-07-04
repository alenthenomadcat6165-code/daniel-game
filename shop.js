const STORAGE_KEYS = {
  points: "pixelPartyPoints",
  retroOwned: "pixelPartyRetroOwned",
  retroOn: "pixelPartyRetroOn",
};

const RETRO_COST = 75;
const walletPointsEl = document.querySelector("#walletPoints");
const retroShopButton = document.querySelector("#retroShopButton");
const shopStatus = document.querySelector("#shopStatus");

function readNumber(key, fallback = 0) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

function writePoints(points) {
  localStorage.setItem(STORAGE_KEYS.points, String(points));
  walletPointsEl.textContent = points;
}

function ownsRetro() {
  return localStorage.getItem(STORAGE_KEYS.retroOwned) === "true";
}

function retroIsOn() {
  return localStorage.getItem(STORAGE_KEYS.retroOn) === "true";
}

function applyTheme() {
  document.body.classList.toggle("retro-theme", ownsRetro() && retroIsOn());
}

function updateShop() {
  const points = readNumber(STORAGE_KEYS.points);
  walletPointsEl.textContent = points;

  if (!ownsRetro()) {
    retroShopButton.textContent = points >= RETRO_COST ? "Buy" : "Need points";
    retroShopButton.disabled = points < RETRO_COST;
    shopStatus.textContent = `${Math.max(0, RETRO_COST - points)} more points needed.`;
    return;
  }

  retroShopButton.disabled = false;
  retroShopButton.textContent = retroIsOn() ? "Use clean style" : "Use retro style";
  shopStatus.textContent = "Owned. You can switch styles whenever you want.";
}

retroShopButton.addEventListener("click", () => {
  const points = readNumber(STORAGE_KEYS.points);

  if (!ownsRetro()) {
    if (points < RETRO_COST) return;
    writePoints(points - RETRO_COST);
    localStorage.setItem(STORAGE_KEYS.retroOwned, "true");
    localStorage.setItem(STORAGE_KEYS.retroOn, "true");
    applyTheme();
    updateShop();
    return;
  }

  localStorage.setItem(STORAGE_KEYS.retroOn, retroIsOn() ? "false" : "true");
  applyTheme();
  updateShop();
});

applyTheme();
updateShop();
