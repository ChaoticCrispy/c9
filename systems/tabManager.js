
//------------------------------------------------------------------------------ Tab Creations
function createTabButton(tabId, tabName = tabId) {
  const tabBtn = document.createElement('button');
  tabBtn.className = 'tab-button';

  const span = document.createElement('span');
  span.contentEditable = false; // not editable by default
  span.innerText = tabName;

  // Enable editing on double-click
  span.ondblclick = () => {
    span.contentEditable = true;
    span.focus();

    // Move cursor to end
    document.getSelection().collapse(span, 1);
  };

  // Save when done (blur or Enter)
  span.onblur = () => {
    renameTab(span, tabId);
    span.contentEditable = false; // disable editing again
  };

  span.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      span.blur(); // triggers onblur
    }
  };

  const del = document.createElement('span');
  del.className = 'delete-tab';
  del.innerText = '✕';

  let holdTimeout;

  const initiateDelete = () => {
    del.classList.add('danger');
    holdTimeout = setTimeout(() => deleteTab(tabId, tabBtn), 1000);
  };

  const cancelDelete = () => {
    clearTimeout(holdTimeout);
    del.classList.remove('danger');
  };

  del.onmousedown = initiateDelete;
  del.onmouseup = del.onmouseleave = cancelDelete;
  del.ontouchstart = (e) => {
    e.preventDefault();
    initiateDelete();
  };
  del.ontouchend = del.ontouchcancel = cancelDelete;

  tabBtn.appendChild(span);
  tabBtn.appendChild(del);

  tabBtn.onclick = (e) => {
    if (e.target === del) return;
    openTab(e, tabId);
  };

  return tabBtn;
}
function createTab() {
  const tabs = document.getElementById('tabs');
  const addTabBtn = document.getElementById('add-tab-button');
  const tabContainer = document.getElementById('tab-container');
  const tabsList = JSON.parse(localStorage.getItem("tabs") || "[]");

  const newId = `Tab${Date.now()}`;
  tabsList.push(newId);
  localStorage.setItem("tabs", JSON.stringify(tabsList));
  localStorage.setItem(`${newId}-name`, newId);
  localStorage.setItem(newId, "");

  const newButton = createTabButton(newId);
  tabs.insertBefore(newButton, addTabBtn);

  newButton.classList.add("animate-in");
  setTimeout(() => newButton.classList.remove("animate-in"), 300);
  tabs.insertBefore(newButton, addTabBtn);

  const newTab = document.createElement("div");
  newTab.id = newId;
  newTab.className = "tab-content";
  newTab.contentEditable = true;
  newTab.addEventListener("input", () => saveTabContent(newId));
  tabContainer.appendChild(newTab);

  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

  newButton.classList.add('active');
  newTab.classList.add('active');
}


//------------------------------------------------------------------------------ Tab opperations

function renameTab(spanEl, id) {
  const name = spanEl.innerText.trim();
  localStorage.setItem(`${id}-name`, name);
}

function saveTabContent(id) {
  const content = document.getElementById(id).innerHTML;
  localStorage.setItem(id, content);
}

function openTab(evt, tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabName).classList.add('active');
  evt.currentTarget.classList.add('active');
}

function deleteTab(tabId, tabBtn) {
  const tabContent = document.getElementById(tabId);
  tabBtn.remove();
  tabContent.remove();

  localStorage.removeItem(tabId);
  localStorage.removeItem(`${tabId}-name`);

  let tabsList = JSON.parse(localStorage.getItem("tabs") || "[]");
  tabsList = tabsList.filter(id => id !== tabId);
  localStorage.setItem("tabs", JSON.stringify(tabsList));

  const nextTab = document.querySelector(".tab-button");
  const nextContent = document.querySelector(".tab-content");
  if (nextTab && nextContent) {
    nextTab.classList.add("active");
    nextContent.classList.add("active");
  }
}

//------------------------------------------------------------------------------ TAB DECORATIONS 
function decorateAllTabs() {
  const emojis = ['📄','📝','📘','🧾','📂','✏️','💡','🧠','📋','🗒️'];
  document.querySelectorAll('.tab-button').forEach((btn, i) => {
    addTabDecoration(btn, emojis[i % emojis.length]);
  });
}

function addTabDecoration(tabBtn, emoji) {
  const icon = document.createElement('span');
  icon.textContent = emoji;
  icon.style.marginRight = '6px';
  icon.style.opacity = '0.7';
  tabBtn.insertBefore(icon, tabBtn.firstChild);
}

//------------------------------------------------------------------------------ Initiation

function initTabs() {
  const tabContainer = document.getElementById('tab-container');
  const tabs = document.getElementById('tabs');
  const addTabBtn = document.getElementById('add-tab-button');

  const tabsList = JSON.parse(localStorage.getItem("tabs") || "[]");

  for (const tabId of tabsList) {
    const tabName = localStorage.getItem(`${tabId}-name`);
    const tabContent = localStorage.getItem(tabId);

    if (tabName && tabContent !== null) {
      const tabBtn = createTabButton(tabId, tabName);
      tabs.insertBefore(tabBtn, addTabBtn);

      const tabEl = document.createElement("div");
      tabEl.id = tabId;
      tabEl.className = "tab-content";
      tabEl.contentEditable = true;
      tabEl.innerHTML = tabContent;
      tabEl.addEventListener("input", () => saveTabContent(tabId));
      tabContainer.appendChild(tabEl);
    }
  }

  const firstTab = document.querySelector('.tab-button');
  const firstContent = document.querySelector('.tab-content');
  if (firstTab && firstContent) {
    firstTab.classList.add('active');
    firstContent.classList.add('active');
  }

  const tabsWrapper = document.getElementById("tabs-wrapper");

// Ensure fades exist
let fadeLeft = tabsWrapper.querySelector(".tabs-fade.left");
let fadeRight = tabsWrapper.querySelector(".tabs-fade.right");
if (!fadeLeft || !fadeRight) {
  fadeLeft = document.createElement("div");
  fadeRight = document.createElement("div");
  fadeLeft.className = "tabs-fade left";
  fadeRight.className = "tabs-fade right";
  tabsWrapper.appendChild(fadeLeft);
  tabsWrapper.appendChild(fadeRight);
}

tabsWrapper.addEventListener("wheel", (e) => {
  if (e.deltaY !== 0) {
    e.preventDefault();

    const start = tabsWrapper.scrollLeft;
    const target = start + e.deltaY;
    const duration = 300; // ms
    const startTime = performance.now();

    function animateScroll(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      tabsWrapper.scrollLeft = start + (target - start) * ease;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  }
});
function updateFades() {
  const maxScroll = Math.max(0, tabsWrapper.scrollWidth - tabsWrapper.clientWidth);
  const x = tabsWrapper.scrollLeft;

  const fadeWidth = 32; 

  const leftStrength = Math.min(x / (fadeWidth * 0.6), 1);
  const rightStrength = Math.min((maxScroll - x) / (fadeWidth * 0.6), 1);

  fadeLeft.style.opacity = maxScroll <= 0 ? 0 : leftStrength;
  fadeRight.style.opacity = maxScroll <= 0 ? 0 : rightStrength;
}

tabsWrapper.addEventListener("scroll", updateFades);
window.addEventListener("resize", updateFades);
updateFades();
}


