/* ════════ LEADERBOARD ════════ */

function openLeaderboard() {
  var ov = document.getElementById("leaderboardOverlay");
  ov.style.opacity = "1"; ov.style.pointerEvents = "all";
  document.getElementById("leaderboardCard").style.transform = "translateY(0)";
  renderLeaderboardLoading();
  fetchLeaderboard(function(rows, myUid) {
    renderLeaderboard(rows, myUid);
  });
}

function closeLeaderboard() {
  var ov = document.getElementById("leaderboardOverlay");
  ov.style.opacity = "0"; ov.style.pointerEvents = "none";
  document.getElementById("leaderboardCard").style.transform = "translateY(60px)";
}

function renderLeaderboardLoading() {
  document.getElementById("lbPodium").innerHTML =
    '<div style="color:#2a4838;font-family:Orbitron,sans-serif;font-size:13px;letter-spacing:2px;padding:40px 0;">LOADING...</div>';
  document.getElementById("lbList").innerHTML = "";
}

function renderLeaderboard(rows, myUid) {
  var podiumEl = document.getElementById("lbPodium");
  var listEl   = document.getElementById("lbList");
  podiumEl.innerHTML = "";
  listEl.innerHTML   = "";

  if (!rows || rows.length === 0) {
    podiumEl.innerHTML = '<div style="color:#2a4838;font-family:Orbitron,sans-serif;font-size:12px;letter-spacing:2px;padding:40px 0;text-align:center;">NO PLAYERS YET<br><span style="font-size:10px;color:#1a3020">Win a level to appear here</span></div>';
    return;
  }

  /* ── Podium (top 3) ── */
  var podiumOrder = [1, 0, 2]; // silver, gold, bronze visual order
  var podiumColors = ["#c0c0c0", "#ffd700", "#cd7f32"];
  var podiumHeights = ["70px", "95px", "55px"];
  var podiumLabels  = ["2ND", "1ST", "3RD"];
  var podiumGlows   = [
    "rgba(192,192,192,.35)",
    "rgba(255,215,0,.45)",
    "rgba(205,127,50,.35)"
  ];

  podiumEl.style.display = "flex";
  podiumEl.style.alignItems = "flex-end";
  podiumEl.style.justifyContent = "center";
  podiumEl.style.gap = "10px";
  podiumEl.style.padding = "0 16px 8px";

  for (var pi = 0; pi < 3; pi++) {
    var realIdx = podiumOrder[pi];
    var p = rows[realIdx];
    if (!p) continue;
    var isMe = p.uid === myUid;
    var col  = podiumColors[pi];
    var glow = podiumGlows[pi];

    var block = document.createElement("div");
    block.style.cssText = [
      "flex:1","display:flex","flex-direction:column","align-items:center",
      "background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,transparent 100%)",
      "border:1px solid " + col + "44",
      "border-radius:14px 14px 0 0",
      "padding:10px 6px 0",
      "min-height:" + podiumHeights[pi],
      "position:relative",
      isMe ? "box-shadow:0 0 18px " + glow + ",inset 0 0 18px rgba(0,255,136,.06)" : ""
    ].join(";");

    var rankBadge = document.createElement("div");
    rankBadge.textContent = podiumLabels[pi];
    rankBadge.style.cssText = [
      "position:absolute","top:-12px","left:50%","transform:translateX(-50%)",
      "background:" + col, "color:#000",
      "font-family:Orbitron,sans-serif","font-size:9px","font-weight:900",
      "padding:2px 8px","border-radius:20px","letter-spacing:1px","white-space:nowrap"
    ].join(";");

    var avatarEl = document.createElement("div");
    avatarEl.textContent = p.avatar || "😎";
    avatarEl.style.cssText = [
      "font-size:" + (realIdx === 0 ? "30px" : "24px"),
      "margin-bottom:4px",
      "filter:drop-shadow(0 0 8px " + glow + ")"
    ].join(";");

    var nameEl = document.createElement("div");
    nameEl.textContent = _truncate(p.name || "Player", 8);
    nameEl.style.cssText = [
      "font-family:Orbitron,sans-serif","font-size:9px","font-weight:700",
      "color:" + col, "letter-spacing:.5px","margin-bottom:2px","text-align:center"
    ].join(";");

    var xpEl = document.createElement("div");
    xpEl.textContent = _formatNum(p.xp || 0) + " XP";
    xpEl.style.cssText = "font-family:Orbitron,sans-serif;font-size:9px;color:#6a9080;letter-spacing:.5px;text-align:center;";

    if (isMe) {
      var youBadge = document.createElement("div");
      youBadge.textContent = "YOU";
      youBadge.style.cssText = "font-family:Orbitron,sans-serif;font-size:8px;font-weight:900;color:#00ff88;letter-spacing:1px;margin-top:3px;";
      block.appendChild(youBadge);
    }

    block.appendChild(rankBadge);
    block.appendChild(avatarEl);
    block.appendChild(nameEl);
    block.appendChild(xpEl);
    podiumEl.appendChild(block);
  }

  /* ── Rank list (4th onward, plus always show current player) ── */
  var myRank = -1;
  for (var ri = 0; ri < rows.length; ri++) {
    if (rows[ri].uid === myUid) { myRank = ri + 1; break; }
  }

  for (var i = 3; i < rows.length; i++) {
    var row = rows[i];
    var isMyRow = row.uid === myUid;
    listEl.appendChild(_buildRowEl(i + 1, row, isMyRow));
  }

  /* If current player is in top 3 or not in list yet, show a sticky "you" row */
  if (myRank === -1) {
    var myRow = document.createElement("div");
    myRow.style.cssText = "padding:8px 16px;text-align:center;font-family:Orbitron,sans-serif;font-size:10px;color:#2ecc71;letter-spacing:1px;border-top:1px solid #1a2d3a;";
    myRow.textContent = "Win a level to enter the leaderboard";
    listEl.appendChild(myRow);
  } else if (myRank <= 3 && rows.length > 3) {
    /* player is in podium — nothing extra needed */
  }
}

function _buildRowEl(rank, p, isMe) {
  var el = document.createElement("div");
  el.style.cssText = [
    "display:flex","align-items:center","gap:10px",
    "padding:10px 16px",
    "border-bottom:1px solid #0d1e18",
    isMe
      ? "background:linear-gradient(90deg,rgba(0,255,136,.08),transparent);border-left:2px solid #00ff88;"
      : "background:transparent;"
  ].join(";");

  var rankEl = document.createElement("div");
  rankEl.textContent = "#" + rank;
  rankEl.style.cssText = "font-family:Orbitron,sans-serif;font-size:11px;font-weight:700;color:" + (isMe ? "#00ff88" : "#2a4838") + ";width:30px;flex-shrink:0;";

  var avatarEl = document.createElement("div");
  avatarEl.textContent = p.avatar || "😎";
  avatarEl.style.cssText = "font-size:22px;flex-shrink:0;";

  var infoEl = document.createElement("div");
  infoEl.style.cssText = "flex:1;min-width:0;";

  var nameEl = document.createElement("div");
  nameEl.textContent = (p.name || "Player") + (isMe ? "  (You)" : "");
  nameEl.style.cssText = "font-family:Orbitron,sans-serif;font-size:11px;font-weight:700;color:" + (isMe ? "#00ff88" : "#d8eee0") + ";white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";

  var lvlEl = document.createElement("div");
  lvlEl.textContent = "Lv." + (p.playerLevel || 1) + "  ·  " + _formatNum(p.thndr || 0) + " ⚡";
  lvlEl.style.cssText = "font-size:10px;color:#2a5040;margin-top:1px;";

  var xpEl = document.createElement("div");
  xpEl.textContent = _formatNum(p.xp || 0);
  xpEl.style.cssText = "font-family:Orbitron,sans-serif;font-size:12px;font-weight:900;color:" + (isMe ? "#00ff88" : "#00aaff") + ";flex-shrink:0;";

  var xpLblEl = document.createElement("div");
  xpLblEl.style.cssText = "text-align:right;flex-shrink:0;";
  xpLblEl.appendChild(xpEl);
  var xpSubEl = document.createElement("div");
  xpSubEl.textContent = "XP";
  xpSubEl.style.cssText = "font-size:9px;color:#2a4838;text-align:right;letter-spacing:1px;";
  xpLblEl.appendChild(xpSubEl);

  infoEl.appendChild(nameEl);
  infoEl.appendChild(lvlEl);
  el.appendChild(rankEl);
  el.appendChild(avatarEl);
  el.appendChild(infoEl);
  el.appendChild(xpLblEl);
  return el;
}

function _truncate(str, len) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function _formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
