// ============================================================
// RK RAJA MASTI BOT v10
// C3C / AppState + Facebook Messenger + Web Dashboard
// ============================================================

const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

// ================= FCA LOADER =================

let login = null;
let fcaName = "unknown";

function loadFCA() {
  const packages = [
    "ws3-fca",
    "ws3-fca/src",
    "fca-unofficial",
    "facebook-chat-api"
  ];

  for (const pkg of packages) {
    try {
      const mod = require(pkg);
      if (typeof mod === "function") {
        login = mod;
        fcaName = pkg;
        console.log("✅ FCA loaded:", pkg);
        return true;
      }

      if (mod && typeof mod.login === "function") {
        login = mod.login;
        fcaName = pkg;
        console.log("✅ FCA loaded:", pkg);
        return true;
      }
    } catch (_) {}
  }

  console.error("❌ FCA package nahi mila.");
  return false;
}

loadFCA();

// ================= APP =================

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));

app.use(express.static(path.join(__dirname, "public")));

// ================= CONFIG =================

const PORT = process.env.PORT || 3000;

const BOT_NAME = "RK RAJA XWD";
const TELEGRAM_LINK = "https://t.me/Akatsuki_rulex";

const KICK_LIMIT = 3;
const MAX_RETRIES = 3;

const MEDIA_DIR = path.join(__dirname, "media");
const FYT_DIR = path.join(__dirname, "fyt");

const BOT_DP_PATH = path.join(MEDIA_DIR, "rk-raja-xwd.jpg");
const FYT_PATH = path.join(FYT_DIR, "fyt.txt");

fs.mkdirSync(MEDIA_DIR, { recursive: true });
fs.mkdirSync(FYT_DIR, { recursive: true });

// ================= REPLIES =================

let replies = {};

try {
  replies = require("./replies");
  console.log("✅ replies.js loaded");
} catch (e) {
  console.log("⚠️ replies.js nahi mila, built-in replies use honge.");
}

// ================= STATE =================

const state = {
  botAPI: null,
  botID: null,
  adminID: null,
  prefix: "#",
  mode: "c3c",
  cookies: null,
  running: false,

  locks: {
    groupNames: {},
    nicknames: {},
    messageLock: {},
    spamLock: {}
  },

  fyt: {},

  spam: {},

  stats: {
    messages: 0,
    commands: 0,
    groups: 0,
    startedAt: null
  }
};

// ================= LOG =================

function log(message) {
  const line = `[${new Date().toLocaleTimeString()}] ${message}`;

  console.log(line);

  io.emit("log", {
    message: line
  });
}

// ================= SAFE ID =================

function cleanID(id) {
  if (id == null) return null;
  return String(id);
}

function cleanMessageID(id) {
  if (id == null) return null;
  return String(id);
}

// ================= PHOTO =================

function createPhotoAttachment() {
  if (!fs.existsSync(BOT_DP_PATH)) {
    return null;
  }

  return fs.createReadStream(BOT_DP_PATH);
}

// ================= SAFE CALLBACK HELPER =================

function safePromise(fn) {
  return new Promise((resolve, reject) => {
    let done = false;

    const finish = (err, result) => {
      if (done) return;
      done = true;

      if (err) reject(err);
      else resolve(result);
    };

    try {
      fn(finish);
    } catch (e) {
      finish(e);
    }
  });
}

// ================= SEND MESSAGE =================

function sendMessageSafe(api, message, threadID, replyToMessageID = null) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const done = (err, info) => {
      if (settled) return;
      settled = true;

      if (err) reject(err);
      else resolve(info);
    };

    try {
      const tid = cleanID(threadID);

      if (!tid) {
        return done(new Error("Invalid threadID"));
      }

      let result;

      if (replyToMessageID) {
        result = api.sendMessage(
          message,
          tid,
          done,
          cleanMessageID(replyToMessageID)
        );
      } else {
        result = api.sendMessage(
          message,
          tid,
          done
        );
      }

      if (result && typeof result.then === "function") {
        result
          .then((info) => done(null, info))
          .catch((err) => done(err));
      }

    } catch (e) {
      done(e);
    }
  });
}

// ================= SEND PHOTO =================

async function sendPhotoMessageSafe(api, threadID, text) {
  const tid = cleanID(threadID);

  if (!tid) {
    throw new Error("Invalid threadID");
  }

  const attachment = createPhotoAttachment();

  if (!attachment) {
    return sendMessageSafe(api, text, tid);
  }

  const message = {
    body: text,
    attachment
  };

  return sendMessageSafe(api, message, tid);
}

// ================= GET USER =================

function getUserInfoSafe(api, userID) {
  return new Promise((resolve) => {
    const uid = cleanID(userID);

    if (!uid || !api || typeof api.getUserInfo !== "function") {
      return resolve(null);
    }

    let finished = false;

    const done = (err, info) => {
      if (finished) return;

      finished = true;

      if (err) {
        resolve(null);
      } else {
        resolve(info || null);
      }
    };

    try {
      const result = api.getUserInfo(uid, done);

      if (result && typeof result.then === "function") {
        result
          .then((info) => done(null, info))
          .catch(() => done(new Error("getUserInfo failed")));
      }
    } catch (_) {
      resolve(null);
    }

    setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(null);
      }
    }, 7000);
  });
}

// ================= THREAD INFO =================

function getThreadInfoSafe(api, threadID) {
  return new Promise((resolve) => {
    const tid = cleanID(threadID);

    if (!tid || !api || typeof api.getThreadInfo !== "function") {
      return resolve(null);
    }

    let finished = false;

    const done = (err, info) => {
      if (finished) return;

      finished = true;

      if (err) resolve(null);
      else resolve(info || null);
    };

    try {
      const result = api.getThreadInfo(tid, done);

      if (result && typeof result.then === "function") {
        result
          .then((info) => done(null, info))
          .catch(() => done(new Error("thread info failed")));
      }
    } catch (_) {
      resolve(null);
    }

    setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(null);
      }
    }, 7000);
  });
}

// ================= THREAD LIST =================

function getThreadListSafe(api, limit = 1000) {
  return new Promise((resolve) => {
    if (!api || typeof api.getThreadList !== "function") {
      return resolve([]);
    }

    let finished = false;

    const done = (err, list) => {
      if (finished) return;

      finished = true;

      if (err) {
        console.log("getThreadList error:", err);
        return resolve([]);
      }

      resolve(Array.isArray(list) ? list : []);
    };

    try {
      const result = api.getThreadList(
        limit,
        null,
        ["INBOX"],
        done
      );

      if (result && typeof result.then === "function") {
        result
          .then((list) => done(null, list))
          .catch((err) => done(err));
      }

    } catch (e) {
      resolve([]);
    }

    setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve([]);
      }
    }, 15000);
  });
}

// ================= SET TITLE =================

function setTitleSafe(api, title, threadID) {
  return new Promise((resolve) => {
    if (!api || typeof api.setTitle !== "function") {
      return resolve(false);
    }

    const tid = cleanID(threadID);

    try {
      const result = api.setTitle(
        title,
        tid,
        (err) => {
          resolve(!err);
        }
      );

      if (result && typeof result.then === "function") {
        result
          .then(() => resolve(true))
          .catch(() => resolve(false));
      }
    } catch (_) {
      resolve(false);
    }
  });
}

// ================= CHANGE NICKNAME =================

function changeNicknameSafe(api, nickname, threadID, userID) {
  return new Promise((resolve) => {
    if (!api || typeof api.changeNickname !== "function") {
      return resolve(false);
    }

    try {
      api.changeNickname(
        nickname,
        cleanID(threadID),
        cleanID(userID),
        (err) => {
          resolve(!err);
        }
      );
    } catch (_) {
      resolve(false);
    }
  });
}

// ================= REMOVE USER =================

function removeUserSafe(api, userID, threadID) {
  return new Promise((resolve) => {
    if (!api || typeof api.removeUserFromGroup !== "function") {
      return resolve(false);
    }

    try {
      api.removeUserFromGroup(
        cleanID(userID),
        cleanID(threadID),
        (err) => {
          resolve(!err);
        }
      );
    } catch (_) {
      resolve(false);
    }
  });
}

// ================= NORMALIZE =================

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/[!?.,;:()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ================= ADMIN =================

function isAdmin(userID) {
  return cleanID(userID) === cleanID(state.adminID);
}

// ================= PREFIX COMMAND =================

function stripCommandPrefix(text) {
  const raw = String(text || "").trim();

  if (!raw) {
    return {
      command: "",
      args: "",
      prefixed: false
    };
  }

  const first = raw.split(/\s+/)[0];

  if (
    first.startsWith("#") ||
    first.startsWith("/") ||
    first.startsWith(".")
  ) {
    const without = raw.substring(1).trim();

    const parts = without.split(/\s+/);

    return {
      command: (parts.shift() || "").toLowerCase(),
      args: parts.join(" "),
      prefixed: true
    };
  }

  return {
    command: "",
    args: "",
    prefixed: false
  };
}

// ================= USER COMMANDS =================

const USER_COMMANDS = new Set([
  "help",
  "menu",
  "shayari",
  "shayri",
  "sher",
  "joke",
  "jokes",
  "hasao",
  "flirt",
  "flirting",
  "dp",
  "profile",
  "uid",
  "userid",
  "id",
  "couple",
  "welcome",
  "status",
  "ping",
  "bot",
  "song",
  "video",
  "rules",
  "level",
  "xp",
  "rank"
]);

// ================= ADMIN COMMANDS =================

const ADMIN_COMMANDS = new Set([
  "fyt",
  "fytfile",
  "fytclear",
  "fytinterval",
  "nickname",
  "locknick",
  "groupname",
  "lockname",
  "msglock",
  "spamlock",
  "unlock",
  "reset",
  "stats",
  "broadcast"
]);

function isKnownCommand(command) {
  return (
    USER_COMMANDS.has(command) ||
    ADMIN_COMMANDS.has(command)
  );
}

// ================= PARSE COMMAND =================

function parseCommand(text) {
  const raw = String(text || "").trim();

  if (!raw) return null;

  const pref = stripCommandPrefix(raw);

  if (pref.prefixed) {
    if (!isKnownCommand(pref.command)) {
      return null;
    }

    return {
      command: pref.command,
      args: pref.args,
      prefixed: true
    };
  }

  const parts = raw.split(/\s+/);

  let command = parts.shift().toLowerCase();

  // @command only if actually known
  if (command.startsWith("@")) {
    command = command.substring(1);
  }

  if (!isKnownCommand(command)) {
    return null;
  }

  return {
    command,
    args: parts.join(" "),
    prefixed: false
  };
}

// ================= NAME =================

async function getDisplayName(api, userID) {
  const uid = cleanID(userID);

  if (!uid) return "User";

  const info = await getUserInfoSafe(api, uid);

  if (!info) {
    return "User";
  }

  if (info[uid]) {
    return (
      info[uid].name ||
      info[uid].fullName ||
      "User"
    );
  }

  if (info.name) {
    return info.name;
  }

  return "User";
}

// ================= THREAD NAME =================

async function getGroupName(api, threadID) {
  const info = await getThreadInfoSafe(api, threadID);

  return (
    info?.threadName ||
    info?.name ||
    "Facebook Group"
  );
}

// ================= STARTUP MESSAGE =================

const LIVE_MESSAGE =
`╔════════════════════════════╗
║   🤍🩷 RK RAJA XWD 🩷🤍   ║
╚════════════════════════════╝

🎉 RK RAJA XWD BOT IS LIVE ❤️

🤖 Bot successfully online hai!
🔥 Bot ab group me active hai.

💬 Shayari • Joke • Flirt
👤 UID • DP • Couple
🎉 Welcome System
❤️ Love • Kiss • Hug
⚡ Auto Reply

📲 Group Join Please ❤️
${TELEGRAM_LINK}

🤍🩷 RK RAJA XWD 🤍🩷`;

// ================= ANNOUNCE BOT ONLINE =================

async function announceBotOnline(api) {
  try {
    log("📢 Bot online announcement start...");

    const list = await getThreadListSafe(api, 1000);

    if (!list.length) {
      log("⚠️ Group list empty. Announcement skip hua.");
      return;
    }

    const groups = [];
    const seen = new Set();

    for (const thread of list) {
      const tid = cleanID(
        thread.threadID ||
        thread.threadId ||
        thread.id
      );

      if (!tid || seen.has(tid)) continue;

      let isGroup = false;

      if (
        thread.isGroup === true ||
        thread.isGroupChat === true
      ) {
        isGroup = true;
      }

      if (
        thread.threadType === "GROUP" ||
        thread.threadType === "GROUP_CHAT"
      ) {
        isGroup = true;
      }

      if (
        Array.isArray(thread.participantIDs) &&
        thread.participantIDs.length > 2
      ) {
        isGroup = true;
      }

      if (
        Array.isArray(thread.participants) &&
        thread.participants.length > 2
      ) {
        isGroup = true;
      }

      if (!isGroup) continue;

      seen.add(tid);
      groups.push(tid);
    }

    log(`📢 ${groups.length} groups found.`);

    state.stats.groups = groups.length;

    for (const threadID of groups) {
      try {
        await sendPhotoMessageSafe(
          api,
          threadID,
          LIVE_MESSAGE
        );

        log(`✅ Live message sent: ${threadID}`);
      } catch (err) {
        log(
          `⚠️ Live message failed ${threadID}: ${
            err?.message || err
          }`
        );
      }

      await new Promise((r) =>
        setTimeout(r, 1800)
      );
    }

    log("🎉 Bot online announcement completed.");

  } catch (err) {
    log(
      `⚠️ Announcement error: ${
        err?.message || err
      }`
    );
  }
}

// ================= WELCOME =================

async function sendWelcome(
  api,
  threadID,
  userID,
  replyToMessageID = null
) {
  const name = await getDisplayName(
    api,
    userID
  );

  const groupName = await getGroupName(
    api,
    threadID
  );

  const text =
`🎉 Welcome @${name} ❤️

🤍🩷 ${groupName} 🩷🤍
Aapka hamare group me dil se welcome hai! 🥰

📲 Telegram Group Join Please ❤️
${TELEGRAM_LINK}`;

  const message = {
    body: text,
    mentions: [
      {
        tag: `@${name}`,
        id: cleanID(userID)
      }
    ]
  };

  const attachment = createPhotoAttachment();

  if (attachment) {
    message.attachment = attachment;
  }

  await sendMessageSafe(
    api,
    message,
    threadID,
    replyToMessageID
  );
}

// ================= UID =================

async function sendUIDCard(
  api,
  threadID,
  userID,
  replyToMessageID = null
) {
  const uid = cleanID(userID);

  const name = await getDisplayName(
    api,
    uid
  );

  const text =
`👤 Name: ${name}
🆔 UID: ${uid}

🤍🩷 RK RAJA XWD 🤍🩷
📲 Telegram Group Join Please ❤️
${TELEGRAM_LINK}`;

  const attachment = createPhotoAttachment();

  const message = {
    body: text
  };

  if (attachment) {
    message.attachment = attachment;
  }

  await sendMessageSafe(
    api,
    message,
    threadID,
    replyToMessageID
  );
}

// ================= SHAYARI =================

const BUILTIN_SHAYARI = [
  "❤️ Dil se jo baat niklegi, woh dil tak zaroor jayegi.",
  "🥰 Mohabbat naam hai us ehsaas ka, jo bina bole bhi samajh aa jaye.",
  "🌸 Zindagi chhoti si hai, muskurao aur apno ke saath jiyo.",
  "❤️ Kuch log dil me aise bas jaate hain, jinhe bhulana mumkin nahi hota.",
  "✨ Teri ek smile ke liye hum hazaar baar smile kar sakte hain."
];

const BUILTIN_JOKES = [
  "😂 Teacher: Homework kaha hai? Student: Sir network nahi tha.",
  "🤣 Dost: Bhai online kyu nahi aaya? Main: Recharge khatam tha.",
  "😂 Maa: Phone chhod de! Beta: Bas 5 minute. 5 minute: 3 ghante.",
  "🤣 Single life bhi ajeeb hai, notification bhi khud hi check karna padta hai."
];

const BUILTIN_FLIRT = [
  "😏 Aap online aaye aur mera notification system khush ho gaya ❤️",
  "🥰 Itni cute smile allowed hai kya? ❤️",
  "😉 Aapka naam kya hai ya main apni favourite list me save kar du? ❤️",
  "😍 Aap message karte ho to chat automatically special ho jaati hai."
];

function randomItem(arr) {
  return arr[
    Math.floor(Math.random() * arr.length)
  ];
}

function getShayari() {
  try {
    if (typeof replies.getShayari === "function") {
      return replies.getShayari();
    }
  } catch (_) {}

  return randomItem(BUILTIN_SHAYARI);
}

function getJoke() {
  try {
    if (typeof replies.getJoke === "function") {
      return replies.getJoke();
    }
  } catch (_) {}

  return randomItem(BUILTIN_JOKES);
}

function getFlirt() {
  try {
    if (typeof replies.getFlirt === "function") {
      return replies.getFlirt();
    }
  } catch (_) {}

  return randomItem(BUILTIN_FLIRT);
}

// ================= SHAYARI SEND =================

async function sendShayari(
  api,
  threadID
) {
  const text =
`${getShayari()}

🤍🩷 RK RAJA XWD 🤍🩷
📲 Telegram Group Join Please ❤️
${TELEGRAM_LINK}`;

  const attachment = createPhotoAttachment();

  const message = {
    body: text
  };

  if (attachment) {
    message.attachment = attachment;
  }

  await sendMessageSafe(
    api,
    message,
    threadID
  );
}

// ================= HELP =================

function helpText() {
  return `
🤍🩷 RK RAJA XWD BOT 🩷🤍

👤 USER COMMANDS

hi
hello
shayari
joke
flirt
dp
uid
uid @user
couple
welcome
welcome @user
song
video
status
help
rules
level
xp
rank

🤖 ADMIN COMMANDS

fyt on
fyt off
fytfile filename
fytclear
fytinterval 10

nickname RK RAJA
locknick on RK RAJA

groupname RK RAJA FAMILY
lockname on

msglock on
msglock off

spamlock on
spamlock off

unlock
reset
stats
broadcast message

🤍🩷 ${TELEGRAM_LINK} 🩷🤍
`;
}

// ================= RULES =================

function rulesText() {
  return `
🤍🩷 RK RAJA XWD GROUP RULES 🩷🤍

1️⃣ Respect everyone ❤️
2️⃣ No unnecessary spam
3️⃣ No abusive content
4️⃣ Admin ka respect karo
5️⃣ Group me enjoy karo 🥰

📲 Telegram:
${TELEGRAM_LINK}
`;
}

// ================= AUTO REPLIES =================

const AUTO_REPLIES = {
  hi: [
    "Hii ❤️🥰",
    "Hii ji 😍",
    "Hello ❤️"
  ],

  hello: [
    "Hello ❤️🥰",
    "Hello ji 😍",
    "Hii 👋❤️"
  ],

  hii: [
    "Hiiii ❤️🥰",
    "Hii ji 😘"
  ],

  hey: [
    "Heyy ❤️",
    "Hey ji 😍"
  ],

  gm: [
    "Good Morning 🌅❤️",
    "GM ji 🥰☀️"
  ],

  gn: [
    "Good Night 🌙❤️",
    "GN ji 😴❤️"
  ],

  "love you": [
    "Love you too ❤️🥰",
    "Awww ❤️😘"
  ],

  "miss you": [
    "Awww miss you too 🥺❤️"
  ],

  kiss: [
    "Muaaah 😘❤️"
  ],

  hug: [
    "Big hug 🤗❤️"
  ],

  thanks: [
    "Welcome ji ❤️🥰",
    "Anytime ❤️"
  ],

  thankyou: [
    "Welcome ❤️"
  ],

  bye: [
    "Bye bye 👋❤️",
    "Good night if sleeping 😴❤️"
  ],

  "good morning": [
    "Good Morning 🌅❤️🥰"
  ],

  "good night": [
    "Good Night 🌙❤️🥰"
  ]
};

function findAutoReply(text) {
  const normalized = normalizeText(text);

  try {
    if (
      typeof replies.getAutoReply === "function"
    ) {
      const custom =
        replies.getAutoReply(normalized);

      if (custom) {
        return custom;
      }
    }
  } catch (_) {}

  for (const key of Object.keys(AUTO_REPLIES)) {
    if (
      normalized === key ||
      normalized.includes(key)
    ) {
      return randomItem(
        AUTO_REPLIES[key]
      );
    }
  }

  if (
    normalized.includes("😂") ||
    normalized.includes("🤣")
  ) {
    return "😂😂😂 Hasi control karo bhai!";
  }

  return null;
}

// ================= FYT =================

function readFYTLines() {
  try {
    if (!fs.existsSync(FYT_PATH)) {
      return [];
    }

    return fs
      .readFileSync(FYT_PATH, "utf8")
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);

  } catch (_) {
    return [];
  }
}

function stopFyt(threadID) {
  const tid = cleanID(threadID);

  if (!tid) return;

  const item = state.fyt[tid];

  if (!item) return;

  if (item.timer) {
    clearInterval(item.timer);
  }

  delete state.fyt[tid];

  log(`⛔ FYT stopped: ${tid}`);
}

async function startFyt(
  api,
  threadID
) {
  const tid = cleanID(threadID);

  const lines = readFYTLines();

  if (!lines.length) {
    await sendMessageSafe(
      api,
      "❌ FYT file empty hai.",
      tid
    );
    return;
  }

  stopFyt(tid);

  const interval =
    Number(
      state.fytInterval ||
      10000
    );

  state.fyt[tid] = {
    index: 0,
    lines,
    interval,
    timer: null
  };

  const sendNext = async () => {
    const current =
      state.fyt[tid];

    if (!current) return;

    if (
      current.index >=
      current.lines.length
    ) {
      current.index = 0;
    }

    const line =
      current.lines[
        current.index
      ];

    current.index++;

    try {
      await sendMessageSafe(
        api,
        line,
        tid
      );
    } catch (err) {
      log(
        `FYT send error: ${
          err?.message || err
        }`
      );
    }

    if (
      current.index >=
      current.lines.length
    ) {
      current.index = 0;
    }
  };

  await sendNext();

  state.fyt[tid].timer =
    setInterval(
      sendNext,
      interval
    );

  await sendMessageSafe(
    api,
    `✅ FYT ON\n📄 Lines: ${lines.length}\n⏱ Interval: ${interval / 1000}s`,
    tid
  );
}

state.fytInterval = 10000;

// ================= FYT FILE =================

function loadUploadedFYT(filename) {
  const safeName =
    path.basename(
      String(filename || "")
    );

  if (!safeName) return false;

  const source =
    path.join(
      __dirname,
      "fyt",
      safeName
    );

  if (!fs.existsSync(source)) {
    return false;
  }

  fs.copyFileSync(
    source,
    FYT_PATH
  );

  return true;
}

// ================= GROUP LOCK =================

async function checkGroupNameLock(
  api,
  threadID
) {
  const tid = cleanID(threadID);

  const lock =
    state.locks.groupNames[tid];

  if (!lock) return;

  const info =
    await getThreadInfoSafe(
      api,
      tid
    );

  if (!info) return;

  const current =
    info.threadName ||
    info.name ||
    "";

  if (
    current !== lock.name
  ) {
    await setTitleSafe(
      api,
      lock.name,
      tid
    );

    log(
      `🔒 Group name restored: ${tid}`
    );
  }
}

// ================= NICKNAME LOCK =================

async function applyNicknameLock(
  api,
  threadID
) {
  const tid = cleanID(threadID);

  const lock =
    state.locks.nicknames[tid];

  if (!lock) return;

  const info =
    await getThreadInfoSafe(
      api,
      tid
    );

  if (!info) return;

  let participants = [];

  if (
    Array.isArray(
      info.participantIDs
    )
  ) {
    participants =
      info.participantIDs;
  }

  if (
    Array.isArray(
      info.participants
    )
  ) {
    participants =
      info.participants.map(
        (x) =>
          cleanID(
            x.userID ||
            x.id ||
            x.uid
          )
      );
  }

  participants =
    participants
      .filter(Boolean);

  for (
    const uid of participants
  ) {
    if (
      cleanID(uid) ===
      cleanID(state.botID)
    ) {
      continue;
    }

    try {
      await changeNicknameSafe(
        api,
        lock.nickname,
        tid,
        uid
      );
    } catch (_) {}
  }
}

// ================= MESSAGE LOCK =================

async function handleMessageLock(
  api,
  event
) {
  const tid =
    cleanID(event.threadID);

  if (
    !state.locks.messageLock[tid]
  ) {
    return false;
  }

  if (
    isAdmin(event.senderID)
  ) {
    return false;
  }

  try {
    await sendMessageSafe(
      api,
      "🔒 Message Lock ON\n⚠️ Normal members ke messages allowed nahi hain.",
      tid
    );
  } catch (_) {}

  if (
    typeof api.unsendMessage ===
    "function"
  ) {
    try {
      api.unsendMessage(
        cleanMessageID(
          event.messageID
        ),
        () => {}
      );
    } catch (_) {}
  }

  const key =
    `${tid}:${event.senderID}`;

  state.spam[key] =
    (state.spam[key] || 0) + 1;

  if (
    state.spam[key] >=
    KICK_LIMIT
  ) {
    state.spam[key] = 0;

    await removeUserSafe(
      api,
      event.senderID,
      tid
    );

    try {
      await sendMessageSafe(
        api,
        "🚫 Message Lock: user removed.",
        tid
      );
    } catch (_) {}
  }

  return true;
}

// ================= SPAM LOCK =================

async function handleSpamLock(
  api,
  event
) {
  const tid =
    cleanID(event.threadID);

  if (
    !state.locks.spamLock[tid]
  ) {
    return false;
  }

  if (
    isAdmin(event.senderID)
  ) {
    return false;
  }

  const hasSticker =
    event.stickerID ||
    event.type === "message_reply" &&
    event.messageReply?.attachments?.some(
      (a) =>
        a.type === "sticker"
    );

  const attachments =
    event.attachments || [];

  const hasMedia =
    hasSticker ||
    attachments.some(
      (a) =>
        a.type === "photo" ||
        a.type === "animated_image" ||
        a.type === "sticker"
    );

  if (!hasMedia) {
    return false;
  }

  const key =
    `${tid}:${event.senderID}`;

  state.spam[key] =
    (state.spam[key] || 0) + 1;

  if (
    typeof api.unsendMessage ===
    "function"
  ) {
    try {
      api.unsendMessage(
        cleanMessageID(
          event.messageID
        ),
        () => {}
      );
    } catch (_) {}
  }

  if (
    state.spam[key] >=
    KICK_LIMIT
  ) {
    state.spam[key] = 0;

    await removeUserSafe(
      api,
      event.senderID,
      tid
    );

    await sendMessageSafe(
      api,
      "🚫 Spam Lock: user removed.",
      tid
    );
  }

  return true;
}

// ================= ADMIN COMMANDS =================

async function handleAdminCommand(
  api,
  event,
  command,
  args
) {
  const tid =
    cleanID(event.threadID);

  const sender =
    cleanID(event.senderID);

  if (
    !isAdmin(sender)
  ) {
    await sendMessageSafe(
      api,
      "⛔ Ye command sirf bot admin use kar sakta hai.",
      tid,
      event.messageID
    );

    return true;
  }

  state.stats.commands++;

  // -------- FYT --------

  if (command === "fyt") {
    const mode =
      normalizeText(args);

    if (mode === "on") {
      await startFyt(
        api,
        tid
      );
      return true;
    }

    if (mode === "off") {
      stopFyt(tid);

      await sendMessageSafe(
        api,
        "⛔ FYT OFF",
        tid
      );

      return true;
    }

    await sendMessageSafe(
      api,
      "Use:\nfyt on\nfyt off",
      tid
    );

    return true;
  }

  // -------- FYT FILE --------

  if (
    command === "fytfile"
  ) {
    if (!args) {
      await sendMessageSafe(
        api,
        "Use: fytfile filename.txt",
        tid
      );

      return true;
    }

    const ok =
      loadUploadedFYT(args);

    await sendMessageSafe(
      api,
      ok
        ? "✅ FYT file loaded."
        : "❌ File nahi mili.",
      tid
    );

    return true;
  }

  // -------- FYT CLEAR --------

  if (
    command === "fytclear"
  ) {
    for (
      const id of Object.keys(
        state.fyt
      )
    ) {
      stopFyt(id);
    }

    try {
      fs.writeFileSync(
        FYT_PATH,
        ""
      );
    } catch (_) {}

    await sendMessageSafe(
      api,
      "🗑️ FYT file clear kar di.",
      tid
    );

    return true;
  }

  // -------- FYT INTERVAL --------

  if (
    command === "fytinterval"
  ) {
    const seconds =
      Number(args);

    if (
      !Number.isFinite(seconds) ||
      seconds < 5
    ) {
      await sendMessageSafe(
        api,
        "❌ Minimum interval 5 seconds rakho.",
        tid
      );

      return true;
    }

    state.fytInterval =
      seconds * 1000;

    await sendMessageSafe(
      api,
      `✅ FYT interval: ${seconds}s`,
      tid
    );

    return true;
  }

  // -------- NICKNAME --------

  if (
    command === "nickname"
  ) {
    const nickname =
      args.trim();

    if (!nickname) {
      await sendMessageSafe(
        api,
        "Use: nickname RK RAJA",
        tid
      );

      return true;
    }

    state.locks.nicknames[
      tid
    ] = {
      nickname
    };

    await applyNicknameLock(
      api,
      tid
    );

    await sendMessageSafe(
      api,
      `🔒 Nickname Lock ON\n👤 Nickname: ${nickname}`,
      tid
    );

    return true;
  }

  // -------- LOCKNICK --------

  if (
    command === "locknick"
  ) {
    const match =
      args.match(
        /^(on|off)(?:\s+(.+))?$/i
      );

    if (!match) {
      await sendMessageSafe(
        api,
        "Use:\nlocknick on RK RAJA\nlocknick off",
        tid
      );

      return true;
    }

    const mode =
      match[1].toLowerCase();

    if (mode === "off") {
      delete state.locks.nicknames[
        tid
      ];

      await sendMessageSafe(
        api,
        "🔓 Nickname Lock OFF",
        tid
      );

      return true;
    }

    const nickname =
      (match[2] || "RK RAJA").trim();

    state.locks.nicknames[
      tid
    ] = {
      nickname
    };

    await applyNicknameLock(
      api,
      tid
    );

    await sendMessageSafe(
      api,
      `🔒 Nickname Lock ON\n👤 ${nickname}`,
      tid
    );

    return true;
  }

  // -------- GROUP NAME --------

  if (
    command === "groupname"
  ) {
    if (!args.trim()) {
      await sendMessageSafe(
        api,
        "Use: groupname RK RAJA FAMILY",
        tid
      );

      return true;
    }

    const name =
      args.trim();

    await setTitleSafe(
      api,
      name,
      tid
    );

    state.locks.groupNames[
      tid
    ] = {
      name
    };

    await sendMessageSafe(
      api,
      `🔒 Group Name Lock ON\n📌 ${name}`,
      tid
    );

    return true;
  }

  // -------- LOCKNAME --------

  if (
    command === "lockname"
  ) {
    const match =
      args.match(
        /^(on|off)(?:\s+(.+))?$/i
      );

    if (!match) {
      await sendMessageSafe(
        api,
        "Use:\nlockname on RK RAJA FAMILY\nlockname off",
        tid
      );

      return true;
    }

    const mode =
      match[1].toLowerCase();

    if (mode === "off") {
      delete state.locks.groupNames[
        tid
      ];

      await sendMessageSafe(
        api,
        "🔓 Group Name Lock OFF",
        tid
      );

      return true;
    }

    const name =
      (
        match[2] ||
        "RK RAJA XWD"
      ).trim();

    await setTitleSafe(
      api,
      name,
      tid
    );

    state.locks.groupNames[
      tid
    ] = {
      name
    };

    await sendMessageSafe(
      api,
      `🔒 Group Name Lock ON\n📌 ${name}`,
      tid
    );

    return true;
  }

  // -------- MESSAGE LOCK --------

  if (
    command === "msglock"
  ) {
    const mode =
      normalizeText(args);

    if (mode === "on") {
      state.locks.messageLock[
        tid
      ] = true;

      await sendMessageSafe(
        api,
        "🔒 Message Lock ON",
        tid
      );

      return true;
    }

    if (mode === "off") {
      delete state.locks.messageLock[
        tid
      ];

      await sendMessageSafe(
        api,
        "🔓 Message Lock OFF",
        tid
      );

      return true;
    }

    return true;
  }

  // -------- SPAM LOCK --------

  if (
    command === "spamlock"
  ) {
    const mode =
      normalizeText(args);

    if (mode === "on") {
      state.locks.spamLock[
        tid
      ] = true;

      await sendMessageSafe(
        api,
        "🔒 Spam Lock ON",
        tid
      );

      return true;
    }

    if (mode === "off") {
      delete state.locks.spamLock[
        tid
      ];

      await sendMessageSafe(
        api,
        "🔓 Spam Lock OFF",
        tid
      );

      return true;
    }

    return true;
  }

  // -------- UNLOCK --------

  if (
    command === "unlock"
  ) {
    delete state.locks.groupNames[
      tid
    ];

    delete state.locks.nicknames[
      tid
    ];

    delete state.locks.messageLock[
      tid
    ];

    delete state.locks.spamLock[
      tid
    ];

    stopFyt(tid);

    await sendMessageSafe(
      api,
      "🔓 All locks + FYT OFF",
      tid
    );

    return true;
  }

  // -------- RESET --------

  if (
    command === "reset"
  ) {
    delete state.locks.groupNames[
      tid
    ];

    delete state.locks.nicknames[
      tid
    ];

    delete state.locks.messageLock[
      tid
    ];

    delete state.locks.spamLock[
      tid
    ];

    stopFyt(tid);

    state.spam = {};

    await sendMessageSafe(
      api,
      "♻️ Group settings reset.",
      tid
    );

    return true;
  }

  // -------- STATS --------

  if (
    command === "stats"
  ) {
    const uptime =
      state.stats.startedAt
        ? Math.floor(
            (Date.now() -
              state.stats.startedAt) /
              1000
          )
        : 0;

    await sendMessageSafe(
      api,
      `🤖 RK RAJA XWD STATS

🟢 Running: ${state.running}
👤 Bot ID: ${state.botID}
👑 Admin ID: ${state.adminID}
💬 Messages: ${state.stats.messages}
⚡ Commands: ${state.stats.commands}
👥 Groups: ${state.stats.groups}
⏱ Uptime: ${uptime}s`,
      tid
    );

    return true;
  }

  // -------- BROADCAST --------

  if (
    command === "broadcast"
  ) {
    if (!args.trim()) {
      await sendMessageSafe(
        api,
        "Use: broadcast Your message",
        tid
      );

      return true;
    }

    const list =
      await getThreadListSafe(
        api,
        1000
      );

    let sent = 0;

    for (const thread of list) {
      const target =
        cleanID(
          thread.threadID ||
          thread.threadId ||
          thread.id
        );

      if (!target) continue;

      try {
        await sendMessageSafe(
          api,
          args.trim(),
          target
        );

        sent++;

        await new Promise(
          (r) =>
            setTimeout(r, 1000)
        );
      } catch (_) {}
    }

    await sendMessageSafe(
      api,
      `📢 Broadcast complete.\n✅ Sent: ${sent}`,
      tid
    );

    return true;
  }

  return false;
}

// ================= USER COMMANDS =================

async function handleUserCommand(
  api,
  event,
  command,
  args
) {
  const tid =
    cleanID(event.threadID);

  const sender =
    cleanID(event.senderID);

  state.stats.commands++;

  // -------- HELP --------

  if (
    command === "help" ||
    command === "menu"
  ) {
    await sendMessageSafe(
      api,
      helpText(),
      tid,
      event.messageID
    );

    return true;
  }

  // -------- SHAYARI --------

  if (
    command === "shayari" ||
    command === "shayri" ||
    command === "sher"
  ) {
    await sendShayari(
      api,
      tid
    );

    return true;
  }

  // -------- JOKE --------

  if (
    command === "joke" ||
    command === "jokes" ||
    command === "hasao"
  ) {
    await sendMessageSafe(
      api,
      `😂 ${getJoke()}`,
      tid
    );

    return true;
  }

  // -------- FLIRT --------

  if (
    command === "flirt" ||
    command === "flirting"
  ) {
    await sendMessageSafe(
      api,
      getFlirt(),
      tid
    );

    return true;
  }

  // -------- UID --------

  if (
    command === "uid" ||
    command === "userid" ||
    command === "id"
  ) {
    let target =
      sender;

    if (
      event.mentions &&
      Object.keys(
        event.mentions
      ).length
    ) {
      target =
        cleanID(
          Object.keys(
            event.mentions
          )[0]
        );
    }

    await sendUIDCard(
      api,
      tid,
      target,
      event.messageID
    );

    return true;
  }

  // -------- WELCOME --------

  if (
    command === "welcome"
  ) {
    let target =
      sender;

    if (
      event.mentions &&
      Object.keys(
        event.mentions
      ).length
    ) {
      target =
        cleanID(
          Object.keys(
            event.mentions
          )[0]
        );
    }

    await sendWelcome(
      api,
      tid,
      target,
      event.messageID
    );

    return true;
  }

  // -------- DP --------

  if (
    command === "dp" ||
    command === "profile"
  ) {
    const target =
      sender;

    const name =
      await getDisplayName(
        api,
        target
      );

    const text =
`👤 ${name}

🤍🩷 RK RAJA XWD 🤍🩷
📲 ${TELEGRAM_LINK}`;

    const attachment =
      createPhotoAttachment();

    const message = {
      body: text
    };

    if (attachment) {
      message.attachment =
        attachment;
    }

    await sendMessageSafe(
      api,
      message,
      tid
    );

    return true;
  }

  // -------- COUPLE --------

  if (
    command === "couple"
  ) {
    await sendMessageSafe(
      api,
      `💑 Couple feature active ❤️

🤍🩷 RK RAJA XWD 🩷🤍
📲 ${TELEGRAM_LINK}`,
      tid
    );

    return true;
  }

  // -------- STATUS --------

  if (
    command === "status" ||
    command === "ping" ||
    command === "bot"
  ) {
    await sendMessageSafe(
      api,
      `🤖 RK RAJA XWD BOT

🟢 Status: ONLINE
⚡ Mode: ${state.mode.toUpperCase()}
❤️ Bot active hai!

📲 ${TELEGRAM_LINK}`,
      tid
    );

    return true;
  }

  // -------- RULES --------

  if (
    command === "rules"
  ) {
    await sendMessageSafe(
      api,
      rulesText(),
      tid
    );

    return true;
  }

  // -------- LEVEL --------

  if (
    command === "level" ||
    command === "xp" ||
    command === "rank"
  ) {
    await sendMessageSafe(
      api,
      `🏆 ${await getDisplayName(
        api,
        sender
      )}

⭐ XP system active hai.
🤍🩷 RK RAJA XWD 🩷🤍`,
      tid
    );

    return true;
  }

  // -------- SONG --------

  if (
    command === "song"
  ) {
    const query =
      args.trim();

    if (!query) {
      await sendMessageSafe(
        api,
        "🎵 Use: song song-name",
        tid
      );

      return true;
    }

    await sendMessageSafe(
      api,
      `🎵 Song search:\n${query}\n\nYouTube par search karo ❤️`,
      tid
    );

    return true;
  }

  // -------- VIDEO --------

  if (
    command === "video"
  ) {
    const query =
      args.trim();

    if (!query) {
      await sendMessageSafe(
        api,
        "🎬 Use: video video-name",
        tid
      );

      return true;
    }

    await sendMessageSafe(
      api,
      `🎬 Video search:\n${query}\n\nYouTube par search karo ❤️`,
      tid
    );

    return true;
  }

  return false;
}

// ================= MESSAGE EVENT =================

async function handleMessage(
  api,
  event
) {
  if (!event) return;

  if (
    !event.threadID ||
    !event.senderID
  ) {
    return;
  }

  state.stats.messages++;

  const tid =
    cleanID(event.threadID);

  const sender =
    cleanID(event.senderID);

  // Bot ke own messages ignore
  if (
    state.botID &&
    sender ===
      cleanID(state.botID)
  ) {
    return;
  }

  // Locks
  await checkGroupNameLock(
    api,
    tid
  );

  if (
    await handleMessageLock(
      api,
      event
    )
  ) {
    return;
  }

  if (
    await handleSpamLock(
      api,
      event
    )
  ) {
    return;
  }

  // Nickname lock periodically
  if (
    state.locks.nicknames[tid]
  ) {
    await applyNicknameLock(
      api,
      tid
    );
  }

  const text =
    String(
      event.body || ""
    ).trim();

  if (!text) return;

  // ================= COMMAND =================

  const parsed =
    parseCommand(text);

  if (parsed) {
    if (
      ADMIN_COMMANDS.has(
        parsed.command
      )
    ) {
      await handleAdminCommand(
        api,
        event,
        parsed.command,
        parsed.args
      );

      return;
    }

    if (
      USER_COMMANDS.has(
        parsed.command
      )
    ) {
      await handleUserCommand(
        api,
        event,
        parsed.command,
        parsed.args
      );

      return;
    }
  }

  // ================= AUTO REPLY =================

  const reply =
    findAutoReply(text);

  if (reply) {
    const name =
      await getDisplayName(
        api,
        sender
      );

    let finalReply =
      `${reply}`;

    // Name only for greeting-style replies
    const normalized =
      normalizeText(text);

    if (
      normalized === "hi" ||
      normalized === "hello" ||
      normalized === "hii" ||
      normalized === "hey"
    ) {
      finalReply =
        `@${name} ${reply}`;
    }

    await sendMessageSafe(
      api,
      finalReply,
      tid,
      event.messageID
    );
  }
}

// ================= EVENT HANDLER =================

async function handleEvent(
  api,
  event
) {
  try {
    if (!event) return;

    // Normal message
    if (
      event.type === "message" ||
      event.type === "message_reply"
    ) {
      await handleMessage(
        api,
        event
      );

      return;
    }

    // User joined
    if (
      event.type === "event" &&
      (
        event.logMessageType ===
          "log:subscribe" ||
        event.logMessageType ===
          "log:subscribe"
      )
    ) {
      const added =
        event.logMessageData
          ?.addedParticipants ||
        [];

      for (
        const user of added
      ) {
        const uid =
          cleanID(
            user.userFbId ||
            user.userId ||
            user.id
          );

        if (
          uid &&
          cleanID(uid) ===
            cleanID(state.botID)
        ) {
          try {
            await sendPhotoMessageSafe(
              api,
              event.threadID,
              LIVE_MESSAGE
            );

            log(
              `🎉 Bot joined group and live message sent: ${event.threadID}`
            );
          } catch (err) {
            log(
              `Join announcement error: ${
                err?.message || err
              }`
            );
          }
        }
      }

      return;
    }

  } catch (err) {
    log(
      `Handler error: ${
        err?.message || err
      }`
    );
  }
}

// ================= LOGIN =================

function parseCookies(input) {
  if (!input) return null;

  if (
    typeof input === "object"
  ) {
    return input;
  }

  const raw =
    String(input).trim();

  // JSON AppState
  try {
    const parsed =
      JSON.parse(raw);

    if (
      Array.isArray(parsed)
    ) {
      return parsed;
    }

    if (
      parsed &&
      typeof parsed ===
        "object"
    ) {
      return parsed;
    }
  } catch (_) {}

  // Cookie string
  const result = {};

  raw
    .split(";")
    .forEach((part) => {
      const index =
        part.indexOf("=");

      if (index === -1) return;

      const key =
        part
          .substring(0, index)
          .trim();

      const value =
        part
          .substring(index + 1)
          .trim();

      if (key) {
        result[key] =
          value;
      }
    });

  return Object.keys(result)
    .length
    ? result
    : null;
}

// ================= LOGIN OPTIONS =================

function buildLoginOptions(cookies) {
  const options = {
    logLevel: "silent",
    forceLogin: false,
    listenEvents: true,
    selfListen: false,
    updatePresence: false,
    autoMarkRead: false,
    autoMarkDelivery: false,
    online: true
  };

  if (
    Array.isArray(cookies)
  ) {
    options.appState =
      cookies;
  } else if (
    cookies &&
    typeof cookies ===
      "object"
  ) {
    options.cookies =
      cookies;
  }

  return options;
}

// ================= INITIALIZE BOT =================

function initializeBot(
  cookieInput
) {
  if (!login) {
    log(
      "❌ FCA loaded nahi hai."
    );

    return;
  }

  const cookies =
    parseCookies(
      cookieInput
    );

  if (!cookies) {
    log(
      "❌ C3C/AppState cookies invalid."
    );

    return;
  }

  state.cookies =
    cookies;

  state.running =
    false;

  let attempt = 0;

  const tryLogin = () => {
    attempt++;

    log(
      `INFO: Initializing bot... attempt ${attempt}/${MAX_RETRIES}`
    );

    const options =
      buildLoginOptions(
        cookies
      );

    try {
      login(
        options,
        async (
          err,
          api
        ) => {
          if (err) {
            log(
              `❌ Login error: ${
                err?.errorDescription ||
                err?.message ||
                JSON.stringify(err)
              }`
            );

            if (
              attempt <
              MAX_RETRIES
            ) {
              setTimeout(
                tryLogin,
                3000
              );
            }

            return;
          }

          if (!api) {
            log(
              "❌ API object nahi mila."
            );

            return;
          }

          state.botAPI =
            api;

          state.running =
            true;

          state.stats.startedAt =
            Date.now();

          try {
            const detected =
              typeof api.getCurrentUserID ===
              "function"
                ? api.getCurrentUserID()
                : null;

            state.botID =
              cleanID(
                detected
              );
          } catch (_) {}

          if (!state.botID) {
            state.botID =
              cleanID(
                process.env.BOT_ID
              );
          }

          log(
            `INFO: ✅ Bot logged in. BotID: ${state.botID || "unknown"}`
          );

          io.emit(
            "status",
            {
              running: true,
              botID:
                state.botID
            }
          );

          // ================= LISTENER FIRST =================

          try {
            api.listenMqtt(
              async (
                err,
                event
              ) => {
                if (err) {
                  log(
                    `MQTT error: ${
                      err?.message ||
                      err
                    }`
                  );

                  return;
                }

                await handleEvent(
                  api,
                  event
                );
              }
            );

            log(
              "✅ Messenger listener started."
            );

          } catch (listenError) {
            log(
              `❌ listenMqtt error: ${
                listenError?.message ||
                listenError
              }`
            );

            state.running =
              false;

            return;
          }

          // ================= ONLINE ANNOUNCEMENT =================

          setTimeout(
            async () => {
              await announceBotOnline(
                api
              );
            },
            3000
          );
        }
      );

    } catch (e) {
      log(
        `❌ FCA start error: ${
          e?.message || e
        }`
      );

      if (
        attempt <
        MAX_RETRIES
      ) {
        setTimeout(
          tryLogin,
          3000
        );
      }
    }
  };

  tryLogin();
}

// ================= STOP BOT =================

function stopBot() {
  state.running =
    false;

  for (
    const tid of Object.keys(
      state.fyt
    )
  ) {
    stopFyt(tid);
  }

  state.botAPI = null;

  io.emit(
    "status",
    {
      running: false
    }
  );

  log(
    "⛔ Bot stopped."
  );
}

// ================= CONFIGURE =================

app.post(
  "/configure",
  (req, res) => {
    try {
      const body =
        req.body || {};

      const mode =
        body.mode ||
        "c3c";

      const cookies =
        body.cookies ||
        body.appState ||
        body.cookie ||
        body.rawCookies;

      state.mode =
        mode;

      state.adminID =
        cleanID(
          body.adminID ||
          body.adminId ||
          ""
        );

      state.botID =
        cleanID(
          body.botID ||
          body.botId ||
          ""
        );

      state.prefix =
        body.prefix ||
        "#";

      if (!cookies) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "C3C/AppState cookies required."
          });
      }

      log(
        `INFO: ${mode.toUpperCase()} mode configured.`
      );

      log(
        `INFO: Admin:${state.adminID || "none"} Prefix:${state.prefix} BotID:${state.botID || "auto"}`
      );

      initializeBot(
        cookies
      );

      res.json({
        success: true,
        message:
          "Bot initializing..."
      });

    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          error:
            err.message
        });
    }
  }
);

// ================= START =================

app.post(
  "/start",
  (req, res) => {
    if (state.running) {
      return res.json({
        success: true,
        message:
          "Bot already running."
      });
    }

    const cookies =
      state.cookies ||
      req.body?.cookies;

    if (!cookies) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Pehle C3C/AppState configure karo."
        });
    }

    initializeBot(
      cookies
    );

    res.json({
      success: true
    });
  }
);

// ================= STOP =================

app.post(
  "/stop",
  (req, res) => {
    stopBot();

    res.json({
      success: true
    });
  }
);

// ================= STATUS =================

app.get(
  "/status",
  (req, res) => {
    res.json({
      success: true,
      running:
        state.running,
      botID:
        state.botID,
      adminID:
        state.adminID,
      mode:
        state.mode,
      prefix:
        state.prefix,
      fca:
        fcaName,
      groups:
        state.stats.groups,
      messages:
        state.stats.messages,
      commands:
        state.stats.commands
    });
  }
);

// ================= FYT UPLOAD =================

app.post(
  "/fyt-file",
  (req, res) => {
    try {
      const filename =
        path.basename(
          String(
            req.body?.filename ||
            "fyt.txt"
          )
        );

      const content =
        String(
          req.body?.content ||
          ""
        );

      const interval =
        Number(
          req.body?.interval
        );

      if (
        Number.isFinite(
          interval
        ) &&
        interval >= 5
      ) {
        state.fytInterval =
          interval * 1000;
      }

      fs.mkdirSync(
        FYT_DIR,
        {
          recursive: true
        }
      );

      fs.writeFileSync(
        path.join(
          FYT_DIR,
          filename
        ),
        content,
        "utf8"
      );

      fs.writeFileSync(
        FYT_PATH,
        content,
        "utf8"
      );

      log(
        `📄 FYT uploaded: ${filename}`
      );

      res.json({
        success: true,
        filename,
        lines:
          readFYTLines().length,
        interval:
          state.fytInterval /
          1000
      });

    } catch (err) {
      log(
        `FYT upload error: ${
          err?.message || err
        }`
      );

      res
        .status(500)
        .json({
          success: false,
          error:
            err.message
        });
    }
  }
);

// ================= FYT DELETE =================

app.delete(
  "/fyt-file",
  (req, res) => {
    try {
      for (
        const tid of Object.keys(
          state.fyt
        )
      ) {
        stopFyt(tid);
      }

      fs.writeFileSync(
        FYT_PATH,
        "",
        "utf8"
      );

      log(
        "🗑️ FYT file cleared."
      );

      res.json({
        success: true
      });

    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          error:
            err.message
        });
    }
  }
);

// ================= FYT STATUS =================

app.get(
  "/fyt-status",
  (req, res) => {
    res.json({
      success: true,
      lines:
        readFYTLines().length,
      interval:
        state.fytInterval /
        1000,
      runningGroups:
        Object.keys(
          state.fyt
        )
    });
  }
);

// ================= BROADCAST API =================

app.post(
  "/broadcast",
  async (req, res) => {
    try {
      if (
        !isAdmin(
          req.body?.adminID
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            error:
              "Admin only"
          });
      }

      const message =
        String(
          req.body?.message ||
          ""
        ).trim();

      if (!message) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Message required"
          });
      }

      if (!state.botAPI) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Bot offline"
          });
      }

      const list =
        await getThreadListSafe(
          state.botAPI,
          1000
        );

      let sent = 0;

      for (
        const thread of list
      ) {
        const tid =
          cleanID(
            thread.threadID ||
            thread.threadId ||
            thread.id
          );

        if (!tid) continue;

        try {
          await sendMessageSafe(
            state.botAPI,
            message,
            tid
          );

          sent++;

          await new Promise(
            (r) =>
              setTimeout(
                r,
                1000
              )
          );

        } catch (_) {}
      }

      res.json({
        success: true,
        sent
      });

    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          error:
            err.message
        });
    }
  }
);

// ================= SOCKET.IO =================

io.on(
  "connection",
  (socket) => {
    socket.emit(
      "status",
      {
        running:
          state.running,
        botID:
          state.botID
      }
    );

    socket.on(
      "requestStatus",
      () => {
        socket.emit(
          "status",
          {
            running:
              state.running,
            botID:
              state.botID,
            groups:
              state.stats.groups,
            messages:
              state.stats.messages
          }
        );
      }
    );
  }
);

// ================= ROOT =================

app.get(
  "/",
  (req, res) => {
    const index =
      path.join(
        __dirname,
        "public",
        "index.html"
      );

    if (
      fs.existsSync(index)
    ) {
      return res.sendFile(
        index
      );
    }

    res.send(`
      <h2>🤍🩷 RK RAJA XWD BOT 🩷🤍</h2>
      <p>Bot server running.</p>
    `);
  }
);

// ================= START SERVER =================

server.listen(
  PORT,
  () => {
    console.log("");
    console.log(
      "╔════════════════════════════════════╗"
    );
    console.log(
      "║     🤍🩷 RK RAJA XWD BOT 🩷🤍     ║"
    );
    console.log(
      "╚════════════════════════════════════╝"
    );
    console.log(
      `🚀 Server running on port ${PORT}`
    );
    console.log(
      `📡 FCA: ${fcaName}`
    );
    console.log(
      `📲 Telegram: ${TELEGRAM_LINK}`
    );
    console.log("");
  }
);

// ================= ERROR HANDLERS =================

process.on(
  "uncaughtException",
  (err) => {
    log(
      `UNCAUGHT: ${
        err?.message || err
      }`
    );
  }
);

process.on(
  "unhandledRejection",
  (err) => {
    log(
      `REJECTION: ${
        err?.message || err
      }`
    );
  }
);
