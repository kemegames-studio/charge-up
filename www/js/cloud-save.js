/* ════════ CLOUD SAVE — Firebase + LocalStorage ════════ */

var FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCbbZ1xntVWgD_61-pFZ4iIt2HnLCDtHCs",
  authDomain:        "charge-up-61258.firebaseapp.com",
  projectId:         "charge-up-61258",
  storageBucket:     "charge-up-61258.firebasestorage.app",
  messagingSenderId: "1048134678058",
  appId:             "1:1048134678058:web:d8ea2e6d120a7bf795b553"
};

var _db = null;
var _uid = null;
var _saveTimeout = null;
var _cloudReady = false;
var _loaded = false;   // guard: block saves until initial load completes

/* ── Init ── */
function initCloudSave() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    firebase.auth().signInAnonymously()
      .then(function(result) {
        _uid = result.user.uid;
        _db  = firebase.firestore();
        _cloudReady = true;
        _saveLocalUid(_uid);
        loadProgress();
      })
      .catch(function(err) {
        console.warn("Cloud auth failed, using local save:", err.message);
        loadProgressLocal();
      });
  } catch(e) {
    console.warn("Firebase init failed, using local save:", e.message);
    loadProgressLocal();
  }
}

function _saveLocalUid(uid) {
  try { localStorage.setItem("cu_uid", uid); } catch(e) {}
}

/* ── Collect all game state ── */
function _collectState() {
  return {
    completedLevels: Array.from(completedLevels),
    selectedLevel:   selectedLevel   || 0,
    xp:              xp              || 0,
    thndr:           thndr           || 0,
    playerLevel:     playerLevel     || 1,
    lives:           lives           || 5,
    coins:           coins           || 0,
    soundSfx:        soundSettings   ? soundSettings.sfx    : true,
    soundBgm:        soundSettings   ? soundSettings.bgm    : true,
    soundVol:        soundSettings   ? soundSettings.volume : 0.08,
    lang:            currentLang     || "en",
    profileName:     (typeof profile !== "undefined") ? profile.name   : "Player",
    profileAvatar:   (typeof profile !== "undefined") ? profile.avatar : "😎",
    savedAt:         Date.now()
  };
}

/* ── Apply loaded state to game ── */
function _applyState(data) {
  if (!data) { _loaded = true; return; }

  /* completed levels */
  completedLevels = new Set(data.completedLevels || []);

  /* progress */
  selectedLevel = data.selectedLevel || 0;
  xp            = data.xp            || 0;
  thndr         = data.thndr         || 0;
  playerLevel   = data.playerLevel   || 1;
  lives         = data.lives         || 5;
  coins         = data.coins         || 0;

  /* sound */
  if (soundSettings) {
    soundSettings.sfx    = data.soundSfx !== undefined ? data.soundSfx : true;
    soundSettings.bgm    = data.soundBgm !== undefined ? data.soundBgm : true;
    soundSettings.volume = data.soundVol !== undefined ? data.soundVol : 0.08;
  }

  /* language */
  if (data.lang) { currentLang = data.lang; }

  /* profile */
  if (typeof profile !== "undefined") {
    if (data.profileName)   profile.name   = data.profileName;
    if (data.profileAvatar) profile.avatar = data.profileAvatar;
    var nameEl   = document.getElementById("avatarName");
    var dispEl   = document.getElementById("avatarDisplay");
    if (nameEl)  nameEl.textContent  = profile.name;
    if (dispEl)  dispEl.textContent  = profile.avatar;
  }

  /* refresh all UI */
  if (typeof updateXpDisplay    === "function") updateXpDisplay();
  if (typeof updateLivesDisplay === "function") updateLivesDisplay();
  if (typeof updateCoinsDisplay === "function") updateCoinsDisplay();
  if (typeof buildLevelMap      === "function") buildLevelMap(false);
  if (typeof updateTogglesUI    === "function") updateTogglesUI();

  _loaded = true;
  _showSaveToast("☁️ Progress loaded");
}

/* ── Save (debounced 2s) ── */
function saveProgress() {
  if (!_loaded) return;   // don't overwrite save data before load completes
  _saveLocal();
  if (!_cloudReady) return;
  clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(_saveCloud, 2000);
}

function _saveLocal() {
  try {
    localStorage.setItem("cu_save", JSON.stringify(_collectState()));
  } catch(e) {}
}

function _saveCloud() {
  if (!_cloudReady || !_db || !_uid) return;
  var state = _collectState();
  _db.collection("players").doc(_uid)
    .set(state)
    .then(function() { _showSaveToast("☁️ Saved"); })
    .catch(function(err) { console.warn("Cloud save failed:", err.message); });
  _syncLeaderboard(state);
}

function _syncLeaderboard(state) {
  if (!_cloudReady || !_db || !_uid) return;
  var s = state || _collectState();
  var entry = {
    name:        s.profileName   || "Player",
    avatar:      s.profileAvatar || "😎",
    xp:          s.xp            || 0,
    thndr:       s.thndr         || 0,
    playerLevel: s.playerLevel   || 1,
    updatedAt:   Date.now()
  };
  /* update() with dot-notation only touches THIS player's key — other players' entries survive */
  var patch = {};
  patch["players." + _uid] = entry;
  var ref = _db.collection("meta").doc("leaderboard");
  ref.update(patch).catch(function(err) {
    /* Document doesn't exist yet — create it then retry */
    var seed = { players: {} };
    seed.players[_uid] = entry;
    ref.set(seed).catch(function(e) { console.warn("Leaderboard sync failed:", e.message); });
  });
}

function fetchLeaderboard(callback) {
  function _selfEntry() {
    var s = _collectState();
    return { uid: _uid || "me", name: s.profileName || "Player", avatar: s.profileAvatar || "😎",
             xp: s.xp || 0, thndr: s.thndr || 0, playerLevel: s.playerLevel || 1 };
  }

  if (!_cloudReady || !_db) {
    callback([_selfEntry()], _uid);
    return;
  }

  _db.collection("meta").doc("leaderboard").get()
    .then(function(doc) {
      var rows = [];
      var myInList = false;
      if (doc.exists) {
        var data = doc.data().players || {};
        Object.keys(data).forEach(function(uid) {
          var p = data[uid];
          rows.push({ uid: uid, name: p.name || "Player", avatar: p.avatar || "😎",
                      xp: p.xp || 0, thndr: p.thndr || 0, playerLevel: p.playerLevel || 1 });
          if (uid === _uid) myInList = true;
        });
      }
      if (!myInList) rows.push(_selfEntry());
      rows.sort(function(a, b) { return (b.xp || 0) - (a.xp || 0); });
      callback(rows, _uid);
    })
    .catch(function(err) {
      console.warn("Leaderboard fetch failed:", err.message);
      callback([_selfEntry()], _uid);
    });
}

/* ── Load ── */
function loadProgress() {
  /* try cloud first */
  if (_cloudReady && _db && _uid) {
    _db.collection("players").doc(_uid).get()
      .then(function(doc) {
        if (doc.exists) {
          var d = doc.data();
          _applyState(d);
          _syncLeaderboard();   // backfill shared leaderboard doc on every load
        } else {
          /* no cloud data — check local */
          loadProgressLocal();
          /* push local to cloud */
          _saveCloud();
        }
      })
      .catch(function(err) {
        console.warn("Cloud load failed, using local:", err.message);
        loadProgressLocal();
      });
  } else {
    loadProgressLocal();
  }
}

function loadProgressLocal() {
  try {
    var raw = localStorage.getItem("cu_save");
    if (raw) _applyState(JSON.parse(raw));
    else _loaded = true;  // no saved data — allow saves from now on
  } catch(e) { _loaded = true; }
}

/* ── Toast notification ── */
function _showSaveToast(msg) {
  var existing = document.getElementById("saveToast");
  if (existing) existing.remove();
  var t = document.createElement("div");
  t.id = "saveToast";
  t.textContent = msg;
  t.style.cssText = [
    "position:fixed","bottom:90px","left:50%","transform:translateX(-50%)",
    "background:rgba(0,255,136,.12)","border:1px solid rgba(0,255,136,.3)",
    "color:#00ff88","font-size:11px","font-weight:700","font-family:Orbitron,sans-serif",
    "letter-spacing:1px","padding:7px 18px","border-radius:50px","z-index:9000",
    "pointer-events:none","opacity:1","transition:opacity .5s"
  ].join(";");
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity="0"; }, 1800);
  setTimeout(function() { if(t.parentNode) t.remove(); }, 2400);
}

/* ── Auto-save triggers (called from other modules) ── */
function onLevelComplete()  { saveProgress(); }
function onSettingsChange() { saveProgress(); }
function onCoinsChange()    { saveProgress(); }
