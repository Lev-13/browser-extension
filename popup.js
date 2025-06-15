const MessageTypes = {
  SET_SPEED: 'VSC_SET_SPEED',
  ADJUST_SPEED: 'VSC_ADJUST_SPEED',
  RESET_SPEED: 'VSC_RESET_SPEED',
};

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(null, (storage) => {
    const getStep = (action, def) =>
      (storage.keyBindings?.find(kb => kb.action === action)?.value) ?? def;

    const slower = getStep("slower", 0.1),
          faster = getStep("faster", 0.1),
          reset = getStep("fast", 1.0);

    updateBtn("#speed-decrease", -slower);
    updateBtn("#speed-increase", faster);
    const resetBtn = document.querySelector("#speed-reset");
    if (resetBtn) resetBtn.textContent = reset;

    initBtn("#speed-decrease", () => send("ADJUST_SPEED", { delta: -slower }));
    initBtn("#speed-increase", () => send("ADJUST_SPEED", { delta: faster }));
    initBtn("#speed-reset", () => send("RESET_SPEED"));
    document.querySelectorAll(".preset-btn").forEach(btn =>
      btn.addEventListener("click", () => send("SET_SPEED", { speed: +btn.dataset.speed }))
    );
  });

  initBtn("#config", () => window.open(chrome.runtime.getURL("options.html")));

  initBtn("#disable", function () {
    const enabled = this.classList.contains("disabled");
    chrome.storage.sync.set({ enabled }, () => updateUI(enabled, true));
  });

  chrome.storage.sync.get({ enabled: true }, ({ enabled }) => updateUI(enabled));

  function updateUI(enabled, showMsg) {
    const btn = document.querySelector("#disable");
    btn.classList.toggle("disabled", !enabled);
    btn.title = enabled ? "Disable Extension" : "Enable Extension";
    const suffix = enabled ? "" : "_disabled";
    chrome.action.setIcon({
      path: {
        "19": `icons/icon19${suffix}.png`,
        "38": `icons/icon38${suffix}.png`,
        "48": `icons/icon48${suffix}.png`,
      }
    });
    if (showMsg) showStatus(`${enabled ? "Enabled" : "Disabled"}. Reload page.`);
  }

  function showStatus(msg) {
    const el = document.querySelector("#status");
    if (el) {
      el.classList.remove("hide");
      el.innerText = msg;
    }
  }

  function updateBtn(sel, delta) {
    const btn = document.querySelector(sel);
    if (btn) {
      btn.dataset.delta = delta;
      const span = btn.querySelector("span");
      if (span) span.textContent = delta > 0 ? `+${delta}` : delta;
    }
  }

  function initBtn(selector, handler) {
    const el = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (el) el.addEventListener("click", handler);
  }

  function send(type, payload = {}) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab) chrome.tabs.sendMessage(tab.id, { type: MessageTypes[type], payload });
    });
  }
});
