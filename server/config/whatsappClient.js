const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('Initializing WhatsApp Client...');

const client = new Client({
  authStrategy: new LocalAuth(), // Saves session to valid re-login
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for some server environments
  }
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED. Scan this with WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
});

client.on('auth_failure', (msg) => {
  console.error('WhatsApp Authentication failure', msg);
});

client.initialize();

module.exports = { client };