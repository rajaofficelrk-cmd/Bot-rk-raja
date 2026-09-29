// ============================================================
// RK RAJA XWD BOT v15 — FULL WORKING
// Auto Announce + Human Chat + Welcome + Locks + FYT + Music
// ============================================================

const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

// ================= FCA LOADER =================
let login = null, fcaName = "unknown";
function loadFCA() {
  const pkgs = ["ws3-fca","@dongdev/fca-unofficial","fca-unofficial","facebook-chat-api"];
  for (const p of pkgs) {
    try {
      const m = require(p);
      const fn = typeof m === "function" ? m : (m && typeof m.login === "function" ? m.login : null);
      if (fn) { login = fn; fcaName = p; console.log("✅ FCA:", p); return true; }
    } catch(_) {}
  }
  return false;
}
loadFCA();

// ================= REPLIES =================
let R = null;
try { R = require("./replies"); console.log("✅ replies.js loaded"); }
catch(e) { console.log("⚠️ replies.js nahi mila - built-in use hoga"); }

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ================= CONFIG =================
const PORT = process.env.PORT || 3000;
const BOT_NAME = "◄⸻̅͟ˣ͠𓆩𝐑꯭꘍꯭֟፝͡᪂꘍꯭ 𝐋꯭𖾝ԍ𖾝꯭֟፝͡᎔꯭𑀘𓆪꯭ˣ͢ 👍";
const BOT_SHORT = "RK RAJA XWD";
const TELEGRAM_LINK = "https://t.me/Akatsuki_rulex";
const KICK_LIMIT = 3;
const MAX_RETRIES = 3;
const HUMAN_MODE = true;
const WELCOME_MODE = true;

const MEDIA_DIR = path.join(__dirname, "media");
const FYT_DIR = path.join(__dirname, "fyt");
const BOT_DP_PATH = path.join(MEDIA_DIR, "rk-raja-xwd.jpg");
const FYT_PATH = path.join(FYT_DIR, "fyt.txt");

fs.mkdirSync(MEDIA_DIR, { recursive: true });
fs.mkdirSync(FYT_DIR, { recursive: true });

// ================= BOT TRIGGERS =================
const BOT_TRIGGERS = [
  "rk raja","rk raja xwd","rkraja","rk-raja","raja xwd","raja","rk",
  "bot","bots","rk bot","raja bot","xwd","raja bhai","rk bhai",
  "prince","legend prince","@rk","@raja","@bot"
];

function normalizeText(t) {
  return String(t || "").toLowerCase().replace(/[“”‘’]/g,"'").replace(/[!?.,;:()[\]{}]/g," ").replace(/\s+/g," ").trim();
}

function isBotCalled(text) {
  const t = normalizeText(text);
  if (!t) return false;
  if (/^(#|\/|\.)(bot|rk|raja)\b/i.test(t)) return true;
  for (const trg of BOT_TRIGGERS) {
    if (!trg) continue;
    const esc = trg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|\\s)${esc}(\\s|$|[^a-z])`, "i");
    if (re.test(t)) return true;
  }
  return false;
}

// ================= STATE =================
const state = {
  botAPI: null, botID: null, adminID: null,
  prefix: "#", mode: "c3c", cookies: null, running: false,
  fytInterval: 8000,
  locks: { groupNames: {}, nicknames: {}, messageLock: {}, spamLock: {} },
  fyt: {}, spam: {}, levels: {},
  stats: { messages: 0, commands: 0, groups: 0, startedAt: null }
};

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(line);
  io.emit("log", { message: line });
}

function cleanID(id) { return id == null ? null : String(id); }
function isAdmin(uid) { return cleanID(uid) === cleanID(state.adminID); }

function createPhotoAttachment() {
  if (!fs.existsSync(BOT_DP_PATH)) return null;
  return fs.createReadStream(BOT_DP_PATH);
}

// ================= SEND HELPERS =================
function sendMessageSafe(api, message, threadID, replyTo = null) {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (err, info) => {
      if (done) return; done = true;
      if (err) reject(err); else resolve(info);
    };
    try {
      const tid = cleanID(threadID);
      if (!tid) return finish(new Error("Invalid threadID"));
      const r = replyTo
        ? api.sendMessage(message, tid, finish, cleanID(replyTo))
        : api.sendMessage(message, tid, finish);
      if (r && typeof r.then === "function") r.then(i => finish(null, i)).catch(finish);
    } catch (e) { finish(e); }
  });
}

async function sendPhotoMessageSafe(api, threadID, text, replyTo = null) {
  const tid = cleanID(threadID);
  const att = createPhotoAttachment();
  const msg = att ? { body: text, attachment: att } : text;
  return sendMessageSafe(api, msg, tid, replyTo);
}

function getUserInfoSafe(api, uid) {
  return new Promise(resolve => {
    uid = cleanID(uid);
    if (!uid || !api || typeof api.getUserInfo !== "function") return resolve(null);
    let done = false;
    const finish = (err, info) => { if (done) return; done = true; resolve(err ? null : info); };
    try {
      const r = api.getUserInfo(uid, finish);
      if (r && r.then) r.then(i => finish(null, i)).catch(() => finish(new Error("x")));
    } catch(_) { resolve(null); }
    setTimeout(() => { if (!done) { done = true; resolve(null); } }, 7000);
  });
}

function getThreadInfoSafe(api, tid) {
  return new Promise(resolve => {
    tid = cleanID(tid);
    if (!tid || !api || typeof api.getThreadInfo !== "function") return resolve(null);
    let done = false;
    const finish = (err, info) => { if (done) return; done = true; resolve(err ? null : info); };
    try {
      const r = api.getThreadInfo(tid, finish);
      if (r && r.then) r.then(i => finish(null, i)).catch(() => finish(new Error("x")));
    } catch(_) { resolve(null); }
    setTimeout(() => { if (!done) { done = true; resolve(null); } }, 7000);
  });
}

function getThreadListSafe(api, limit = 1000, filter = ["INBOX"]) {
  return new Promise(resolve => {
    if (!api || typeof api.getThreadList !== "function") return resolve([]);
    let done = false;
    const finish = (err, list) => { if (done) return; done = true; resolve(err ? [] : (Array.isArray(list) ? list : [])); };
    try {
      const r = api.getThreadList(limit, null, filter, finish);
      if (r && r.then) r.then(l => finish(null, l)).catch(finish);
    } catch(_) { resolve([]); }
    setTimeout(() => { if (!done) { done = true; resolve([]); } }, 15000);
  });
}

function setTitleSafe(api, title, tid) {
  return new Promise(resolve => {
    if (!api || typeof api.setTitle !== "function") return resolve(false);
    try {
      const r = api.setTitle(title, cleanID(tid), err => resolve(!err));
      if (r && r.then) r.then(() => resolve(true)).catch(() => resolve(false));
    } catch(_) { resolve(false); }
  });
}

function changeNicknameSafe(api, nick, tid, uid) {
  return new Promise(resolve => {
    if (!api || typeof api.changeNickname !== "function") return resolve(false);
    try {
      api.changeNickname(nick, cleanID(tid), cleanID(uid), err => resolve(!err));
    } catch(_) { resolve(false); }
  });
}

function removeUserSafe(api, uid, tid) {
  return new Promise(resolve => {
    if (!api || typeof api.removeUserFromGroup !== "function") return resolve(false);
    try {
      api.removeUserFromGroup(cleanID(uid), cleanID(tid), err => resolve(!err));
    } catch(_) { resolve(false); }
  });
}

function unsendSafe(api, mid) {
  try { if (api && typeof api.unsendMessage === "function") api.unsendMessage(cleanID(mid), () => {}); } catch(_) {}
}

// ============================================================
// ================= STARTUP MESSAGE ==========================
// ============================================================
const LIVE_MESSAGE =
`╔═══════════════════════════════╗
║  🤍🩷 𝐑𝐊 𝐑𝐀𝐉𝐀 𝐗𝐖𝐃 🩷🤍  ║
╚═══════════════════════════════╝

${BOT_NAME}

╭───────────────────────╮
│  🎉 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐎𝐔𝐑 𝐆𝐑𝐎𝐔𝐏 🎉
╰───────────────────────╯

🔥 𝐇𝐚𝐦𝐚𝐫𝐚 𝐁𝐨𝐭 𝐢𝐬 𝐋𝐢𝐯𝐞 ❤️
🤖 𝐑𝐊 𝐑𝐀𝐉𝐀 𝐗𝐖𝐃 𝐁𝐨𝐭 𝐎𝐧𝐥𝐢𝐧𝐞

✅ Bot ab is group me active hai
✅ Sabhi features ready hai

╭──❰ 💫 𝐅𝐄𝐀𝐓𝐔𝐑𝐄𝐒 ❱──╮
│ 💬 Shayari • Joke • Flirt
│ 👤 UID • DP • Couple
│ 🎵 Music • Song
│ 🎉 Welcome System
│ 🔐 Group Locks
│ 📢 FYT Mode
│ 🌍 Multi-Language
╰───────────────────────╯

╭──❰ 📲 𝐉𝐎𝐈𝐍 𝐌𝐘 𝐆𝐂 𝐓𝐆 ❱──╮
│  ${TELEGRAM_LINK}
╰───────────────────────╯

╭──❰ 👑 𝐎𝐖𝐍𝐄𝐑 ❱──╮
│  ${BOT_NAME}
╰───────────────────────╯

🤍🩷 𝐑𝐊 𝐑𝐀𝐉𝐀 𝐗𝐖𝐃 🤍🩷
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

// ================= FALLBACK REPLIES (agar replies.js na ho) =================
const FB_SHAYARI = [
  "Tere bina zindagi adhoori si lagti hai,\nTere saath har khushi poori si lagti hai 💕",
  "Chand bhi sharma jaye teri chamak se,\nTaare bhi jal jaye teri ek jhalak se 🌙✨",
  "Dil ki gehraiyon me tera naam likha hai,\nHar dhadkan pe tera hi paigam likha hai ❤️",
  "Meri subah tu, meri shaam tu,\nMeri har dua me sirf tera naam tu 🌸",
  "Tu meri subah ki pehli soch hai,\nTu meri raat ki aakhri khwahish hai 🌄"
];
const FB_JOKES = [
  "Teacher: Homework kaha hai? Me: Sir network issue tha 📶😂",
  "Mobile: 20% battery. Me: 20 minute aur. Mobile: 1%. Me: 5 minute aur 😂",
  "Wife: tum mujhe kitna pyaar karte ho? Husband: GPS se zyada accurate 😂"
];
const FB_FLIRT = [
  "Arre babu 😍 tumse pyaar to hume bhi hai, par pehle level badhao 😏",
  "Sona 💋 tumhari baatein sunke dil pighal jata hai 🫠",
  "Oye jaan 🥰 itna pyaar kaha chhupa rahe the ab tak? 💕"
];
const FB_AUTO = {
  hi: ["Hii jaan 💕","Hello babu 🥰","Hii sona 😘","Heyy cutie 💗"],
  hello: ["Hello babu 🥰","Hello ji 💕","Hello sona 😘"],
  hii: ["Hiiii jaan 💕🥰","Hiiii babu 😍"],
  hey: ["Heyy babu 🥰","Hey jaan 💕"],
  "kese ho": ["Mai mast hu babu 💕 tum batao?","First class 😎 tum sunao"],
  "kaise ho": ["Mai badhiya hu jaan 😊","Mast hu babu 💕"],
  "i love you": ["I love you too jaan 💝","Aww babu 🥰 mai bhi"],
  "love you": ["Love you too jaan 💝","Aww 🥰 mujhe bhi"],
  kiss: ["Muaaah 😘💋","Smooch 💕😘","Aww babu 😘"],
  hug: ["Big hug 🤗💕","Aao jhappi 🫂😘"],
  "good morning": ["Good morning jaan ☀️","GM babu 🌅 khana khaya?"],
  "good night": ["Good night jaan 🌙","GN babu 😴 meetha sapna"],
  babu: ["Haan babu 💕 bolo","Kya hua babu 🥰"],
  sona: ["Haan sona 💗 bolo","Kya hua sona 🥰"],
  jaan: ["Haan jaan 💕 bolo","Kya hua jaanu 🥰"]
};

function fbRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getShayari() { return R ? R.getShayari() : fbRand(FB_SHAYARI); }
function getJoke() { return R ? R.getJoke() : fbRand(FB_JOKES); }
function getFlirt() { return R ? R.getFlirt() : fbRand(FB_FLIRT); }
function getAutoReply(text) {
  if (R) return R.getAutoReply(text);
  const n = normalizeText(text);
  if (!n) return null;
  if (FB_AUTO[n]) return fbRand(FB_AUTO[n]);
  for (const k of Object.keys(FB_AUTO)) {
    if (n.includes(k)) return fbRand(FB_AUTO[k]);
  }
  return null;
}
function getWelcomeShayari() {
  return R ? R.getWelcomeShayari() : "Aapke aane se mehki ye mehfil 💐✨";
}
function getWelcomeHeader() {
  return R ? R.getWelcomeHeader() : "🎉 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🎉";
}

// ================= ANNOUNCE =================
async function announceBotOnline(api) {
  try {
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    log("📸 PHOTO CHECK");
    log(`   Path: ${BOT_DP_PATH}`);
    const exists = fs.existsSync(BOT_DP_PATH);
    log(`   Exists: ${exists}`);
    if (exists) {
      const s = fs.statSync(BOT_DP_PATH);
      log(`   Size: ${(s.size / 1024).toFixed(2)} KB`);
      if (s.size > 2 * 1024 * 1024) log("   ⚠️ File 2MB se badi hai!");
    } else {
      log("   ❌ File nahi mili! media/rk-raja-xwd.jpg daalo.");
    }
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    log("📢 Announcement start...");
    let list = await getThreadListSafe(api, 1000, ["GROUP"]);
    log(`📢 GROUP filter: ${list.length}`);
    if (!list.length) {
      list = await getThreadListSafe(api, 1000, ["INBOX"]);
      log(`📢 INBOX fallback: ${list.length}`);
    }

    const groups = [], seen = new Set();
    for (const t of list) {
      const tid = cleanID(t.threadID || t.threadId || t.id);
      if (!tid || seen.has(tid)) continue;
      let g = false;
      if (t.isGroup || t.isGroupChat || t.threadType === "GROUP" || t.threadType === "GROUP_CHAT") g = true;
      if (Array.isArray(t.participantIDs) && t.participantIDs.length > 2) g = true;
      if (Array.isArray(t.participants) && t.participants.length > 2) g = true;
      if (!g && t.name && t.threadType !== "USER") g = true;
      if (!g) continue;
      seen.add(tid); groups.push(tid);
      log(`✅ Group: ${tid} (${t.name || '?'})`);
    }

    state.stats.groups = groups.length;
    if (!groups.length) { log("⚠️ Koi group nahi mila."); return; }

    for (let i = 0; i < groups.length; i++) {
      const tid = groups[i];
      try {
        log(`  📤 [${i+1}/${groups.length}] → ${tid}`);

        const nickOk = await changeNicknameSafe(api, BOT_NAME, tid, state.botID);
        log(`     Nickname: ${nickOk ? "✅ set" : "⚠️ fail (bot admin banao)"}`);

        await sendPhotoMessageSafe(api, tid, LIVE_MESSAGE);
        log(`  ✅ Sent to ${tid}`);
      } catch (e) { log(`  ❌ Failed ${tid}: ${e.message}`); }
      await new Promise(r => setTimeout(r, 2000));
    }
    log("🎉 Announcement complete — sabhi groups me message gaya.");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (e) { log(`Announce err: ${e.message}`); }
}

// ================= LEVEL =================
function getLevel(xp) { return Math.floor(Math.sqrt(xp / 50)) + 1; }
function xpForNext(l) { return 50 * l * l; }
function addXP(uid, amt = 10) {
  if (!state.levels[uid]) state.levels[uid] = { xp: 0, level: 1 };
  state.levels[uid].xp += amt;
  state.levels[uid].level = getLevel(state.levels[uid].xp);
  return state.levels[uid];
}

// ================= NAMES =================
async function getDisplayName(api, uid) {
  uid = cleanID(uid);
  if (!uid) return "User";
  const info = await getUserInfoSafe(api, uid);
  if (!info) return "User";
  return info[uid]?.name || info[uid]?.fullName || info.name || "User";
}

async function getGroupName(api, tid) {
  const info = await getThreadInfoSafe(api, tid);
  return info?.threadName || info?.name || "Facebook Group";
}

// ================= UID CARD =================
async function sendUIDCard(api, tid, uid, replyTo = null) {
  uid = cleanID(uid);
  const name = await getDisplayName(api, uid);
  const u = state.levels[uid] || { xp: 0, level: 1 };
  const profileUrl = `https://www.facebook.com/${uid}`;
  const text =
`👑 𝐌𝐀𝐈 𝐑𝐊 𝐑𝐀𝐉𝐀 𝐇𝐔 👑

${BOT_NAME}

👤 𝐍𝐚𝐦𝐞 : ${name}
🆔 𝐔𝐈𝐃 : ${uid}
🔗 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 : ${profileUrl}
🏆 𝐋𝐞𝐯𝐞𝐥 : ${u.level}
⚡ 𝐗𝐏 : ${u.xp}

📲 𝐉𝐨𝐢𝐧𝐞 𝐦𝐲 𝐆𝐂 𝐓𝐆 ❤️
${TELEGRAM_LINK}

🤍🩷 RK RAJA XWD 🤍🩷`;
  const att = createPhotoAttachment();
  const msg = att ? { body: text, attachment: att } : text;
  return sendMessageSafe(api, msg, tid, replyTo);
}

// ================= CUTE DP =================
async function sendCuteDP(api, tid, uid, replyTo = null) {
  uid = cleanID(uid);
  const name = await getDisplayName(api, uid);
  const u = addXP(uid, 10);
  const rem = Math.max(0, xpForNext(u.level) - u.xp);
  const shayari = getShayari();
  const stickers = ["🥰","😍","💕","💖","✨","🌸","💘","😘"];
  const emoji = stickers[Math.floor(Math.random() * stickers.length)];
  const text =
`${emoji} @${name} ${emoji}

${shayari}

╭─❰ 📊 PLAYER STATS ❱─╮
│ 🎖️ Level : ${u.level}
│ ⚡ XP : ${u.xp}
│ 🎯 Next : ${rem} XP
╰────────────────────╯

📲 ${TELEGRAM_LINK}
❥ RK RAJA XWD ❥`;
  let dpUrl = null;
  try {
    const info = await getUserInfoSafe(api, uid);
    if (info && info[uid]) dpUrl = info[uid].profileUrl || info[uid].thumbSrc;
  } catch(_) {}
  const msg = { body: text, mentions: [{ tag: `@${name}`, id: uid }] };
  if (dpUrl) msg.attachment = dpUrl;
  return sendMessageSafe(api, msg, tid, replyTo);
}

// ================= WELCOME =================
async function sendWelcomeMessage(api, tid, targetUID, replyTo = null) {
  targetUID = cleanID(targetUID);
  if (!targetUID) return;
  let name = "User", profileUrl = `https://www.facebook.com/${targetUID}`, dpUrl = null, bio = "";
  try {
    const info = await getUserInfoSafe(api, targetUID);
    if (info && info[targetUID]) {
      name = info[targetUID].name || info[targetUID].fullName || name;
      profileUrl = info[targetUID].profileUrl || profileUrl;
      dpUrl = info[targetUID].profileUrl || info[targetUID].thumbSrc || null;
      bio = info[targetUID].bio || "";
    }
  } catch(_){}
  const shayari = getWelcomeShayari();
  const header = getWelcomeHeader();
  let groupName = "RK RAJA XWD";
  try {
    const ginfo = await getThreadInfoSafe(api, tid);
    if (ginfo) groupName = ginfo.threadName || ginfo.name || groupName;
  } catch(_){}
  const u = state.levels[targetUID] || { xp: 0, level: 1 };
  const text =
`${header}

@${name} 💕

${shayari}

╭─❰ 🎊 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 🎊 ❱─╮
│ 📌 ${groupName}
╰────────────────────╯

👤 𝐍𝐚𝐦𝐞 : ${name}
🆔 𝐔𝐈𝐃 : ${targetUID}
🔗 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 : ${profileUrl}${bio ? `\n📝 𝐁𝐢𝐨 : ${bio}` : ""}
🎖️ 𝐋𝐞𝐯𝐞𝐥 : ${u.level}
⚡ 𝐗𝐏 : ${u.xp}

📲 𝐉𝐨𝐢𝐧𝐞 𝐦𝐲 𝐆𝐂 𝐓𝐆 ❤️
${TELEGRAM_LINK}

❥ RK RAJA XWD ❥`;
  const msg = { body: text, mentions: [{ tag: `@${name}`, id: targetUID }] };
  if (dpUrl) msg.attachment = dpUrl;
  else { const att = createPhotoAttachment(); if (att) msg.attachment = att; }
  try {
    await sendMessageSafe(api, msg, tid, replyTo);
    log(`👋 Welcome sent to ${name} (${targetUID})`);
  } catch (e) { log(`Welcome err: ${e.message}`); }
}

// ================= HELP =================
function helpText() {
  return `
🤍🩷 RK RAJA XWD BOT 🩷🤍

💬 USER COMMANDS
hi, hello, shayari, joke, flirt
dp, uid, couple, welcome
music <song>, song <song>
cute, level, xp, rank
status, bot, rules, help
welcome @user  (welcome karo)

🔐 ADMIN COMMANDS
lockname on <name> / off
locknick on <nick> / off
msglock on/off
spamlock on/off
unlock all
reset
stats
broadcast <msg>
fytfile <filename>
fyt on/off
fytinterval <sec>

📲 ${TELEGRAM_LINK}
`;
}

// ================= FYT =================
function readFYTLines() {
  try {
    if (!fs.existsSync(FYT_PATH)) return [];
    return fs.readFileSync(FYT_PATH, "utf8").split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  } catch(_) { return []; }
}

function stopFyt(tid) {
  tid = cleanID(tid);
  if (state.fyt[tid]) {
    clearInterval(state.fyt[tid].timer);
    delete state.fyt[tid];
    log(`⛔ FYT stopped: ${tid}`);
  }
}

async function startFyt(api, tid) {
  tid = cleanID(tid);
  const lines = readFYTLines();
  if (!lines.length) {
    await sendMessageSafe(api, "❌ FYT file empty hai. Admin pehle file upload kare.", tid);
    return;
  }
  stopFyt(tid);
  state.fyt[tid] = { index: 0, timer: null };
  const interval = Number(state.fytInterval || 8000);
  const sendNext = async () => {
    if (!state.fyt[tid]) return;
    const lines2 = readFYTLines();
    if (!lines2.length) return;
    const i = state.fyt[tid].index % lines2.length;
    const line = lines2[i];
    state.fyt[tid].index = (i + 1) % lines2.length;
    try { await sendMessageSafe(api, line, tid); }
    catch(e) { log(`FYT send err: ${e.message}`); }
  };
  await sendNext();
  state.fyt[tid].timer = setInterval(sendNext, interval);
  await sendMessageSafe(api, `✅ FYT ON — ${lines.length} lines, har ${interval/1000}s loop 🔁`, tid);
}

function loadUploadedFYT(name) {
  const safe = path.basename(String(name || ""));
  if (!safe) return false;
  const src = path.join(FYT_DIR, safe);
  if (!fs.existsSync(src)) return false;
  fs.copyFileSync(src, FYT_PATH);
  return true;
}

// ================= LOCKS =================
async function checkGroupNameLock(api, tid) {
  tid = cleanID(tid);
  const lock = state.locks.groupNames[tid];
  if (!lock) return;
  const info = await getThreadInfoSafe(api, tid);
  if (!info) return;
  const current = info.threadName || info.name || "";
  if (current !== lock.name) {
    await setTitleSafe(api, lock.name, tid);
    log(`🔒 Group name restored: ${tid}`);
  }
}

async function applyNicknameLock(api, tid) {
  tid = cleanID(tid);
  const lock = state.locks.nicknames[tid];
  if (!lock) return 0;
  const info = await getThreadInfoSafe(api, tid);
  if (!info) return 0;
  let parts = [];
  if (Array.isArray(info.participantIDs)) parts = info.participantIDs;
  else if (Array.isArray(info.participants)) parts = info.participants.map(p => cleanID(p.userID || p.id || p.uid));
  parts = parts.filter(Boolean);
  let ok = 0;
  for (const uid of parts) {
    if (cleanID(uid) === cleanID(state.botID)) continue;
    if (cleanID(uid) === cleanID(state.adminID)) continue;
    const r = await changeNicknameSafe(api, lock.nickname, tid, uid);
    if (r) ok++;
    await new Promise(x => setTimeout(x, 250));
  }
  return ok;
}

async function handleMessageLock(api, event) {
  const tid = cleanID(event.threadID);
  if (!state.locks.messageLock[tid]) return false;
  if (isAdmin(event.senderID)) return false;
  unsendSafe(api, event.messageID);
  const key = `${tid}:${event.senderID}`;
  state.spam[key] = (state.spam[key] || 0) + 1;
  if (state.spam[key] === 1) {
    try { await sendMessageSafe(api, "🔒 Message Lock ON — Group me sirf admin message kar sakta hai!", tid); } catch(_){}
  }
  if (state.spam[key] >= KICK_LIMIT) {
    state.spam[key] = 0;
    await removeUserSafe(api, event.senderID, tid);
    try { await sendMessageSafe(api, "🚫 User kicked (msg lock violation).", tid); } catch(_){}
  }
  return true;
}

async function handleSpamLock(api, event) {
  const tid = cleanID(event.threadID);
  if (!state.locks.spamLock[tid]) return false;
  if (isAdmin(event.senderID)) return false;
  const atts = event.attachments || [];
  const hasMedia = event.stickerID || atts.some(a => ["photo","animated_image","sticker","video"].includes(a.type));
  if (!hasMedia) return false;
  unsendSafe(api, event.messageID);
  const key = `${tid}:${event.senderID}`;
  state.spam[key] = (state.spam[key] || 0) + 1;
  if (state.spam[key] === 1) {
    try { await sendMessageSafe(api, "🚫 Sticker/Photo spam allowed nahi hai!", tid); } catch(_){}
  }
  if (state.spam[key] >= KICK_LIMIT) {
    state.spam[key] = 0;
    await removeUserSafe(api, event.senderID, tid);
    try { await sendMessageSafe(api, "🚫 User kicked (spam).", tid); } catch(_){}
  }
  return true;
}

// ================= MUSIC =================
async function sendMusic(api, tid, query, replyTo = null) {
  query = String(query || "").trim();
  if (!query) return sendMessageSafe(api, "🎵 Use: music <song name>", tid, replyTo);
  const q = encodeURIComponent(query);
  const text =
`🎵 𝐒𝐎𝐍𝐆 𝐒𝐄𝐀𝐑𝐂𝐇 🎵

🔍 ${query}

🔗 YouTube: https://www.youtube.com/results?search_query=${q}
🔗 Spotify: https://open.spotify.com/search/${q}
🔗 JioSaavn: https://www.jiosaavn.com/search/${q}

📲 ${TELEGRAM_LINK}
❥ RK RAJA XWD ❥`;
  return sendMessageSafe(api, text, tid, replyTo);
}

// ================= COMMANDS =================
const USER_COMMANDS = new Set([
  "help","menu","shayari","shayri","sher","joke","jokes","hasao",
  "flirt","flirting","dp","profile","uid","userid","id","couple","welcome",
  "status","ping","bot","song","video","music","rules","level","xp","rank","cute"
]);

const ADMIN_COMMANDS = new Set([
  "fyt","fytfile","fytclear","fytinterval","nickname","locknick",
  "groupname","lockname","msglock","spamlock","unlock","reset","stats","broadcast"
]);

function isKnownCommand(c) { return USER_COMMANDS.has(c) || ADMIN_COMMANDS.has(c); }

function parseCommand(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const first = raw.split(/\s+/)[0];
  if (first.startsWith("#") || first.startsWith("/") || first.startsWith(".")) {
    const without = raw.substring(1).trim();
    const parts = without.split(/\s+/);
    const cmd = (parts.shift() || "").toLowerCase();
    if (!isKnownCommand(cmd)) return null;
    return { command: cmd, args: parts.join(" "), prefixed: true };
  }
  const parts = raw.split(/\s+/);
  let cmd = parts.shift().toLowerCase();
  if (cmd.startsWith("@")) cmd = cmd.substring(1);
  if (!isKnownCommand(cmd)) return null;
  return { command: cmd, args: parts.join(" "), prefixed: false };
}

// ================= ADMIN HANDLER =================
async function handleAdminCommand(api, event, command, args) {
  const tid = cleanID(event.threadID);
  const sender = cleanID(event.senderID);
  if (!isAdmin(sender)) {
    await sendMessageSafe(api, "⛔ Ye command sirf ADMIN use kar sakta hai 🔒", tid, event.messageID);
    return true;
  }
  state.stats.commands++;

  if (command === "lockname") {
    const m = args.match(/^(on|off)(?:\s+(.+))?$/i);
    if (!m) { await sendMessageSafe(api, `Usage: ${state.prefix}lockname on <name>`, tid); return true; }
    if (m[1].toLowerCase() === "off") {
      delete state.locks.groupNames[tid];
      await sendMessageSafe(api, "🔓 Group Name Unlocked", tid);
      return true;
    }
    const name = (m[2] || "RK RAJA XWD").trim();
    const ok = await setTitleSafe(api, name, tid);
    state.locks.groupNames[tid] = { name };
    await sendMessageSafe(api, `🔒 Group Name Locked: "${name}" ${ok ? "✅" : "(bot admin banao!)"}`, tid);
    return true;
  }

  if (command === "locknick") {
    const m = args.match(/^(on|off)(?:\s+(.+))?$/i);
    if (!m) { await sendMessageSafe(api, `Usage: ${state.prefix}locknick on <nick>`, tid); return true; }
    if (m[1].toLowerCase() === "off") {
      delete state.locks.nicknames[tid];
      await sendMessageSafe(api, "🔓 Nickname Unlocked", tid);
      return true;
    }
    const nick = (m[2] || "RK RAJA").trim();
    state.locks.nicknames[tid] = { nickname: nick };
    const done = await applyNicknameLock(api, tid);
    await sendMessageSafe(api, `🔒 Nickname Locked: "${nick}"\n✅ ${done || 0} members updated`, tid);
    return true;
  }

  if (command === "msglock") {
    const sub = normalizeText(args);
    if (sub === "on") { state.locks.messageLock[tid] = true; await sendMessageSafe(api, "🔒 Message Lock ON", tid); return true; }
    if (sub === "off") { delete state.locks.messageLock[tid]; await sendMessageSafe(api, "🔓 Message Lock OFF", tid); return true; }
    await sendMessageSafe(api, `Usage: ${state.prefix}msglock on/off`, tid);
    return true;
  }

  if (command === "spamlock") {
    const sub = normalizeText(args);
    if (sub === "on") { state.locks.spamLock[tid] = true; await sendMessageSafe(api, "🔒 Spam Lock ON", tid); return true; }
    if (sub === "off") { delete state.locks.spamLock[tid]; await sendMessageSafe(api, "🔓 Spam Lock OFF", tid); return true; }
    await sendMessageSafe(api, `Usage: ${state.prefix}spamlock on/off`, tid);
    return true;
  }

  if (command === "unlock") {
    delete state.locks.groupNames[tid];
    delete state.locks.nicknames[tid];
    delete state.locks.messageLock[tid];
    delete state.locks.spamLock[tid];
    stopFyt(tid);
    await sendMessageSafe(api, "🔓 Sab locks unlock ho gaye!", tid);
    return true;
  }

  if (command === "reset") {
    delete state.locks.groupNames[tid];
    delete state.locks.nicknames[tid];
    delete state.locks.messageLock[tid];
    delete state.locks.spamLock[tid];
    stopFyt(tid);
    state.spam = {};
    await sendMessageSafe(api, "♻️ Group reset ho gaya.", tid);
    return true;
  }

  if (command === "stats") {
    const up = state.stats.startedAt ? Math.floor((Date.now() - state.stats.startedAt) / 1000) : 0;
    await sendMessageSafe(api,
`🤖 RK RAJA XWD STATS
🟢 Running: ${state.running}
👤 BotID: ${state.botID}
👑 Admin: ${state.adminID}
💬 Messages: ${state.stats.messages}
⚡ Commands: ${state.stats.commands}
👥 Groups: ${state.stats.groups}
⏱ Uptime: ${up}s`, tid);
    return true;
  }

  if (command === "broadcast") {
    if (!args.trim()) { await sendMessageSafe(api, "Use: broadcast <msg>", tid); return true; }
    const list = await getThreadListSafe(api, 1000, ["GROUP"]);
    let sent = 0;
    for (const t of list) {
      const target = cleanID(t.threadID || t.threadId || t.id);
      if (!target) continue;
      try { await sendMessageSafe(api, args.trim(), target); sent++; await new Promise(r => setTimeout(r, 1000)); } catch(_){}
    }
    await sendMessageSafe(api, `📢 Broadcast sent to ${sent} groups.`, tid);
    return true;
  }

  if (command === "fyt") {
    const sub = normalizeText(args);
    if (sub === "on") { await startFyt(api, tid); return true; }
    if (sub === "off") { stopFyt(tid); await sendMessageSafe(api, "⛔ FYT OFF", tid); return true; }
    await sendMessageSafe(api, `Usage: ${state.prefix}fyt on/off`, tid);
    return true;
  }

  if (command === "fytfile") {
    if (!args.trim()) { await sendMessageSafe(api, "Use: fytfile <filename>", tid); return true; }
    const ok = loadUploadedFYT(args.trim());
    await sendMessageSafe(api, ok ? "✅ FYT file loaded" : "❌ File nahi mili", tid);
    return true;
  }

  if (command === "fytclear") {
    for (const id of Object.keys(state.fyt)) stopFyt(id);
    try { fs.writeFileSync(FYT_PATH, ""); } catch(_){}
    await sendMessageSafe(api, "🗑️ FYT file cleared", tid);
    return true;
  }

  if (command === "fytinterval") {
    const s = Number(args);
    if (!Number.isFinite(s) || s < 5) { await sendMessageSafe(api, "❌ Min interval 5s", tid); return true; }
    state.fytInterval = s * 1000;
    await sendMessageSafe(api, `✅ FYT interval: ${s}s`, tid);
    return true;
  }

  return false;
}

// ================= USER HANDLER =================
async function handleUserCommand(api, event, command, args) {
  const tid = cleanID(event.threadID);
  const sender = cleanID(event.senderID);
  state.stats.commands++;

  if (command === "help" || command === "menu") {
    await sendMessageSafe(api, helpText(), tid, event.messageID);
    return true;
  }

  if (command === "shayari" || command === "shayri" || command === "sher") {
    const s = getShayari();
    const att = createPhotoAttachment();
    const text = `${s}\n\n📲 ${TELEGRAM_LINK}\n❥ RK RAJA XWD ❥`;
    const msg = att ? { body: text, attachment: att } : text;
    await sendMessageSafe(api, msg, tid);
    return true;
  }

  if (command === "joke" || command === "jokes" || command === "hasao") {
    await sendMessageSafe(api, `😂 ${getJoke()}`, tid);
    return true;
  }

  if (command === "flirt" || command === "flirting") {
    await sendMessageSafe(api, getFlirt(), tid);
    return true;
  }

  if (command === "uid" || command === "userid" || command === "id" || command === "bot") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    await sendUIDCard(api, tid, target, event.messageID);
    return true;
  }

  if (command === "dp" || command === "profile" || command === "cute") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    await sendCuteDP(api, tid, target, event.messageID);
    return true;
  }

  if (command === "couple") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    await sendCuteDP(api, tid, target, event.messageID);
    return true;
  }

  if (command === "music" || command === "song" || command === "video") {
    await sendMusic(api, tid, args, event.messageID);
    return true;
  }

  if (command === "welcome") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    else if (event.messageReply && event.messageReply.senderID) target = cleanID(event.messageReply.senderID);
    await sendWelcomeMessage(api, tid, target, event.messageID);
    return true;
  }

  if (command === "status" || command === "ping") {
    await sendMessageSafe(api,
`🤖 RK RAJA XWD BOT
🟢 Status: ONLINE
⚡ Mode: ${state.mode.toUpperCase()}
👑 Bot active hai!
📲 ${TELEGRAM_LINK}`, tid, event.messageID);
    return true;
  }

  if (command === "rules") {
    await sendMessageSafe(api,
`🤍🩷 RK RAJA XWD RULES 🩷🤍
1️⃣ Respect everyone
2️⃣ No spam
3️⃣ No abuse
4️⃣ Admin respect
5️⃣ Enjoy 🥰
📲 ${TELEGRAM_LINK}`, tid);
    return true;
  }

  if (command === "level" || command === "xp" || command === "rank") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    await sendCuteDP(api, tid, target, event.messageID);
    return true;
  }

  return false;
}

// ================= MESSAGE HANDLER =================
async function handleMessage(api, event) {
  if (!event || !event.threadID || !event.senderID) return;
  state.stats.messages++;
  const tid = cleanID(event.threadID);
  const sender = cleanID(event.senderID);

  if (state.botID && sender === cleanID(state.botID)) return;

  if (await handleMessageLock(api, event)) return;
  if (await handleSpamLock(api, event)) return;

  const text = String(event.body || "").trim();
  if (!text) return;

  if (state.locks.nicknames[tid]) {
    applyNicknameLock(api, tid).catch(() => {});
  }

  const parsed = parseCommand(text);
  const called = isBotCalled(text);

  if (parsed) {
    if (ADMIN_COMMANDS.has(parsed.command)) {
      await handleAdminCommand(api, event, parsed.command, parsed.args);
      return;
    }
    if (USER_COMMANDS.has(parsed.command)) {
      await handleUserCommand(api, event, parsed.command, parsed.args);
      return;
    }
  }

  // HUMAN MODE
  if (HUMAN_MODE) {
    const name = await getDisplayName(api, sender);

    if (/shayari|shayri|sher|sheri|poetry/i.test(text)) {
      const s = getShayari();
      const att = createPhotoAttachment();
      const body = `@${name} ${s}\n\n📲 ${TELEGRAM_LINK}\n❥ RK RAJA XWD ❥`;
      const msg = att
        ? { body, attachment: att, mentions: [{ tag: `@${name}`, id: sender }] }
        : { body, mentions: [{ tag: `@${name}`, id: sender }] };
      await sendMessageSafe(api, msg, tid, event.messageID);
      return;
    }

    const humanReply = getAutoReply(text);
    if (humanReply) {
      const n = normalizeText(text);
      const greetings = ["hi","hii","hiii","hello","hey","heyy","gm","gn","good morning","good night"];
      const final = greetings.includes(n) ? `@${name} ${humanReply}` : humanReply;
      await sendMessageSafe(api, final, tid, event.messageID);
      return;
    }

    if (called) {
      const defaults = [
        `@${name} haan bolo jaan 💕 kya chahiye?\n\n• shayari\n• joke\n• dp\n• music`,
        `@${name} bolo babu 🥰 kya karna hai?`,
        `@${name} haan jaan 😘 mai sun raha hu`
      ];
      await sendMessageSafe(api, defaults[Math.floor(Math.random() * defaults.length)], tid, event.messageID);
      return;
    }

    if (Math.random() < 0.3) {
      const fb = [
        "Hmm bolo na babu 💕","Kya hua jaan? 🥰","Achha 😊 aur batao?",
        "Sahi hai sona 😘","Haan haan bolo 😌","Kya keh rahe ho jaan? 💗",
        "Theek hai babu 🥰","Aur sunao? 😘","Interesting 💕","Bolo na aur kya? 🥺"
      ];
      await sendMessageSafe(api, fb[Math.floor(Math.random() * fb.length)], tid);
    }
    return;
  }

  // NON-HUMAN MODE
  if (!called) return;
  const reply = getAutoReply(text);
  if (reply) {
    const name = await getDisplayName(api, sender);
    const n = normalizeText(text);
    const final = ["hi","hello","hii","hey"].includes(n) ? `@${name} ${reply}` : reply;
    await sendMessageSafe(api, final, tid, event.messageID);
  }
}

// ================= EVENT HANDLER =================
async function handleEvent(api, event) {
  try {
    if (!event) return;

    if (event.type === "message" || event.type === "message_reply") {
      await handleMessage(api, event);
      return;
    }

    // JOIN
    if (event.type === "event" && event.logMessageType === "log:subscribe") {
      const added = event.logMessageData?.addedParticipants || [];
      for (const p of added) {
        const uid = cleanID(p.userFbId || p.userId || p.id);
        if (!uid) continue;

        if (uid === cleanID(state.botID)) {
          try { await sendPhotoMessageSafe(api, event.threadID, LIVE_MESSAGE); } catch(_){}
        } else {
          const lock = state.locks.nicknames[event.threadID];
          if (lock) await changeNicknameSafe(api, lock.nickname, event.threadID, uid);
          if (WELCOME_MODE) {
            try { await sendWelcomeMessage(api, event.threadID, uid); } catch(e){ log(`welcome err: ${e.message}`); }
          }
        }
        await new Promise(r => setTimeout(r, 1500));
      }
      return;
    }

    // GROUP NAME CHANGE
    if (event.type === "event" && event.logMessageType === "log:thread-name") {
      const tid = cleanID(event.threadID);
      const lock = state.locks.groupNames[tid];
      if (!lock) return;
      const author = cleanID(event.author);
      if (author === cleanID(state.adminID)) { lock.name = event.logMessageData?.name || lock.name; return; }
      const newName = event.logMessageData?.name;
      if (newName && newName !== lock.name) {
        log(`🔒 Name change detected, reverting to "${lock.name}"`);
        for (let i = 0; i < 3; i++) {
          const ok = await setTitleSafe(api, lock.name, tid);
          if (ok) {
            const name = await getDisplayName(api, author);
            await sendMessageSafe(api, {
              body: `@${name} 🔒 Group name locked hai!\nWapas set: "${lock.name}"`,
              mentions: [{ tag: `@${name}`, id: author }]
            }, tid);
            break;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      return;
    }

    // NICKNAME CHANGE
    if (event.type === "event" && event.logMessageType === "log:user-nickname") {
      const tid = cleanID(event.threadID);
      const lock = state.locks.nicknames[tid];
      if (!lock) return;
      const author = cleanID(event.author);
      const changed = cleanID(event.logMessageData?.participant_id || event.logMessageData?.participantID);
      if (changed === cleanID(state.botID)) return;
      if (author === cleanID(state.adminID) && changed === cleanID(state.adminID)) return;
      const newNick = event.logMessageData?.nickname;
      if (changed && newNick !== lock.nickname) {
        log(`🔒 Nick change detected for ${changed}, reverting...`);
        await changeNicknameSafe(api, lock.nickname, tid, changed);
      }
      return;
    }
  } catch (e) { log(`Handler err: ${e.message}`); }
}

// ================= COOKIES =================
function parseCookies(input) {
  if (!input) return null;
  if (Array.isArray(input)) return input;
  if (typeof input === "object") return input;
  const raw = String(input).trim();
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) return p;
    if (p && typeof p === "object") return p;
  } catch(_){}
  const obj = {};
  raw.split(";").forEach(x => {
    const i = x.indexOf("=");
    if (i === -1) return;
    const k = x.substring(0, i).trim();
    const v = x.substring(i + 1).trim();
    if (k) obj[k] = v;
  });
  return Object.keys(obj).length ? obj : null;
}

function cookieStringToAppState(s) {
  const parts = String(s).split(/;\s*/);
  const arr = [];
  const now = Math.floor(Date.now() / 1000);
  for (const p of parts) {
    const i = p.indexOf("=");
    if (i === -1) continue;
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).trim();
    if (!k || !v) continue;
    arr.push({ key: k, value: v, domain: ".facebook.com", path: "/", hostOnly: false, creation: now, lastAccessed: now });
  }
  return arr;
}

function buildLoginOptions(cookies) {
  const o = {
    logLevel: "silent",
    forceLogin: false,
    listenEvents: true,
    selfListen: false,
    updatePresence: false,
    autoMarkRead: false,
    autoMarkDelivery: false,
    online: true
  };
  if (Array.isArray(cookies)) o.appState = cookies;
  else o.cookies = cookies;
  return o;
}

// ================= INIT =================
function initializeBot(input) {
  if (!login) { log("❌ FCA nahi mila"); return; }
  const cookies = parseCookies(input);
  if (!cookies) { log("❌ Cookies invalid"); return; }
  state.cookies = cookies;
  state.running = false;
  let attempt = 0;

  const tryLogin = () => {
    attempt++;
    log(`Initializing... attempt ${attempt}/${MAX_RETRIES}`);
    try {
      login(buildLoginOptions(cookies), async (err, api) => {
        if (err) {
          const m = err.errorDescription || err.message || JSON.stringify(err);
          log(`❌ Login err: ${m}`);
          if (attempt < MAX_RETRIES) setTimeout(tryLogin, 3000);
          else log("🛑 Max retries reached.");
          return;
        }
        if (!api) { log("❌ API null"); return; }

        state.botAPI = api;
        state.running = true;
        state.stats.startedAt = Date.now();
        try { state.botID = cleanID(api.getCurrentUserID()); } catch(_){}
        log(`✅ Bot logged in. BotID: ${state.botID}`);
        io.emit("status", { running: true, botID: state.botID });

        try {
          api.listenMqtt(async (err, ev) => {
            if (err) { log(`MQTT err: ${err.message}`); return; }
            await handleEvent(api, ev);
          });
          log("✅ Listener started");
        } catch (e) {
          log(`❌ listenMqtt: ${e.message}`);
          return;
        }

        // 🎯 3 sec baad announcement
        setTimeout(() => announceBotOnline(api), 3000);
      });
    } catch (e) {
      log(`❌ Login threw: ${e.message}`);
      if (attempt < MAX_RETRIES) setTimeout(tryLogin, 3000);
    }
  };
  tryLogin();
}

function stopBot() {
  state.running = false;
  for (const id of Object.keys(state.fyt)) stopFyt(id);
  state.botAPI = null;
  io.emit("status", { running: false });
  log("⛔ Bot stopped");
}

// ================= ROUTES =================
app.post("/configure", (req, res) => {
  try {
    const b = req.body || {};
    let cookies = b.cookies || b.appState || b.cookie || b.rawCookies || b.cookieString;
    state.mode = b.mode || "c3c";
    state.adminID = cleanID(b.adminID || "");
    state.botID = cleanID(b.botID || "");
    state.prefix = b.prefix || "#";
    if (!cookies) return res.status(400).json({ success: false, error: "Cookies required" });
    if (state.mode === "cookies" && typeof cookies === "string" && !cookies.trim().startsWith("[")) {
      cookies = cookieStringToAppState(cookies);
    }
    log(`Admin:${state.adminID} Prefix:${state.prefix}`);
    initializeBot(cookies);
    res.json({ success: true, message: "Bot starting..." });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/start", (req, res) => {
  if (state.running) return res.json({ success: true, message: "Already running" });
  if (!state.cookies) return res.status(400).json({ success: false, error: "Configure first" });
  initializeBot(state.cookies);
  res.json({ success: true });
});

app.post("/stop", (req, res) => { stopBot(); res.json({ success: true }); });

app.get("/status", (req, res) => {
  res.json({
    success: true, running: state.running, botID: state.botID,
    adminID: state.adminID, mode: state.mode, prefix: state.prefix,
    fca: fcaName, groups: state.stats.groups,
    messages: state.stats.messages, commands: state.stats.commands
  });
});

app.post("/fyt-file", (req, res) => {
  try {
    const fn = path.basename(String(req.body?.filename || "fyt.txt"));
    const content = String(req.body?.content || "");
    const iv = Number(req.body?.interval);
    if (Number.isFinite(iv) && iv >= 5) state.fytInterval = iv * 1000;
    fs.writeFileSync(path.join(FYT_DIR, fn), content, "utf8");
    fs.writeFileSync(FYT_PATH, content, "utf8");
    log(`📄 FYT: ${fn}`);
    res.json({ success: true, filename: fn, lines: readFYTLines().length, interval: state.fytInterval / 1000 });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete("/fyt-file", (req, res) => {
  for (const id of Object.keys(state.fyt)) stopFyt(id);
  fs.writeFileSync(FYT_PATH, "");
  res.json({ success: true });
});

app.get("/fyt-status", (req, res) => {
  res.json({ success: true, lines: readFYTLines().length, interval: state.fytInterval / 1000, running: Object.keys(state.fyt) });
});

io.on("connection", s => {
  s.emit("status", { running: state.running, botID: state.botID });
  s.emit("log", { message: "Dashboard connected" });
});

app.get("/", (req, res) => {
  const p = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(p)) return res.sendFile(p);
  res.send("<h2>RK RAJA XWD BOT running ✅</h2>");
});

// ================= SERVER =================
server.listen(PORT, () => {
  console.log("");
  console.log("╔════════════════════════════╗");
  console.log("║  🤍🩷 RK RAJA XWD BOT 🩷🤍  ║");
  console.log("╚════════════════════════════╝");
  console.log(`🚀 Port: ${PORT} | FCA: ${fcaName}`);
  console.log(`📲 Telegram: ${TELEGRAM_LINK}`);
  console.log("");
});

process.on("uncaughtException", e => log(`UNCAUGHT: ${e.message}`));
process.on("unhandledRejection", e => log(`REJECT: ${e?.message || e}`));
