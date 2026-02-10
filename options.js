// Saves options to chrome.storage
const saveOptions = () => {

  chrome.permissions.request({
    permissions: ['storage']
  }, (granted) => {
    // The callback argument will be true if the user granted the permissions.
    if (granted) {
      
      const newTab = document.getElementById('new-tab-toggle').checked;

      chrome.storage.sync.set(
        { newTab: newTab },
        () => {
          // Update status to let user know options were saved.
          const status = document.getElementById('status');
          status.textContent = 'Options saved.';
          setTimeout(() => {
            status.textContent = '';
          }, 750);
        }
      );
      
    } else {
      alert('Cannot store settings without storage permissions')
    }
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.permissions.contains({
    permissions: ['tabs'],
    origins: ['<all_urls>']
  }, (result) => {
    if (result) {
      chrome.storage.sync.get(
        { newTab: false },
        (items) => {
          document.getElementById('new-tab-toggle').checked = items.newTab;
        }
      );
    }
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);