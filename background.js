import { API_KEY } from './config.js';

const TTS_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

// --- Код создания меню и добавления слов (без изменений) ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "speak-czech-cloud", title: "Прочитать вслух (Český Akcent)", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "add-to-dictionary", title: "💡 Добавить в словарь", contexts: ["selection"] });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selection = info.selectionText.trim();
  if (!selection) return;
  if (info.menuItemId === "speak-czech-cloud") { speakText(selection); }
  if (info.menuItemId === "add-to-dictionary") { addWordToDictionary(selection); }
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
            if (!dictionary.some(item => item.original === word)) {
                dictionary.push({ original: word, translation: translation });
                await chrome.storage.sync.set({ dictionary: dictionary });
            }
        }
    } catch (error) { console.error("Ошибка при переводе или сохранении слова:", error); }
}
// --- Код озвучивания (без изменений) ---
async function speakText(text) {
  const settings = await chrome.storage.sync.get({ voice: 'cs-CZ-Wavenet-A', speed: 1 });
  try {
    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: text },
        voice: { languageCode: 'cs-CZ', name: settings.voice },
        audioConfig: { audioEncoding: 'MP3', speakingRate: settings.speed }
      })
    });
    if (!response.ok) {
      console.error('Ошибка от API Google:', await response.json());
      return;
    }
    const data = await response.json();
    await playAudio(data.audioContent);
  } catch (error) { console.error('Ошибка при отправке запроса к API:', error); }
}
async function playAudio(base64Audio) {
  if (await chrome.offscreen.hasDocument()) {
    await chrome.offscreen.closeDocument(); // Закрываем старый плеер на всякий случай
  }
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Требуется для воспроизведения аудио',
  });
  chrome.runtime.sendMessage({ type: 'play', target: 'offscreen', data: base64Audio });
}

// --- НОВАЯ, УПРОЩЕННАЯ ЛОГИКА ДЛЯ КОМАНДЫ "СТОП" ---
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'stop-audio') {
        // Проверяем, есть ли активный плеер
        if (await chrome.offscreen.hasDocument()) {
            // Если есть - просто закрываем его
            await chrome.offscreen.closeDocument();
        }
    }
});