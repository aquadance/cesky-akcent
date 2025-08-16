import { API_KEY } from './config.js';

const TTS_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "speak-czech-cloud",
    title: "Прочитать вслух (Český Akcent)",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "add-to-dictionary",
    title: "💡 Добавить в словарь",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selection = info.selectionText.trim();
  if (!selection) {
    return;
  }
  if (info.menuItemId === "speak-czech-cloud") {
    speakText(selection);
  }
  if (info.menuItemId === "add-to-dictionary") {
    addWordToDictionary(selection);
  }
});

async function addWordToDictionary(word) {
  try {
    const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=cs|ru`;
    const response = await fetch(translateUrl);
    const data = await response.json();

    if (data && data.responseData) {
      const translation = data.responseData.translatedText;
      const result = await chrome.storage.sync.get({ dictionary: [] });
      const dictionary = result.dictionary;
      let messageText = '';

      if (!dictionary.some(item => item.original === word)) {
        dictionary.push({ original: word, translation: translation });
        await chrome.storage.sync.set({ dictionary: dictionary });
        messageText = '✅ Сохранено!';
      } else {
        messageText = 'Уже в словаре';
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'SHOW_TOOLTIP',
            text: messageText
          });
        } catch (error) {
          if (error.message.includes('Receiving end does not exist')) {
            console.log("Content script not ready on this tab.");
          } else {
            throw error;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing word:", error);
  }
}

async function speakText(text) {
  const settings = await chrome.storage.sync.get({
    voice: 'cs-CZ-Wavenet-A',
    speed: 1
  });

  try {
    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text: text },
        voice: { languageCode: 'cs-CZ', name: settings.voice },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: settings.speed
        }
      })
    });

    if (!response.ok) {
      console.error('Google API Error:', await response.json());
      return;
    }

    const data = await response.json();
    await playAudio(data.audioContent);
  } catch (error) {
    console.error('API request error:', error);
  }
}

async function playAudio(base64Audio) {
  if (await chrome.offscreen.hasDocument()) {
    await chrome.offscreen.closeDocument();
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Required for audio playback.',
  });

  chrome.runtime.sendMessage({
    type: 'play',
    target: 'offscreen',
    data: base64Audio
  });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'stop-audio') {
    if (await chrome.offscreen.hasDocument()) {
      await chrome.offscreen.closeDocument();
    }
  }
  return true;
});