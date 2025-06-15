// Simplified version for speed controller options

const DEFAULTS = {
  speed: 1.0,
  displayKeyCode: 86, // V
  rememberSpeed: false,
  audioBoolean: false,
  startHidden: false,
  forceLastSavedSpeed: false,
  enabled: true,
  controllerOpacity: 0.3,
  controllerButtonSize: 14,
  keyBindings: [
    { action: "display", key: 86, value: 0, force: false },
    { action: "slower", key: 83, value: 0.1, force: false },
    { action: "faster", key: 68, value: 0.1, force: false },
    { action: "rewind", key: 90, value: 10, force: false },
    { action: "advance", key: 88, value: 10, force: false },
    { action: "reset", key: 82, value: 1, force: false },
    { action: "fast", key: 71, value: 1.8, force: false }
  ],
  blacklist: "www.instagram.com\ntwitter.com\nimgur.com\nteams.microsoft.com"
};

const keyAliases = {
  32: "Space", 37: "Left", 38: "Up", 39: "Right", 40: "Down",
  186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`",
  219: "[", 220: "\\", 221: "]", 222: "'"
};

// Helpers
function getKeyLabel(keyCode) {
  return keyAliases[keyCode] || String.fromCharCode(keyCode);
}

function saveOptions() {
  const rememberSpeed = document.getElementById("rememberSpeed").checked;
  const audioBoolean = document.getElementById("audioBoolean").checked;
  const enabled = document.getElementById("enabled").checked;
  const startHidden = document.getElementById("startHidden").checked;
  const controllerOpacity = document.getElementById("controllerOpacity").value;
  const controllerButtonSize = document.getElementById("controllerButtonSize").value;
  const blacklist = document.getElementById("blacklist").value.trim();

  const bindings = Array.from(document.querySelectorAll(".shortcut")).map(row => ({
    action: row.querySelector(".action").value,
    key: row.querySelector(".key").keyCode,
    value: parseFloat(row.querySelector(".value").value),
    force: row.querySelector(".force").checked
  }));

  chrome.storage.sync.set({
    rememberSpeed,
    audioBoolean,
    enabled,
    startHidden,
    controllerOpacity,
    controllerButtonSize,
    keyBindings: bindings,
    blacklist
  }, () => {
    document.getElementById("status").textContent = "Options saved!";
    setTimeout(() => document.getElementById("status").textContent = "", 1000);
  });
}

function restoreOptions() {
  chrome.storage.sync.get(DEFAULTS, (items) => {
    document.getElementById("rememberSpeed").checked = items.rememberSpeed;
    document.getElementById("audioBoolean").checked = items.audioBoolean;
    document.getElementById("enabled").checked = items.enabled;
    document.getElementById("startHidden").checked = items.startHidden;
    document.getElementById("controllerOpacity").value = items.controllerOpacity;
    document.getElementById("controllerButtonSize").value = items.controllerButtonSize;
    document.getElementById("blacklist").value = items.blacklist;

    const container = document.getElementById("shortcuts");
    container.innerHTML = ""; // Clear old

    items.keyBindings.forEach(binding => {
      const div = document.createElement("div");
      div.className = "shortcut";
      div.innerHTML = `
        <select class="action">
          <option value="slower">Slower</option>
          <option value="faster">Faster</option>
          <option value="rewind">Rewind</option>
          <option value="advance">Advance</option>
          <option value="reset">Reset</option>
          <option value="fast">Fast</option>
          <option value="display">Toggle Display</option>
        </select>
        <input class="key" type="text" placeholder="Key" readonly />
        <input class="value" type="number" step="0.1" />
        <label><input class="force" type="checkbox" /> Force</label>
        <button class="remove">X</button>
      `;

      div.querySelector(".action").value = binding.action;
      const keyInput = div.querySelector(".key");
      keyInput.value = getKeyLabel(binding.key);
      keyInput.keyCode = binding.key;
      div.querySelector(".value").value = binding.value;
      div.querySelector(".force").checked = binding.force;

      container.appendChild(div);
    });
  });
}

function addShortcut() {
  const container = document.getElementById("shortcuts");
  const div = document.createElement("div");
  div.className = "shortcut";
  div.innerHTML = `
    <select class="action">
      <option value="slower">Slower</option>
      <option value="faster">Faster</option>
      <option value="rewind">Rewind</option>
      <option value="advance">Advance</option>
      <option value="reset">Reset</option>
      <option value="fast">Fast</option>
      <option value="display">Toggle Display</option>
    </select>
    <input class="key" type="text" placeholder="Key" readonly />
    <input class="value" type="number" step="0.1" />
    <label><input class="force" type="checkbox" /> Force</label>
    <button class="remove">X</button>
  `;
  container.appendChild(div);
}

// Event bindings
document.addEventListener("DOMContentLoaded", () => {
  restoreOptions();

  document.getElementById("save").addEventListener("click", saveOptions);
  document.getElementById("add").addEventListener("click", addShortcut);
  document.getElementById("restore").addEventListener("click", () => {
    chrome.storage.sync.set(DEFAULTS, restoreOptions);
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove")) {
      e.target.closest(".shortcut").remove();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.classList.contains("key")) {
      const input = e.target;
      input.value = getKeyLabel(e.keyCode);
      input.keyCode = e.keyCode;
      e.preventDefault();
    }
  });
});
