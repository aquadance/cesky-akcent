chrome.runtime.onMessage.addListener((msg) => {
  if (msg.target === 'offscreen' && msg.type === 'play') {
    const audioPlayer = document.querySelector('#player');
    audioPlayer.src = `data:audio/mp3;base64,${msg.data}`;
    audioPlayer.play();
  }
});