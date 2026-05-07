/* ════════ STORE ════════ */
var noAdsPurchased = false;
var COIN_BUNDLES = [
  { id:1, coins:100,  price:"$0.99",  label:"Starter",  color:"#2ecc71", bonus:"" },
  { id:2, coins:250,  price:"$1.99",  label:"Small",    color:"#3498db", bonus:"" },
  { id:3, coins:600,  price:"$3.99",  label:"Medium",   color:"#9b59b6", bonus:"+50 bonus" },
  { id:4, coins:1400, price:"$7.99",  label:"Large",    color:"#f39c12", bonus:"+200 bonus" },
  { id:5, coins:3000, price:"$14.99", label:"Huge",     color:"#e74c3c", bonus:"+500 bonus" },
  { id:6, coins:7000, price:"$29.99", label:"Mega",     color:"#C4922A", bonus:"+2000 bonus" },
];

function buildCoinBundles() {
  var grid = document.getElementById("coinBundleGrid");
  if(!grid) return;
  grid.innerHTML = "";
  COIN_BUNDLES.forEach(function(b) {
    var el = document.createElement("div");
    el.onclick = function(){ purchaseCoins(b); };
    el.style.cssText = "background:rgba(255,255,255,.13);border:2px solid rgba(255,255,255,.28);border-radius:16px;padding:16px 10px;text-align:center;cursor:pointer;transition:all .15s;backdrop-filter:blur(6px);";
    el.innerHTML =
      '<img src="img/figma/gold_coin.png" style="width:48px;height:48px;object-fit:contain;margin-bottom:6px;">' +
      '<div style="font-family:Orbitron,sans-serif;font-size:22px;font-weight:900;color:#FFD060;">'+b.coins+'</div>' +
      '<div style="font-size:10px;color:rgba(255,255,255,.60);margin:3px 0;">'+b.label+'</div>' +
      (b.bonus?'<div style="font-size:10px;color:#88FF66;font-weight:700;">'+b.bonus+'</div>':'')+
      '<div style="margin-top:10px;background:linear-gradient(to bottom,#88FF66,#44BB00);border-radius:10px;padding:6px 0;font-family:Orbitron,sans-serif;font-size:12px;font-weight:900;color:#fff;box-shadow:0 3px 0 #226600;">'+b.price+'</div>';
    grid.appendChild(el);
  });
}

function openStore() {
  buildCoinBundles();
  var el = document.getElementById("storeCoinDisplay");
  if(el) el.textContent = coins;
  var ov = document.getElementById("storeOverlay");
  ov.style.opacity="1"; ov.style.pointerEvents="all";
  // update nav
  document.querySelectorAll(".h-nav-btn").forEach(function(b){b.classList.remove("active");});
  var sb = document.getElementById("navStoreBtn"); if(sb) sb.classList.add("active");
}

function closeStore() {
  var ov = document.getElementById("storeOverlay");
  ov.style.opacity="0"; ov.style.pointerEvents="none";
  document.querySelectorAll(".h-nav-btn").forEach(function(b){b.classList.remove("active");});
  var hb = document.getElementById("navHomeBtn"); if(hb) hb.classList.add("active");
}

function navStore() { openStore(); }
function navHome() {
  closeStore();
  var ov = document.getElementById("storeOverlay");
  ov.style.opacity="0"; ov.style.pointerEvents="none";
}

function purchaseCoins(bundle) {
  // Simulate purchase (in real app: call in-app purchase API)
  var old = coins;
  coins += bundle.coins;
  updateCoinsDisplay();
  if(typeof updateBombBtn==="function") updateBombBtn();
  var el = document.getElementById("storeCoinDisplay");
  if(el) el.textContent = coins;
  // Flash confirmation
  showStorePurchaseMsg("+" + bundle.coins + " coins added! ??", "#2ecc71");
}

function purchaseNoAds() {
  if(noAdsPurchased) { showStorePurchaseMsg("Already purchased!", "#f39c12"); return; }
  noAdsPurchased = true;
  var btn = document.getElementById("noAdsBtnText");
  if(btn) btn.textContent = "✓ PURCHASED";
  showStorePurchaseMsg("No Ads activated! ??", "#2ecc71");
}

function showStorePurchaseMsg(msg, color) {
  var el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText = "position:fixed;top:30%;left:50%;transform:translateX(-50%);background:#111;border:1px solid "+color+";color:"+color+";padding:12px 24px;border-radius:12px;font-family:Orbitron,sans-serif;font-size:14px;font-weight:700;z-index:999;opacity:1;transition:opacity .5s;white-space:nowrap;";
  document.body.appendChild(el);
  setTimeout(function(){ el.style.opacity="0"; setTimeout(function(){ el.remove(); },500); }, 2000);
}

// Close store when clicking overlay bg
window.addEventListener("load", function(){
  var ov = document.getElementById("storeOverlay");
  if(ov) ov.addEventListener("click", function(e){ if(e.target===this) closeStore(); });
});
