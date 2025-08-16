// Импортируем наш секретный ключ из файла config.js
import { API_KEY } from './config.js';

// URL для обращения к API Google
const API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

// Создание пункта в меню при установке расширения
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "speak-czech-cloud",
    title: "Прочитать вслух (Český Akcent)",
    contexts: ["selection"]
  });
});

// Обработчик клика по нашему пункту в меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "speak-czech-cloud" && info.selectionText) {
    // Вызываем главную функцию озвучивания
    speakText(info.selectionText);
  }
});

// Асинхронная функция для отправки текста в Google и получения аудио
async function speakText(text) {
  // Сначала получаем настройки пользователя из хранилища
  const settings = await chrome.storage.sync.get({
      voice: 'cs-CZ-Wavenet-A', // Голос по умолчанию
      speed: 1                  // Скорость по умолчанию
  });

  try {
    // Отправляем запрос (fetch) в Google Cloud API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text: text },
        // Используем голос, полученный из настроек
        voice: { languageCode: 'cs-CZ', name: settings.voice },
        // Используем скорость, полученную из настроек
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
    
    const audioContent = data.audioContent;
    await playAudio(audioContent);

  } catch (error) {
    console.error('Ошибка при отправке запроса к API:', error);
  }
}

// Функция для управления невидимым плеером (Offscreen Document)
async function playAudio(base64Audio) {
  // Проверяем, есть ли уже активный плеер
  if (await chrome.offscreen.hasDocument()) {
    // Если есть, просто отправляем ему новые аудиоданные для проигрывания
    chrome.runtime.sendMessage({
      type: 'play',
      target: 'offscreen',
      data: base64Audio
    });
  } else {
    // Если плеера нет, создаем его
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'Требуется для воспроизведения аудио из Text-to-Speech API',
    });
    // Сразу после создания отправляем аудиоданные
     chrome.runtime.sendMessage({
      type: 'play',
      target: 'offscreen',
      data: base64Audio
    });
  }
}