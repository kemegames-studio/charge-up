/* ════════ PROGRESSION SYSTEM ════════ */
var xp = 0;
var thndr = 0;
var playerLevel = 1;

function getXpForLevel(levelIdx, isFirstTime) {
  if (levelIdx <= 2) {
    // Easy: levels 1-3 (index 0-2)
    return { xp: 50, thndr: 5 };
  } else if (levelIdx <= 7) {
    // Medium: levels 4-8 (index 3-7)
    return { xp: 100, thndr: 10 };
  } else {
    // Hard: levels 9-50 (index 8+)
    if (isFirstTime) {
      return { xp: 150, thndr: 20 };
    } else {
      return { xp: 50, thndr: 5 };
    }
  }
}

function getPlayerLevel() {
  return Math.floor(xp / 500) + 1;
}

function showLevelUpToast(newLevel) {
  var existing = document.getElementById("levelUpToast");
  if (existing) existing.remove();
  var toast = document.createElement("div");
  toast.id = "levelUpToast";
  toast.textContent = "⚡ LEVEL UP! Player Level " + newLevel;
  toast.style.cssText = [
    "position:fixed",
    "top:20%",
    "left:50%",
    "transform:translateX(-50%)",
    "background:linear-gradient(135deg,#00ff88,#00aaff)",
    "color:#000",
    "font-family:'Orbitron',sans-serif",
    "font-size:14px",
    "font-weight:900",
    "padding:12px 24px",
    "border-radius:30px",
    "z-index:9999",
    "box-shadow:0 0 30px rgba(0,255,136,.6)",
    "letter-spacing:2px",
    "opacity:1",
    "transition:opacity 0.5s"
  ].join(";");
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = "0";
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 500);
  }, 2500);
}

function awardLevel(levelIdx, isFirstTime) {
  var reward = getXpForLevel(levelIdx, isFirstTime);
  var oldLevel = getPlayerLevel();
  xp += reward.xp;
  thndr += reward.thndr;
  var newLevel = getPlayerLevel();
  playerLevel = newLevel;
  updateXpDisplay();
  if (newLevel > oldLevel) {
    showLevelUpToast(newLevel);
  }
  return reward;
}

function updateXpDisplay() {
  var xpEl = document.getElementById("xpCount");
  var thndrEl = document.getElementById("thndrCount");
  if (xpEl) xpEl.textContent = xp;
  if (thndrEl) thndrEl.textContent = thndr;
}
