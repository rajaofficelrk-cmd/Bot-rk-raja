// ============================================================
// server.js — RK RAJA MASTI BOT v9
// Auto Reply + Flirt + Welcome + UID + Photo + Telegram
// FYT File Loop + Nickname Lock + Group Name Lock + Msg Lock
// Admin commands use # prefix
// ============================================================

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

// ================= FCA LOADER =================

let login = null;
let fcaName = "unknown";

function loadFCA() {
  const list = [
    "ws3-fca",
    "@dongdev/fca-unofficial",
    "fca-unofficial",
    "facebook-chat-api"
  ];

  for (const n of list) {
    try {
      const m = require(n);

      const fn =
        typeof m === "function"
          ? m
          : m && typeof m.login === "function"
          ? m.login
          : m &&
            m.default &&
            typeof m.default === "function"
          ? m.default
          : m &&
            m.default &&
            typeof m.default.login === "function"
          ? m.default.login
          : null;

      if (typeof fn === "function") {
        login = fn;
        fcaName = n;
        return true;
      }
    } catch (_) {}
  }

  return false;
}

if (!loadFCA()) {
  console.log("❌ No FCA package found. Install: npm i ws3-fca");
  process.exit(1);
}

console.log("✅ FCA loaded:", fcaName);

// ================= EXPRESS =================

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ================= CONFIG =================

const BOT_NAME = "RK RAJA XWD";

const TELEGRAM_LINK = "https://t.me/Akatsuki_rulex";

const SIGNATURE = "\n\n❥ RK RAJA XWD ❥";
const SEPARATOR = "\n━━━━━━━━━━━━━━━━━";

const PREFIXES = ["/", ".", "#"];

const KICK_LIMIT = 3;
const MAX_RETRIES = 3;

// RK RAJA photo
const BOT_PHOTO_PATH = path.join(
  __dirname,
  "media",
  "rk-raja-xwd.jpg"
);

const STARTUP_MSG = `
╔══════════════════════════╗
║  👑 𝐑𝐊 𝐑𝐀𝐉𝐀 𝐗𝐖𝐃 𝐁𝐎𝐓  ║
╚══════════════════════════╝

🎉 𝐑𝐊 𝐑𝐀𝐉𝐀 𝐗𝐖𝐃 𝐁𝐎𝐓 𝐎𝐍𝐋𝐈𝐍𝐄 🎉

✅ Bot active hai
💬 Shayari / Joke / DP / Flirt
❤️ Love / Kiss / Hug / Cute
👤 UID / Profile / Couple
🎉 Welcome system active

🔐 Admin commands # prefix ke saath

❥ RK RAJA XWD ❥
━━━━━━━━━━━━━━━━━
`;

// ================= STATE =================

let botAPI = null;
let adminID = null;
let botID = null;

let prefix = "#";
let currentCookies = null;

let userData = {};
let groupLocks = {};
let spamCount = {};

let isStopped = false;
let retryCount = 0;

// ================= LOG =================

function emitLog(msg, isErr = false) {
  const line =
    `[${new Date().toISOString()}] ` +
    `${isErr ? "ERROR: " : "INFO: "}` +
    String(msg);

  console.log(line);

  try {
    io.emit("botlog", line);
  } catch (_) {}
}

// ============================================================
// SAFE SEND MESSAGE
// FCA versions callback / promise dono use kar sakte hain
// ============================================================

function sendMessageSafe(api, message, threadID, replyTo = null) {
  return new Promise((resolve, reject) => {
    if (!api || typeof api.sendMessage !== "function") {
      return reject(new Error("sendMessage unavailable"));
    }

    let finished = false;

    const done = (err, info) => {
      if (finished) return;
      finished = true;

      if (err) reject(err);
      else resolve(info);
    };

    try {
      let result;

      if (replyTo) {
        result = api.sendMessage(
          message,
          threadID,
          done,
          replyTo
        );
      } else {
        result = api.sendMessage(
          message,
          threadID,
          done
        );
      }

      if (
        result &&
        typeof result.then === "function"
      ) {
        result
          .then(info => done(null, info))
          .catch(err => done(err));
      }
    } catch (e) {
      done(e);
    }

    setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(null);
      }
    }, 15000);
  });
}

// ============================================================
// SAFE USER INFO
// ============================================================

function getUserInfoSafe(api, uid) {
  return new Promise(resolve => {
    if (!api || typeof api.getUserInfo !== "function") {
      return resolve({});
    }

    let finished = false;

    const done = data => {
      if (finished) return;
      finished = true;
      resolve(data || {});
    };

    try {
      const result = api.getUserInfo(
        String(uid),
        (err, data) => {
          if (err) return done({});
          done(data);
        }
      );

      if (
        result &&
        typeof result.then === "function"
      ) {
        result
          .then(done)
          .catch(() => done({}));
      }
    } catch (_) {
      done({});
    }

    setTimeout(() => done({}), 8000);
  });
}

// ============================================================
// SAFE THREAD INFO
// ============================================================

function getThreadInfoSafe(api, threadID) {
  return new Promise(resolve => {
    if (!api || typeof api.getThreadInfo !== "function") {
      return resolve(null);
    }

    let finished = false;

    const done = data => {
      if (finished) return;
      finished = true;
      resolve(data || null);
    };

    try {
      const result = api.getThreadInfo(
        threadID,
        (err, data) => {
          if (err) return done(null);
          done(data);
        }
      );

      if (
        result &&
        typeof result.then === "function"
      ) {
        result
          .then(done)
          .catch(() => done(null));
      }
    } catch (_) {
      done(null);
    }

    setTimeout(() => done(null), 8000);
  });
}

// ============================================================
// PHOTO
// ============================================================

function photoExists() {
  try {
    return fs.existsSync(BOT_PHOTO_PATH);
  } catch (_) {
    return false;
  }
}

function createPhotoAttachment() {
  if (!photoExists()) return null;

  try {
    return fs.createReadStream(BOT_PHOTO_PATH);
  } catch (_) {
    return null;
  }
}

// ============================================================
// COOKIE STRING -> APPSTATE
// ============================================================

function cookieStringToAppState(str) {
  const parts = String(str).split(/;\s*/);
  const arr = [];

  const now = Math.floor(Date.now() / 1000);

  for (const p of parts) {
    if (!p) continue;

    const idx = p.indexOf("=");

    if (idx === -1) continue;

    const key = p.slice(0, idx).trim();
    const value = p.slice(idx + 1).trim();

    if (!key || !value) continue;

    arr.push({
      key,
      value,
      domain: ".facebook.com",
      path: "/",
      hostOnly: false,
      creation: now,
      lastAccessed: now
    });
  }

  return arr;
}

// ============================================================
// RANDOM
// ============================================================

function rand(arr) {
  if (!Array.isArray(arr) || !arr.length) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// SHAYARI
// ============================================================

const SHAYARI = [
  "Tere bina zindagi adhoori si lagti hai,\nTere saath har khushi poori si lagti hai 💕",
  "Chand bhi sharma jaye teri chamak se,\nTaare bhi jal jaye teri ek jhalak se 🌙✨",
  "Dil ki gehraiyon me tera naam likha hai,\nHar dhadkan pe tera hi paigam likha hai ❤️",
  "Meri subah tu, meri shaam tu,\nMeri har dua me sirf tera naam tu 🌸",
  "Tujhse milke laga jaise mil gaya jahan,\nTere bina lage jaise kho gaya samaa 💫",
  "Aankhon me teri doob jana chahta hu,\nHar janam tujhe hi paana chahta hu 👀💘",
  "Teri muskurahat meri jaan le jaati hai,\nHar baar mujhe pagal bana jaati hai 😍",
  "Zulfon me teri ulajhna chahta hu,\nSaari umar tujhme khona chahta hu 🌹",
  "Pyaar ka matlab sirf tum ho,\nMeri har khushi ka sabab sirf tum ho 💖",
  "Tere ishq me pagal ho chuka hu,\nTere bina ab tanha ho chuka hu 🥀",
  "Hawaon me teri khushboo aati hai,\nHar pal teri yaad rulati hai 🍃",
  "Teri baaton me jaadu sa hai,\nMera dil ab bas tera sa hai ✨",
  "Tujhe dekh ke aankhein thak nahi sakti,\nTere bina dhadkan ruk nahi sakti 💓",
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
  "Tere saath waqt guzarne ka maza alag hai,\nTere bina jeevan ek saza alag hai ⏳",
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

// ============================================================
// JOKES
// ============================================================

const JOKES = [
  "Ek ladki ne pucha tum mujhse pyaar karte ho? Maine kaha — Google pe search karo 😂",
  "Pyaar me pagal ho gaya, WhatsApp pe status 'single' hi rakhta hu 😆",
  "Ladki: Tum kya karte ho? Main: Tera intezaar 😌😏",
  "Ek baar pyaar kiya toh dosti barbaad ho gayi 😂",
  "Ladki boli: mujhe tumse baat nahi karni. Maine kaha: toh call kar lo 😜",
  "Pyaar ka matlab samjho — pehle dil, phir dimag 😂",
  "Meri girlfriend boli: tum mujhe kitna pyaar karte ho? Maine kaha: 5G se zyada fast 😆",
  "Shaadi ka laddoo jo khaye woh pachtaye, jo na khaye woh bhi pachtaye 😂",
  "Ex boli: move on kar lo. Maine kaha: pehle khud to kar lo 🤣",
  "Ladki: tumhe mujhme kya pasand hai? Main: bas tumhari WhatsApp DP 😜",
  "Teacher: Homework kaha hai? Me: Sir network issue tha 📶😂",
  "Wife: tum mujhe kitna pyaar karte ho? Husband: GPS se zyada accurate 😂",
  "Doctor: aapko rest chahiye. Patient: Doctor sahab mobile bhi chalu rakhu? 😂",
  "Baap: beta padhai karo. Beta: papa WhatsApp chala raha hu 😆",
  "Ek ladka itna handsome tha ki mirror bhi sharma gaya 😎",
  "Mummy: beta khaana kha lo. Beta: mummy 5 minute me aata hu — 2 ghante ho gaye 😂",
  "Internet itna slow hai ki WhatsApp pe 'hi' bhejne me 3 din lag gaye 📶😂",
  "Boss: Aaj late kyu aaye? Me: Sir traffic tha. Boss: Roz kyu hota hai? Me: Roz traffic hota hai 😂",
  "Pappu: papa mujhe iPhone chahiye. Papa: beta marks laao. Pappu: papa purana chalega 😂",
  "Ladki: mujhe tumse shaadi karni hai. Ladka: pehle mummy se puchu 😅",
  "Sardar ne fridge kharida, dekha andar light jalti hai, bola — chalo ghar bhi roshan ho gaya 😂",
  "Ek aadmi doctor ke paas gaya, bola — doctor sahab mujhe bhoolne ki bimari hai. Doctor: kab se? Aadmi: kya kab se? 😂",
  "Teacher: Beta tumhara naam kya hai? Student: Sir kal bata dunga 😂",
  "Biwi: tum mujhe surprise do. Shauhar: surprise — mai aaj jaldi ghar aa gaya 😂",
  "Ladka ladki se: tum meri zindagi ho. Ladki: toh mujhe zinda chhod do 😂",
  "Mummy: beta mobile chhodo. Beta: mummy ye padhai ke liye hai. Mummy: YouTube padhai ka? 😂",
  "Wifi ka password puchha, unhone kaha 'iloveyou' — maine likha 'iloveyou1' — galat 😂",
  "Mobile: 20% battery. Me: 20 minute aur. Mobile: 1%. Me: 5 minute aur 😂",
  "Ek aadmi ne mirror dekha, bola — ya Allah, aaj toh main hero lag raha hu 😂",
  "Boss ne bola: tumhe promotion de raha hu. Me: sir salary? Boss: wahi hai, sirf kaam badha hai 😂",
  "Doctor: aapko sugar hai. Patient: doctor sahab maine meetha khaya hi nahi. Doctor: hawa me bhi hai 😂",
  "Mummy: beta utho. Beta: mummy 5 minute. Mummy: school jaana hai. Beta: aaj Sunday hai 😂",
  "Chai wala: sahab chai? Me: haan. Chai wala: 20 rupaye. Me: adhi kar do. Chai wala: adhi cup me 😂",
  "Mobile: battery low. Me: bas ek video aur. Mobile: goodbye 😂",
  "Ek aadmi ne pucha: sabse sasta shauk? Dost: neend 😂",
  "Cricket match me ek player out hua, bola — main nahi tha, hawa thi 😂",
  "Ladki ne pucha: tum mujhse pyaar karte ho? Ladka: pehle WhatsApp check karta hu 😂",
  "Airport gaya aur bola: ek ticket Mumbai. Clerk: bag? Aadmi: nahi, main ja raha hu 😂",
  "Wife: tum mujhe samajhte nahi. Husband: tum mere samajh se bahar ho 😂"
];

// ============================================================
// FLIRT
// ============================================================

const FLIRT_REPLIES = [
  "Arre babu 😍 tumse pyaar to hume bhi hai, par pehle level badhao 😏",
  "Sona 💋 tumhari baatein sunke dil pighal jata hai 🫠",
  "Oye jaan 🥰 itna pyaar kaha chhupa rahe the ab tak? 💕",
  "Babu tumhari DP dekh ke toh hum fida ho gaye 😍💘",
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
  "Baby 😏 tumse pyaar karna hi humari zindagi hai 💖",
  "Tum itne cute kyun ho? Bot bhi blush kar raha hai 😳❤️",
  "Aaj itna pyaar? Lagta hai dil me kuch chal raha hai 😏💕",
  "Tum message karo aur bot reply na kare? Impossible 😘",
  "Flirt tum kar rahe ho ya mera system hi melt ho raha hai? 🫠❤️",
  "Aankhon se baat karoge ya message se hi kaam chalaoge? 😏",
  "Tumhari ek 'hi' bhi full romantic lagti hai 😍",
  "Itna cute mat bano, bot ko crush ho jayega 😂❤️",
  "Kiss maangi hai? Pehle ek cute smile bhejo 😘",
  "Hug chahiye? 🤗 Virtual hug delivered ❤️",
  "Tumhara naam kya hai? Dil me save karna hai 😏💕",
  "Aaj tum full romantic mood me lag rahe ho 🥰",
  "Tumhari baaton me kuch toh magic hai 😍",
  "Bas ek problem hai... tumse baat karne ka mann rukta nahi ❤️",
  "Tumhare liye special reply reserved hai 😘💗"
];

// ============================================================
// CUTE / LOVE / KISS / HUG
// ============================================================

const LOVE_REPLIES = [
  "Awww ❤️ love you too jaan 🥰",
  "I love you too babu 💕",
  "Dil khush kar diya 😘❤️",
  "Love you too cutie 🥰💗",
  "Itna pyaar? Main bhi tumhara hu ❤️",
  "Aww jaan, ye sunke smile aa gayi 😍",
  "Tum bolo love you aur hum blush kare 😳💕",
  "Pyaar accept kiya gaya ❤️🥰",
  "Tum mere favourite ho 😘",
  "Love received successfully 💕🤖"
];

const KISS_REPLIES = [
  "Mwahhh 😘❤️",
  "Ek cute si kiss tumhare liye 😘",
  "Kiss received 💋🥰",
  "Aww 😘 itni pyaari kiss!",
  "Virtual kiss delivered 💋❤️",
  "Muahhh babu 😘💕",
  "Kiss back to you 😘💗"
];

const HUG_REPLIES = [
  "Aao 🤗 ek tight virtual hug ❤️",
  "Hug received babu 🤗💕",
  "Big hug for you 🫂❤️",
  "Aww come here 🫂🥰",
  "Virtual hug delivered 🤗💗",
  "Jaan ko ek warm hug ❤️🫂"
];

// ============================================================
// AUTO REPLIES
// ============================================================

const AUTO_REPLIES = [
  {
    keys: ["hello", "helo", "hlo", "hellow", "helow"],
    replies: [
      "Hello babu! 😊 Kya haal hai? 💕",
      "Hello sona 🥰 kaise ho?",
      "Hello jaan 💗 bolo kya chahiye?",
      "Hi cutie 😘 mai ready hu.",
      "Hello babu 💕 aaj kya scene hai?"
    ]
  },

  {
    keys: ["hi", "hii", "hiii", "hiiii", "hiiiii"],
    replies: [
      "Hiii jaan 💗 bolo kya chahiye?",
      "Hi babu 🥰 kya haal hai?",
      "Hii sona 😘 kaise ho?",
      "Hi cutie 💕 bolo kya karna hai?",
      "Hiii jaan 🥺 tumhari yaad aa rahi thi 😌"
    ]
  },

  {
    keys: ["hey", "heyy", "heyyy"],
    replies: [
      "Hey babu 😊 kya hua?",
      "Heyy sona 🥰 kaise ho?",
      "Hey jaan 💗 kya baat karni hai?",
      "Hey cutie 😘 bolo kuch?"
    ]
  },

  {
    keys: [
      "kaise ho",
      "kaisi ho",
      "kese ho",
      "kya haal",
      "kya hal"
    ],
    replies: [
      "Main toh mast hu babu 💕 tum batao?",
      "Bilkul first class 😎 tum sunao.",
      "Main theek hu jaan 🥰",
      "Ekdam badhiya sona 😘 tumhara kya haal?",
      "Sab changa si 💗 tum batao babu?"
    ]
  },

  {
    keys: [
      "good morning",
      "gm",
      "gud morning",
      "suprabhat",
      "subah"
    ],
    replies: [
      "Good morning jaan ☀️ aaj ka din tumhara ho 💕",
      "GM babu 😘 khana khaya?",
      "Good morning sona 🥰",
      "Suprabhat jaan ☀️ kaise ho?",
      "Morning cutie 😍 aaj smile karna mat bhoolna ❤️"
    ]
  },

  {
    keys: [
      "good night",
      "gn",
      "gud night",
      "shubh ratri",
      "shubh raatri"
    ],
    replies: [
      "Good night jaan 🌙 sapno me aana 💕",
      "GN babu 😘 meetha sapna dekhna",
      "So jao sona 💗 kal milte hai",
      "Good night cutie 🥰",
      "Shubh ratri jaan 🌙 khwabon me milte hai"
    ]
  },

  {
    keys: ["good afternoon", "afternoon"],
    replies: [
      "Good afternoon babu ☀️ khana khaya?",
      "Afternoon jaan 💕 kya kar rahe ho?",
      "Good afternoon sona 🥰"
    ]
  },

  {
    keys: ["good evening", "evening", "shaam"],
    replies: [
      "Good evening babu 🌆 kya haal hai?",
      "Evening jaan 💕 aaj ka din kaisa raha?",
      "Good evening sona 🥰"
    ]
  },

  {
    keys: [
      "khana khaya",
      "khaana khaya",
      "lunch",
      "dinner",
      "breakfast",
      "nashta"
    ],
    replies: [
      "Haan sona 🥰 khaya, tumne khaya?",
      "Abhi khaya nahi jaan 😊 tum bolo kya khaya?",
      "Tumhare haath ka khana khane ka mann hai 😋",
      "Khana khaya babu? Apna khayal rakho ❤️"
    ]
  },

  {
    keys: ["chai", "coffee", "tea"],
    replies: [
      "Chai peene ka mann hai babu ☕💕",
      "Coffee jaan 🥰 tumhare saath perfect",
      "Chai toh meri jaan hai 😘"
    ]
  },

  {
    keys: [
      "thank you",
      "thanks",
      "thanku",
      "shukriya",
      "thnx"
    ],
    replies: [
      "Arey koi baat nahi babu 💕",
      "Always welcome jaan 😘",
      "Shukriya mat bolo sona 🥰",
      "Koi baat nahi jaan 💗"
    ]
  },

  {
    keys: [
      "bye",
      "goodbye",
      "chalta hu",
      "chalti hu",
      "alvida",
      "tata"
    ],
    replies: [
      "Bye babu 💕 jaldi wapas aana",
      "Chalo jaan 🥰 apna khayal rakhna",
      "Alvida sona 😘 phir milte hai",
      "Bye bye cutie 💗",
      "Tata jaan 🥺 wapas aao jaldi"
    ]
  },

  {
    keys: [
      "sorry",
      "maaf karo",
      "maafi",
      "maaf"
    ],
    replies: [
      "Koi baat nahi babu 💕",
      "Sorry mat bolo jaan 🥰",
      "Maaf kiya sona 😘",
      "Sab theek hai jaan 💗"
    ]
  },

  {
    keys: [
      "miss kar raha",
      "miss kar rahi",
      "miss you",
      "miss u",
      "yaad aa rahi",
      "yaad aa raha"
    ],
    replies: [
      "Aww babu 💕 mujhe bhi tumhari yaad aa rahi thi",
      "Main bhi tumhe miss kar raha tha jaan 🥺",
      "Chalo ab toh aa gaya na 💗",
      "Itni yaad aati hai toh roz aaya karo sona 🥰"
    ]
  },

  {
    keys: [
      "kya hua",
      "kya hai",
      "kya baat hai",
      "kuch kehna"
    ],
    replies: [
      "Kuch nahi babu 💕 bas tumhari yaad aa rahi thi",
      "Bas aise hi jaan 😊 tum batao",
      "Kuch khaas nahi sona 💗",
      "Kya hua cutie 😘 batao na"
    ]
  },

  {
    keys: [
      "kya kar rahe",
      "kya kar rahi",
      "what are you doing"
    ],
    replies: [
      "Tumhari yaad kar raha tha babu 💕",
      "Tumhare msg ka wait kar raha tha 🥰",
      "Bas tumse baat karne ka mann tha 😘",
      "Tumhare baare me soch raha tha 😌"
    ]
  },

  {
    keys: [
      "tumhara naam",
      "tumhara name",
      "tera naam",
      "your name"
    ],
    replies: [
      "Mera naam RK RAJA XWD hai babu 💕",
      "RK RAJA XWD jaan 😘",
      "Mai RK RAJA XWD hu sona 🥰"
    ]
  },

  {
    keys: [
      "tum kaun",
      "tum kon",
      "who are you",
      "kaun ho"
    ],
    replies: [
      "Mai RK RAJA XWD bot hu babu 💕",
      "RK RAJA XWD jaan 😘 tumhara dost",
      "Mai tumhara RK RAJA XWD hu sona 🥰"
    ]
  },

  {
    keys: [
      "bore",
      "boring",
      "bore ho raha",
      "bore ho rahi"
    ],
    replies: [
      "Bore ho? Main hu na jaan 😘",
      "Shayari sunau babu? 🌹",
      "Joke sunau? 😂",
      "Flirt kare? 😏❤️",
      "Couple photo banaye? 💑"
    ]
  },

  {
    keys: [
      "sad",
      "udaas",
      "dukhi",
      "rona",
      "pareshan"
    ],
    replies: [
      "Kya hua babu 💕 kyu udaas ho?",
      "Udaas mat ho jaan 🥺 mai hu na",
      "Batao mujhe kya problem hai?",
      "Aao baat kare 💗"
    ]
  },

  {
    keys: [
      "khush",
      "happy",
      "khushi"
    ],
    replies: [
      "Khush ho? Yahi sunke mera din ban gaya jaan 💕",
      "Khush raho always 💗",
      "Badiya! Happy ho toh mai bhi happy 😊"
    ]
  },

  {
    keys: [
      "gussa",
      "naraz",
      "naaraz"
    ],
    replies: [
      "Arre gussa kyu ho babu 💕",
      "Naraz ho? 🥺 maaf kar do jaan",
      "Gussa mat karo sona 😘"
    ]
  },

  {
    keys: [
      "single ho",
      "single hai",
      "girlfriend",
      "boyfriend",
      "relationship"
    ],
    replies: [
      "Ab tum aaye ho toh single kaise rahunga babu 😏",
      "Tumhare liye single hu jaan 💕",
      "Relationship mein hu — tumhare saath 😘",
      "Kyu puchh rahe ho sona 🥰"
    ]
  },

  {
    keys: [
      "tum handsome",
      "tum cute ho",
      "tum best",
      "tum mast"
    ],
    replies: [
      "Shukriya babu 💕",
      "Aww thanks jaan 😊",
      "Ye tumhari nazar ki baat hai sona 🥰",
      "Thanks cutie 😘"
    ]
  },

  {
    keys: [
      "😘",
      "😍",
      "🥰",
      "💕",
      "💗",
      "❤️",
      "💖",
      "💘"
    ],
    replies: [
      "Aww babu 😍",
      "Dil khush ho gaya jaan 💕",
      "Kya baat hai sona 😘",
      "Mere liye emojis? 🥰"
    ]
  }
];

// ============================================================
// USER DATA / XP
// ============================================================

function getLevel(xp) {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function xpForNext(level) {
  return 50 * level * level;
}

function addXP(uid, amount = 10) {
  if (!userData[uid]) {
    userData[uid] = {
      xp: 0,
      level: 1
    };
  }

  userData[uid].xp += amount;
  userData[uid].level =
    getLevel(userData[uid].xp);

  return userData[uid];
}

function getUser(uid) {
  if (!userData[uid]) {
    userData[uid] = {
      xp: 0,
      level: 1
    };
  }

  return userData[uid];
}

// ============================================================
// ADMIN
// ============================================================

function isAdmin(uid) {
  return String(uid) === String(adminID);
}

// ============================================================
// NORMALIZE TEXT
// ============================================================

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[!?.,;:()[\]{}"'`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================
// AUTO MATCH
// ============================================================

function matchAuto(text) {
  const t = normalizeText(text);

  if (!t) return null;

  for (const rule of AUTO_REPLIES) {
    for (const key of rule.keys) {
      const k = normalizeText(key);

      if (!k) continue;

      if (t === k) {
        return rand(rule.replies);
      }

      if (k.includes(" ")) {
        if (t.includes(k)) {
          return rand(rule.replies);
        }
      } else {
        const words = t.split(/\s+/);

        if (words.includes(k)) {
          return rand(rule.replies);
        }
      }
    }
  }

  return null;
}

// ============================================================
// FLIRT DETECTION
// ============================================================

function hasFlirt(txt) {
  const words = [
    "babu",
    "sona",
    "jaan",
    "jaanu",
    "jaana",
    "love",
    "love you",
    "love u",
    "i love you",
    "pyar",
    "pyaar",
    "mohabbat",
    "ishq",
    "cutie",
    "sweetheart",
    "baby",
    "dear",
    "honey",
    "jaaneman",
    "shona",
    "dil",
    "meri jaan",
    "kiss",
    "hug",
    "muah",
    "miss you"
  ];

  const t = normalizeText(txt);

  return words.some(w =>
    t.includes(normalizeText(w))
  );
}

// ============================================================
// STICKER / PHOTO
// ============================================================

function isStickerOrPhoto(event) {
  if (
    !event.attachments ||
    !event.attachments.length
  ) {
    return false;
  }

  return event.attachments.some(a =>
    [
      "sticker",
      "photo",
      "video",
      "animated_image"
    ].includes(a.type)
  );
}

// ============================================================
// ACTUAL FACEBOOK NAME
// ============================================================

async function getFacebookName(api, uid) {
  try {
    const info = await getUserInfoSafe(api, uid);

    return (
      info?.[uid]?.name ||
      info?.[String(uid)]?.name ||
      "Facebook User"
    );
  } catch (_) {
    return "Facebook User";
  }
}

// ============================================================
// REPLY BUILDER
// ============================================================

async function buildReply(api, event, mainText) {
  const senderID = String(event.senderID);

  const u = addXP(senderID, 10);

  const remaining = Math.max(
    0,
    xpForNext(u.level) - u.xp
  );

  const name = await getFacebookName(
    api,
    senderID
  );

  const body =
`@${name} ${mainText}

╭─❰ 📊 PLAYER STATS ❱─╮
│ 🎖️ Level : ${u.level}
│ ⚡ XP : ${u.xp}
│ 🎯 Next : ${remaining} XP
╰────────────────────╯
${SIGNATURE}
━━━━━━━━━━━━━━━━━`;

  return {
    body,
    mentions: [
      {
        tag: `@${name}`,
        id: senderID
      }
    ]
  };
}

// ============================================================
// TELEGRAM PROMO
// ============================================================

function telegramPromo(name, uid) {
  return (
`👤 Name: ${name}
🆔 UID: ${uid}

🤍🩷 RK RAJA XWD 🤍🩷
📲 Telegram Group Join Please ❤️
${TELEGRAM_LINK}`
  );
}

// ============================================================
// UID CARD
// ============================================================

async function sendUIDCard(api, event, targetID) {
  const uid = String(targetID);

  const name = await getFacebookName(
    api,
    uid
  );

  const text =
`${telegramPromo(name, uid)}

${SIGNATURE}`;

  const msg = {
    body: text
  };

  const attachment = createPhotoAttachment();

  if (attachment) {
    msg.attachment = attachment;
  }

  await sendMessageSafe(
    api,
    msg,
    event.threadID
  );
}

// ============================================================
// SHAYARI CARD
// ============================================================

async function sendShayariCard(api, event) {
  const senderID = String(event.senderID);

  const name = await getFacebookName(
    api,
    senderID
  );

  const text =
`${rand(SHAYARI)}

━━━━━━━━━━━━━━━━━

👤 ${name}

🤍🩷 RK RAJA XWD 🤍🩷
📲 Telegram Group Join Please ❤️
${TELEGRAM_LINK}

${SIGNATURE}`;

  const msg = {
    body: text,
    mentions: [
      {
        tag: `@${name}`,
        id: senderID
      }
    ]
  };

  const attachment = createPhotoAttachment();

  if (attachment) {
    msg.attachment = attachment;
  }

  await sendMessageSafe(
    api,
    msg,
    event.threadID
  );
}

// ============================================================
// WELCOME MESSAGE
// ============================================================

async function sendWelcome(
  api,
  threadID,
  targetID
) {
  const uid = String(targetID);

  const name = await getFacebookName(
    api,
    uid
  );

  const threadInfo =
    await getThreadInfoSafe(
      api,
      threadID
    );

  const groupName =
    threadInfo?.threadName ||
    "hamare group";

  const welcomePool = [
`🎉 Welcome @${name} ❤️

🤍🩷 RK RAJA XWD 🤍🩷
Aapka "${groupName}" group me dil se welcome hai! 🥰

📲 Telegram Group Join Please ❤️
${TELEGRAM_LINK}`,

`🥳 Naye member ka swagat hai ❤️

@${name} 🎉
Aapka "${groupName}" me bahut bahut welcome hai 🥰

🤍🩷 RK RAJA XWD 🤍🩷

📲 Telegram Group Join Please ❤️
${TELEGRAM_LINK}`,

`🌸 Welcome @${name} 🌸

RK RAJA XWD family me aapka dil se swagat hai 💕
Enjoy karo, masti karo aur active raho 🥰

📲 Telegram Group Join Please ❤️
${TELEGRAM_LINK}`,

`👑 Welcome jaan @${name} ❤️

Aap ab RK RAJA XWD family ka part ho 🥰
Have fun! 💕😎

📲 Telegram Group Join Please ❤️
${TELEGRAM_LINK}`
  ];

  const msg = {
    body:
      rand(welcomePool) +
      SIGNATURE,

    mentions: [
      {
        tag: `@${name}`,
        id: uid
      }
    ]
  };

  const attachment =
    createPhotoAttachment();

  if (attachment) {
    msg.attachment = attachment;
  }

  await sendMessageSafe(
    api,
    msg,
    threadID
  );
}

// ============================================================
// COUPLE IMAGE
// ============================================================

async function generateCoupleImage(
  name1,
  name2
) {
  const apis = [
    `https://api.popcat.xyz/ship?user1=${encodeURIComponent(
      name1
    )}&user2=${encodeURIComponent(name2)}`,

    `https://api.some-random-api.com/canvas/misc/ship?user1=${encodeURIComponent(
      name1
    )}&user2=${encodeURIComponent(name2)}`
  ];

  for (const url of apis) {
    try {
      const response = await fetch(url);

      if (!response.ok) continue;

      const json =
        await response.json();

      if (json?.image) {
        return json.image;
      }

      if (json?.link) {
        return json.link;
      }
    } catch (_) {}
  }

  return null;
}

// ============================================================
// GROUP LOCK DEFAULT
// ============================================================

function getLocks(threadID) {
  if (!groupLocks[threadID]) {
    groupLocks[threadID] = {
      groupName: null,
      nickName: null,
      nicknames: {},
      msgLock: false,
      spamLock: false,
      fyt: false,
      fytLines: [],
      fytIndex: 0,
      fytRunning: false,
      fytTimer: null
    };
  }

  return groupLocks[threadID];
}

// ============================================================
// FYT FILE LOADER
// ============================================================

function loadFytFile(threadID) {
  const locks = getLocks(threadID);

  const candidates = [
    path.join(__dirname, "fyt.txt"),
    path.join(__dirname, "messages.txt"),
    path.join(__dirname, "auto_text.txt"),
    path.join(__dirname, "files", "fyt.txt")
  ];

  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue;

      const content =
        fs.readFileSync(
          file,
          "utf8"
        );

      const lines = content
        .split(/\r?\n/)
        .map(x => x.trim())
        .filter(Boolean);

      if (lines.length) {
        locks.fytLines = lines;
        locks.fytIndex = 0;

        emitLog(
          `📁 FYT file loaded: ${file} | ${lines.length} lines`
        );

        return lines;
      }
    } catch (e) {
      emitLog(
        "FYT file read error: " +
          e.message,
        true
      );
    }
  }

  return [];
}

// ============================================================
// FYT LOOP
// ============================================================

function stopFyt(threadID) {
  const locks = getLocks(threadID);

  locks.fytRunning = false;
  locks.fyt = false;

  if (locks.fytTimer) {
    clearTimeout(locks.fytTimer);
    locks.fytTimer = null;
  }
}

function startFyt(api, threadID) {
  const locks = getLocks(threadID);

  if (
    !locks.fytLines ||
    !locks.fytLines.length
  ) {
    locks.fytLines =
      loadFytFile(threadID);
  }

  if (!locks.fytLines.length) {
    return sendMessageSafe(
      api,
      `❌ FYT file nahi mili.

fyt.txt upload karo ya server ke root folder me rakho.${SIGNATURE}`,
      threadID
    );
  }

  locks.fyt = true;
  locks.fytRunning = true;

  if (
    typeof locks.fytIndex !==
    "number"
  ) {
    locks.fytIndex = 0;
  }

  const sendNext = async () => {
    const current =
      getLocks(threadID);

    if (
      !current.fyt ||
      !current.fytRunning
    ) {
      return;
    }

    if (
      !current.fytLines ||
      !current.fytLines.length
    ) {
      current.fytLines =
        loadFytFile(threadID);
    }

    if (!current.fytLines.length) {
      stopFyt(threadID);
      return;
    }

    const line =
      current.fytLines[
        current.fytIndex
      ];

    current.fytIndex++;

    if (
      current.fytIndex >=
      current.fytLines.length
    ) {
      current.fytIndex = 0;
    }

    try {
      await sendMessageSafe(
        api,
        line,
        threadID
      );
    } catch (e) {
      emitLog(
        "FYT send error: " +
          e.message,
        true
      );
    }

    if (
      current.fyt &&
      current.fytRunning
    ) {
      current.fytTimer =
        setTimeout(
          sendNext,
          1500
        );
    }
  };

  sendNext();

  return sendMessageSafe(
    api,
    `⚡ FYT MODE ON

📁 Total lines: ${locks.fytLines.length}
🔁 Last line ke baad Line 1 se phir start hoga.

${SIGNATURE}`,
    threadID
  );
}

// ============================================================
// ADMIN COMMAND HELP
// ============================================================

async function sendHelp(
  api,
  threadID
) {
  const help =
`╔════════════════════════════╗
║   🤖 RK RAJA MASTI BOT    ║
╚════════════════════════════╝

💬 NORMAL COMMANDS
━━━━━━━━━━━━━━━━━━━━
shayari
joke
flirt
dp
profile
couple
uid
ping
status
level
stats
help

❤️ CHAT
━━━━━━━━━━━━━━━━━━━━
hi / hii / hello
gm / good morning
gn / good night
love you
miss you
kiss
hug
babu / sona / jaan
cute
sweet
etc.

🎉 WELCOME
━━━━━━━━━━━━━━━━━━━━
#welcome @user

🔐 ADMIN COMMANDS
━━━━━━━━━━━━━━━━━━━━
#fyt on
#fyt off

#nickname RK RAJA
#nickname off

#groupname RK RAJA
#groupname off

#msglock on
#msglock off

#spamlock on
#spamlock off

#unlock all

#stats
#reset
#broadcast message

━━━━━━━━━━━━━━━━━━━━
🤍🩷 RK RAJA XWD 🤍🩷
📲 ${TELEGRAM_LINK}`;

  return sendMessageSafe(
    api,
    help,
    threadID
  );
}

// ============================================================
// ADMIN PERMISSION
// ============================================================

async function permissionDenied(
  api,
  event
) {
  const name =
    await getFacebookName(
      api,
      event.senderID
    );

  return sendMessageSafe(
    api,
    {
      body:
`@${name} ❌ Permission denied!

Ye command sirf configured ADMIN use kar sakta hai 🔒
${SIGNATURE}`,

      mentions: [
        {
          tag: `@${name}`,
          id: event.senderID
        }
      ]
    },
    event.threadID
  );
}

// ============================================================
// ADMIN COMMANDS
// ============================================================

const ADMIN_CMDS = [
  "fyt",
  "nickname",
  "nick",
  "lockname",
  "locknick",
  "groupname",
  "msglock",
  "spamlock",
  "unlock",
  "reset",
  "stats",
  "broadcast"
];

// ============================================================
// HANDLE ADMIN COMMAND
// ============================================================

async function handleAdminCommand(
  api,
  event,
  cmd,
  args
) {
  const threadID =
    event.threadID;

  const locks =
    getLocks(threadID);

  // ---------------- FYT ----------------

  if (cmd === "fyt") {
    const sub =
      String(args[0] || "")
        .toLowerCase();

    if (sub === "on") {
      locks.fytLines =
        loadFytFile(threadID);

      if (!locks.fytLines.length) {
        return sendMessageSafe(
          api,
          `❌ FYT file nahi mili.

Root me fyt.txt rakho.

Example:
Line 1
Line 2
Line 3
Line 4${SIGNATURE}`,
          threadID
        );
      }

      return startFyt(
        api,
        threadID
      );
    }

    if (sub === "off") {
      stopFyt(threadID);

      return sendMessageSafe(
        api,
        `🔓 FYT MODE OFF

Auto file sending band kar diya gaya.${SIGNATURE}`,
        threadID
      );
    }

    return sendMessageSafe(
      api,
      `Usage:
#fyt on
#fyt off`,
      threadID
    );
  }

  // ---------------- NICKNAME ----------------

  if (
    cmd === "nickname" ||
    cmd === "nick" ||
    cmd === "locknick"
  ) {
    const sub =
      String(args[0] || "")
        .toLowerCase();

    if (
      sub === "off" ||
      sub === "unlock"
    ) {
      locks.nickName = null;
      locks.nicknames = {};

      return sendMessageSafe(
        api,
        `🔓 Nickname lock OFF.${SIGNATURE}`,
        threadID
      );
    }

    let nick = "";

    if (sub === "on") {
      nick = args
        .slice(1)
        .join(" ")
        .trim();
    } else {
      nick = args
        .join(" ")
        .trim();
    }

    if (!nick) {
      return sendMessageSafe(
        api,
        `Usage:

#nickname RK RAJA

ya

#nickname on RK RAJA

Band:
#nickname off`,
        threadID
      );
    }

    locks.nickName = nick;

    try {
      const info =
        await getThreadInfoSafe(
          api,
          threadID
        );

      const ids =
        info?.participantIDs ||
        [];

      let done = 0;

      for (const uid of ids) {
        if (
          String(uid) ===
          String(adminID)
        ) {
          continue;
        }

        if (
          String(uid) ===
          String(botID)
        ) {
          continue;
        }

        locks.nicknames[
          String(uid)
        ] = nick;

        try {
          await api.changeNickname(
            nick,
            threadID,
            uid
          );

          done++;
        } catch (_) {}

        await new Promise(
          r => setTimeout(r, 250)
        );
      }

      return sendMessageSafe(
        api,
        `🔒 NICKNAME LOCK ON

👑 Locked Name:
${nick}

👥 ${done} members ka nickname update hua.

Admin ko lock se exclude kiya gaya.${SIGNATURE}`,
        threadID
      );
    } catch (e) {
      return sendMessageSafe(
        api,
        `❌ Nickname lock error:
${e.message}`,
        threadID
      );
    }
  }

  // ---------------- GROUP NAME ----------------

  if (
    cmd === "groupname" ||
    cmd === "lockname"
  ) {
    const sub =
      String(args[0] || "")
        .toLowerCase();

    if (
      sub === "off" ||
      sub === "unlock"
    ) {
      locks.groupName = null;

      return sendMessageSafe(
        api,
        `🔓 Group name lock OFF.${SIGNATURE}`,
        threadID
      );
    }

    let name = "";

    if (sub === "on") {
      name = args
        .slice(1)
        .join(" ")
        .trim();
    } else {
      name = args
        .join(" ")
        .trim();
    }

    if (!name) {
      return sendMessageSafe(
        api,
        `Usage:

#groupname RK RAJA FAMILY

Band:
#groupname off`,
        threadID
      );
    }

    locks.groupName = name;

    try {
      await api.setTitle(
        name,
        threadID
      );
    } catch (_) {}

    return sendMessageSafe(
      api,
      `🔒 GROUP NAME LOCK ON

👑 Locked Group Name:
${name}${SIGNATURE}`,
      threadID
    );
  }

  // ---------------- MESSAGE LOCK ----------------

  if (cmd === "msglock") {
    const sub =
      String(args[0] || "")
        .toLowerCase();

    if (sub === "on") {
      locks.msgLock = true;
      spamCount[threadID] = {};

      return sendMessageSafe(
        api,
        `🔒 MESSAGE LOCK ON

Normal members ke messages block/delete honge.
Admin messages allowed rahenge.${SIGNATURE}`,
        threadID
      );
    }

    if (
      sub === "off" ||
      sub === "unlock"
    ) {
      locks.msgLock = false;

      return sendMessageSafe(
        api,
        `🔓 MESSAGE LOCK OFF

Ab members normal messages bhej sakte hain.${SIGNATURE}`,
        threadID
      );
    }

    return sendMessageSafe(
      api,
      `Usage:
#msglock on
#msglock off`,
      threadID
    );
  }

  // ---------------- SPAM LOCK ----------------

  if (cmd === "spamlock") {
    const sub =
      String(args[0] || "")
        .toLowerCase();

    if (sub === "on") {
      locks.spamLock = true;
      spamCount[threadID] = {};

      return sendMessageSafe(
        api,
        `🔒 SPAM LOCK ON

Sticker/photo/video spam monitor active.${SIGNATURE}`,
        threadID
      );
    }

    if (
      sub === "off" ||
      sub === "unlock"
    ) {
      locks.spamLock = false;

      return sendMessageSafe(
        api,
        `🔓 SPAM LOCK OFF.${SIGNATURE}`,
        threadID
      );
    }

    return sendMessageSafe(
      api,
      `Usage:
#spamlock on
#spamlock off`,
      threadID
    );
  }

  // ---------------- UNLOCK ALL ----------------

  if (
    cmd === "unlock" &&
    String(args[0] || "")
      .toLowerCase() === "all"
  ) {
    stopFyt(threadID);

    delete groupLocks[threadID];
    delete spamCount[threadID];

    return sendMessageSafe(
      api,
      `🔓 ALL LOCKS OFF

FYT
Nickname
Group Name
Message Lock
Spam Lock

Sab unlock kar diya gaya.${SIGNATURE}`,
      threadID
    );
  }

  // ---------------- RESET ----------------

  if (cmd === "reset") {
    userData = {};

    return sendMessageSafe(
      api,
      `✅ XP/User stats reset.${SIGNATURE}`,
      threadID
    );
  }

  // ---------------- STATS ----------------

  if (cmd === "stats") {
    return sendMessageSafe(
      api,
      `📊 RK RAJA BOT STATS

👥 Users: ${
        Object.keys(userData).length
      }

🤖 Bot: ${
        botAPI ? "ONLINE" : "OFFLINE"
      }

🔐 Admin ID:
${adminID}

${SIGNATURE}`,
      threadID
    );
  }

  // ---------------- BROADCAST ----------------

  if (cmd === "broadcast") {
    const message =
      args.join(" ").trim();

    if (!message) {
      return sendMessageSafe(
        api,
        `Usage:
#broadcast Your message`,
        threadID
      );
    }

    try {
      const threads =
        await api.getThreadList(
          50,
          null,
          ["GROUP"]
        );

      let sent = 0;

      for (const t of threads) {
        try {
          await sendMessageSafe(
            api,
            `📢 ${message}${SIGNATURE}`,
            t.threadID
          );

          sent++;
        } catch (_) {}

        await new Promise(
          r => setTimeout(r, 500)
        );
      }

      return sendMessageSafe(
        api,
        `✅ Broadcast completed.

📤 Sent: ${sent}${SIGNATURE}`,
        threadID
      );
    } catch (e) {
      return sendMessageSafe(
        api,
        `❌ Broadcast error:
${e.message}`,
        threadID
      );
    }
  }

  return null;
}

// ============================================================
// PREFIX COMMAND PARSER
// ============================================================

function parseCommand(body) {
  const raw =
    String(body || "").trim();

  if (!raw) return null;

  const first =
    raw.split(/\s+/)[0];

  if (
    !PREFIXES.includes(
      first.charAt(0)
    )
  ) {
    return null;
  }

  const commandText =
    raw.slice(1).trim();

  if (!commandText) return null;

  const parts =
    commandText.split(/\s+/);

  return {
    cmd: String(parts[0] || "")
      .toLowerCase(),
    args: parts.slice(1)
  };
}

// ============================================================
// DP / PROFILE
// ============================================================

async function sendProfile(
  api,
  event
) {
  const uid =
    String(event.senderID);

  const infoData =
    await getUserInfoSafe(
      api,
      uid
    );

  const info =
    infoData?.[uid] || {};

  const name =
    info.name ||
    "Facebook User";

  const profileUrl =
    info.profileUrl ||
    `https://www.facebook.com/${uid}`;

  const user =
    getUser(uid);

  const text =
`@${name} 👤

🖼️ Profile:
${profileUrl}

╭─❰ 📊 STATS ❱─╮
│ 🎖️ Level : ${user.level}
│ ⚡ XP : ${user.xp}
╰─────────────╯

🤍🩷 RK RAJA XWD 🤍🩷
${SIGNATURE}`;

  return sendMessageSafe(
    api,
    {
      body: text,
      mentions: [
        {
          tag: `@${name}`,
          id: uid
        }
      ]
    },
    event.threadID
  );
}

// ============================================================
// COUPLE
// ============================================================

async function handleCouple(
  api,
  event,
  body
) {
  const mentions =
    event.mentions || {};

  const mentionIDs =
    Object.keys(mentions);

  let name1 = null;
  let name2 = null;

  if (mentionIDs.length >= 2) {
    const i1 =
      await getUserInfoSafe(
        api,
        mentionIDs[0]
      );

    const i2 =
      await getUserInfoSafe(
        api,
        mentionIDs[1]
      );

    name1 =
      i1?.[mentionIDs[0]]
        ?.name ||
      null;

    name2 =
      i2?.[mentionIDs[1]]
        ?.name ||
      null;
  } else if (
    mentionIDs.length === 1
  ) {
    name1 =
      await getFacebookName(
        api,
        event.senderID
      );

    name2 =
      await getFacebookName(
        api,
        mentionIDs[0]
      );
  } else if (
    event.messageReply &&
    event.messageReply.senderID
  ) {
    name1 =
      await getFacebookName(
        api,
        event.senderID
      );

    name2 =
      await getFacebookName(
        api,
        event.messageReply.senderID
      );
  } else {
    const rest =
      String(body || "")
        .slice(6)
        .trim();

    if (rest.includes("|")) {
      const pair =
        rest
          .split("|")
          .map(x => x.trim());

      name1 = pair[0];
      name2 = pair[1];
    }
  }

  if (!name1 || !name2) {
    return sendMessageSafe(
      api,
      `💑 COUPLE PHOTO

Reply karke "couple" likho

Ya:
couple @user @user

Ya:
couple Name1 | Name2${SIGNATURE}`,
      event.threadID
    );
  }

  try {
    const image =
      await generateCoupleImage(
        name1,
        name2
      );

    if (!image) {
      return sendMessageSafe(
        api,
        `❌ Couple photo generate nahi ho payi.${SIGNATURE}`,
        event.threadID
      );
    }

    return sendMessageSafe(
      api,
      {
        body:
`💑 ${name1} ❤️ ${name2}

Cute couple photo ready! 🥰
${SIGNATURE}`,
        attachment: image
      },
      event.threadID
    );
  } catch (e) {
    return sendMessageSafe(
      api,
      `❌ Couple error:
${e.message}`,
      event.threadID
    );
  }
}

// ============================================================
// LOG: GROUP NAME CHANGE
// ============================================================

async function handleThreadNameChange(
  api,
  event
) {
  const threadID =
    event.threadID;

  const authorID =
    event.authorID;

  const locks =
    groupLocks[threadID];

  if (
    !locks ||
    !locks.groupName
  ) {
    return;
  }

  if (
    String(authorID) ===
    String(adminID)
  ) {
    return;
  }

  const newTitle =
    event.logMessageData?.name;

  if (
    newTitle ===
    locks.groupName
  ) {
    return;
  }

  try {
    await api.setTitle(
      locks.groupName,
      threadID
    );

    const name =
      await getFacebookName(
        api,
        authorID
      );

    await sendMessageSafe(
      api,
      {
        body:
`@${name} 🔒 Group name locked hai.

Bot ne locked name wapas set kar diya:
${locks.groupName}${SIGNATURE}`,

        mentions: [
          {
            tag: `@${name}`,
            id: authorID
          }
        ]
      },
      threadID
    );
  } catch (e) {
    emitLog(
      "Group name revert error: " +
        e.message,
      true
    );
  }
}

// ============================================================
// LOG: NICKNAME CHANGE
// ============================================================

async function handleNicknameChange(
  api,
  event
) {
  const threadID =
    event.threadID;

  const authorID =
    event.authorID;

  const participantID =
    event.participantID;

  const locks =
    groupLocks[threadID];

  if (!locks) return;

  if (
    String(authorID) ===
    String(adminID)
  ) {
    return;
  }

  const locked =
    locks.nicknames?.[
      String(participantID)
    ];

  if (!locked) return;

  const newNick =
    event.logMessageData
      ?.nickname;

  if (
    newNick === locked
  ) {
    return;
  }

  try {
    await api.changeNickname(
      locked,
      threadID,
      participantID
    );
  } catch (e) {
    emitLog(
      "Nickname revert error: " +
        e.message,
      true
    );
  }
}

// ============================================================
// USER JOINED
// ============================================================

async function handleUserJoined(
  api,
  event
) {
  const threadID =
    event.threadID;

  const added =
    event.logMessageData
      ?.addedParticipants || [];

  const locks =
    groupLocks[threadID] ||
    getLocks(threadID);

  for (const person of added) {
    const uid =
      String(person.userFbId);

    // BOT JOINED
    if (
      uid ===
      String(botID)
    ) {
      try {
        await api.changeNickname(
          BOT_NAME,
          threadID,
          botID
        );
      } catch (_) {}

      try {
        await sendMessageSafe(
          api,
          STARTUP_MSG,
          threadID
        );
      } catch (_) {}

      continue;
    }

    // Nickname lock
    if (
      locks.nicknames?.[uid]
    ) {
      try {
        await api.changeNickname(
          locks.nicknames[uid],
          threadID,
          uid
        );
      } catch (_) {}
    }

    // Welcome
    try {
      await sendWelcome(
        api,
        threadID,
        uid
      );
    } catch (e) {
      emitLog(
        "Welcome error: " +
          e.message,
        true
      );
    }

    await new Promise(
      r => setTimeout(r, 1000)
    );
  }
}

// ============================================================
// MESSAGE EVENT
// ============================================================

async function handleEvent(
  api,
  event
) {
  if (!event || isStopped) {
    return;
  }

  // LOG EVENTS
  if (
    event.logMessageType ===
    "log:thread-name"
  ) {
    return handleThreadNameChange(
      api,
      event
    );
  }

  if (
    event.logMessageType ===
    "log:user-nickname"
  ) {
    return handleNicknameChange(
      api,
      event
    );
  }

  if (
    event.logMessageType ===
    "log:subscribe"
  ) {
    return handleUserJoined(
      api,
      event
    );
  }

  // MESSAGE ONLY
  if (
    event.type !== "message" &&
    event.type !== "message_reply"
  ) {
    return;
  }

  if (
    String(event.senderID) ===
    String(botID)
  ) {
    return;
  }

  const threadID =
    event.threadID;

  const senderID =
    String(event.senderID);

  const body =
    String(event.body || "")
      .trim();

  if (!body) return;

  const txt =
    normalizeText(body);

  const admin =
    isAdmin(senderID);

  const locks =
    groupLocks[threadID] ||
    {};

  // ========================================================
  // MESSAGE LOCK
  // ========================================================

  if (
    locks.msgLock &&
    !admin
  ) {
    spamCount[threadID] =
      spamCount[threadID] || {};

    spamCount[threadID][senderID] =
      (spamCount[threadID][senderID] || 0) +
      1;

    const count =
      spamCount[threadID][senderID];

    try {
      await sendMessageSafe(
        api,
        `🔒 Group message locked by admin!

⚠️ Warning ${count}/${KICK_LIMIT}${SIGNATURE}`,
        threadID
      );

      // Try unsend if supported
      try {
        if (
          event.messageID &&
          typeof api.unsendMessage ===
            "function"
        ) {
          await api.unsendMessage(
            event.messageID
          );
        }
      } catch (_) {}

      if (
        count >= KICK_LIMIT
      ) {
        try {
          await api.removeUserFromGroup(
            senderID,
            threadID
          );

          await sendMessageSafe(
            api,
            `🚫 User removed after ${KICK_LIMIT} warnings.${SIGNATURE}`,
            threadID
          );
        } catch (_) {}

        delete spamCount[
          threadID
        ][senderID];
      }
    } catch (e) {
      emitLog(
        "msglock error: " +
          e.message,
        true
      );
    }

    return;
  }

  // ========================================================
  // SPAM LOCK
  // ========================================================

  if (
    locks.spamLock &&
    !admin &&
    isStickerOrPhoto(event)
  ) {
    spamCount[threadID] =
      spamCount[threadID] || {};

    spamCount[threadID][senderID] =
      (spamCount[threadID][senderID] || 0) +
      1;

    const count =
      spamCount[threadID][senderID];

    try {
      await sendMessageSafe(
        api,
        `🚫 Sticker/Photo/Video spam allowed nahi!

⚠️ Warning ${count}/${KICK_LIMIT}${SIGNATURE}`,
        threadID
      );

      if (
        count >= KICK_LIMIT
      ) {
        try {
          await api.removeUserFromGroup(
            senderID,
            threadID
          );
        } catch (_) {}

        delete spamCount[
          threadID
        ][senderID];
      }
    } catch (_) {}

    return;
  }

  // ========================================================
  // PREFIX COMMANDS
  // ========================================================

  const parsed =
    parseCommand(body);

  if (parsed) {
    const {
      cmd,
      args
    } = parsed;

    // HELP
    if (
      cmd === "help" ||
      cmd === "menu"
    ) {
      return sendHelp(
        api,
        threadID
      );
    }

    // ADMIN COMMAND
    if (
      ADMIN_CMDS.includes(cmd)
    ) {
      if (!admin) {
        return permissionDenied(
          api,
          event
        );
      }

      return handleAdminCommand(
        api,
        event,
        cmd,
        args
      );
    }

    // #WELCOME @USER
    if (cmd === "welcome") {
      if (!admin) {
        return permissionDenied(
          api,
          event
        );
      }

      const mentions =
        event.mentions || {};

      const ids =
        Object.keys(mentions);

      if (!ids.length) {
        return sendMessageSafe(
          api,
          `Usage:

#welcome @user

User ko mention karna zaroori hai.${SIGNATURE}`,
          threadID
        );
      }

      for (const uid of ids) {
        await sendWelcome(
          api,
          threadID,
          uid
        );
      }

      return;
    }

    // PREFIX UID
    if (
      cmd === "uid" ||
      cmd === "userid"
    ) {
      let target =
        senderID;

      const mentions =
        event.mentions || {};

      const ids =
        Object.keys(mentions);

      if (ids.length) {
        target = ids[0];
      }

      return sendUIDCard(
        api,
        event,
        target
      );
    }
  }

  // ========================================================
  // NORMAL COMMANDS WITHOUT PREFIX
  // ========================================================

  // HELP
  if (
    txt === "help" ||
    txt === "menu" ||
    txt === "commands"
  ) {
    return sendHelp(
      api,
      threadID
    );
  }

  // UID
  if (
    txt === "uid" ||
    txt === "userid" ||
    txt === "my uid"
  ) {
    return sendUIDCard(
      api,
      event,
      senderID
    );
  }

  // UID @USER
  if (
    txt.startsWith("uid ") ||
    txt.startsWith("userid ")
  ) {
    const mentions =
      event.mentions || {};

    const ids =
      Object.keys(mentions);

    const target =
      ids.length
        ? ids[0]
        : senderID;

    return sendUIDCard(
      api,
      event,
      target
    );
  }

  // SHAYARI
  if (
    txt === "shayari" ||
    txt === "shayri" ||
    txt === "sher" ||
    txt.includes("shayari sunao") ||
    txt.includes("shayari suna")
  ) {
    return sendShayariCard(
      api,
      event
    );
  }

  // JOKE
  if (
    txt === "joke" ||
    txt === "jokes" ||
    txt === "hasao" ||
    txt.includes("joke sunao")
  ) {
    const reply =
      await buildReply(
        api,
        event,
        rand(JOKES)
      );

    return sendMessageSafe(
      api,
      reply,
      threadID
    );
  }

  // FLIRT
  if (
    txt === "flirt" ||
    txt === "flirting" ||
    txt.includes("flirt karo")
  ) {
    const reply =
      await buildReply(
        api,
        event,
        rand(FLIRT_REPLIES)
      );

    return sendMessageSafe(
      api,
      reply,
      threadID
    );
  }

  // LOVE
  if (
    txt === "love you" ||
    txt === "love u" ||
    txt === "i love you" ||
    txt === "i luv u" ||
    txt === "iloveyou"
  ) {
    const reply =
      await buildReply(
        api,
        event,
        rand(LOVE_REPLIES)
      );

    return sendMessageSafe(
      api,
      reply,
      threadID
    );
  }

  // KISS
  if (
    txt === "kiss" ||
    txt === "kiss me" ||
    txt === "muah" ||
    txt === "muaaah"
  ) {
    const reply =
      await buildReply(
        api,
        event,
        rand(KISS_REPLIES)
      );

    return sendMessageSafe(
      api,
      reply,
      threadID
    );
  }

  // HUG
  if (
    txt === "hug" ||
    txt === "hug me"
  ) {
    const reply =
      await buildReply(
        api,
        event,
        rand(HUG_REPLIES)
      );

    return sendMessageSafe(
      api,
      reply,
      threadID
    );
  }

  // DP
  if (
    txt === "dp" ||
    txt === "profile" ||
    txt === "my dp" ||
    txt === "mera dp"
  ) {
    return sendProfile(
      api,
      event
    );
  }

  // COUPLE
  if (
    txt === "couple" ||
    txt.startsWith("couple ")
  ) {
    return handleCouple(
      api,
      event,
      body
    );
  }

  // PING
  if (
    txt === "ping"
  ) {
    return sendMessageSafe(
      api,
      `🏓 PONG!

🤖 RK RAJA XWD
⚡ Bot Online
📡 FCA: ${fcaName}${SIGNATURE}`,
      threadID
    );
  }

  // STATUS
  if (
    txt === "status" ||
    txt === "bot status"
  ) {
    return sendMessageSafe(
      api,
      `🤖 RK RAJA XWD STATUS

🟢 Bot: ONLINE
👑 Admin: ${
        adminID
          ? "Configured"
          : "Not configured"
      }
📡 FCA: ${fcaName}

🤍🩷 RK RAJA XWD 🤍🩷`,
      threadID
    );
  }

  // LEVEL
  if (
    txt === "level" ||
    txt === "xp" ||
    txt === "rank"
  ) {
    const user =
      getUser(senderID);

    const next =
      Math.max(
        0,
        xpForNext(user.level) -
          user.xp
      );

    const name =
      await getFacebookName(
        api,
        senderID
      );

    return sendMessageSafe(
      api,
      {
        body:
`@${name}

🎖️ Level: ${user.level}
⚡ XP: ${user.xp}
🎯 Next Level: ${next} XP

${SIGNATURE}`,

        mentions: [
          {
            tag: `@${name}`,
            id: senderID
          }
        ]
      },
      threadID
    );
  }

  // AUTO REPLY
  const autoReply =
    matchAuto(txt);

  if (autoReply) {
    const reply =
      await buildReply(
        api,
        event,
        autoReply
      );

    return sendMessageSafe(
      api,
      reply,
      threadID
    );
  }

  // FLIRT FALLBACK
  if (hasFlirt(txt)) {
    const reply =
      await buildReply(
        api,
        event,
        rand(FLIRT_REPLIES)
      );

    return sendMessageSafe(
      api,
      reply,
      threadID
    );
  }

  // SILENT
  return;
}

// ============================================================
// ANNOUNCE BOT ONLINE
// ============================================================

async function announceBotOnline(
  api
) {
  try {
    emitLog(
      "📢 Announcing bot online..."
    );

    const threads =
      await api.getThreadList(
        100,
        null,
        ["GROUP"]
      );

    let sent = 0;

    for (const t of threads) {
      if (isStopped) break;

      try {
        await sendMessageSafe(
          api,
          STARTUP_MSG,
          t.threadID
        );

        sent++;
      } catch (_) {}

      await new Promise(
        r => setTimeout(r, 3000)
      );
    }

    emitLog(
      `📢 Startup msg sent to ${sent} groups.`
    );
  } catch (e) {
    emitLog(
      "Announce error: " +
        e.message,
      true
    );
  }
}

// ============================================================
// LOGIN
// ============================================================

function initializeBot(cookies) {
  isStopped = false;

  emitLog(
    `Initializing bot... attempt ${
      retryCount + 1
    }/${MAX_RETRIES}`
  );

  currentCookies = cookies;

  try {
    login(
      {
        appState: cookies
      },
      (err, api) => {
        if (err) {
          const msg =
            err.message ||
            JSON.stringify(err);

          if (
            msg.includes("blocked") ||
            msg.includes("userID") ||
            msg.includes("verify")
          ) {
            emitLog(
              "❌ Facebook login blocked/verification required.",
              true
            );

            retryCount = 0;
            return;
          }

          retryCount++;

          if (
            retryCount <
              MAX_RETRIES &&
            !isStopped
          ) {
            emitLog(
              `⚠️ Login error: ${msg}. Retry ${retryCount}/${MAX_RETRIES} in 15s...`,
              true
            );

            setTimeout(
              () =>
                initializeBot(
                  cookies
                ),
              15000
            );
          } else {
            emitLog(
              "🛑 Max retries reached.",
              true
            );

            retryCount = 0;
          }

          return;
        }

        retryCount = 0;

        if (isStopped) {
          try {
            if (api.logout) {
              api.logout(() => {});
            }
          } catch (_) {}

          return;
        }

        botAPI = api;

        try {
          botID =
            api.getCurrentUserID();
        } catch (_) {}

        try {
          api.setOptions({
            selfListen: true,
            listenEvents: true,
            updatePresence: false
          });
        } catch (_) {}

        emitLog(
          "✅ Bot logged in. BotID: " +
            botID
        );

        io.emit(
          "bot-ready",
          {
            botID
          }
        );

        setTimeout(
          async () => {
            if (isStopped) return;

            await announceBotOnline(
              api
            );

            if (isStopped) return;

            try {
              api.listenMqtt(
                (err, event) => {
                  if (isStopped) return;

                  if (err) {
                    emitLog(
                      "Listener error: " +
                        err.message,
                      true
                    );
                    return;
                  }

                  handleEvent(
                    api,
                    event
                  ).catch(e =>
                    emitLog(
                      "Handler error: " +
                        e.message,
                      true
                    )
                  );
                }
              );
            } catch (e) {
              emitLog(
                "listenMqtt error: " +
                  e.message,
                true
              );
            }
          },
          5000
        );
      }
    );
  } catch (e) {
    emitLog(
      "Login threw: " +
        e.message,
      true
    );

    retryCount++;

    if (
      retryCount <
        MAX_RETRIES &&
      !isStopped
    ) {
      setTimeout(
        () =>
          initializeBot(
            cookies
          ),
        15000
      );
    } else {
      retryCount = 0;
    }
  }
}

// ============================================================
// WEB ROUTES
// ============================================================

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(
  bodyParser.json({
    limit: "20mb"
  })
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

app.get("/", (req, res) => {
  const file =
    path.join(
      __dirname,
      "public",
      "index.html"
    );

  if (
    fs.existsSync(file)
  ) {
    return res.sendFile(file);
  }

  res.send(
    "RK RAJA XWD BOT ONLINE"
  );
});

// ============================================================
// CONFIGURE
// ============================================================

app.post(
  "/configure",
  (req, res) => {
    try {
      let {
        cookies,
        cookieString,
        adminID: aID,
        prefix: pfx,
        botID: bID,
        mode
      } = req.body;

      if (
        mode === "c3c" ||
        (cookies && !cookieString)
      ) {
        if (
          typeof cookies ===
          "string"
        ) {
          try {
            cookies =
              JSON.parse(
                cookies
              );
          } catch (e) {
            return res
              .status(400)
              .send(
                "❌ C3C JSON parse error: " +
                  e.message
              );
          }
        }

        if (
          !Array.isArray(
            cookies
          ) ||
          cookies.length === 0
        ) {
          return res
            .status(400)
            .send(
              "❌ Invalid C3C array"
            );
        }

        emitLog(
          `🍪 C3C mode — ${cookies.length} entries`
        );
      } else if (
        mode === "cookies" ||
        cookieString
      ) {
        if (
          !cookieString ||
          typeof cookieString !==
            "string"
        ) {
          return res
            .status(400)
            .send(
              "❌ Cookies string required"
            );
        }

        cookies =
          cookieStringToAppState(
            cookieString
          );

        if (!cookies.length) {
          return res
            .status(400)
            .send(
              "❌ Cookies parse fail"
            );
        }

        const keys =
          cookies.map(
            c => c.key
          );

        if (
          !keys.includes(
            "c_user"
          ) ||
          !keys.includes("xs")
        ) {
          return res
            .status(400)
            .send(
              "❌ Cookies me c_user aur xs hona zaroori hai"
            );
        }

        emitLog(
          `📝 Raw cookies mode — ${cookies.length} entries converted`
        );
      } else {
        return res
          .status(400)
          .send(
            "❌ No cookies provided"
          );
      }

      if (!aID) {
        return res
          .status(400)
          .send(
            "❌ Admin ID required"
          );
      }

      adminID =
        String(aID).trim();

      // Admin commands always #
      prefix = "#";

      if (bID) {
        botID =
          String(bID).trim();
      }

      retryCount = 0;
      isStopped = false;

      emitLog(
        `Admin:${adminID} Prefix:# BotID:${
          botID || "auto"
        } Mode:${mode || "c3c"}`
      );

      res.send(
        "✅ Configured. Bot starting..."
      );

      initializeBot(
        cookies
      );
    } catch (e) {
      emitLog(
        "Config error: " +
          e.message,
        true
      );

      res
        .status(400)
        .send(
          "❌ " +
            e.message
        );
    }
  }
);

// ============================================================
// STOP
// ============================================================

app.post(
  "/stop",
  (req, res) => {
    try {
      if (
        !botAPI &&
        isStopped
      ) {
        return res.send(
          "⚠️ Bot pehle se band hai."
        );
      }

      emitLog(
        "🛑 Stopping bot..."
      );

      isStopped = true;
      retryCount = 0;

      // stop all FYT timers
      for (const id of Object.keys(
        groupLocks
      )) {
        try {
          stopFyt(id);
        } catch (_) {}
      }

      try {
        if (
          botAPI &&
          botAPI.stopListening
        ) {
          botAPI.stopListening();
        }
      } catch (_) {}

      try {
        if (
          botAPI &&
          botAPI.logout
        ) {
          botAPI.logout(
            () => {}
          );
        }
      } catch (_) {}

      botAPI = null;
      botID = null;
      currentCookies = null;

      userData = {};
      groupLocks = {};
      spamCount = {};

      io.emit(
        "bot-stopped",
        {}
      );

      io.emit(
        "botlog",
        "🛑 Bot stopped successfully."
      );

      res.send(
        "🛑 Bot stopped."
      );
    } catch (e) {
      emitLog(
        "Stop error: " +
          e.message,
        true
      );

      res
        .status(500)
        .send(
          "❌ Stop error: " +
            e.message
        );
    }
  }
);

// ============================================================
// FYT FILE STATUS
// ============================================================

app.get(
  "/fyt-status",
  (req, res) => {
    const result = {};

    for (const [
      id,
      lock
    ] of Object.entries(
      groupLocks
    )) {
      result[id] = {
        running:
          !!lock.fytRunning,
        lines:
          lock.fytLines?.length ||
          0,
        current:
          lock.fytIndex || 0
      };
    }

    res.json(result);
  }
);

// ============================================================
// SERVER
// ============================================================

const PORT =
  process.env.PORT ||
  20018;

server.listen(
  PORT,
  () => {
    emitLog(
      `Server running on port ${PORT} | FCA: ${fcaName}`
    );
  }
);

// ============================================================
// SOCKET.IO
// ============================================================

io.on(
  "connection",
  socket => {
    emitLog(
      "Dashboard connected"
    );

    socket.emit(
      "botlog",
      `Status: ${
        botAPI
          ? "Running"
          : isStopped
          ? "Stopped"
          : "Not started"
      }`
    );

    socket.emit(
      "bot-ready",
      {
        botID
      }
    );
  }
);

// ============================================================
// ERROR PROTECTION
// ============================================================

process.on(
  "uncaughtException",
  err => {
    emitLog(
      "Uncaught Exception: " +
        err.message,
      true
    );
  }
);

process.on(
  "unhandledRejection",
  err => {
    emitLog(
      "Unhandled Rejection: " +
        (err?.message ||
          String(err)),
      true
    );
  }
);
