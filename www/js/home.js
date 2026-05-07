/* ════════ LIVES ════════ */
var lives = 5; var maxLives = 5;
function updateLivesDisplay() {
  var el = document.getElementById("livesCount");
  var lbl = document.querySelector(".h-stat-label");
  if (el) el.textContent = lives;
  if (lbl) lbl.textContent = lives >= maxLives ? "MAX" : "";
  var ge = document.getElementById("livesCountGame");
  if (ge) ge.textContent = lives;
}
function deductLife() {
  if (lives > 0) lives--;
  updateLivesDisplay();
}

/* ════════ HOME STATE ════════ */
var completedLevels=new Set(), selectedLevel=0, pendingUnlock=-1;

function buildLevelMap(animateUnlock) {
  var map=document.getElementById("levelMap"); map.innerHTML="";
  var L=getLang();
  var pendingUnlockIdx = animateUnlock ? pendingUnlock : -1;
  for (var i=LEVELS.length-1;i>=0;i--) {
    var isDone=completedLevels.has(i), isCurrent=(i===selectedLevel), isLocked=(i>selectedLevel&&!isDone);
    var cls=isLocked?"locked":isDone?"done":isCurrent?"current":"open";
    if (i===selectedLevel) cls+=" selected";
    var wrap=document.createElement("div"); wrap.className="lnode-wrap";
    var node=document.createElement("div"); node.className="lnode "+cls; node.id="lnode-"+i;
    var lockOrNum=isLocked?'<img src="img/figma/lock.png" style="width:26px;height:26px;object-fit:contain;opacity:.75;">':String(i+1);
    var diff=isLocked?L.locked:L.difficulty[i];
    var stars="";
    if (isDone) stars='<div class="lnode-stars"><img src="img/figma/star.png" class="lnode-star"><img src="img/figma/star.png" class="lnode-star"><img src="img/figma/star.png" class="lnode-star"></div>';
    else if (isCurrent) stars='<div class="lnode-stars"><img src="img/figma/star.png" class="lnode-star lnode-star-empty"><img src="img/figma/star.png" class="lnode-star lnode-star-empty"><img src="img/figma/star.png" class="lnode-star lnode-star-empty"></div>';
    node.innerHTML='<div class="lnode-num">'+lockOrNum+'</div>'+stars;
    if (!isLocked) { (function(idx){ node.onclick=function(){ selectedLevel=idx; buildLevelMap(false); }; })(i); }
    wrap.appendChild(node);
    var badge=document.createElement("div"); badge.className="lnode-diff-badge"; badge.textContent=diff;
    wrap.appendChild(badge);
    map.appendChild(wrap);
    if (i>0) {
      var conn=document.createElement("div");
      var connClass;
      // conn-i sits BELOW node-i, ABOVE node-(i-1)
      // Green only if node-(i-1) is completed (player passed through it)
      // The connector ABOVE selectedLevel must stay dark
      if (animateUnlock && i === pendingUnlockIdx) {
        // This connector will be animated from dark to green
        connClass = "locked";
      } else if (completedLevels.has(i-1) && i-1 < selectedLevel) {
        // Both sides below current — fully completed path
        connClass = "done";
      } else if (i-1 === selectedLevel - 1 && completedLevels.has(i-1)) {
        // Connector just below current level (between completed and current)
        connClass = "open";
      } else if (i <= selectedLevel && completedLevels.has(i-1)) {
        connClass = "done";
      } else {
        connClass = "locked";
      }
      conn.className="connector "+connClass;
      conn.id="conn-"+i; map.appendChild(conn);
    }
  }
  setTimeout(function(){
    var ns=map.querySelectorAll(".lnode"), idx=LEVELS.length-1-selectedLevel;
    if (ns[idx]) ns[idx].scrollIntoView({block:"center",behavior:"smooth"});
  },80);
  if (animateUnlock&&pendingUnlock>=0) {
    var ui=pendingUnlock; pendingUnlock=-1;
    setTimeout(function(){ animateUnlockNode(ui); },600);
  }
}


function spawnNodeConfetti(node) {
  var colors = ["#f39c12","#2ecc71","#e74c3c","#3498db","#fff","#f1c40f"];
  var rect = node.getBoundingClientRect();
  var cx = rect.left + rect.width/2;
  var cy = rect.top + rect.height/2;
  for (var i = 0; i < 14; i++) {
    var el = document.createElement("div");
    el.className = "mini-conf";
    el.style.background = colors[i % colors.length];
    var angle = (i / 14) * 360;
    var rad = angle * Math.PI / 180;
    var dist = 30 + Math.random() * 20;
    el.style.left = (cx + Math.cos(rad)*dist - 3) + "px";
    el.style.top  = (cy + Math.sin(rad)*dist - 3) + "px";
    el.style.animationDelay = (i * 0.03) + "s";
    el.style.transform = "rotate(" + angle + "deg)";
    document.body.appendChild(el);
    setTimeout(function(e){ if(e.parentNode) e.parentNode.removeChild(e); }, 900, el);
  }
}

function animateUnlockNode(newIdx) {
  var completedIdx  = newIdx - 1;
  var completedNode = document.getElementById("lnode-" + completedIdx);
  // conn-newIdx sits between completed node (newIdx-1) and new node (newIdx)
  var conn = document.getElementById("conn-" + newIdx);
  var newNode       = document.getElementById("lnode-" + newIdx);
  if (!newNode) return;
  var L = getLang();

  setTimeout(function(){
    newNode.scrollIntoView({ block:"center", behavior:"smooth" });
  }, 100);

  // Phase 1: Confetti + stars on completed node
  setTimeout(function(){
    if (completedNode) {
      // Glow border
      completedNode.style.animation = "celebGlow 0.35s ease-in-out 3";
      completedNode.style.borderColor = "#f39c12";
      // Spawn confetti
      spawnNodeConfetti(completedNode);
      // Light up 3 stars one by one
      var starsWrap = completedNode.querySelector(".lnode-stars");
      if (starsWrap) {
        var spans = starsWrap.querySelectorAll(".lnode-star");
        for (var si=0; si<spans.length; si++) {
          (function(s, delay){
            setTimeout(function(){
              s.className = "node-star-pop";
              s.style.filter = "drop-shadow(0 0 6px #f39c12) brightness(1.1)"; s.style.opacity = "1";
            }, delay);
          })(spans[si], si * 180);
        }
      }
      setTimeout(function(){
        if (completedNode) { completedNode.style.animation = ""; completedNode.style.borderColor = ""; }
      }, 1100);
    }
  }, 150);

  // Phase 2: Connector fills
  setTimeout(function(){
    if (conn) {
      conn.className = "connector filling";
      setTimeout(function(){ if (conn) conn.className = "connector open"; }, 500);
    }
  }, 950);

  // Phase 3: Lock wiggles
  setTimeout(function(){
    var lockEl = newNode.querySelector(".lnode-num");
    if (lockEl) lockEl.style.animation = "lockWiggle 0.4s ease-in-out";
  }, 1600);

  // Phase 4: Lock out, number in
  setTimeout(function(){
    var lockEl = newNode.querySelector(".lnode-num");
    if (lockEl) lockEl.style.animation = "lockFadeOut 0.2s ease-in forwards";
    setTimeout(function(){
      playUnlockSfx();
      newNode.className = "lnode current selected";
      newNode.removeAttribute("style");
      newNode.innerHTML =
        '<div class="lnode-num" style="animation:numReveal 0.4s cubic-bezier(.36,1.56,.64,1) forwards;opacity:0;">'
        + (newIdx + 1) + '</div>'
        + '<div class="lnode-stars">'
        + '<img src="img/figma/star.png" class="lnode-star lnode-star-empty">'
        + '<img src="img/figma/star.png" class="lnode-star lnode-star-empty">'
        + '<img src="img/figma/star.png" class="lnode-star lnode-star-empty">'
        + '</div>';
      var wrap = newNode.parentNode;
      if (wrap) { var b = wrap.querySelector(".lnode-diff-badge"); if (b) b.textContent = L.difficulty[newIdx]; }
      newNode.onclick = function(){ selectedLevel = newIdx; buildLevelMap(false); };

      // Phase 5: Ring ripple + glow
      setTimeout(function(){
        newNode.style.animation = "newNodeRing 0.5s ease-out, newNodeGlow 0.8s ease-in-out 2";
        setTimeout(function(){ newNode.style.animation = ""; }, 2000);
      }, 200);
    }, 200);
  }, 2000);
}

function startSelectedLevel() {
  levelIdx=selectedLevel;
  updateBombBtn();
  document.getElementById("homeView").classList.add("hidden");
  document.getElementById("gameView").classList.remove("hidden");
  syncGameTopbar();
  resize(); resetLevel(); startBgm();
}
function goHome(withUnlock) {
  clearInterval(battTimer); clearInterval(phoneTimer); stopBgm();
  document.getElementById("gameView").classList.add("hidden");
  document.getElementById("homeView").classList.remove("hidden");
  buildLevelMap(withUnlock);
}

/* ════════ PROFILE / AVATAR ════════ */
/* ════════ PROFILE / AVATAR ════════ */
var AVATARS = ["😎","🦁","🐯","🦊","🐺","🤖","👾","🧙","🥷","🦸","👑","🐲","🔥","⚡","🌙"];
var profile = { name:"Player", avatar:"😎" };

function openAvatarModal() {
  // Populate grid
  var grid = document.getElementById("avatarGrid");
  grid.innerHTML = "";
  AVATARS.forEach(function(av) {
    var btn = document.createElement("button");
    btn.textContent = av;
    btn.style.cssText = "font-size:28px;background:"+(av===profile.avatar?"#1a3a1a":"#0d1117")+";border:2px solid "+(av===profile.avatar?"#2ecc71":"#222")+";border-radius:10px;padding:6px;cursor:pointer;transition:all .15s;";
    btn.onclick = function() {
      profile.avatar = av;
      document.getElementById("avatarBig").textContent = av;
      grid.querySelectorAll("button").forEach(function(b){
        b.style.background="#0d1117"; b.style.borderColor="#222";
      });
      btn.style.background="#1a3a1a"; btn.style.borderColor="#2ecc71";
    };
    grid.appendChild(btn);
  });
  document.getElementById("avatarBig").textContent = profile.avatar;
  document.getElementById("nameInput").value = profile.name;
  var modal = document.getElementById("avatarModal");
  var card  = document.getElementById("avatarCard");
  modal.style.opacity="1"; modal.style.pointerEvents="all";
  card.style.transform="scale(1)";
}

function closeAvatarModal() {
  var modal = document.getElementById("avatarModal");
  var card  = document.getElementById("avatarCard");
  modal.style.opacity="0"; modal.style.pointerEvents="none";
  card.style.transform="scale(0.85)";
}

function syncGameTopbar() {
  var gAvatar = document.getElementById("avatarDisplayGame");
  var gName   = document.getElementById("avatarNameGame");
  var gLives  = document.getElementById("livesCountGame");
  var gCoins  = document.getElementById("coinCountGame");
  if (gAvatar) gAvatar.textContent = profile.avatar;
  if (gName)   gName.textContent   = profile.name;
  if (gLives)  gLives.textContent  = lives;
  if (gCoins)  gCoins.textContent  = document.getElementById("coinCount") ? document.getElementById("coinCount").textContent : "380";
}
function saveProfile() {
  var nameVal = document.getElementById("nameInput").value.trim();
  if (nameVal) profile.name = nameVal;
  document.getElementById("avatarDisplay").textContent = profile.avatar;
  document.getElementById("avatarName").textContent    = profile.name;
  var mr = document.getElementById("menuAvatarRing");
  var mn = document.getElementById("menuPlayerName");
  if (mr) mr.textContent = profile.avatar;
  if (mn) mn.textContent = profile.name;
  closeAvatarModal();
  if (typeof saveProgress === "function") saveProgress();
}

function navHome()  { /* already on home */ }
function navStore() { /* store coming soon */ }

/* ════════ HAMBURGER MENU ════════ */
function openMenu() {
  var drawer = document.getElementById("menuDrawer");
  var btn    = document.getElementById("hamburgerBtn");
  // sync stats
  var mr = document.getElementById("menuAvatarRing");
  var mn = document.getElementById("menuPlayerName");
  var ml = document.getElementById("menuLivesVal");
  var mc = document.getElementById("menuCoinsVal");
  var mx = document.getElementById("menuXpVal");
  if (mr) mr.textContent = profile.avatar;
  if (mn) mn.textContent = profile.name;
  if (ml) ml.textContent = lives;
  if (mc) mc.textContent = document.getElementById("coinCount") ? document.getElementById("coinCount").textContent : "0";
  if (mx) mx.textContent = document.getElementById("xpCount") ? document.getElementById("xpCount").textContent : "0";
  if (drawer) drawer.classList.add("open");
  if (btn) btn.classList.add("open");
}
function closeMenu() {
  var drawer = document.getElementById("menuDrawer");
  var btn    = document.getElementById("hamburgerBtn");
  if (drawer) drawer.classList.remove("open");
  if (btn) btn.classList.remove("open");
}

window.addEventListener("load", function() {
  document.getElementById("avatarDisplay").textContent = profile.avatar;
  document.getElementById("avatarName").textContent    = profile.name;
  // close avatar modal on bg click
  document.getElementById("avatarModal").addEventListener("click", function(e){
    if(e.target===this) closeAvatarModal();
  });
});
