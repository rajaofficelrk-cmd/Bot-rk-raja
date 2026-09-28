// server.js — RK RAJA MASTI BOT v3 (FCA fallback + FYT + Locks + File upload + Bot UID)
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// ==================================================
// ============ FCA LOADER (multi fallback) =========
// ==================================================
let login = null;
let fcaName = 'unknown';

function loadFCA() {
  const candidates = [
    'ws3-fca',
    '@dongdev/fca-unofficial',
    'fca-unofficial',
    'facebook-chat-api',
    'fca-super',
    'fca-unofficial-custom'
  ];
  for (const name of candidates) {
    try {
      const mod = require(name);
      const fn =
        typeof mod === 'function' ? mod :
        (mod && typeof mod.login === 'function') ? mod.login :
        (mod && mod.default && typeof mod.default === 'function') ? mod.default :
        (mod && mod.default && typeof mod.default.login === 'function') ? mod.default.login :
        null;
      if (typeof fn === 'function') {
        login = fn;
        fcaName = name;
        return true;
      }
    } catch (e) { /* try next */ }
  }
  return false;
}

if (!loadFCA()) {
  console.log('❌ No FCA package found. Install: npm i ws3-fca');
  process.exit(1);
}
console.log('✅ FCA loaded:', fcaName);

// ==================================================
// ================== APP SETUP =====================
// ==================================================
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ==================================================
// ================== CONFIG ========================
// ==================================================
const BOT_NAME = 'RK RAJA XWD';
const SIGNATURE = '\n\n❥ RK RAJA XWD ❥';
const SEPARATOR = '\n━━━━━━━━━━━━━━━━━';
const PREFIXES = ['/', '.', '#', '@'];
const KICK_LIMIT = 3;

// ==================================================
// ================== STATE =========================
// ==================================================
let botAPI = null;
let adminID = null;
let botID = null;
let prefix = '/';
let currentCookies = null;
let userData = {};              // { userID: { xp, level } }
let lastReply = {};             // anti-spam per user
let groupLocks = {};            // per-thread locks
let spamCount = {};             // per-thread per-user warnings

// ==================================================
// ================== LOGGER ========================
// ==================================================
function emitLog(msg, isErr = false) {
  const line = `[${new Date().toISOString()}] ${isErr ? 'ERROR: ' : 'INFO: '}${msg}`;
  console.log(line);
  io.emit('botlog', line);
}

// ==================================================
// ================== SHAYARI =======================
// ==================================================
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

// ==================================================
// ================== FLIRT =========================
// ==================================================
const FLIRT_WORDS = [
  'babu','sona','jaan','jaanu','jaana','i love you','love you','pyar',
  'mohabbat','cutie','sweetheart','baby','dear','honey','jaaneman',
  'shona','babu ji','dil','meri jaan','i luv u','love u','babe'
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

// ==================================================
// ================== LEVEL/XP ======================
// ==================================================
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

// ==================================================
// ================== HELPERS =======================
// ==================================================
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const hasFlirt = txt => FLIRT_WORDS.some(w => txt.toLowerCase().includes(w));
const isAdmin = id => String(id) === String(adminID);

function isStickerOrPhoto(event) {
  if (!event.attachments || !event.attachments.length) return false;
  return event.attachments.some(a =>
    ['sticker', 'photo', 'video', 'animated_image'].includes(a.type)
  );
}

// ==================================================
// ================== REPLY BUILDER =================
// ==================================================
async function buildReply(api, event, mainText) {
  const { senderID } = event;
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
│ 🎯 Next : ${remaining} XP
╰────────────────────╯
${SIGNATURE}
━━━━━━━━━━━━━━━━━`;

  return { body, mentions: [{ tag: `@${name}`, id: senderID }] };
}

// ==================================================
// ================== HELP MENU =====================
// ==================================================
async function sendHelp(api, threadID) {
  const help =
`╔═════════════════════════╗
║  🤖 RK RAJA MASTI BOT  ║
╚═════════════════════════╝

💬 𝐅𝐔𝐍 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒
${prefix}shayari — Random shayari 💕
${prefix}joke — Random joke 😂
${prefix}dp — Apna DP + stats 📸
${prefix}flirt — Flirt reply 😘
(ya bas "babu", "sona", "jaan" likho)

🔐 𝐆𝐑𝐎𝐔𝐏 𝐅𝐘𝐓 𝐌𝐎𝐃𝐄 (admin only)
${prefix}fyt on — Full lock (name+nick+msg+spam)
${prefix}fyt off — Full unlock
${prefix}lockname on <name> — Lock group name
${prefix}lockname off — Unlock group name
${prefix}locknick on <nick> — Lock all nicknames
${prefix}locknick off — Unlock all nicknames
${prefix}msglock on/off — Message locker
${prefix}spamlock on/off — Anti sticker/photo spam
${prefix}unlock all — Sab unlock

⚙️ 𝐀𝐃𝐌𝐈𝐍 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒
${prefix}stats — Total users
${prefix}reset — Reset all XP
${prefix}broadcast <msg> — Sab groups me msg
${prefix}help — Ye menu

━━━━━━━━━━━━━━━━━
❥ RK RAJA XWD ❥`;

  return api.sendMessage(help, threadID);
}

// ==================================================
// ================== LOGIN =========================
// ==================================================
function initializeBot(cookies) {
  emitLog('Initializing bot...');
  currentCookies = cookies;

  try {
    login({ appState: cookies }, (err, api) => {
      if (err) {
        emitLog('Login error: ' + (err.message || JSON.stringify(err)), true);
        setTimeout(() => initializeBot(cookies), 8000);
        return;
      }
      botAPI = api;
      try { botID = api.getCurrentUserID(); } catch {}
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
  } catch (e) {
    emitLog('Login threw: ' + e.message, true);
    setTimeout(() => initializeBot(cookies), 8000);
  }
}

// ==================================================
// ================== EVENT HANDLER =================
// ==================================================
async function handleEvent(api, event) {
  if (!event) return;

  // ---- LOG EVENTS ----
  if (event.logMessageType === 'log:thread-name') {
    return handleThreadNameChange(api, event);
  }
  if (event.logMessageType === 'log:user-nickname') {
    return handleNicknameChange(api, event);
  }
  if (event.logMessageType === 'log:subscribe') {
    return handleUserJoined(api, event);
  }

  // ---- MESSAGES ----
  if (event.type !== 'message' && event.type !== 'message_reply') return;
  if (event.senderID === botID) return;

  const { threadID, senderID, body } = event;
  const txt = (body || '').trim().toLowerCase();
  const admin = isAdmin(senderID);
  const locks = groupLocks[threadID] || {};

  // ==================================================
  // 1. MESSAGE LOCKER
  // ==================================================
  if (locks.msgLock && !admin) {
    try {
      spamCount[threadID] = spamCount[threadID] || {};
      spamCount[threadID][senderID] = (spamCount[threadID][senderID] || 0) + 1;
      const c = spamCount[threadID][senderID];

      await api.sendMessage(
        `🔒 Group message locked by admin!\nWarning ${c}/${KICK_LIMIT}${SIGNATURE}`,
        threadID
      );

      if (c >= KICK_LIMIT) {
        await api.removeUserFromGroup(senderID, threadID);
        await api.sendMessage(`🚫 User kicked (repeated msg violation).`, threadID);
        delete spamCount[threadID][senderID];
      }
    } catch (e) { emitLog('msglock kick err: ' + e.message, true); }
    return;
  }

  // ==================================================
  // 2. SPAM LOCKER
  // ==================================================
  if (locks.spamLock && !admin && isStickerOrPhoto(event)) {
    try {
      spamCount[threadID] = spamCount[threadID] || {};
      spamCount[threadID][senderID] = (spamCount[threadID][senderID] || 0) + 1;
      const c = spamCount[threadID][senderID];

      await api.sendMessage(
        `🚫 Sticker/Photo spam allowed nahi!\nWarning ${c}/${KICK_LIMIT}${SIGNATURE}`,
        threadID
      );

      if (c >= KICK_LIMIT) {
        await api.removeUserFromGroup(senderID, threadID);
        await api.sendMessage(`🚫 User kicked for spam.`, threadID);
        delete spamCount[threadID][senderID];
      }
    } catch (e) { emitLog('spamlock err: ' + e.message, true); }
    return;
  }

  if (!body) return;

  // anti-spam delay
  const now = Date.now();
  if (lastReply[senderID] && now - lastReply[senderID] < 1200) return;
  lastReply[senderID] = now;

  // ==================================================
  // 3. COMMANDS
  // ==================================================
  const usedPrefix = PREFIXES.find(p => txt.startsWith(p));
  if (usedPrefix) {
    const parts = txt.slice(1).split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    // ---- HELP (anyone) ----
    if (cmd === 'help' || cmd === 'menu') {
      return sendHelp(api, threadID);
    }

    if (admin) {
      // reset
      if (cmd === 'reset') {
        userData = {};
        return api.sendMessage('✅ All XP reset.' + SIGNATURE, threadID);
      }
      // stats
      if (cmd === 'stats') {
        return api.sendMessage(
          `📊 Total users tracked: ${Object.keys(userData).length}${SIGNATURE}`,
          threadID
        );
      }
      // broadcast
      if (cmd === 'broadcast') {
        const msg = args.join(' ');
        if (!msg) return api.sendMessage(`Usage: ${prefix}broadcast <msg>`, threadID);
        try {
          const threads = await api.getThreadList(50, null, ['GROUP']);
          let sent = 0;
          for (const t of threads) {
            try { await api.sendMessage(`📢 ${msg}${SIGNATURE}`, t.threadID); sent++; }
            catch {}
            await new Promise(r => setTimeout(r, 300));
          }
          return api.sendMessage(`✅ Broadcast sent to ${sent} groups.${SIGNATURE}`, threadID);
        } catch (e) {
          return api.sendMessage('Broadcast error: ' + e.message, threadID);
        }
      }

      // FYT
      if (cmd === 'fyt') {
        const sub = args[0];
        if (sub === 'on') {
          const info = await api.getThreadInfo(threadID).catch(() => null);
          const currentName = info?.threadName || '';
          const nicknames = {};
          if (info?.nicknames) {
            for (const uid in info.nicknames) nicknames[uid] = info.nicknames[uid];
          }
          groupLocks[threadID] = {
            name: currentName,
            nicknames,
            msgLock: true,
            spamLock: true,
            fyt: true
          };
          await api.sendMessage(
            `🔐 𝐅𝐘𝐓 𝐌𝐎𝐃𝐄 𝐎𝐍\n• Group name locked\n• Nicknames locked\n• Message locker ON\n• Spam locker ON${SIGNATURE}`,
            threadID
          );
          return;
        }
        if (sub === 'off') {
          delete groupLocks[threadID];
          return api.sendMessage(`🔓 𝐅𝐘𝐓 𝐌𝐎𝐃𝐄 𝐎𝐅𝐅 — sab unlock.${SIGNATURE}`, threadID);
        }
        return api.sendMessage(`Usage: ${prefix}fyt on/off`, threadID);
      }

      // LOCK NAME
      if (cmd === 'lockname') {
        const sub = args[0];
        if (sub === 'on') {
          const name = args.slice(1).join(' ').trim();
          if (!name) return api.sendMessage(`Usage: ${prefix}lockname on <name>`, threadID);
          groupLocks[threadID] = groupLocks[threadID] || { nicknames: {} };
          groupLocks[threadID].name = name;
          try { await api.setTitle(name, threadID); } catch {}
          return api.sendMessage(`🔒 Group name locked to "${name}".${SIGNATURE}`, threadID);
        }
        if (sub === 'off') {
          if (groupLocks[threadID]) groupLocks[threadID].name = null;
          return api.sendMessage(`🔓 Group name unlocked.${SIGNATURE}`, threadID);
        }
        return api.sendMessage(`Usage: ${prefix}lockname on/off`, threadID);
      }

      // LOCK NICK
      if (cmd === 'locknick') {
        const sub = args[0];
        if (sub === 'on') {
          const nick = args.slice(1).join(' ').trim();
          if (!nick) return api.sendMessage(`Usage: ${prefix}locknick on <nick>`, threadID);
          try {
            const info = await api.getThreadInfo(threadID);
            const ids = info.participantIDs || [];
            groupLocks[threadID] = groupLocks[threadID] || { nicknames: {} };
            for (const uid of ids) {
              if (String(uid) === String(adminID)) continue;
              groupLocks[threadID].nicknames[uid] = nick;
              try { await api.changeNickname(nick, threadID, uid); } catch {}
              await new Promise(r => setTimeout(r, 200));
            }
          } catch (e) { emitLog('locknick err: ' + e.message, true); }
          return api.sendMessage(`🔒 All nicknames locked to "${nick}".${SIGNATURE}`, threadID);
        }
        if (sub === 'off') {
          if (groupLocks[threadID]) groupLocks[threadID].nicknames = {};
          return api.sendMessage(`🔓 Nicknames unlocked.${SIGNATURE}`, threadID);
        }
        return api.sendMessage(`Usage: ${prefix}locknick on <nick> / off`, threadID);
      }

      // MSG LOCK
      if (cmd === 'msglock') {
        const sub = args[0];
        groupLocks[threadID] = groupLocks[threadID] || { nicknames: {} };
        if (sub === 'on') {
          groupLocks[threadID].msgLock = true;
          spamCount[threadID] = {};
          return api.sendMessage(`🔒 Message locker ON.${SIGNATURE}`, threadID);
        }
        if (sub === 'off') {
          groupLocks[threadID].msgLock = false;
          return api.sendMessage(`🔓 Message locker OFF.${SIGNATURE}`, threadID);
        }
        return api.sendMessage(`Usage: ${prefix}msglock on/off`, threadID);
      }

      // SPAM LOCK
      if (cmd === 'spamlock') {
        const sub = args[0];
        groupLocks[threadID] = groupLocks[threadID] || { nicknames: {} };
        if (sub === 'on') {
          groupLocks[threadID].spamLock = true;
          spamCount[threadID] = {};
          return api.sendMessage(`🔒 Spam locker ON (sticker/photo).${SIGNATURE}`, threadID);
        }
        if (sub === 'off') {
          groupLocks[threadID].spamLock = false;
          return api.sendMessage(`🔓 Spam locker OFF.${SIGNATURE}`, threadID);
        }
        return api.sendMessage(`Usage: ${prefix}spamlock on/off`, threadID);
      }

      // UNLOCK ALL
      if (cmd === 'unlock' && args[0] === 'all') {
        delete groupLocks[threadID];
        delete spamCount[threadID];
        return api.sendMessage(`🔓 Sab unlock ho gaya.${SIGNATURE}`, threadID);
      }
    }
  }

  // ==================================================
  // 4. NORMAL FUN REPLIES
  // ==================================================
  if (txt.includes('shayari') || txt.includes('shayri')) {
    return api.sendMessage(await buildReply(api, event, rand(SHAYARI)), threadID);
  }
  if (txt.includes('joke')) {
    return api.sendMessage(await buildReply(api, event, rand(JOKES)), threadID);
  }
  if (txt.includes('flirt')) {
    return api.sendMessage(await buildReply(api, event, rand(FLIRT_REPLIES)), threadID);
  }
  if (txt.includes('dp') || txt.includes('profile')) {
    let dp = null, name = 'User';
    try {
      const u = await api.getUserInfo(senderID);
      dp = u?.[senderID]?.profileUrl;
      name = u?.[senderID]?.name || name;
    } catch {}
    const ud = getUser(senderID);
    const body =
`@${name} ye teri DP 😍

╭─❰ 📊 PLAYER STATS ❱─╮
│ 🎖️ Level : ${ud.level}
│ ⚡ XP : ${ud.xp}
╰────────────────────╯
${SIGNATURE}
━━━━━━━━━━━━━━━━━`;
    return api.sendMessage(
      { body, mentions: [{ tag: `@${name}`, id: senderID }] },
      threadID
    );
  }

  if (hasFlirt(txt)) {
    return api.sendMessage(await buildReply(api, event, rand(FLIRT_REPLIES)), threadID);
  }

  const defaults = [
    "Kya baat karni hai babu? 😏 shayari, joke, ya flirt?",
    "Bolo jaan 💕 kya chahiye — shayari / joke / dp",
    "Haan bolo 😌 'shayari' likho toh shayari sunau, 'joke' likho toh hasau",
    "Kya haal hai cutie? 🥰 kuch bolo na",
    `Type ${prefix}help for commands 😎`
  ];
  return api.sendMessage(await buildReply(api, event, rand(defaults)), threadID);
}

// ==================================================
// ============== LOG EVENT HANDLERS ================
// ==================================================
async function handleThreadNameChange(api, event) {
  const { threadID, authorID } = event;
  const newTitle = event.logMessageData?.name;
  const locks = groupLocks[threadID];
  if (!locks || !locks.name) return;
  if (String(authorID) === String(adminID)) return;
  if (newTitle === locks.name) return;

  try {
    await api.setTitle(locks.name, threadID);
    let name = 'User';
    try { const u = await api.getUserInfo(authorID); name = u?.[authorID]?.name || name; } catch {}
    await api.sendMessage(
      { body: `@${name} 🔒 group name locked tha, wapas set kar diya!${SIGNATURE}`,
        mentions: [{ tag: `@${name}`, id: authorID }] },
      threadID
    );
  } catch (e) { emitLog('lockname revert err: ' + e.message, true); }
}

async function handleNicknameChange(api, event) {
  const { threadID, authorID, participantID } = event;
  const newNick = event.logMessageData?.nickname;
  const locks = groupLocks[threadID];
  if (!locks || !locks.nicknames) return;
  if (String(authorID) === String(adminID)) return;

  if (String(participantID) === String(botID) && newNick !== BOT_NAME) {
    try { await api.changeNickname(BOT_NAME, threadID, botID); } catch {}
    return;
  }

  const locked = locks.nicknames[participantID];
  if (locked && newNick !== locked) {
    try { await api.changeNickname(locked, threadID, participantID); } catch {}
  }
}

async function handleUserJoined(api, event) {
  const { threadID, logMessageData } = event;
  const added = logMessageData?.addedParticipants || [];
  for (const p of added) {
    if (String(p.userFbId) === String(botID)) {
      try { await api.changeNickname(BOT_NAME, threadID, botID); } catch {}
      await api.sendMessage(
        `👋 Hello! Main ${BOT_NAME} hu.\nType ${prefix}help for commands.${SIGNATURE}`,
        threadID
      );
    }
  }
}

// ==================================================
// ================== WEB ROUTES ====================
// ==================================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.post('/configure', (req, res) => {
  try {
    let { cookies, adminID: aID, prefix: pfx, botID: bID } = req.body;

    if (typeof cookies === 'string') cookies = JSON.parse(cookies);
    if (!Array.isArray(cookies) || cookies.length === 0)
      return res.status(400).send('❌ Invalid C3C / cookies array');
    if (!aID) return res.status(400).send('❌ Admin ID required');

    adminID = String(aID).trim();
    prefix = PREFIXES.includes(pfx) ? pfx : '/';
    if (bID) botID = String(bID).trim();

    emitLog(`Admin: ${adminID} | Prefix: ${prefix} | BotID: ${botID || 'auto'}`);
    res.send('✅ Configured. Bot starting...');

    initializeBot(cookies);
  } catch (e) {
    emitLog('Configure error: ' + e.message, true);
    res.status(400).send('❌ Error: ' + e.message);
  }
});

// ==================================================
// ================== SERVER ========================
// ==================================================
const PORT = process.env.PORT || 20018;
server.listen(PORT, () => emitLog(`Server running on port ${PORT} | FCA: ${fcaName}`));

io.on('connection', socket => {
  emitLog('Dashboard connected');
  socket.emit('botlog', `Status: ${botAPI ? 'Running' : 'Not started'}`);
  socket.emit('bot-ready', { botID });
});
