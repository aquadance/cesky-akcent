document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы для вкладок ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- Элементы для настроек ---
    const voiceSelect = document.getElementById('voice-select');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const saveButton = document.getElementById('save-button');
    const statusMessage = document.getElementById('status-message');

    // --- Элементы для словаря ---
    const dictionaryContent = document.getElementById('dictionary-content');

    // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Убираем класс active у всех кнопок и контентов
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Добавляем класс active нажатой кнопке и соответствующему контенту
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    // --- ЛОГИКА СЛОВАРЯ ---
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
                // Добавляем кнопку удаления с data-атрибутом
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
    
    // НОВАЯ функция для удаления слова
    async function deleteWord(wordToDelete) {
        const result = await chrome.storage.sync.get({ dictionary: [] });
        let dictionary = result.dictionary;
        // Фильтруем массив, оставляя все слова, кроме удаляемого
        dictionary = dictionary.filter(item => item.original !== wordToDelete);
        await chrome.storage.sync.set({ dictionary: dictionary });
        // Обновляем отображение словаря
        displayDictionary();
    }

    // Слушатель для кнопок удаления (используем делегирование событий)
    dictionaryContent.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const wordToDelete = event.target.dataset.word;
            deleteWord(wordToDelete);
        }
    });

    // --- ЛОГИКА НАСТРОЕК ---
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
        const voice = voiceSelect.value;
        const speed = speedSlider.value;
        chrome.storage.sync.set({
            voice: voice,
            speed: speed
        }, () => {
            statusMessage.textContent = 'Сохранено!';
            setTimeout(() => { statusMessage.textContent = ''; }, 1500);
        });
    }

    // --- Слушатели событий для настроек ---
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = `${parseFloat(speedSlider.value).toFixed(2)}x`;
    });
    saveButton.addEventListener('click', saveSettings);
    
    // --- Инициализация при открытии ---
    loadSettings();
    displayDictionary();
});