
document.addEventListener("DOMContentLoaded", () => {

  
  const theme = localStorage.getItem("editorTheme") || "dark";
   // other init functions
  initTabs();
  initTypingEffects();
 


document.addEventListener("keydown", (e) => {
  // Ctrl+L keybind
  if (e.ctrlKey && e.key.toLowerCase() === "l") {
    e.preventDefault();
    toggleLined();
  }
});

function toggleLined() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  if (!selectedText) return;

  const container = document.createElement("div");
  container.appendChild(range.cloneContents());

  // Check if selection already contains a .lined span
  const alreadyLined = container.querySelector(".lined");

  if (alreadyLined) {
    // --- Unwrap: remove <span class="lined">
    const span = alreadyLined;
    const parent = span.parentNode;
    while (span.firstChild) {
      parent.insertBefore(span.firstChild, span);
    }
    parent.removeChild(span);
  } else {
    // --- Wrap: apply line-through
    const span = document.createElement("span");
    span.classList.add("lined");
    span.textContent = selectedText;

    range.deleteContents();
    range.insertNode(span);
  }
}


});
