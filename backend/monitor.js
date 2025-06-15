const axios = require('axios');

const URL_TO_MONITOR = 'http://localhost:5000/health'; 
const BOT_TOKEN = '7811521792:AAHvgJxtalJtQBFqHn71KHj6vUM1yL4nnrE';
const CHAT_ID = '6662566183';

let isDown = false;

console.log("inside monitor file");

async function sendTelegramAlert(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    });
    console.log("Telegram alert sent:", message);
  } catch (error) {
    console.error("Telegram error:", error.message);
  }
}

async function checkBackend() {
  try {
    await axios.get(URL_TO_MONITOR);
    console.log(`[UP] ${new Date().toLocaleTimeString()}`);

    if (isDown) {
      await sendTelegramAlert("✅ Backend is UP again!");
      isDown = false;
    }
  } catch (err) {
    console.log(`[DOWN] ${new Date().toLocaleTimeString()}`);
    if (!isDown) {
      await sendTelegramAlert("🚨 Backend is DOWN!");
      isDown = true;
    }
  }
}

setInterval(checkBackend, 60000); 
