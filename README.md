# Český Akcent - Language Learning Assistant

Český Akcent is a browser extension designed to help users learn and practice the Czech language by turning any webpage into an interactive learning environment. It goes beyond simple text-to-speech, offering tools to build a personal vocabulary and manage learning materials on the fly.



---

## ✨ Key Features

* **High-Quality Text-to-Speech**: Highlight any Czech text on a webpage to hear it pronounced by a natural-sounding, cloud-based voice.
* **Customizable Audio**: Use the intuitive popup menu to choose between different voices and adjust the playback speed to your liking.
* **Contextual Vocabulary Builder**: Right-click on any unfamiliar word to instantly translate it and save it to your personal dictionary.
* **Personal Dictionary**: All saved words are collected in a dedicated "Dictionary" tab within the popup, allowing you to review your vocabulary anytime.
* **Word Management**: Easily manage your dictionary by deleting individual words as you learn them.
* **Instant On-Page Feedback**: Get a seamless, non-intrusive confirmation tooltip next to the word right after you save it to your dictionary.
* **Full Playback Control**: A dedicated "Stop" button allows you to immediately halt audio playback, which is perfect for longer text selections.

---

## 🛠️ Tech Stack & APIs

This project was built using modern web technologies and Chrome Extension APIs (Manifest V3).

* **Core Technologies**: `HTML5`, `CSS3`, `JavaScript (ES6 Modules)`

* **Chrome Extension APIs (Manifest V3)**:
    * `chrome.contextMenus`: To create the right-click menu options ("Read aloud" and "Add to Dictionary").
    * `chrome.storage.sync`: To securely save user settings and the vocabulary list, syncing them across all user's devices.
    * `chrome.offscreen`: To reliably play audio from a service worker context, a requirement for Manifest V3.
    * `chrome.tabs.sendMessage` & `chrome.runtime.onMessage`: For robust communication between the background script, popup, and content scripts.
    * `content_scripts`: To inject the custom tooltip directly onto the webpage for instant user feedback.

* **External APIs**:
    * **Google Cloud Text-to-Speech API**: Leveraged for its high-quality, natural "WaveNet" voices.
    * **MyMemory Translation API**: Used as a free, reliable, and key-less API for on-the-fly word translation.

---

## 🚀 Setup & Installation

To run this extension locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/cesky-akcent.git](https://github.com/your-username/cesky-akcent.git)
    ```

2.  **Create your configuration file:**
    * In the project's root directory, you will find a file named `config.example.js`.
    * Duplicate this file and rename the copy to `config.js`.
    * Open `config.js` and paste your Google Cloud Text-to-Speech API key into the `API_KEY` constant. This file is included in `.gitignore` to keep your key private.

3.  **Load the extension in your browser:**
    * Open your browser (Chrome, Edge, etc.) and navigate to `chrome://extensions`.
    * Enable **"Developer mode"** using the toggle switch in the top-right corner.
    * Click on the **"Load unpacked"** button.
    * Select the entire `cesky-akcent` project folder.

The extension icon should now appear in your browser's toolbar.

---

## © Credits

* Icons used in this project were created by **Freepik - Flaticon**.
