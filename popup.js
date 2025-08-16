document.addEventListener('DOMContentLoaded', () => {
    const voiceSelect = document.getElementById('voice-select');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const saveButton = document.getElementById('save-button');
    const statusMessage = document.getElementById('status-message');

    // Функция для загрузки настроек
    function loadSettings() {
        // Загружаем, используя значения по умолчанию, если ничего не сохранено
        chrome.storage.sync.get({
            voice: 'cs-CZ-Wavenet-A',
            speed: 1
        }, (items) => {
            voiceSelect.value = items.voice;
            speedSlider.value = items.speed;
            speedValue.textContent = `${parseFloat(items.speed).toFixed(2)}x`;
        });
    }

    // Функция для сохранения настроек
    function saveSettings() {
        const voice = voiceSelect.value;
        const speed = speedSlider.value;

        chrome.storage.sync.set({
            voice: voice,
            speed: speed
        }, () => {
            // Показываем сообщение об успешном сохранении
            statusMessage.textContent = 'Сохранено!';
            setTimeout(() => {
                statusMessage.textContent = '';
            }, 1500); // Сообщение исчезнет через 1.5 секунды
        });
    }

    // Обновляем отображение значения скорости при движении ползунка
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = `${parseFloat(speedSlider.value).toFixed(2)}x`;
    });
    
    // Сохраняем настройки при нажатии на кнопку
    saveButton.addEventListener('click', saveSettings);

    // Загружаем настройки сразу при открытии popup-окна
    loadSettings();
});