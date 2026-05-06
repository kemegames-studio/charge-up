/* ════════ SPLASH SEQUENCE ════════ */
window.addEventListener("resize",resize);

function runSplash() {
  var keme = document.getElementById("splashKeme");
  var game = document.getElementById("splashGame");
  var home = document.getElementById("homeView");

  // Show Keme splash (already visible)
  // After 1.5s: fade out Keme, show Game splash
  setTimeout(function(){
    keme.classList.add("fade-out");
    setTimeout(function(){
      keme.classList.add("gone");
      game.classList.remove("gone");
      // After another 1.5s: fade out Game, show Home
      setTimeout(function(){
        game.classList.add("fade-out");
        setTimeout(function(){
          game.classList.add("gone");
          home.classList.remove("hidden");
          buildLevelMap(false);
        }, 500);
      }, 1500);
    }, 500);
  }, 1500);
}

window.addEventListener("load",function(){
  setLang("en");
  var ov=document.getElementById("settingsOverlay");
  if (ov) ov.addEventListener("click",function(e){if(e.target===this)closeSettings();});
  initCloudSave();
  runSplash();
});
