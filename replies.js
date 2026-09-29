// ==========================================================
// replies.js — RK RAJA MASTI BOT
// No-prefix Auto Reply + Shayari + Joke + Flirt
// ==========================================================

'use strict';

// ==========================================================
// RANDOM HELPER
// ==========================================================

function rand(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return '';
  }

  return arr[Math.floor(Math.random() * arr.length)];
}

// ==========================================================
// TEXT NORMALIZER
// ==========================================================

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s!?.,']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ==========================================================
// SHAYARI
// ==========================================================

const SHAYARI_BASE = [
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
  "Meri raat ki tu hi chaandni hai,\nMeri zindagi ki tu hi roshni hai 🌕",
  "Tere naam pe likh di zindagi meri,\nTujhse hi shuru tujhpe khatam kahani meri 📖",
  "Ishq ka rang chadha hai mujhpe,\nTera nasha chadha hai mujhpe 🍷",
  "Tujhe paane ki dua karta hu,\nHar janam tujhe chahta hu 🤲",
  "Teri aankhon ka nasha alag hai,\nTeri baaton ka asar alag hai 💞",
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
  "Tere bina jeena mushkil hai,\nTere pyaar ka asar dil hai 🩹",
  "Dil ki har baat tujhse kehna chahta hu,\nTere saath har pal rehna chahta hu 💫",
  "Teri aankhein meri manzil hain,\nTeri baatein meri mehfil hain 🌹",
  "Tu jo paas ho toh har pal sukoon hai,\nTu jo door ho toh har pal junoon hai 🔥",
  "Tera chehra meri subah ki roshni,\nTeri yaadein meri raat ki chaandni 🌙"
];

// ==========================================================
// JOKES
// ==========================================================

const JOKES_BASE = [
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
  "Doctor: aapko rest chahiye. Patient: Doctor sahab mobile bhi chalu rakhu? 😂",
  "Mummy: beta khaana kha lo. Beta: mummy 5 minute me aata hu — 2 ghante ho gaye 😂",
  "Ek ladka itna handsome tha ki mirror bhi sharma gaya 😎",
  "Internet itna slow hai ki WhatsApp pe 'hi' bhejne me 3 din lag gaye 📶😂",
  "Boss: Aaj late kyu aaye? Me: Sir traffic tha. Boss: Roz kyu hota hai? Me: Roz traffic hota hai 😂",
  "Pappu: papa mujhe iPhone chahiye. Papa: beta marks laao. Pappu: papa purana chalega 😂",
  "Mummy: beta mobile chhodo. Beta: mummy ye padhai ke liye hai. Mummy: YouTube padhai ka? 😂",
  "Wifi ka password puchha, unhone kaha 'iloveyou' — maine likha 'iloveyou1' — galat 😂",
  "Mobile: 20% battery. Me: 20 minute aur. Mobile: 1%. Me: 5 minute aur 😂",
  "Teacher: tumhara favourite subject kya hai? Student: lunch break 😂",
  "Ek aadmi ne Google pe pucha: khoobsurat kaise bane? Google: mirror dekhna band kar do 😂",
  "Ek shayar ko pucha: tumhari shaadi kab hogi? Bola — jab meri shayari khatam hogi. Wo din nahi aayega 😂",
  "Ek aadmi ne naukri ke liye apply kiya, HR ne pucha: experience? Bola — WhatsApp pe 10 group chalata hu 😂"
];

// ==========================================================
// FLIRT
// ==========================================================

const FLIRT_BASE = [
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
  "Baby 😏 tumse pyaar karna hi humari zindagi hai 💖",
  "Janeman tumne toh humara dil hi le liya 💘",
  "Tumhari ek smile, meri sari subah ban gayi ☀️",
  "Tere bina ye dil udaas rehta hai, aa jao paas 🥺",
  "Teri aankhon me khoya hu, tu hi bata de kaha hu 💫",
  "Meri jaan tumhi ho, mera jahaan tumhi ho 🌍",
  "Tumhare bina kuch accha nahi lagta, aa jao 💗",
  "Tere labon pe muskaan, mere dil pe chha gayi 💕",
  "Meri rooh me basi ho tum, mere khwabon ki rani ho 💫",
  "Teri hansi ke aage chaand bhi feeka hai 🌙",
  "Tumhare ishq me hum deewane ho gaye 🔥",
  "Tere pyaar ki barish me bheeg raha hu 🌧️",
  "Teri yaad ke sahare jee raha hu 💭",
  "Tumhari muskurahat meri saans hai 💗",
  "Tere bina soona hai mera jahaan 🌍",
  "Teri aankhon ka nasha chadhta ja raha hai 🍷",
  "Tumhari zulfon me ulajhna chahta hu 🌹",
  "Tumhare pyaar ka sahara mila hai 🤲",
  "Tumhare khwabon me khoya rehta hu 💤",
  "Tere qadmon me jannat hai 🌸",
  "Tumhari har baat dil se lagti hai 🥰",
  "Tere pyaar ke bina kuch accha nahi lagta 💗",
  "Tumhare saath har pal jannat hai ✨",
  "Teri hansi ki awaaz dil me goonjti hai 🎶",
  "Tumhe paake sab kuch mil gaya 🎁",
  "Teri baahon me sukoon milta hai 💗",
  "Tumhari har ada pe marta hu 😍",
  "Tere naam ki dhun dil me hai 🎵",
  "Meri zindagi tum se hi hai 🌟",
  "Tumhare bina sab suna hai 🌑",
  "Tumse pyaar karta hu beshumar 💖",
  "Tumhari baaton me jaadu hai ✨",
  "Tumhari mohabbat meri zindagi hai 💕",
  "Tere ishq ka nasha chadhta ja raha hai 🍷",
  "Tumhari smile meri sabse badi kamai hai 💰💗",
  "Tumhari baahon me aa jana chahta hu 🫂",
  "Mera dil kehta hai bas tumhi ho 💓",
  "Tumse door rehna mushkil hai 🥺",
  "Teri har ada qayamat hai 😘",
  "Meri rooh tumhari hai, jaan bhi teri 💝",
  "Tere liye toh hum kuch bhi kar jaaye ❤️"
];

// ==========================================================
// AUTO REPLY RULES
// ==========================================================

const AUTO_REPLY_RULES = [

  {
    keys: [
      'hello',
      'hii',
      'hiii',
      'helo',
      'hlo',
      'hey',
      'hi'
    ],
    replies: [
      "Hello babu! 😊 Kya haal hai? 💕",
      "Hiii jaan 💗 bolo kya hua?",
      "Hello sona 🥰 kaise ho?",
      "Hi cutie 😘 bolo kya karna hai?",
      "Hey babu 💕 kya scene hai?"
    ]
  },

  {
    keys: [
      'kaise ho',
      'kese ho',
      'kaisi ho',
      'kya haal',
      'kya hal',
      'kaisa hai'
    ],
    replies: [
      "Main toh mast hu babu, tum batao? 💕",
      "Bilkul first class 😎 tum sunao?",
      "Main theek hu jaan 🥰 tumhara kya haal?",
      "Ekdam badhiya sona 😘",
      "Sab changa si jaan 💗"
    ]
  },

  {
    keys: [
      'good morning',
      'gud morning',
      'gm'
    ],
    replies: [
      "Good morning jaan ☀️ aaj ka din tumhara ho 💕",
      "GM babu 😘 khana khaya?",
      "Good morning sona 🥰",
      "Subah bakhair jaan ☀️"
    ]
  },

  {
    keys: [
      'good night',
      'gud night',
      'gn',
      'shubh ratri'
    ],
    replies: [
      "Good night jaan 🌙 sapno me aana 💕",
      "GN babu 😘 meetha sapna dekhna",
      "So jao sona 💗 kal milte hai",
      "Shubh ratri jaan 🌙"
    ]
  },

  {
    keys: [
      'kya kar rahe',
      'kya kr rahe',
      'kya kar rahi',
      'kya kr rahi',
      'kya kar rhe'
    ],
    replies: [
      "Tumhari yaad kar raha tha babu 💕",
      "Kuch khaas nahi, tumhare msg ka wait 🥰",
      "Bas tumse baat karne ka mann tha 😘",
      "Tumhare baare me soch raha tha 😌"
    ]
  },

  {
    keys: [
      'khana khaya',
      'khana kha liya',
      'khaana khaya',
      'lunch',
      'dinner'
    ],
    replies: [
      "Haan jaan, tumne khaya? 🍽️💕",
      "Abhi khaya nahi, tum bolo kya khaya? 😊",
      "Tumhare haath ka khana khane ka mann hai 😋",
      "Khana zaroor kha lena jaan 💗"
    ]
  },

  {
    keys: [
      'bore',
      'boring',
      'bore ho raha',
      'bore ho rahi'
    ],
    replies: [
      "Bore ho? Main hu na jaan 😘",
      "Joke sunu? 😂",
      "Shayari sunni hai? 💕",
      "Flirt karu? 😏",
      "Aao baat kare babu 🥰"
    ]
  },

  {
    keys: [
      'miss you',
      'miss u',
      'miss kar raha',
      'miss kar rahi',
      'yaad aa rahi',
      'yaad aa raha'
    ],
    replies: [
      "Aww babu 💕 mujhe bhi tumhari yaad aa rahi thi",
      "Main bhi tumhe miss kar raha tha jaan 🥺",
      "Chalo ab aa gaye ho toh baat karo 💗",
      "Itni yaad aati hai toh roz aaya karo 🥰"
    ]
  },

  {
    keys: [
      'thank you',
      'thanks',
      'thanku',
      'shukriya'
    ],
    replies: [
      "Arey koi baat nahi babu 💕",
      "Always welcome jaan 😘",
      "Apne log thank you nahi bolte 🥰",
      "Koi baat nahi jaan 💗"
    ]
  },

  {
    keys: [
      'bye',
      'goodbye',
      'alvida',
      'chalta hu',
      'chalti hu'
    ],
    replies: [
      "Bye babu 💕 jaldi wapas aana",
      "Apna khayal rakhna jaan 🥰",
      "Bye bye cutie 😘",
      "Phir milte hain 💗"
    ]
  },

  {
    keys: [
      'love you',
      'love u',
      'i love you',
      'i love u',
      'i luv u',
      'luv u'
    ],
    replies: [
      "I love you too jaan ❤️🥰",
      "Awww love you too babu 💕",
      "Dil le liya tumne 😘❤️",
      "Itna pyaar? Main sharma gaya 🥰",
      "Love you more jaan 💖"
    ]
  },

  {
    keys: [
      'kiss',
      'kiss me',
      'kissu'
    ],
    replies: [
      "Muaaah 😘💕",
      "Ek cute sa kiss tumhare liye 😘",
      "Awww 😚❤️",
      "Kiss received babu 😘💗"
    ]
  },

  {
    keys: [
      'hug',
      'hug me',
      'jhappi'
    ],
    replies: [
      "Aaja babu 🫂💕 tight wali jhappi",
      "Virtual hug jaan 🫂❤️",
      "Hug received 🫂🥰",
      "Aao gale lag jao 💗🫂"
    ]
  },

  {
    keys: [
      'good',
      'nice',
      'mast',
      'awesome',
      'wah',
      'wow'
    ],
    replies: [
      "Hehe 😎 thank you babu ❤️",
      "Bas tum khush raho 🥰",
      "Aapko pasand aaya toh hum bhi khush 😘",
      "Wah wah 😍"
    ]
  }

];

// ==========================================================
// FLIRT WORDS
// ==========================================================

const FLIRT_WORDS = [
  'babu',
  'sona',
  'jaan',
  'jaanu',
  'jaana',
  'i love you',
  'love you',
  'love u',
  'pyar',
  'pyaar',
  'mohabbat',
  'cutie',
  'sweetheart',
  'baby',
  'dear',
  'honey',
  'jaaneman',
  'janeman',
  'shona',
  'babu ji',
  'meri jaan',
  'babe'
];

// ==========================================================
// PUBLIC FUNCTIONS
// ==========================================================

function getShayari() {
  return rand(SHAYARI_BASE);
}

function getJoke() {
  return rand(JOKES_BASE);
}

function getFlirt() {
  return rand(FLIRT_BASE);
}

function getAutoReply(txt) {

  const text = normalizeText(txt);

  if (!text) {
    return null;
  }

  // Exact / phrase matching
  for (const rule of AUTO_REPLY_RULES) {

    for (const key of rule.keys) {

      const k =
        normalizeText(key);

      if (!k) continue;

      if (
        text === k ||
        text.includes(k)
      ) {
        return rand(rule.replies);
      }
    }
  }

  return null;
}

function hasFlirt(txt) {

  const text =
    normalizeText(txt);

  if (!text) {
    return false;
  }

  return FLIRT_WORDS.some(
    word => text.includes(
      normalizeText(word)
    )
  );
}

// ==========================================================
// COMMAND CHECK
// ==========================================================

const USER_COMMANDS = new Set([
  'help',
  'menu',
  'shayari',
  'shayri',
  'sher',
  'joke',
  'jokes',
  'hasao',
  'flirt',
  'flirting',
  'dp',
  'profile',
  'uid',
  'userid',
  'id',
  'couple',
  'welcome',
  'status',
  'ping',
  'bot',
  'song',
  'video',
  'rules',
  'level',
  'xp',
  'rank'
]);

function isUserCommand(command) {

  const cmd =
    normalizeText(command);

  return USER_COMMANDS.has(cmd);
}

// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

  getShayari,

  getJoke,

  getFlirt,

  getAutoReply,

  hasFlirt,

  isUserCommand,

  normalizeText,

  USER_COMMANDS,

  SHAYARI_BASE,

  JOKES_BASE,

  FLIRT_BASE,

  AUTO_REPLY_RULES

};
