/* ════════ SETTINGS ════════ */
var soundSettings = { sfx:true, bgm:true, volume:0.08 };

function openSettings() {
  updateTogglesUI();
  var ov=document.getElementById("settingsOverlay");
  ov.style.opacity="1"; ov.style.pointerEvents="all";
  document.getElementById("settingsCard").style.transform="scale(1)";
}
function closeSettings() {
  var ov=document.getElementById("settingsOverlay");
  ov.style.opacity="0"; ov.style.pointerEvents="none";
  document.getElementById("settingsCard").style.transform="scale(0.85)";
}
function updateTogglesUI() {
  document.getElementById("sfxToggle").className="toggle-wrap"+(soundSettings.sfx?" on":"");
  document.getElementById("bgmToggle").className="toggle-wrap"+(soundSettings.bgm?" on":"");
  var L=getLang();
  document.getElementById("sfxLabel").textContent=L.sfxLabel;
  document.getElementById("sfxSub").textContent=L.sfxSub;
  document.getElementById("bgmLabel").textContent=L.musicLabel;
  document.getElementById("bgmSub").textContent=L.musicSub;
  document.getElementById("langLabel").textContent=L.langLabel;
  var vl=document.getElementById("volLabel"); if(vl) vl.textContent=L.volLabel;
  document.getElementById("langSub").textContent=L.langSub;
}
function toggleSfx() { soundSettings.sfx=!soundSettings.sfx; updateTogglesUI(); onSettingsChange(); }
function toggleBgm() {
  soundSettings.bgm=!soundSettings.bgm; updateTogglesUI();
  if (soundSettings.bgm) { startBgm(); } else { stopBgm(); }
  onSettingsChange();
}
function onVolumeChange(val) {
  soundSettings.volume = parseInt(val) / 100;
  if (bgmGain) bgmGain.gain.value = soundSettings.volume;
  onSettingsChange();
}
function setLang(lang) {
  currentLang=lang;
  document.documentElement.lang=lang;
  document.documentElement.dir=(lang==="ar")?"rtl":"ltr";
  var eb=document.getElementById("langEnBtn"), ab=document.getElementById("langArBtn");
  eb.style.background=(lang==="en")?"#2ecc71":"#1a1a1a"; eb.style.color=(lang==="en")?"#fff":"#666";
  ab.style.background=(lang==="ar")?"#2ecc71":"#1a1a1a"; ab.style.color=(lang==="ar")?"#fff":"#666";
  var L=getLang();
  document.getElementById("playBtnText").textContent=L.play;
  var h=document.querySelector(".hint"); if(h) h.textContent=L.hint;
  var rs=document.querySelectorAll(".reset-btn"); for(var i=0;i<rs.length;i++) rs[i].textContent=L.resetBtn;
  var ps=document.querySelectorAll(".prev-btn");  for(var i=0;i<ps.length;i++) ps[i].textContent=L.prevBtn;
  var ns=document.querySelectorAll(".next-btn");  for(var i=0;i<ns.length;i++) ns[i].textContent=L.nextBtn;
  var wt=document.querySelector(".win-title"); if(wt) wt.textContent=L.winTitle||"CHARGED!";
  var wt=document.querySelector(".win-title"); if(wt) wt.textContent=L.winTitle||"CHARGED!";
  var wt=document.querySelector(".win-title"); if(wt) wt.textContent=L.winTitle||"CHARGED!";
  var wt=document.querySelector(".win-title"); if(wt) wt.textContent=L.winTitle||"CHARGED!";
  var wt=document.querySelector(".win-title"); if(wt) wt.textContent=L.winTitle||"CHARGED!";
  var ws=document.querySelector(".win-subtitle"); if(ws) ws.textContent=L.winSub;
  var bl=document.querySelector(".win-bat-label"); if(bl) bl.textContent=L.batteryLeft;
  var cb=document.querySelector(".win-continue-btn"); if(cb) cb.textContent=L.continueBtn||"CONTINUE";
  var bb=document.getElementById("backBtn"); if(bb) bb.textContent=(lang==="ar")?"→":"←";
  var cb=document.querySelector(".win-continue-btn"); if(cb) cb.textContent=L.continueBtn||"CONTINUE";
  var bb=document.getElementById("backBtn"); if(bb) bb.textContent=(lang==="ar")?"→":"←";
  var cb=document.querySelector(".win-continue-btn"); if(cb) cb.textContent=L.continueBtn||"CONTINUE";
  var bb=document.getElementById("backBtn"); if(bb) bb.textContent=(lang==="ar")?"→":"←";
  var cb=document.querySelector(".win-continue-btn"); if(cb) cb.textContent=L.continueBtn||"CONTINUE";
  var bb=document.getElementById("backBtn"); if(bb) bb.textContent=(lang==="ar")?"→":"←";
  var cb=document.querySelector(".win-continue-btn"); if(cb) cb.textContent=L.continueBtn||"CONTINUE";
  var bb=document.getElementById("backBtn"); if(bb) bb.textContent=(lang==="ar")?"→":"←";
  updateTogglesUI();
  buildLevelMap(false);
  if (!document.getElementById("gameView").classList.contains("hidden")) setMsg(L.msgStart);
  onSettingsChange();
}

/* ════════ WIN OVERLAY ════════ */
/* ════════ WIN OVERLAY ════════ */
var confettiParticles=[], confettiAnim=null;
function showWinOverlay(battPct, reward) {
  var L=getLang();
  document.getElementById("winBattery").textContent=battPct+"%";
  var xpBanner=document.getElementById("winXpReward");
  var thndrBanner=document.getElementById("winThndrReward");
  if (xpBanner && reward) xpBanner.textContent="+"+(reward.xp||0)+" XP";
  if (thndrBanner && reward) thndrBanner.textContent="+"+(reward.thndr||0)+" ⚡";
  var wt2=document.querySelector(".win-title"); if(wt2) wt2.textContent=L.winTitle||"CHARGED!";
  document.querySelector(".win-subtitle").textContent=L.winSub;
  document.querySelector(".win-bat-label").textContent=L.batteryLeft;
  var cb2=document.querySelector(".win-continue-btn"); if(cb2) cb2.textContent=L.continueBtn||"CONTINUE";
  var stars=document.querySelectorAll("#winStars span");
  for (var i=0;i<stars.length;i++) { stars[i].classList.remove("lit"); stars[i].style.opacity="0"; }
  document.getElementById("winOverlay").classList.add("show");
  setTimeout(function(){ stars[0].classList.add("lit"); },400);
  setTimeout(function(){ stars[1].classList.add("lit"); },650);
  setTimeout(function(){ stars[2].classList.add("lit"); },900);
  startConfetti();
}
function hideWinOverlay() { document.getElementById("winOverlay").classList.remove("show"); stopConfetti(); }
function onContinue() { hideWinOverlay(); saveProgress(); setTimeout(function(){ goHome(true); },350); }
function startConfetti() {
  var c=document.getElementById("confettiCanvas"); c.width=window.innerWidth; c.height=window.innerHeight;
  var cx=c.getContext("2d"); confettiParticles=[];
  var cols=["#2ecc71","#f39c12","#3498db","#e74c3c","#9b59b6","#fff"];
  for (var i=0;i<120;i++) confettiParticles.push({x:Math.random()*c.width,y:Math.random()*c.height-c.height,w:Math.random()*10+5,h:Math.random()*6+3,color:cols[Math.floor(Math.random()*cols.length)],rot:Math.random()*360,vx:(Math.random()-0.5)*2,vy:Math.random()*3+2,vr:(Math.random()-0.5)*8});
  function loop() {
    cx.clearRect(0,0,c.width,c.height); var alive=false;
    for (var i=0;i<confettiParticles.length;i++) {
      var p=confettiParticles[i]; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
      if (p.y<c.height+20) alive=true;
      cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot*Math.PI/180);
      cx.fillStyle=p.color; cx.globalAlpha=Math.max(0,1-p.y/c.height);
      cx.fillRect(-p.w/2,-p.h/2,p.w,p.h); cx.restore();
    }
    if (alive) confettiAnim=requestAnimationFrame(loop);
  }
  confettiAnim=requestAnimationFrame(loop);
}
function stopConfetti() {
  if (confettiAnim) { cancelAnimationFrame(confettiAnim); confettiAnim=null; }
  var c=document.getElementById("confettiCanvas"); c.getContext("2d").clearRect(0,0,c.width,c.height);
}

/* ════════ LOSE OVERLAY ════════ */

/* ════════ LOSE OVERLAY ════════ */
var loseSadAnim = null;

function showLoseOverlay() {
  deductLife();
  var overlay = document.getElementById("loseOverlay");
  var isAr = (currentLang === "ar");
  var lvlLbl = document.getElementById("loseLevelLabel");
  if(lvlLbl) lvlLbl.textContent = "Level " + (levelIdx+1);
  var lifeCount = document.getElementById("loseLifeCount");
  if(lifeCount) lifeCount.textContent = lives;
  var retryLbl = document.getElementById("loseRetryLabel");
  if(retryLbl) retryLbl.textContent = isAr ? "حاول مجددا" : "TRY AGAIN";
  var titleEl = document.getElementById("loseTitle");
  if(titleEl) titleEl.textContent = isAr ? "فشلت!" : "You Failed";
  var homeLbl = document.getElementById("loseHomeLabel");
  if(homeLbl) homeLbl.textContent = isAr ? "الرئيسية" : "HOME";
  if(lives <= 0) {
    var rb = document.querySelector(".lose-retry-btn");
    if(rb) { rb.disabled=true; rb.style.opacity="0.35"; }
  } else {
    var rb = document.querySelector(".lose-retry-btn");
    if(rb) { rb.disabled=false; rb.style.opacity="1"; }
  }
  overlay.classList.add("show");
  overlay.style.opacity="1"; overlay.style.pointerEvents="all";
  startSadConfetti();
  stopBgm();
  playSadSfx();
}
function hideLoseOverlay() {
  var overlay = document.getElementById("loseOverlay");
  overlay.classList.remove("show");
  overlay.style.opacity="0"; overlay.style.pointerEvents="none";
  stopSadConfetti();
}

function onRetry() {
  hideLoseOverlay();
  resetLevel();
  startBgm();
}

function onLoseHome() {
  hideLoseOverlay();
  goHome(false);
}

function startSadConfetti() {
  var c = document.getElementById("loseConfettiCanvas");
  c.width = window.innerWidth; c.height = window.innerHeight;
  var cx = c.getContext("2d");
  var particles = [];
  var sadCols = ["#555","#e74c3c","#333","#7f8c8d","#2c3e50","#666"];
  for (var i=0;i<60;i++) {
    particles.push({
      x:Math.random()*c.width, y:-20,
      w:Math.random()*8+4, h:Math.random()*5+3,
      color:sadCols[Math.floor(Math.random()*sadCols.length)],
      rot:Math.random()*360, vx:(Math.random()-0.5)*1.5,
      vy:Math.random()*1.5+0.8, vr:(Math.random()-0.5)*4,
      alpha:0.6+Math.random()*0.3
    });
  }
  function loop() {
    cx.clearRect(0,0,c.width,c.height);
    for (var i=0;i<particles.length;i++) {
      var p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
      if(p.y>c.height+20) { p.y=-20; p.x=Math.random()*c.width; }
      cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot*Math.PI/180);
      cx.globalAlpha=p.alpha;
      cx.fillStyle=p.color; cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      cx.restore();
    }
    loseSadAnim = requestAnimationFrame(loop);
  }
  loseSadAnim = requestAnimationFrame(loop);
}

function stopSadConfetti() {
  if(loseSadAnim){ cancelAnimationFrame(loseSadAnim); loseSadAnim=null; }
  var c=document.getElementById("loseConfettiCanvas");
  if(c) c.getContext("2d").clearRect(0,0,c.width,c.height);
}

function playSadSfx() {
  try {
    var ctx = getAudioCtx();
    if(ctx.state==="suspended") ctx.resume();
    // Descending sad tone using oscillator
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    var now = ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(220, now+0.5);
    osc.frequency.linearRampToValueAtTime(180, now+1.0);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0, now+1.2);
    osc.start(now); osc.stop(now+1.2);
    // Second lower tone
    var osc2  = ctx.createOscillator();
    var gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(330, now+0.3);
    osc2.frequency.linearRampToValueAtTime(165, now+0.9);
    gain2.gain.setValueAtTime(0.12, now+0.3);
    gain2.gain.linearRampToValueAtTime(0, now+1.1);
    osc2.start(now+0.3); osc2.stop(now+1.2);
  } catch(e) { console.log("sad sfx err",e); }
}

document.addEventListener("click",function(e){
  var el=e.target;
  if(el.tagName==="BUTTON"||el.closest("button")||el.classList.contains("lnode")||el.classList.contains("powerup-btn")){
    if(typeof playClickSfx==="function") playClickSfx();
  }
},true);
