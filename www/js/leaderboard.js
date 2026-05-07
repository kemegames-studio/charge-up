/* ════════ LEADERBOARD ════════ */

function openLeaderboard() {
  var ov = document.getElementById("leaderboardOverlay");
  ov.style.transform = "translateX(0)";
  ov.style.opacity   = "1";
  ov.style.pointerEvents = "all";
  refreshLeaderboard();
}

function closeLeaderboard() {
  var ov = document.getElementById("leaderboardOverlay");
  ov.style.transform = "translateX(100%)";
  ov.style.opacity   = "0";
  ov.style.pointerEvents = "none";
}

function refreshLeaderboard() {
  document.getElementById("lbPodium").innerHTML =
    '<div style="color:rgba(255,255,255,.7);font-family:Orbitron,sans-serif;font-size:12px;letter-spacing:2px;padding:60px 0;text-align:center;">LOADING...</div>';
  document.getElementById("lbList").innerHTML = "";
  fetchLeaderboard(function(rows, myUid) {
    renderLeaderboard(rows, myUid);
  });
}

function renderLeaderboard(rows, myUid) {
  var podiumEl = document.getElementById("lbPodium");
  var listEl   = document.getElementById("lbList");
  podiumEl.innerHTML = "";
  listEl.innerHTML   = "";

  if (!rows || rows.length === 0) {
    podiumEl.innerHTML =
      '<div style="color:rgba(255,255,255,.7);font-family:Orbitron,sans-serif;font-size:12px;letter-spacing:2px;padding:60px 0;text-align:center;">NO PLAYERS YET</div>';
    return;
  }

  /* ── Podium (top 3): visual order [silver, gold, bronze] = indices [1,0,2] ── */
  var order       = [1, 0, 2];
  var circleSize  = ["76px", "92px", "76px"];
  var emojiFSize  = ["30px", "38px", "30px"];
  var borderColor = ["#a8b8b0", "#c8f135", "#c88832"];

  podiumEl.style.cssText =
    "display:flex;align-items:flex-end;justify-content:center;gap:12px;padding:16px 16px 28px;";

  for (var pi = 0; pi < 3; pi++) {
    var idx  = order[pi];
    var p    = rows[idx];
    var isMe = p && p.uid === myUid;
    var isFirst = idx === 0;

    var col = document.createElement("div");
    col.style.cssText = "display:flex;flex-direction:column;align-items:center;flex:1;max-width:110px;";

    /* crown above #1 */
    var topSpace = document.createElement("div");
    if (isFirst) {
      topSpace.innerHTML = "&#9819;";
      topSpace.style.cssText =
        "font-size:30px;color:#c8f135;line-height:1;margin-bottom:5px;" +
        "filter:drop-shadow(0 0 10px rgba(200,241,53,.55));text-align:center;";
    } else {
      topSpace.style.height = "40px";
    }
    col.appendChild(topSpace);

    /* avatar circle */
    var ring = document.createElement("div");
    ring.style.cssText = [
      "position:relative",
      "width:"  + circleSize[pi],
      "height:" + circleSize[pi],
      "border-radius:50%",
      "background:rgba(255,255,255,.15)",
      "border:2.5px solid " + borderColor[pi],
      "display:flex",
      "align-items:center",
      "justify-content:center",
      isFirst ? "box-shadow:0 0 22px rgba(200,241,53,.28);" : ""
    ].join(";");

    var em = document.createElement("div");
    em.textContent = (p && p.avatar) ? p.avatar : "😎";
    em.style.cssText = "font-size:" + emojiFSize[pi] + ";line-height:1;";
    ring.appendChild(em);

    /* rank badge */
    var badge = document.createElement("div");
    badge.textContent = idx + 1;
    badge.style.cssText = [
      "position:absolute",
      "bottom:-11px",
      "left:50%",
      "transform:translateX(-50%)",
      "width:24px",
      "height:24px",
      "border-radius:50%",
      "background:" + (isFirst ? "#243a10" : "#1a2a20"),
      "border:2px solid " + borderColor[pi],
      "color:" + borderColor[pi],
      "font-size:11px",
      "font-weight:900",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "font-family:Orbitron,sans-serif"
    ].join(";");
    ring.appendChild(badge);
    col.appendChild(ring);

    /* spacer after badge */
    var sp = document.createElement("div");
    sp.style.height = "16px";
    col.appendChild(sp);

    /* name */
    var nameEl = document.createElement("div");
    nameEl.textContent = isMe ? "You" : _truncate((p && p.name) || "Player", 10);
    nameEl.style.cssText =
      "font-family:Cairo,sans-serif;font-size:12px;font-weight:700;color:" +
      (isMe ? "#c8f135" : "#ccd8cc") + ";text-align:center;white-space:nowrap;" +
      "overflow:hidden;text-overflow:ellipsis;max-width:90px;";
    col.appendChild(nameEl);

    /* pts */
    var ptsEl = document.createElement("div");
    ptsEl.style.cssText =
      "display:flex;align-items:center;gap:3px;margin-top:4px;justify-content:center;";
    var starEl = document.createElement("span");
    starEl.textContent = "⭐";
    starEl.style.fontSize = "11px";
    var valEl = document.createElement("span");
    valEl.textContent = _formatNum((p && p.xp) || 0) + " XP";
    valEl.style.cssText =
      "font-family:Orbitron,sans-serif;font-size:10px;font-weight:700;color:#c8f135;";
    ptsEl.appendChild(starEl);
    ptsEl.appendChild(valEl);
    col.appendChild(ptsEl);

    podiumEl.appendChild(col);
  }

  /* ── Rank list (4th onward) ── */
  for (var i = 3; i < rows.length; i++) {
    listEl.appendChild(_buildRowEl(i + 1, rows[i], rows[i].uid === myUid));
  }

  var myRank = rows.findIndex(function(r) { return r.uid === myUid; });
  if (myRank === -1) {
    var hint = document.createElement("div");
    hint.style.cssText =
      "padding:20px;text-align:center;font-family:Orbitron,sans-serif;" +
      "font-size:10px;color:rgba(255,255,255,.40);letter-spacing:1px;";
    hint.textContent = "WIN A LEVEL TO ENTER";
    listEl.appendChild(hint);
  }
}

function _buildRowEl(rank, p, isMe) {
  var el = document.createElement("div");
  el.style.cssText = [
    "display:flex",
    "align-items:center",
    "gap:12px",
    "padding:12px 16px",
    "margin:0 14px 8px",
    "border-radius:16px",
    isMe
      ? "background:rgba(255,255,255,.22);"
      : "background:rgba(255,255,255,.10);"
  ].join(";");

  /* rank number */
  var rankEl = document.createElement("div");
  rankEl.textContent = rank;
  rankEl.style.cssText =
    "font-family:Orbitron,sans-serif;font-size:14px;font-weight:700;width:26px;" +
    "flex-shrink:0;text-align:center;color:" +
    (isMe ? "#c8f135" : "#3a4e3a") + ";";

  /* avatar circle */
  var ring = document.createElement("div");
  ring.style.cssText =
    "width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.15);" +
    "border:2px solid " + (isMe ? "#c8f135" : "#252e25") + ";" +
    "display:flex;align-items:center;justify-content:center;flex-shrink:0;";
  var em = document.createElement("div");
  em.textContent = p.avatar || "😎";
  em.style.cssText = "font-size:22px;line-height:1;";
  ring.appendChild(em);

  /* name */
  var nameEl = document.createElement("div");
  nameEl.textContent = isMe ? "You" : _truncate(p.name || "Player", 16);
  nameEl.style.cssText =
    "flex:1;font-family:Cairo,sans-serif;font-size:15px;font-weight:600;" +
    "color:" + (isMe ? "#ffffff" : "#ccd8cc") + ";" +
    "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";

  /* pts */
  var ptsWrap = document.createElement("div");
  ptsWrap.style.cssText =
    "display:flex;align-items:center;gap:4px;flex-shrink:0;";
  var star = document.createElement("span");
  star.textContent = "⭐";
  star.style.fontSize = "13px";
  var val = document.createElement("span");
  val.textContent = _formatNum(p.xp || 0) + " XP";
  val.style.cssText =
    "font-family:Orbitron,sans-serif;font-size:12px;font-weight:700;" +
    "color:" + (isMe ? "#c8f135" : "#5a8a5a") + ";";
  ptsWrap.appendChild(star);
  ptsWrap.appendChild(val);

  el.appendChild(rankEl);
  el.appendChild(ring);
  el.appendChild(nameEl);
  el.appendChild(ptsWrap);
  return el;
}

function _truncate(str, len) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function _formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
