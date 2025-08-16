document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const voiceSelect = document.getElementById('voice-select');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const saveButton = document.getElementById('save-button');
    const statusMessage = document.getElementById('status-message');
    const dictionaryContent = document.getElementById('dictionary-content');
    const stopButton = document.getElementById('stop-button');
  
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
  
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
      });
    });
  
    function displayDictionary() {
      chrome.storage.sync.get({ dictionary: [] }, (items) => {
        const dictionary = items.dictionary;
        dictionaryContent.innerHTML = '';
  
        if (dictionary.length === 0) {
          dictionaryContent.innerHTML = '<p class="empty-message">Ваш словарь пока пуст.</p>';
          return;
        }
  
        const list = document.createElement('ul');
        list.className = 'dictionary-list';
        dictionary.forEach(item => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `
            <div class="word-pair">
              <span class="original-word">${item.original}</span>
              <span class="translation">${item.translation}</span>
            </div>
            <button class="delete-btn" data-word="${item.original}" title="Удалить слово">×</button>
          `;
          list.appendChild(listItem);
        });
        dictionaryContent.appendChild(list);
      });
    }
  
    async function deleteWord(wordToDelete) {
      const result = await chrome.storage.sync.get({ dictionary: [] });
      let dictionary = result.dictionary;
      dictionary = dictionary.filter(item => item.original !== wordToDelete);
      await chrome.storage.sync.set({ dictionary: dictionary });
      displayDictionary();
    }
  
    dictionaryContent.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-btn')) {
        deleteWord(event.target.dataset.word);
      }
    });
  
    function loadSettings() {
      chrome.storage.sync.get({
        voice: 'cs-CZ-Wavenet-A',
        speed: 1
      }, (items) => {
        voiceSelect.value = items.voice;
        speedSlider.value = items.speed;
        speedValue.textContent = `${parseFloat(items.speed).toFixed(2)}x`;
      });
    }
  
    function saveSettings() {
      chrome.storage.sync.set({
        voice: voiceSelect.value,
        speed: speedSlider.value
      }, () => {
        statusMessage.textContent = 'Сохранено!';
        setTimeout(() => {
          statusMessage.textContent = '';
        }, 1500);
      });
    }
  
    speedSlider.addEventListener('input', () => {
      speedValue.textContent = `${parseFloat(speedSlider.value).toFixed(2)}x`;
    });
  
    saveButton.addEventListener('click', saveSettings);
  
    stopButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'stop-audio' });
    });
  
    loadSettings();
    displayDictionary();
  });