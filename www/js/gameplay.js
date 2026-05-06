/* ════════ GAME ════════ */
var canvas=document.getElementById("canvas"), ctx2=canvas.getContext("2d"), CELL, SIZE;
var levelIdx=0, level=LEVELS[0], paths={}, drawing=null;
var phonePos={x:level.phone.x,y:level.phone.y}, battery=100, won=false, battTimer=null, phoneTimer=null;

function resize() {
  var topBar  = document.querySelector(".game-topbar");
  var msgEl   = document.getElementById("msg");
  var battEl  = document.getElementById("bigBattWrap");
  var puBar   = document.querySelector(".powerup-bar");
  var topH    = (topBar  ? topBar.offsetHeight  : 50) + 8;
  var msgH    = (msgEl   ? msgEl.offsetHeight   : 32) + 4;
  var battH   = (battEl  ? battEl.offsetHeight  : 30) + 4;
  var puH     = (puBar   ? puBar.offsetHeight   : 90) + 8;
  var padding = 24;
  var available = window.innerHeight - topH - msgH - battH - puH - padding;
  var maxByW  = window.innerWidth - 20;
  var maxW    = Math.min(maxByW, available);
  if (maxW < 100) maxW = maxByW;
  CELL = Math.floor(maxW / GRID); SIZE = CELL * GRID;
  canvas.width=SIZE; canvas.height=SIZE;
  canvas.style.width=SIZE+"px"; canvas.style.height=SIZE+"px";
  // Center the canvas horizontally
  canvas.style.marginLeft="auto"; canvas.style.marginRight="auto";
  draw();
}
function setMsg(txt,color) { var el=document.getElementById("msg"); el.textContent=txt; el.style.color=color||"#888"; }
function updateHeader() {
  var b=battery, bc=b>60?"#2ecc71":b>30?"#f39c12":"#e74c3c";
  document.getElementById("battFill").style.width=b+"%"; document.getElementById("battFill").style.background=bc;
  document.getElementById("battPct").style.color=bc; document.getElementById("battPct").textContent=b+"%";
  document.getElementById("connCount").textContent=Object.keys(paths).length+"/"+level.outlets.length+" \u26A1";
  document.getElementById("levelLabel").textContent=level.label+" \u2014 "+getLang().difficulty[levelIdx];
  var pb=document.getElementById("prevBtn"); if(pb) pb.style.display=levelIdx>0?"":"none";
  var nb=document.getElementById("nextBtn"); if(nb) nb.style.display=levelIdx<LEVELS.length-1?"":"none";
  // Big battery bar
  var bf=document.getElementById("bigBattFill");
  var bp=document.getElementById("bigBattPct");
  var bb=document.getElementById("big-batt-bar") || (bf && bf.parentElement);
  if(bf) {
    bf.style.width=b+"%";
    // Color gradient: green->orange->red as battery drops
    var pct = b/100;
    bf.style.backgroundPosition=(100-b)+"% 0";
  }
  if(bp) bp.textContent=b+"%";
  // Danger pulse
  var bbar = document.querySelector(".big-batt-bar");
  if(bbar) {
    if(b<=20) bbar.classList.add("danger");
    else bbar.classList.remove("danger");
  }
}
function resetLevel() {
  clearInterval(battTimer); clearInterval(phoneTimer);
  if(typeof deactivateBombMode==="function") deactivateBombMode();
  level=LEVELS[levelIdx]; paths={}; drawing=null;
  phonePos={x:level.phone.x,y:level.phone.y}; battery=100; won=false;
  setMsg(getLang().msgStart); updateHeader(); draw();
  battTimer=setInterval(function(){
    if (won) return; battery=Math.max(0,battery-1); updateHeader();
    if (battery<=0) { clearInterval(battTimer); clearInterval(phoneTimer); setTimeout(function(){ showLoseOverlay(); }, 300); }
  },400);
  if (level.moveEvery) {
    phoneTimer=setInterval(function(){
      if (won) return;
      var dirs=[{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
      var valid=dirs.filter(function(d){
        var nx=phonePos.x+d.dx,ny=phonePos.y+d.dy;
        return nx>=0&&nx<GRID&&ny>=0&&ny<GRID&&!level.walls.some(function(w){return w.x===nx&&w.y===ny;})&&!level.outlets.some(function(o){return o.x===nx&&o.y===ny;});
      });
      if (!valid.length) return;
      var d=valid[Math.floor(Math.random()*valid.length)];
      phonePos={x:phonePos.x+d.dx,y:phonePos.y+d.dy}; paths={}; drawing=null;
      setMsg(getLang().msgMoved); draw();
    },level.moveEvery);
  }
}
function changeLevel(dir) { levelIdx=Math.max(0,Math.min(LEVELS.length-1,levelIdx+dir)); selectedLevel=levelIdx; resetLevel(); }
function getCell(e) {
  var r=canvas.getBoundingClientRect(), t=e.touches?e.touches[0]:e;
  var x=Math.floor((t.clientX-r.left)*(GRID/r.width)), y=Math.floor((t.clientY-r.top)*(GRID/r.height));
  if (x<0||x>=GRID||y<0||y>=GRID) return null; return {x:x,y:y};
}
function usedByOther(x,y,id) {
  return Object.entries(paths).some(function(e){ return +e[0]!==id&&e[1].some(function(pt){return pt.x===x&&pt.y===y;}); });
}
canvas.addEventListener("mousedown",onStart); canvas.addEventListener("mousemove",onMove);
canvas.addEventListener("mouseup",onEnd); canvas.addEventListener("mouseleave",onEnd);
canvas.addEventListener("touchstart",onStart,{passive:false}); canvas.addEventListener("touchmove",onMove,{passive:false}); canvas.addEventListener("touchend",onEnd,{passive:false});
function onStart(e) {
  e.preventDefault();
  var cell=getCell(e); if(!cell) return;
  if(bombModeActive){
    var wi=-1;
    for(var i=0;i<level.walls.length;i++){
      if(level.walls[i].x===cell.x&&level.walls[i].y===cell.y){wi=i;break;}
    }
    if(wi>=0){
      level.walls.splice(wi,1);
      paths={}; drawing=null; bombModeActive=false;
      if(!bombUsedFree){bombUsedFree=true; updateBombBtn();}
      var bb=document.getElementById("pu-bomb"); if(bb) bb.style.borderColor="#2ecc71";
      setMsg("Blocker destroyed!","#2ecc71");
      draw(); return;
    } else { setMsg("Tap a blocker!","#e74c3c"); return; }
  }
  if(won||battery<=0) return;
  var o=level.outlets.find(function(o){return o.x===cell.x&&o.y===cell.y;}); if(!o) return;
  delete paths[o.id]; drawing={id:o.id,path:[cell]}; setMsg(getLang().msgWire(o.id+1)); draw();
}

function onMove(e) {
  e.preventDefault(); if (!drawing) return;
  var cell=getCell(e); if (!cell) return;
  var x=cell.x,y=cell.y,path=drawing.path,last=path[path.length-1];
  if (last.x===x&&last.y===y) return;
  if (Math.abs(x-last.x)+Math.abs(y-last.y)!==1) return;
  if (level.walls.some(function(w){return w.x===x&&w.y===y;})) return;
  if (level.outlets.some(function(o){return o.x===x&&o.y===y&&o.id!==drawing.id;})) return;
  if (path.length>=2&&path[path.length-2].x===x&&path[path.length-2].y===y) { drawing.path=path.slice(0,-1); draw(); return; }
  if (path.slice(0,-1).some(function(pt){return pt.x===x&&pt.y===y;})) return;
  if (!(x===phonePos.x&&y===phonePos.y)&&usedByOther(x,y,drawing.id)) { setMsg(getLang().msgCross); return; }
  if (x===phonePos.x&&y===phonePos.y) {
    paths[drawing.id]=path.concat([{x:x,y:y}]); drawing=null;
    var done=Object.keys(paths).length,total=level.outlets.length; updateHeader();
    if (done>=total) {
      won=true; clearInterval(battTimer); clearInterval(phoneTimer);
      var wasNew=!completedLevels.has(levelIdx); completedLevels.add(levelIdx);
      if (wasNew&&levelIdx+1<LEVELS.length) { selectedLevel=levelIdx+1; pendingUnlock=levelIdx+1; }
      draw(); playWinSfx(); setTimeout(function(){ showWinOverlay(battery); },500);
    } else { setMsg(getLang().msgDone(done,total)); }
    draw(); return;
  }
  drawing.path=path.concat([{x:x,y:y}]); draw();
}
function onEnd(e) { e.preventDefault(); drawing=null; draw(); }
function draw() {
  if (!CELL) return;
  ctx2.clearRect(0,0,SIZE,SIZE); ctx2.fillStyle="#111600"; ctx2.fillRect(0,0,SIZE,SIZE);
  ctx2.strokeStyle="#1e2400"; ctx2.lineWidth=0.5;
  for (var i=0;i<=GRID;i++){ctx2.beginPath();ctx2.moveTo(i*CELL,0);ctx2.lineTo(i*CELL,SIZE);ctx2.stroke();ctx2.beginPath();ctx2.moveTo(0,i*CELL);ctx2.lineTo(SIZE,i*CELL);ctx2.stroke();}
  for (var r=0;r<GRID;r++) for (var c=0;c<GRID;c++){ctx2.fillStyle="#252d00";ctx2.beginPath();ctx2.arc(c*CELL+CELL/2,r*CELL+CELL/2,2,0,Math.PI*2);ctx2.fill();}
  level.walls.forEach(function(w){
    ctx2.fillStyle=bombModeActive?"#3a0000":"#1e1e1e";
    ctx2.strokeStyle=bombModeActive?"#e74c3c":"#3a3a3a";
    ctx2.lineWidth=bombModeActive?2:1;
    ctx2.beginPath();ctx2.roundRect(w.x*CELL+4,w.y*CELL+4,CELL-8,CELL-8,6);ctx2.fill();ctx2.stroke();
    ctx2.font=(CELL*0.35)+"px sans-serif";ctx2.textAlign="center";ctx2.textBaseline="middle";
    ctx2.fillText(bombModeActive?"??":"??",w.x*CELL+CELL/2,w.y*CELL+CELL/2);
  });
  var all=Object.assign({},paths); if (drawing) all[drawing.id]=drawing.path;
  Object.entries(all).forEach(function(e){
    var id=+e[0],path=e[1]; if (path.length<2) return;
    ctx2.strokeStyle=COLORS[id];ctx2.lineWidth=Math.max(8,CELL*0.22);ctx2.lineCap="round";ctx2.lineJoin="round";ctx2.globalAlpha=0.78;
    ctx2.beginPath(); path.forEach(function(p,i){var px=p.x*CELL+CELL/2,py=p.y*CELL+CELL/2;i===0?ctx2.moveTo(px,py):ctx2.lineTo(px,py);}); ctx2.stroke();ctx2.globalAlpha=1;
  });
  level.outlets.forEach(function(o){
    var connected=!!paths[o.id],active=drawing&&drawing.id===o.id;
    var cx=o.x*CELL+CELL/2,cy=o.y*CELL+CELL/2;
    if(connected||active){ctx2.fillStyle=COLORS[o.id]+"33";ctx2.beginPath();ctx2.arc(cx,cy,CELL*0.46,0,Math.PI*2);ctx2.fill();}
    ctx2.fillStyle=connected?COLORS[o.id]:"#111";ctx2.strokeStyle=COLORS[o.id];ctx2.lineWidth=3;
    var s=CELL*0.42;ctx2.beginPath();ctx2.roundRect(cx-s,cy-s,s*2,s*2,10);ctx2.fill();ctx2.stroke();
    ctx2.font=(CELL*0.38)+"px serif";ctx2.textAlign="center";ctx2.textBaseline="middle";
    ctx2.fillText(connected?"\u26A1":"\uD83D\uDD0C",cx,cy+1);
  });
  var ph=phonePos,px=ph.x*CELL+CELL/2,py=ph.y*CELL+CELL/2;
  var bc=battery>60?"#2ecc71":battery>30?"#f39c12":"#e74c3c";
  var conn=Object.keys(paths).length;
  if(conn>0){ctx2.fillStyle="#2ecc7133";ctx2.beginPath();ctx2.arc(px,py,CELL*0.55,0,Math.PI*2);ctx2.fill();}
  ctx2.fillStyle="#1a1a1a";ctx2.strokeStyle=won?"#2ecc71":battery<=20?"#e74c3c":"#777";ctx2.lineWidth=3;
  var pw=CELL*0.42,ph2=CELL*0.55;
  ctx2.beginPath();ctx2.roundRect(px-pw,py-ph2,pw*2,ph2*2,10);ctx2.fill();ctx2.stroke();
  ctx2.font=(CELL*0.42)+"px serif";ctx2.textAlign="center";ctx2.textBaseline="middle";
  ctx2.fillText(won?"\uD83D\uDD0B":"\uD83D\uDCF1",px,py-ph2*0.18);
  ctx2.fillStyle="#222";ctx2.beginPath();ctx2.roundRect(px-pw*0.7,py+ph2*0.38,pw*1.4,5,2);ctx2.fill();
  ctx2.fillStyle=bc;ctx2.beginPath();ctx2.roundRect(px-pw*0.7,py+ph2*0.38,pw*1.4*(battery/100),5,2);ctx2.fill();
  ctx2.font="bold "+(CELL*0.22)+"px sans-serif";ctx2.fillStyle="#fff";
  ctx2.fillText(conn+"/"+level.outlets.length,px,py+ph2*0.72);
  updateHeader();
}

/* ════════ POWER-UPS ════════ */
/* ════════ POWER-UPS ════════ */
var powerups = { hint:0, reset:0, time:0, freeze:0, bomb:1 };
var bombUsedFree=false; var BOMB_COST=100; var coins=380; var bombModeActive=false;
var freezeActive = false;

function usePowerup(type) {
  if (won || battery <= 0) return;
  if (powerups[type] <= 0) return;

  if (type === 'hint') {
    // Flash an unconnected outlet
    var unconnected = level.outlets.filter(function(o){ return !paths[o.id]; });
    if (!unconnected.length) return;
    var o = unconnected[0];
    powerups.hint--;
    document.getElementById('pu-hint-count').textContent = 'x'+powerups.hint;
    if (powerups.hint<=0) document.getElementById('pu-hint').classList.add('disabled');
    // Flash the outlet on canvas
    var flashes=0, fi=setInterval(function(){
      flashes++;
      var el=document.getElementById('pu-hint');
      el.style.borderColor=flashes%2===0?'#1e3a1e':'#f39c12';
      if(flashes>=6){clearInterval(fi);el.style.borderColor='';}
    },150);
    setMsg('Hint: start from outlet '+(o.id+1)+'!','#f39c12');

  } else if (type === 'reset') {
    paths={}; drawing=null; draw();
    setMsg(getLang().msgStart);

  } else if (type === 'time') {
    powerups.time--;
    document.getElementById('pu-time-count').textContent='x'+powerups.time;
    if(powerups.time<=0) document.getElementById('pu-time').classList.add('disabled');
    battery=Math.min(100,battery+25); updateHeader();
    setMsg('+25% battery!','#2ecc71');

  } else if (type === 'freeze') {
    if (freezeActive) return;
    powerups.freeze--;
    document.getElementById('pu-freeze-count').textContent='x'+powerups.freeze;
    if(powerups.freeze<=0) document.getElementById('pu-freeze').classList.add('disabled');
    freezeActive=true;
    var fb=document.getElementById('pu-freeze');
    fb.style.borderColor='#3498db';
    setMsg('Phone frozen for 5s!','#3498db');
    clearInterval(phoneTimer);
    setTimeout(function(){
      freezeActive=false; fb.style.borderColor='';
      if(level.moveEvery&&!won){
        phoneTimer=setInterval(function(){
          if(won) return;
          var dirs=[{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
          var valid=dirs.filter(function(d){
            var nx=phonePos.x+d.dx,ny=phonePos.y+d.dy;
            return nx>=0&&nx<GRID&&ny>=0&&ny<GRID&&!level.walls.some(function(w){return w.x===nx&&w.y===ny;})&&!level.outlets.some(function(o){return o.x===nx&&o.y===ny;});
          });
          if(!valid.length) return;
          var d=valid[Math.floor(Math.random()*valid.length)];
          phonePos={x:phonePos.x+d.dx,y:phonePos.y+d.dy};
          paths={}; drawing=null; setMsg(getLang().msgMoved); draw();
        },level.moveEvery);
      }
    },5000);

  } else if (type==="bomb") {
    if(level.walls.length===0){ setMsg("No blockers!","#f39c12"); return; }
    if(!bombUsedFree){
      activateBombMode();
    } else {
      if(coins<BOMB_COST){ setMsg("Need 100 coins!","#e74c3c"); return; }
      coins-=BOMB_COST; updateCoinsDisplay(); activateBombMode();
    }
  }
}

function resetPowerups() {
  powerups={hint:0,reset:0,time:0,freeze:0};
  document.getElementById('pu-hint-count').textContent='🔒';
  document.getElementById('pu-time-count').textContent='🔒';
  document.getElementById('pu-freeze-count').textContent='🔒';
  var btns=['pu-hint','pu-reset','pu-time','pu-freeze'];
  for(var i=0;i<btns.length;i++) document.getElementById(btns[i]).classList.remove('disabled');
}


function activateBombMode() {
  if(bombModeActive) return;
  bombModeActive=true;
  var bb=document.getElementById("pu-bomb");
  if(bb) bb.style.borderColor="#e74c3c";
  setMsg("Tap a blocker to destroy it!","#e74c3c");
  draw();
}
function deactivateBombMode() {
  bombModeActive=false;
  var bb=document.getElementById("pu-bomb");
  if(bb) bb.style.borderColor="";
}
function updateCoinsDisplay() {
  var c1=document.getElementById("coinCount");
  var c2=document.getElementById("coinCountGame");
  if(c1) c1.textContent=coins;
  if(c2) c2.textContent=coins;
}
function updateBombBtn() {
  var btn=document.getElementById("pu-bomb");
  var cnt=document.getElementById("pu-bomb-count");
  if(!btn||!cnt) return;
  btn.classList.remove("disabled");
  cnt.textContent=bombUsedFree?("x"+coins+"c"):"FREE";
}

