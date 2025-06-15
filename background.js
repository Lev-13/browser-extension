chrome.runtime.onInstalled.addListener(() => {
  const speeds = [
    ['slow-down-01', 'Slow down (x0.1)'],
    ['slow-down-02', 'Slow down (x0.2)'],
    ['slow-down-04', 'Slow down (x0.4)'],
    ['slow-down-06', 'Slow down (x0.6)'],
    ['slow-down-08', 'Slow down (x0.8)'],
    ['speed-up-20', 'Speed up (x2.0)'],
  ];

  speeds.forEach(([id, title]) => {
    chrome.contextMenus.create({
      id,
      title,
      contexts: ['all'],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, info.menuItemId);
});
