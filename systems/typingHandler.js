var particlesEnabled = false;

function initSpeedMeter() {
  let charCount = 0;
  let startTime = null;

  const meter = document.createElement('div');
  meter.id = 'typing-speed-meter';
  meter.style.position = 'fixed';
  meter.style.bottom = '10px';
  meter.style.right = '10px';
  meter.style.color = '#fff';
  meter.style.fontFamily = 'monospace';
  meter.style.fontSize = '14px';
  meter.style.opacity = '0.7';
  document.body.appendChild(meter);

  const updateSpeed = () => {
    if (!startTime) return;
    const elapsedMin = (Date.now() - startTime) / 60000;
    if (elapsedMin <= 0) return;
    const wpm = Math.round(charCount / 5 / elapsedMin);
    meter.textContent = `WPM: ${wpm}`;
  };

  document.addEventListener('keydown', (e) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (!startTime) startTime = Date.now();
      charCount++;
      updateSpeed();
    }
  });

  setInterval(updateSpeed, 1000);
}


function initTypingEffects() {

  initSpeedMeter();
  decorateAllTabs();
  const canvas = document.getElementById('typingParticlesCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
  }

  resize();

  window.addEventListener('resize', resize);

  function modifyFontSize(scale) {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
  
    const range = sel.getRangeAt(0);
    const selectedNodes = [];
  
    const treeWalker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(node);
          return range.intersectsNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );
  
    while (treeWalker.nextNode()) {
      selectedNodes.push(treeWalker.currentNode);
    }
  
    selectedNodes.forEach(textNode => {
      const span = document.createElement("span");
  
      const currentSize =
        parseFloat(window.getComputedStyle(textNode.parentElement).fontSize) || 16;
      const newSize = Math.max(6, currentSize * scale);
  
      span.style.fontSize = `${newSize}px`;
      span.textContent = textNode.textContent;
  
      textNode.parentNode.replaceChild(span, textNode);
    });
  
    sel.removeAllRanges();
  }

  const particles = [];

  function spawnParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 1.5) * 2,
        alpha: 1,
        radius: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 360}, 100%, 70%)`
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let p of particles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fill();

      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
    }

    // Remove faded particles
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('keydown', (e) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
  
    const range = sel.getRangeAt(0);
  
    if (
      e.ctrlKey || e.metaKey ||
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Backspace", "Delete"].includes(e.key)
    ) return;
  
    if (e.key === "Enter") return;
  
    if (e.key === "Tab") {
      e.preventDefault();
    
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
    
      const range = sel.getRangeAt(0);
      const tabSpan = document.createElement("span");
      tabSpan.textContent = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"; // 4 non-breaking spaces
      tabSpan.className = "fading-letter";
    
      range.insertNode(tabSpan);
    
      range.setStartAfter(tabSpan);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    
      tabSpan.addEventListener("animationend", () => {
        tabSpan.classList.remove("fading-letter");
      });
    
      return;
    }
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      modifyFontSize(1.5); 
      return;
    }
    
    if (e.key === '-') {
      e.preventDefault();
      modifyFontSize(0.5); 
      return;
    }
    if (e.key.length !== 1) return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
    
      if (!range.collapsed) {
        range.deleteContents();
      }
    
      const char = e.key === " " ? "\u00A0" : e.key;
      const span = document.createElement("span");
      span.className = "fading-letter";
      span.textContent = char;
    
      range.insertNode(span);
    
      range.setStartAfter(span);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    
      span.addEventListener("animationend", () => {
        span.classList.remove("fading-letter");
      });
    
      const activeTab = document.querySelector('.tab-content.active');
      if (activeTab) {
        saveTabContent(activeTab.id);
      }
    
      if (particlesEnabled) {
        const rect = span.getBoundingClientRect();
        const x = rect.left + rect.width;
        const y = rect.top + rect.height / 2 + window.scrollY;
        spawnParticles(x, y);
      }
    
      return;
    }
   
  });
 
}


