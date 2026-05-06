/* ════════ LEVEL STATE ════════ */
var levelIdx = 0;
var level = LEVELS[0];
var phonePos = { x: level.phone.x, y: level.phone.y };
var battery = 100, won = false;
var battTimer = null, phoneTimer = null;

/* ════════ LEVEL LOGIC ════════ */
function resetLevel() {
  clearInterval(battTimer); clearInterval(phoneTimer);
  if (typeof deactivateBombMode === "function") deactivateBombMode();
  level = LEVELS[levelIdx]; paths = {}; drawing = null;
  phonePos = { x: level.phone.x, y: level.phone.y }; battery = 100; won = false;
  setMsg(getLang().msgStart); updateHeader(); draw();

  battTimer = setInterval(function() {
    if (won) return;
    battery = Math.max(0, battery - 1); updateHeader();
    if (battery <= 0) {
      clearInterval(battTimer); clearInterval(phoneTimer);
      setTimeout(function() { showLoseOverlay(); }, 300);
    }
  }, 400);

  if (level.moveEvery) {
    phoneTimer = setInterval(function() {
      if (won) return;
      var dirs = [{ dx:1,dy:0 },{ dx:-1,dy:0 },{ dx:0,dy:1 },{ dx:0,dy:-1 }];
      var valid = dirs.filter(function(d) {
        var nx = phonePos.x + d.dx, ny = phonePos.y + d.dy;
        return nx >= 0 && nx < GRID && ny >= 0 && ny < GRID
          && !level.walls.some(function(w) { return w.x === nx && w.y === ny; })
          && !level.outlets.some(function(o) { return o.x === nx && o.y === ny; });
      });
      if (!valid.length) return;
      var d = valid[Math.floor(Math.random() * valid.length)];
      phonePos = { x: phonePos.x + d.dx, y: phonePos.y + d.dy };
      paths = {}; drawing = null;
      setMsg(getLang().msgMoved); draw();
    }, level.moveEvery);
  }
}

function changeLevel(dir) {
  levelIdx = Math.max(0, Math.min(LEVELS.length - 1, levelIdx + dir));
  selectedLevel = levelIdx;
  resetLevel();
}
