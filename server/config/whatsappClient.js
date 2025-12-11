// const { Client, LocalAuth } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');

// console.log('Initializing WhatsApp Client...');

// const client = new Client({
//   authStrategy: new LocalAuth(), // Saves session to valid re-login
//   puppeteer: {
//     args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for some server environments
//   }
// });

// client.on('qr', (qr) => {
//   console.log('QR RECEIVED. Scan this with WhatsApp:');
//   qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//   console.log('WhatsApp Client is ready!');
// });

// client.on('auth_failure', (msg) => {
//   console.error('WhatsApp Authentication failure', msg);
// });

// client.initialize();

// module.exports = { client };

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

console.log('Initializing WhatsApp Client...');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

// Pairing Code Logic
const pairingNumber = process.env.WA_PAIRING_NUMBER; // e.g. 254712345678
let pairingCodeRequested = false;

client.on('qr', async (qr) => {
  if (pairingNumber && !pairingCodeRequested) {
    // If a number is provided in ENV, use Pairing Code instead of QR
    pairingCodeRequested = true; // Prevent multiple requests
    try {
      console.log(`Requesting Pairing Code for: ${pairingNumber}...`);
      const code = await client.requestPairingCode(pairingNumber);
      console.log('------------------------------------------------');
      console.log(`YOUR PAIRING CODE: ${code}`);
      console.log('------------------------------------------------');
      console.log('Open WhatsApp > Linked Devices > Link a Device > Link with phone number instead');
    } catch (err) {
      console.error('Failed to request pairing code:', err);
    }
  } else if (!pairingNumber) {
    // Fallback to QR code if no number provided
    console.log('QR RECEIVED. Scan this with WhatsApp:');
    qrcode.generate(qr, { small: true });
  }
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
});

client.on('authenticated', () => {
    console.log('WhatsApp Authenticated successfully.');
});

client.initialize();

module.exports = { client };