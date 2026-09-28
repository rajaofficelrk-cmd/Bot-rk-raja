// server.js — RK MASTI BOT
const express = require('express');
const bodyParser = require('body-parser');
const login = require('ws3-fca');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ============ CONFIG ============
const BOT_NAME = 'RK RAJA';           // header me dikhega
const SIGNATURE = '\n\n❥ rk raja xwd ❥';
const SEPARATOR = '\n━━━━━━━━━━━━━━━━━';

// ============ GLOBAL STATE ============
let botAPI = null;
let adminID = null;
let botID = null;
let prefix = '/';
let currentCookies = null;
let userData = {};   // { userID: { xp, level } }
let lastReply = {};  // anti-spam

// ============ LOGGER ============
function emitLog(msg, isErr = false) {
  const line = `[${new Date().toISOString()}] ${isErr ? 'ERROR: ' : 'INFO: '}${msg}`;
  console.log(line);
  io.emit('botlog', line);
}

// ============ SHAYARI (Unlimited-feel, random) ============
const SHAYARI = [
  "Tere bina zindagi adhoori si lagti hai,\nTere saath har khushi poori si lagti hai 💕",
  "Chand bhi sharma jaye teri chamak se,\nTaare bhi jal jaye teri ek jhalak se 🌙✨",
  "Dil ki gehraiyon me tera naam likha hai,\nHar dhadkan pe tera hi paigam likha hai ❤️",
  "Meri subah tu, meri shaam tu,\nMeri har dua me sirf tera naam tu 🌸",
  "Tujhse milke laga jaise mil gaya jahan,\nTere bina lage jaise kho gaya samaa 💫",
  "Aankhon me teri doob jana chahta hu,\nHar janam tujhe hi paana chahta hu 👀💘",
  "Teri muskurahat meri jaan le jaati hai,\nHar baar mujhe pagal bana jaati hai 😍",
  "Zulfon me teri uljhana chahta hu,\nSaari umar tujhme khona chahta hu 🌹",
  "Pyaar ka matlab sirf tum ho,\nMeri har khushi ka sabab sirf tum ho 💖",
  "Tere ishq me pagal ho chuka hu,\nTere bina ab tanha ho chuka hu 🥀",
  "Hawaon me teri khushboo aati hai,\nHar pal teri yaad rulati hai 🍃",
  "Teri baaton me jaadu sa hai,\nMera dil ab bas tera sa hai ✨",
  "Tujhe dekh ke aankhein thak nahi sakti,\nTere bina dhadkan rakk nahi sakti 💓",
  "Meri raat ki tu hi chaandni hai,\nMeri zindagi ki tu hi roshni hai 🌕",
  "Tere naam pe likh di zindagi meri,\nTujhse hi shuru tujhpe khatam kahani meri 📖",
  "Ishq ka rang chadha hai mujhpe,\nTera nasha chadha hai mujhpe 🍷",
  "Tujhe paane ki dua karta hu,\nHar janam tujhe chahta hu 🤲",
  "Teri aankhon ka nasha alag hai,\nTeri baahon ka jahaan alag hai 💞",
  "Tere bin ye dil udaas rehta hai,\nHar lamha teri hi pyaas rehta hai 🥺",
  "Teri hansi meri duniya hai,\nTera gham mera sara jahaan hai 💔",
  "Tujhse juda hoke ji nahi sakta,\nTere bina kuch bhi nahi sakta 🌷",
  "Tere ishq me doob gaya hu,\nTere naam se jud gaya hu ⚓",
  "Aaja baahon me meri jaan-e-jaan,\nTere bina soona hai ye jahaan 🌌",
  "Tere labon ki hasi chura lu,\nTere dil me ghar bana lu 🏠",
  "Meri saanso me tera naam hai,\nMeri har dua me tera kaam hai 🙏",
  "Tujhe chahne laga hu main,\nTere hi khwab bunta hu main 💭",
  "Tere saath waqt guzarne ka maza alag hai,\nTere bina jeevan ek sazaa alag hai ⏳",
  "Meri jaan tu, mera jahaan tu,\nMeri har khushi ka samaan tu 💗",
  "Tere bina kya hai meri zindagi,\nAdhoori si ek lambi raat hai 🌃",
  "Tera naam labon pe aata hai,\nDil tera hi gungan karta hai 🎶",
  "Tujhe dekhta hu toh kho jata hu,\nTere ishq me ho jata hu 🥰",
  "Meri duniya tu, mera aasmaan tu,\nMera har armaan, meri jaan tu 💝",
  "Tere pyaar ka sahara mila,\nMujhe jeevan ka kinara mila 🌅",
  "Tere bina kuch accha nahi lagta,\nTere bina dil lagta nahi 😐",
  "Tu meri subah ki pehli soch hai,\nTu meri raat ki aakhri khwahish hai 🌄",
  "Tere ishq ki barish me bheeg gaya,\nTere pyaar me kho gaya 🎐",
  "Mera dil tera, meri jaan teri,\nMeri saari khushiyan teri 🎁",
  "Tere bina ye dil veeran hai,\nTere saath har pal mehmaan hai 🏝️",
  "Tujhe paane ki koshish me hu,\nTere ishq ki aag me hu 🔥",
  "Teri yaadon me kho jata hu,\nTujhe soch ke muskura jata hu 😊",
  "Meri zindagi ka tu hi savera hai,\nTu hi mera har andhera hai 🌟",
  "Tere naam ki mehendi lagau,\nTujhe dil me basa lu 💐",
  "Tujhse pyaar karta hu beshumar,\nTere liye hu beqarar 💓",
  "Meri har dhadkan me tu hai,\nMeri har saans me tu hai 💖",
  "Tere bina jeena mushkil hai,\nTere pyaar ka asar dil hai 🩹"
];

// ============ FLIRT TRIGGERS ============
const FLIRT_WORDS = [
  'babu','sona','jaan','jaanu','jaana','i love you','love you','pyar',
  'mohabbat','cutie','sweetheart','baby','dear','honey','jaaneman',
  'shona','babu ji','dil','meri jaan','i luv u','love u','fuck','babe'
];

const FLIRT_REPLIES = [
  "Arre babu 😍 tumse pyaar to hume bhi hai, par pehle level badhao 😏",
  "Sona 💋 tumhari baatein sunke dil pighal jata hai 🫠",
  "Oye jaan 🥰 itna pyaar kaha chhupa rahe the ab tak? 💕",
  "Babu tumhara DP dekh ke toh hum fida ho gaye 😍💘",
  "I love you bhi bolegi toh hum kya kare? 😳 dil de denge 💝",
  "Cutie 🥺 tumhari ek smile pe hum apni jaan de de 😘",
  "Sweetheart 💖 tumhare liye toh hum chaand bhi todke laaye 🌙",
  "Jaaneman 💗 tumhari baat karne ka andaz hi alag hai 🥰",
  "Honey 🍯 tumhari aankhon me doob gaye hum 😵‍💫",
  "Babe 😏 itna flirt mat karo, hum control kho denge 🔥",
  "Meri jaan 💕 tumse milke laga zindagi poori ho gayi 🌸",
  "Shona 🥰 tumhare msg ka wait rehta hai hume har pal 😌",
  "Dil 💓 tumhara hai, jaan bhi tumhari, ab kya chahiye? 😘",
  "Oye babu 😜 itni pyaari baatein karke kaha bhagoge? 😏",
  "Sona 💖 tumhare liye hum pagal ho gaye hai 🥺",
  "I love you too jaan 💝 ab toh bas tumhara hu ❤️",
  "Jaana 💕 tumhari har baat dil se lagti hai 🥰",
  "Cutie 😘 tumhara naam lete hi muskaan aa jaati hai 😊",
  "Babu 💗 tum toh humari dhadkan ban gayi ho 💓",
  "Baby 😏 tumse pyaar karna hi humari zindagi hai 💖"
];

const JOKES = [
  "Ek ladki ne pucha tum mujhse pyaar karte ho? Maine kaha — Google pe search karo, results dekh lo 😂",
  "Pyaar me pagal ho gaya, ab WhatsApp pe bhi status 'single' hi rakhta hu 😆",
  "Ladki: Tum kya karte ho? Main: Tera intezaar 😌😏",
  "Ek baar pyaar kiya toh dosti barbaad ho gayi 😂",
  "Ladki boli: mujhe tumse baat nahi karni. Maine kaha: toh call kar lo 😜",
  "Pyaar ka matlab samjho — pehle dil, phir dimag 😂",
  "Meri girlfriend boli: tum mujhe kitna pyaar karte ho? Maine kaha: 5G se zyada fast 😆",
  "Shaadi ka laddoo jo khaye woh pachtaye, jo na khaye woh bhi pachtaye 😂",
  "Ex boli: move on kar lo. Maine kaha: pehle khud to kar lo 🤣",
  "Ladki: tumhe mujhme kya pasand hai? Main: bas tumhari WhatsApp DP 😜"
];

// ============ LEVEL / XP ============
function getLevel(xp) { return Math.floor(Math.sqrt(xp / 50)) + 1; }
function xpForNext(level) { return 50 * level * level; }

function addXP(userID, amount = 10) {
  if (!userData[userID]) userData[userID] = { xp: 0, level: 1 };
  userData[userID].xp += amount;
  userData[userID].level = getLevel(userData[userID].xp);
  return userData[userID];
}

function getUser(userID) {
  if (!userData[userID]) userData[userID] = { xp: 0, level: 1 };
  return userData[userID];
}

// ============ RANDOM HELPERS ============
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const hasFlirt = txt => FLIRT_WORDS.some(w => txt.toLowerCase().includes(w));

// ============ FORMAT REPLY ============
async function buildReply(api, event, mainText, attachURL = null) {
  const { senderID, threadID } = event;
  const u = addXP(senderID, 10);
  const nextXP = xpForNext(u.level);
  const remaining = Math.max(0, nextXP - u.xp);

  let name = 'User';
  try {
    const info = await api.getUserInfo(senderID);
    name = info?.[senderID]?.name || `User-${senderID}`;
  } catch { name = `User-${senderID}`; }

  const body =
`@${name} ${mainText}

╭─❰ 📊 PLAYER STATS ❱─╮
│ 🎖️ Level : ${u.level}
│ ⚡ XP : ${u.xp}
│ 🎯 Next : ${remaining} XP more
╰────────────────────╯
${SIGNATURE}
━━━━━━━━━━━━━━━━━`;

  const msg = {
    body,
    mentions: [{ tag: `@${name}`, id: senderID }]
  };
  if (attachURL) msg.attachment = await api.streamFromURL ? null : attachURL;
  if (attachURL) msg.attachment = attachURL;
  return msg;
}

// ============ LOGIN ============
function initializeBot(cookies) {
  emitLog('Initializing bot...');
  currentCookies = cookies;

  login({ appState: cookies }, (err, api) => {
    if (err) {
      emitLog('Login error: ' + err.message, true);
      setTimeout(() => initializeBot(cookies), 8000);
      return;
    }
    botAPI = api;
    botID = api.getCurrentUserID();
    api.setOptions({ selfListen: false, listenEvents: true, updatePresence: false });
    emitLog('Bot logged in successfully. Bot ID: ' + botID);
    io.emit('bot-ready', { botID });

    setTimeout(() => {
      api.listenMqtt((err, event) => {
        if (err) { emitLog('Listener err: ' + err.message, true); return; }
        handleEvent(api, event).catch(e => emitLog('Handler: ' + e.message, true));
      });
    }, 1500);
  });
}

// ============ EVENT HANDLER ============
async function handleEvent(api, event) {
  if (!event || !event.body) return;
  if (event.type !== 'message' && event.type !== 'message_reply') return;
  if (event.senderID === botID) return;

  const { threadID, senderID, body } = event;
  const txt = body.trim().toLowerCase();

  // anti-spam 1.2s
  const now = Date.now();
  if (lastReply[senderID] && now - lastReply[senderID] < 1200) return;
  lastReply[senderID] = now;

  // --- ADMIN COMMANDS ---
  const prefixes = ['/', '.', '#', '@'];
  const usedPrefix = prefixes.find(p => txt.startsWith(p));
  if (usedPrefix && senderID === adminID) {
    const cmd = txt.slice(1).split(/\s+/)[0];
    if (cmd === 'reset') {
      userData = {};
      return api.sendMessage('✅ All user XP reset.', threadID);
    }
    if (cmd === 'stats') {
      return api.sendMessage(
        `📊 Total users tracked: ${Object.keys(userData).length}`,
        threadID
      );
    }
    if (cmd === 'help') {
      return api.sendMessage(
        `🤖 RK MASTI BOT\n\n` +
        `${usedPrefix}reset - reset all xp\n` +
        `${usedPrefix}stats - total users\n` +
        `${usedPrefix}help  - ye menu`,
        threadID
      );
    }
  }

  // --- KEYWORD: shayari ---
  if (txt.includes('shayari') || txt.includes('shayri')) {
    let dp = null;
    try { const u = await api.getUserInfo(senderID); dp = u?.[senderID]?.profileUrl; } catch {}
    const msg = await buildReply(api, event, rand(SHAYARI), dp);
    return api.sendMessage(msg, threadID);
  }

  // --- KEYWORD: joke ---
  if (txt.includes('joke') || txt.includes('jokes')) {
    return api.sendMessage(await buildReply(api, event, rand(JOKES)), threadID);
  }

  // --- KEYWORD: dp / profile ---
  if (txt.includes('dp') || txt.includes('profile')) {
    let dp = null, name = 'User';
    try {
      const u = await api.getUserInfo(senderID);
      dp = u?.[senderID]?.profileUrl;
      name = u?.[senderID]?.name || name;
    } catch {}
    const ud = getUser(senderID);
    return api.sendMessage({
      body:
`@${name} ye teri DP 😍

╭─❰ 📊 PLAYER STATS ❱─╮
│ 🎖️ Level : ${ud.level}
│ ⚡ XP : ${ud.xp}
╰────────────────────╯
${SIGNATURE}
━━━━━━━━━━━━━━━━━`,
      mentions: [{ tag: `@${name}`, id: senderID }],
      attachment: dp ? await api.getUserInfo ? null : null : null
    }, threadID);
  }

  // --- FLIRT TRIGGER ---
  if (hasFlirt(txt)) {
    return api.sendMessage(await buildReply(api, event, rand(FLIRT_REPLIES)), threadID);
  }

  // --- DEFAULT: random reply with stats ---
  const defaults = [
    "Kya baat karni hai babu? 😏 shayari, joke, ya flirt?",
    "Bolo jaan 💕 kya chahiye — shayari / joke / dp",
    "Haan bolo 😌 'shayari' likho toh shayari sunau, 'joke' likho toh hasau",
    "Kya haal hai cutie? 🥰 kuch bolo na"
  ];
  return api.sendMessage(await buildReply(api, event, rand(defaults)), threadID);
}

// ============ WEB DASHBOARD ============
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.post('/configure', (req, res) => {
  try {
    let { cookies, adminID: aID, prefix: pfx } = req.body;
    if (typeof cookies === 'string') cookies = JSON.parse(cookies);
    if (!Array.isArray(cookies) || cookies.length === 0)
      return res.status(400).send('Invalid C3C/cookies array');
    if (!aID) return res.status(400).send('Admin ID required');

    adminID = String(aID).trim();
    prefix = pfx || '/';
    if (!['/', '.', '#', '@'].includes(prefix)) prefix = '/';

    emitLog(`Admin: ${adminID} | Prefix: ${prefix}`);
    res.send('Configured ✅ Bot starting...');

    initializeBot(cookies);
  } catch (e) {
    emitLog('Configure error: ' + e.message, true);
    res.status(400).send('Error: ' + e.message);
  }
});

// ============ SERVER ============
const PORT = process.env.PORT || 20018;
server.listen(PORT, () => emitLog(`Server running on port ${PORT}`));

io.on('connection', socket => {
  emitLog('Dashboard connected');
  socket.emit('botlog', `Status: ${botAPI ? 'Running' : 'Not started'}`);
  socket.emit('bot-ready', { botID });
});
