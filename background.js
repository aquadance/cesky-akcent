import { API_KEY } from './config.js';

// URL для API Google TTS
const TTS_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

// При установке создаем ОБА пункта в меню
chrome.runtime.onInstalled.addListener(() => {
  // Пункт для озвучивания
  chrome.contextMenus.create({
    id: "speak-czech-cloud",
    title: "Прочитать вслух (Český Akcent)",
    contexts: ["selection"]
  });
  // НОВЫЙ пункт для добавления в словарь
  chrome.contextMenus.create({
    id: "add-to-dictionary",
    title: "💡 Добавить в словарь",
    contexts: ["selection"]
  });
});

// Обработчик кликов по меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selection = info.selectionText.trim();
  if (!selection) return;

  // Если нажали "Прочитать"
  if (info.menuItemId === "speak-czech-cloud") {
    speakText(selection);
  }
  // Если нажали "Добавить в словарь"
  if (info.menuItemId === "add-to-dictionary") {
    addWordToDictionary(selection);
  }
});

// НОВАЯ функция для перевода и сохранения слова
async function addWordToDictionary(word) {
    try {
        const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=cs|ru`;
        const response = await fetch(translateUrl);
        const data = await response.json();

        if (data && data.responseData) {
            const translation = data.responseData.translatedText;
            
            // Получаем текущий словарь из хранилища
            const result = await chrome.storage.sync.get({ dictionary: [] });
            const dictionary = result.dictionary;

            // Добавляем новое слово (проверяем, чтобы не было дубликатов)
            if (!dictionary.some(item => item.original === word)) {
                dictionary.push({ original: word, translation: translation });
                // Сохраняем обновленный словарь
                await chrome.storage.sync.set({ dictionary: dictionary });
            }
        }
    } catch (error) {
        console.error("Ошибка при переводе или сохранении слова:", error);
    }
}

// --- Старые функции озвучивания (без изменений) ---

async function speakText(text) {
  const settings = await chrome.storage.sync.get({
      voice: 'cs-CZ-Wavenet-A',
      speed: 1
  });

  try {
    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      const error = await response.json();
      console.error('Ошибка от API Google:', error);
      return;
    }
    const data = await response.json();
    await playAudio(data.audioContent);
  } catch (error) {
    console.error('Ошибка при отправке запроса к API:', error);
  }
}

async function playAudio(base64Audio) {
  if (await chrome.offscreen.hasDocument()) {
    chrome.runtime.sendMessage({ type: 'play', target: 'offscreen', data: base64Audio });
  } else {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'Требуется для воспроизведения аудио из Text-to-Speech API',
    });
    chrome.runtime.sendMessage({ type: 'play', target: 'offscreen', data: base64Audio });
  }
}