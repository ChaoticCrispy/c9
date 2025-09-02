document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  const settingsModal    = document.getElementById("settings-modal");
  const closeSettingsBtn = document.getElementById("close-settings");
  const bgColorInput     = document.getElementById("bg-color");
  const textColorInput   = document.getElementById("text-color");
  const customSettings   = document.querySelectorAll(".custom-setting");
  const fontSelect       = document.getElementById("font-select");
  const bgEffectSelect   = document.getElementById("bg-effect"); 
  const themeSelect      = document.getElementById("theme-select");
  const disclaimerBtn = document.getElementById("disclaimer-button");
  const disclaimer = document.getElementById("disclaimer");
  const disclaimerClose = document.getElementById("close-disclaimer");
  const canvas = document.getElementById("backgroundCanvas");
  const ctx = canvas.getContext("2d");
  // ---------- helpers ----------


  function adjustModalBg(bg) {
    return `${bg}cc`; // bg + 80% opacity
  }

  function openSettings() {
    settingsModal.style.display = "flex";
    settingsModal.style.animation = "modalIn 0.25s ease forwards";
  }

  function closeSettings() {
    settingsModal.style.animation = "modalOut 0.25s ease forwards";
    settingsModal.addEventListener("animationend", () => {
      settingsModal.style.display = "none";
    }, { once: true });
  }

  window.openSettings = openSettings; 

  // ---------- theme + effect ----------
  const applyTheme = (theme) => {
    let bg, text, effectForBG;

    if (theme === "custom") {
      bg = localStorage.getItem("customBgColor") || "#090a0f";
      text = localStorage.getItem("customTextColor") || "#ffffff";
      effectForBG = localStorage.getItem("backgroundEffect") || "constellation";
    } else if (theme === "matrix") {
      bg = "#000000";
      text = "#00ff00";
      effectForBG = "matrix";
    } else if (theme === "light") {
      bg = "#dededed3";
      text = "#111111";
      
    } else { 
      bg = "#090a0f";
      text = "#ffffffff";
      effectForBG = "constellation";
    }
    adjustModalBg(bg)
    root.style.setProperty("--bg-color", bg);
    root.style.setProperty("--text-color", text);

    document.body.dataset.theme = theme;
    localStorage.setItem("editorTheme", theme);
    toggleCustomSettings(theme === "custom");
  };

  const toggleCustomSettings = (show) => {
    customSettings.forEach(el => el.style.display = show ? "flex" : "none");
  };

  const applyFont = (font) => {
    root.style.setProperty("--font-family", font);
  };

  // ---------- events ----------


    // ---------- background effect opacity ----------
  const effectOpacitySlider = document.getElementById("bg-alpha");

  // Load saved opacity (default 100%)
  let savedOpacity = parseInt(localStorage.getItem("effectOpacity") || "100", 10);
  effectOpacitySlider.value = savedOpacity;

  // Expose global getter for canvas scripts
  window.getAlpha = function () {
    return (parseInt(localStorage.getItem("effectOpacity") || "100", 10) / 100);
  };

  // Update when slider moves
  effectOpacitySlider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    localStorage.setItem("effectOpacity", val);
  });
  closeSettingsBtn.addEventListener("click", closeSettings);

  
  if (bgEffectSelect) {
    const savedEffect = localStorage.getItem("backgroundEffect") || "constellation";
    bgEffectSelect.value = savedEffect;

    bgEffectSelect.addEventListener("change", () => {
      const effect = bgEffectSelect.value;
      updateBackgroundEffect(effect, canvas, ctx);
      localStorage.setItem("backgroundEffect", effect);
    });

  }
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  bgColorInput.addEventListener("input", (e) => {
    localStorage.setItem("customBgColor", e.target.value);
    themeSelect.value = "custom";
    applyTheme("custom");

  });
  textColorInput.addEventListener("input", (e) => {
    localStorage.setItem("customTextColor", e.target.value);
    themeSelect.value = "custom";
    applyTheme("custom");
  });

  fontSelect.addEventListener("change", () => {
    const font = fontSelect.value;
    applyFont(font);
    localStorage.setItem("editorFont", font);
  });

disclaimerBtn.addEventListener("click", () => {
  disclaimer.style.display = "block";
});

disclaimerClose.addEventListener("click", () => {
  disclaimer.style.display = "none";
});
  
  function updateStorageBar() {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += ((localStorage[key].length + key.length) * 2); 
      }
    }
    const quota = 5 * 1024 * 1024; 
    const percent = Math.min((used / quota) * 100, 100);

    const bar = document.getElementById("storage-bar-fill");
    const text = document.getElementById("storage-text");

    if (bar && text) {
      bar.style.width = percent + "%";
      text.textContent = percent.toFixed(1) + "%";
    }
  }

  document.getElementById("settings-button").addEventListener("click", () => {
    updateStorageBar();
  });

  // ---------- initial load ----------
  const savedTheme = localStorage.getItem("editorTheme") || "dark";
  const savedFont  = localStorage.getItem("editorFont") || "'Inter', sans-serif";
  const savedBg    = localStorage.getItem("customBgColor");
  const savedText  = localStorage.getItem("customTextColor");
  const savedEffect = localStorage.getItem("backgroundEffect") || "constellation";

  if (bgColorInput && savedBg) bgColorInput.value = savedBg;
  if (textColorInput && savedText) textColorInput.value = savedText;
  if (themeSelect) themeSelect.value = savedTheme;
  if (fontSelect) { fontSelect.value = savedFont; applyFont(savedFont); }
  if (bgEffectSelect) bgEffectSelect.value = savedEffect;

  if (themeSelect) {
    themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));
  }
  initCanvasBackground();
  applyTheme(savedTheme);
});
