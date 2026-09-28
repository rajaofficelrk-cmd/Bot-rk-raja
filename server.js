// server.js — RK RAJA MASTI BOT v6 (Full + Stop + Retry Limit)
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// ================= FCA LOADER =================
let login = null, fcaName = 'unknown';
function loadFCA() {
  const list = ['ws3-fca', '@dongdev/fca-unofficial', 'fca-unofficial', 'facebook-chat-api'];
  for (const n of list) {
    try {
      const m = require(n);
      const fn = typeof m === 'function' ? m :
        (m && typeof m.login === 'function') ? m.login :
        (m && m.default && typeof m.default === 'function') ? m.default :
        (m && m.default && typeof m.default.login === 'function') ? m.default.login : null;
      if (typeof fn === 'function') { login = fn; fcaName = n; return true; }
    } catch {}
  }
  return false;
}
if (!loadFCA()) { console.log('❌ No FCA pkg. Install: npm i ws3-fca'); process.exit(1); }
console.log('✅ FCA loaded:', fcaName);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ================= CONFIG =================
const BOT_NAME = 'RK RAJA XWD';
const SIGNATURE = '\n\n❥ RK RAJA XWD ❥';
const SEPARATOR = '\n━━━━━━━━━━━━━━━━━';
const PREFIXES = ['/', '.', '#', '@'];
const KICK_LIMIT = 3;
const MAX_RETRIES = 3;              // ← retry limit

const STARTUP_MSG =
`╔══════════════════════════╗
║  👑 𝐑𝐊 𝐑𝐀𝐉𝐀 𝐗𝐖𝐃 𝐁𝐎𝐓  ║
╚══════════════════════════╝

🎉 𝐑𝐊 𝐑𝐀𝐉𝐀 𝐗𝐖𝐃 𝐤𝐞 𝐛𝐨𝐭 𝐦𝐞 𝐚𝐚𝐩𝐤𝐚 𝐬𝐰𝐚𝐠𝐚𝐭 𝐡𝐚𝐢 🎉

✅ Bot ab active hai
💬 Shayari / Joke / DP / Flirt — bina prefix likho
🔐 Admin commands — prefix ke saath
👑 Type /help for commands

❥ RK RAJA XWD ❥
━━━━━━━━━━━━━━━━━`;

// ================= STATE =================
let botAPI = null, adminID = null, botID = null;
let prefix = '/', currentCookies = null;
let userData = {}, lastReply = {}, groupLocks = {}, spamCount = {};
let isStopped = false;
let retryCount = 0;                 // ← retry counter

// ================= LOG =================
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
  "Tere bina jeena mushkil hai,\nTere pyaar ka asar dil hai 🩹",
  "Dil ki har baat tujhse kehna chahta hu,\nTere saath har pal rehna chahta hu 💫",
  "Teri aankhein meri manzil hain,\nTeri baatein meri mehfil hain 🌹",
  "Tu jo paas ho toh har pal sukoon hai,\nTu jo door ho toh har pal junoon hai 🔥",
  "Tera chehra meri subah ki roshni,\nTeri yaadein meri raat ki chaandni 🌙",
  "Tere pyaar me kho jana chahta hu,\nTere dil me bas jaana chahta hu 💗",
  "Meri har khwahish tujhse judi hai,\nMeri har dua tujhpe ruki hai 🤲",
  "Tere ishq ki gehraai me doob gaya,\nTere pyaar ki sachai me kho gaya 💙",
  "Tu meri kahani ka sabse pyaara kirdaar,\nTu mera dil, tu mera sansaar 🌍",
  "Tere bina kya hai ye zindagi,\nAdhoora sa ek khwab hai 🌠",
  "Meri rooh me bas gaya tu,\nMera har khwab banta gaya tu ✨",
  "Tujhe paake sab kuch mil gaya,\nJaise main apna aap mil gaya 🥰",
  "Mohabbat me junoon chahiye,\nTere liye har pal sukoon chahiye 💞",
  "Teri zulfon ki chhaon me aaram hai,\nTere labon ki hansi se kaam hai 🌷",
  "Ishq ki raah me kho jaana hai,\nTere pyar me kuchh ho jaana hai 💘",
  "Tere bina adhoori hai ye dastaan,\nTere saath poori hai meri jaan 🎀",
  "Aankhon me teri kho jaayenge,\nTere khwabon me so jaayenge 💫",
  "Tujhe chahna hi meri ibadat hai,\nTere pyaar me hi meri rahat hai 🤲",
  "Teri baat karne me maza aata hai,\nTere saath rehne me sukoon milta hai 💗",
  "Tere ishq ki aag me jal raha hu,\nTere naam ke saath hi chal raha hu 🔥",
  "Dil ne kaha tujhe paana hai,\nHar haal me tujhe chaahna hai 💖",
  "Tere qadmon me jannat basi hai,\nTeri sohbat me khushi basi hai 🌸",
  "Tujhse mila toh mil gaya jahaan,\nTujhse bichhda toh kho gaya samaa 🌌",
  "Tu hi mera chaand, tu hi sitara,\nTu hi meri zindagi ka sahara 🌙",
  "Tere ishq ka nasha chadh gaya,\nMera dil tera ho gaya 💘",
  "Teri yaad me khoya rehta hu,\nTere khwab me soya rehta hu 😴",
  "Meri har dua me tu hai,\nMeri har sada me tu hai 🙏",
  "Tere bina sooni hai ye mehfil,\nTere bina adhoora hai ye dil 💔",
  "Tujhe paane ki chahat hai,\nTere bina kya rahat hai 💗",
  "Aaja paas mere jaan-e-jaan,\nTere bina nahi hai ye jahaan 🌍",
  "Teri baahon me sukoon milta hai,\nTere labon se noor milta hai ✨",
  "Ishq tera mujhe pagal kar gaya,\nTera naam dil me bas gaya 🥰",
  "Tere ishq ki roshni me chal raha hu,\nTere pyaar ki raah pe chal raha hu 💫",
  "Dil ki dharkan me tujhe paaya,\nTujhi me apna sab kuch paaya 💖",
  "Tere liye duniya bhula di,\nTere liye khud ko mita di 🔥",
  "Tujhse juda nahi hona chahta,\nTere bina nahi rehna chahta 🥺",
  "Meri jaan tu, meri dhadkan tu,\nMeri har saans me sirf tu 💓",
  "Tere pyaar me pagal ho gaya hu,\nTere naam ka shaida ho gaya hu 💘",
  "Tere ishq ki tapish me jal raha hu,\nTere pyaar ki barish me bheeg raha hu 🌧️",
  "Teri nazar ka asar hai mujh pe,\nTera nasha chadha hai mujh pe 🍷",
  "Tere bina kya jeena,\nTere bina kya hai marna 💔",
  "Tujhe apna banaana chahta hu,\nTere sang jeevan bitaana chahta hu 💕"
];

// ==================================================
// ================== JOKES =========================
// ==================================================
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
  "Ek chor dusre chor se: aaj kya chori kare? Dusra: WhatsApp pe message, free me milta hai 😂",
  "Biwi: tum mujhe surprise do. Shauhar: surprise — mai aaj jaldi ghar aa gaya 😂",
  "Ladka ladki se: tum meri zindagi ho. Ladki: toh mujhe zinda chhod do 😂",
  "Mummy: beta mobile chhodo. Beta: mummy ye padhai ke liye hai. Mummy: YouTube padhai ka? 😂",
  "Wifi ka password puchha, unhone kaha 'iloveyou' — maine likha 'iloveyou1' — galat 😂",
  "Mere paas 2 rupaye the, ek ko 2 banaya — ab mere paas 4 hain. Maths ka jaadu 😂",
  "Ek aadmi ne apni biwi se pucha: tumhare jaisi do biwi milegi? Biwi: kyu? Aadmi: ek aur chahiye 😂",
  "iPhone wale: mera phone 1 lakh ka. Android wale: mera bhi 1 lakh ka — 5 saal me 😂",
  "Naukri interview: aapki strength kya hai? Me: main kam bolta hu. Interviewer: weakness? Me: kam bolta hu 😂",
  "Padosi: beta kya banna chahte ho? Me: bada aadmi. Padosi: aur padhai? Me: woh baad me 😂",
  "Wife: tum mujhe paise kyu nahi dete? Husband: kyunki tumhare paas pehle se hai 😂",
  "Ek aadmi ne mirror dekha, bola — ya Allah, aaj toh main hero lag raha hu 😂",
  "Train late thi, maine pucha kyu? Guard bola — gaadi aage nahi ja rahi 😂",
  "Ek bachhe ne pucha: papa shaadi kya hai? Papa: beta khana jo roz banaye, roz khilaaye 😂",
  "Boss ne bola: tumhe promotion de raha hu. Me: sir salary? Boss: wahi hai, sirf kaam badha hai 😂",
  "Ladka: mujhe tumhari aankhein pasand hai. Ladki: mujhe tumhari nazar 😂",
  "Doctor: aapko sugar hai. Patient: doctor sahab maine meetha khaya hi nahi. Doctor: hawa me bhi hai 😂",
  "Ek aadmi ne apni biwi se kaha: main tumhe sab kuch deta hu. Biwi: haan, sab kuch chhod ke 😂",
  "Mummy: beta utho. Beta: mummy 5 minute. Mummy: school jaana hai. Beta: aaj Sunday hai 😂",
  "Ek neta bacha bachaya. Doosra neta: kaise? Pehla: jhooth bolna chhod diya 😂",
  "Ek ladka IAS banna chahta tha. Bola — mummy taiyari karu? Mummy: pehle 10th pass 😂",
  "Chai wala: sahab chai? Me: haan. Chai wala: 20 rupaye. Me: adhi kar do. Chai wala: adhi cup me 😂",
  "Mobile: 20% battery. Me: 20 minute aur. Mobile: 1%. Me: 5 minute aur 😂",
  "Ek aadmi ne pucha: sabse sasta shauk? Dost: neend 😂",
  "Cricket match me ek player out hua, bola — main nahi tha, hawa thi 😂",
  "Ek ladki ne pucha: tum mujhse pyaar karte ho? Ladka: pehle WhatsApp check karta hu, dikhta hai too pyaar hai 😂",
  "Ek aadmi airport gaya, bola — ek ticket Mumbai. Clerk: aap bag leke aaye? Aadmi: nahi, main ja raha hu, bag kyu 😂",
  "Wife: tum mujhe samajhte nahi. Husband: tum mere samajh se bahar ho 😂",
  "Ek bachhe ne mummy se pucha: mummy main kaise aaya? Mummy: online order 😂"
];

// ==================================================
// ================== FLIRT =========================
// ==================================================
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
  "Baby 😏 tumse pyaar karna hi humari zindagi hai 💖",
  "Janeman tumne toh humara dil hi le liya 💘",
  "Chhoti si baat thi, tumne dil me ghar bana liya 🏠",
  "Tumhari ek smile, meri sari subah ban gayi ☀️",
  "Tere bina ye dil udaas rehta hai, aa jao paas 🥺",
  "O jaan-e-man, tera hi intezaar hai 🌙",
  "Teri aankhon me khoya hu, tu hi bata de kaha hu 💫",
  "Meri jaan tumhi ho, mera jahaan tumhi ho 🌍",
  "Tumhare bina kuch accha nahi lagta, aa jao 💗",
  "Tere labon pe muskaan, mere dil pe chha gayi 💕",
  "Tujhe chahu me itna, ke duniya jal jaaye 🔥",
  "Meri rooh me basi ho tum, mere khwabon ki rani ho 💫",
  "Sona sona bolke hume sharma mat kar 🥰",
  "Tere bina ek pal bhi nahi jee sakta ❤️",
  "Meri zindagi ki sabse pyaari cheez ho tum 💝",
  "Tere naam ki roshni dil me jal rahi hai ✨",
  "Mujhe teri aankhon ki gehrai pasand hai 💙",
  "Tere saath waqt ruk jata hai ⏳",
  "Teri hassi meri duniya hai 😊",
  "Tu hi mera sukoon, tu hi mera junoon 💞",
  "Meri jaan meri tu, meri pehchaan tu 💗",
  "Tumse milke laga ki jannat mil gayi 🌸",
  "Tumhari baatein koi jaadu se kam nahi 💫",
  "Tumhari aankhein meri duniya hai 🌌",
  "Tum ho to sab kuch hai, tum nahi to kuch nahi 💗",
  "Tumhari ek jhalak pe hazaro dil qurban ❤️",
  "Tera naam lete hi dil khush ho jata hai 🥰",
  "Teri hansi ke aage chaand bhi feeka hai 🌙",
  "Meri subah tumse shuru hoti hai, raat tum pe khatam 🌅",
  "Tumhare ishq me hum deewane ho gaye 🔥",
  "Tere pyaar ki barish me bheeg raha hu 🌧️",
  "Teri yaad ke sahare jee raha hu 💭",
  "Tumhari muskurahat meri saans hai 💗",
  "Tere bina soona hai mera jahaan 🌍",
  "Tere labon ki hansi chura lu, dil me tujhe basa lu 💕",
  "Teri aankhon ka nasha chadhta ja raha hai 🍷",
  "Tumhari zulfon me ulajhna chahta hu 🌹",
  "Tumhare pyaar ka sahara mila hai 🤲",
  "Teri aankhon ke aage koi nahi 💫",
  "Tumhare khwabon me khoya rehta hu 💤",
  "Tere qadmon me jannat hai 🌸",
  "Meri jaan tum ho, mera jahan tum ho 🌏",
  "Tumhari har baat dil se lagti hai 🥰",
  "Tere pyaar ke bina kuch accha nahi lagta 💗",
  "Tumhare saath har pal jannat hai ✨",
  "Teri hansi ki awaaz dil me goonjti hai 🎶",
  "Tumhe paake sab kuch mil gaya 🎁",
  "Tumhari nazar me kuch khaas baat hai 💫",
  "Tere ishq me pagal ho gaya hu 🥺",
  "Tumse juda hoke ji nahi sakta 💔",
  "Teri baahon me sukoon milta hai 💗",
  "Tumhari har ada pe marta hu 😍",
  "Tere naam ki dhun dil me hai 🎵",
  "Tumhari aankhon me khoya rahta hu 😵‍💫",
  "Meri zindagi tum se hi hai 🌟",
  "Tumhare bina sab suna hai 🌑",
  "Teri yaad me bechain rahta hu 💭",
  "Tumse pyaar karta hu beshumar 💖",
  "Tumhari baaton me jaadu hai ✨",
  "Tere labon pe muskaan bani rahe 😊",
  "Tumhari mohabbat meri zindagi hai 💕",
  "Tujhe chahat hai, tujhe ulfat hai 💘",
  "Tumse milke muskura diya hu 😄",
  "Tere bina kuch nahi, tu hi sab kuch 💗"
];

// ================= NO-PREFIX AUTO REPLY =================
const AUTO_REPLIES = [
  { keys: ['hello','hii','hiii','helo','hlo'],
    replies: [
      "Hello babu! 😊 Kya haal hai? Bolo kya hua kuch kaam tha? 💕",
      "Hiii jaan 💗 aagya mai, bolo kya chahiye?",
      "Hello sona 🥰 kaise ho? Kuch kehna tha?",
      "Hi cutie 😘 mai ready hu, bolo kya karna hai?"
    ] },
  { keys: ['kaise ho','kese ho','kaisi ho','kya haal','kya hal'],
    replies: [
      "Main toh mast hu babu, tum batao? 💕",
      "Bilkul first class 😎 tum sunao, kya chal raha hai?",
      "Main theek hu jaan, tumhari yaad aa rahi thi 🥰",
      "Ekdam badhiya sona, tumhara kya haal? 😘"
    ] },
  { keys: ['kya hua','kya hai','kya hua kuch','kuch kehna'],
    replies: [
      "Kuch nahi babu, bas tumhari yaad aa rahi thi 💕",
      "Bas aise hi, tum batao kya hua? 😊",
      "Kuch khaas nahi jaan, tum sunao? 💗",
      "Kya hua sona? Batao na mujhe 😘"
    ] },
  { keys: ['kya kar rahe','kya kr rahe','kya kar rahi'],
    replies: [
      "Tumhari yaad kar raha tha babu 💕",
      "Kuch khaas nahi, tumhare msg ka wait 🥰",
      "Bas tumse baat karne ka mann tha 😘",
      "Kuch nahi sona, tum batao? 💗"
    ] },
  { keys: ['good morning','gm','gud morning'],
    replies: [
      "Good morning jaan ☀️ aaj ka din tumhara ho 💕",
      "Subah bhi roshan ho gayi tumhari yaad se 🌸",
      "GM babu 😘 khana khaya?",
      "Good morning sona 🥰 aaj toh tumhara din hai"
    ] },
  { keys: ['good night','gn','gud night'],
    replies: [
      "Good night jaan 🌙 sapno me aana 💕",
      "GN babu 😘 meetha sapna dekhna",
      "So jao sona, kal milte hai 💗",
      "Good night cutie 🥰 chain se sona"
    ] },
  { keys: ['khana khaya','khaana khaya','lunch','dinner'],
    replies: [
      "Nahi babu, tumhare saath khata toh maza aata 🍽️💕",
      "Abhi khaya nahi, tum bolo kya khaya? 😊",
      "Haan jaan khaya, tumne khaya? 🥰",
      "Tumhare haath ka khana khane ka mann hai 😋"
    ] },
  { keys: ['bore ho raha','bore ho rahi','boring'],
    replies: [
      "Toh aao baat kare babu 💕 shayari sunau?",
      "Bore ho? Main hu na jaan 😘 'shayari' bol do",
      "Bore kyu ho sona? 'joke' bol do, hasi aa jayegi 😄",
      "Aao baat kare, 'flirt' bol do 🥰"
    ] },
  { keys: ['sona','babu','jaan','jaanu','jaana','baby','dear','honey','shona'],
    replies: null
  }
];

// ================= HELPERS =================
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const isAdmin = id => String(id) === String(adminID);

function hasFlirt(txt) {
  const words = ['babu','sona','jaan','jaanu','jaana','i love you','love you','pyar',
    'mohabbat','cutie','sweetheart','baby','dear','honey','jaaneman','shona','dil',
    'meri jaan','i luv u','love u','babe'];
  return words.some(w => txt.includes(w));
}

function isStickerOrPhoto(event) {
  if (!event.attachments || !event.attachments.length) return false;
  return event.attachments.some(a =>
    ['sticker','photo','video','animated_image'].includes(a.type)
  );
}

function matchAuto(txt) {
  for (const rule of AUTO_REPLIES) {
    if (!rule.replies) continue;
    for (const k of rule.keys) {
      if (txt.includes(k)) return rand(rule.replies);
    }
  }
  return null;
}

// ================= LEVEL/XP =================
function getLevel(xp) { return Math.floor(Math.sqrt(xp / 50)) + 1; }
function xpForNext(level) { return 50 * level * level; }
function addXP(uid, amt = 10) {
  if (!userData[uid]) userData[uid] = { xp: 0, level: 1 };
  userData[uid].xp += amt;
  userData[uid].level = getLevel(userData[uid].xp);
  return userData[uid];
}
function getUser(uid) {
  if (!userData[uid]) userData[uid] = { xp: 0, level: 1 };
  return userData[uid];
}

// ================= COUPLE IMAGE =================
async function generateCoupleImage(name1, name2) {
  const apis = [
    `https://api.popcat.xyz/ship?user1=${encodeURIComponent(name1)}&user2=${encodeURIComponent(name2)}`,
    `https://api.some-random-api.com/canvas/misc/ship?user1=${encodeURIComponent(name1)}&user2=${encodeURIComponent(name2)}`
  ];
  for (const url of apis) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json();
      if (j && j.image) return j.image;
      if (j && j.link) return j.link;
    } catch {}
  }
  return null;
}

// ================= REPLY BUILDER =================
async function buildReply(api, event, mainText) {
  const { senderID } = event;
  const u = addXP(senderID, 10);
  const rem = Math.max(0, xpForNext(u.level) - u.xp);
  let name = 'User';
  try {
    const info = await api.getUserInfo(senderID);
    name = info?.[senderID]?.name || `User-${senderID}`;
  } catch { name = `User-${senderID}`; }

  const body = `@${name} ${mainText}

╭─❰ 📊 PLAYER STATS ❱─╮
│ 🎖️ Level : ${u.level}
│ ⚡ XP : ${u.xp}
│ 🎯 Next : ${rem} XP
╰────────────────────╯
${SIGNATURE}
━━━━━━━━━━━━━━━━━`;
  return { body, mentions: [{ tag: `@${name}`, id: senderID }] };
}

// ================= HELP =================
async function sendHelp(api, threadID) {
  const help =
`╔═════════════════════════╗
║  🤖 RK RAJA MASTI BOT  ║
╚═════════════════════════╝

💬 𝐅𝐔𝐍 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 (bina prefix)
shayari — Random shayari 💕
joke — Random joke 😂
dp — Apna DP + link + stats 📸
flirt — Flirt reply 😘
couple — Reply karke likho, cute photo banega 💑
hello/hi — Greeting
kaise ho / kya hua — Baat cheet
babu/sona/jaan — Flirt reply

🔐 𝐆𝐑𝐎𝐔𝐏 𝐅𝐘𝐓 𝐌𝐎𝐃𝐄
⚠️ 𝐎𝐍𝐋𝐘 𝐀𝐃𝐌𝐈𝐍 𝐔𝐒𝐄 𝐊𝐀𝐑 𝐒𝐀𝐊𝐓𝐀 𝐇𝐀𝐈
${prefix}fyt on/off — Full lock / unlock
${prefix}lockname on <name> / off
${prefix}locknick on <nick> / off
${prefix}msglock on/off
${prefix}spamlock on/off
${prefix}unlock all

⚙️ 𝐀𝐃𝐌𝐈𝐍
${prefix}stats / reset / broadcast

━━━━━━━━━━━━━━━━━
❥ RK RAJA XWD ❥`;
  return api.sendMessage(help, threadID);
}

// ================= AUTO ANNOUNCE =================
async function announceBotOnline(api) {
  try {
    emitLog('📢 Announcing bot online...');
    const threads = await api.getThreadList(100, null, ['GROUP']);
    let sent = 0;
    for (const t of threads) {
      if (isStopped) break;
      try { await api.sendMessage(STARTUP_MSG, t.threadID); sent++; }
      catch (e) { emitLog(`Skip ${t.threadID}: ${e.message}`, true); }
      await new Promise(r => setTimeout(r, 800));
    }
    emitLog(`📢 Startup msg sent to ${sent} groups.`);
  } catch (e) { emitLog('Announce err: ' + e.message, true); }
}

// ================= LOGIN (RETRY LIMITED) =================
function initializeBot(cookies) {
  isStopped = false;
  emitLog(`Initializing bot... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
  currentCookies = cookies;

  try {
    login({ appState: cookies }, (err, api) => {
      if (err) {
        const msg = err.message || JSON.stringify(err);

        // Agar Facebook block wala error hai toh retry band karo
        if (msg.includes('blocked') || msg.includes('userID') || msg.includes('verify')) {
          emitLog('❌ Facebook ne login block kar diya!', true);
          emitLog('👉 Solution: Phone browser me FB login karo, verify karo, phir nayi C3C nikalo.', true);
          emitLog('🛑 Retry band. Naya C3C daalo aur Start dabao.', true);
          retryCount = 0;
          return; // retry NAHI
        }

        // Baaki errors pe 3 baar tak retry
        retryCount++;
        if (retryCount < MAX_RETRIES && !isStopped) {
          emitLog(`⚠️ Login err: ${msg}. Retry ${retryCount}/${MAX_RETRIES} in 15s...`, true);
          setTimeout(() => initializeBot(cookies), 15000);
        } else {
          emitLog('🛑 Max retries reached. Naya C3C daalo.', true);
          retryCount = 0;
        }
        return;
      }

      // Login success
      retryCount = 0;

      if (isStopped) {
        emitLog('Bot stopped before login completed.');
        try { api.logout && api.logout(()=>{}); } catch {}
        return;
      }

      botAPI = api;
      try { botID = api.getCurrentUserID(); } catch {}
      api.setOptions({ selfListen: false, listenEvents: true, updatePresence: false });
      emitLog('✅ Bot logged in. BotID: ' + botID);
      io.emit('bot-ready', { botID });

      setTimeout(async () => {
        if (isStopped) return;
        await announceBotOnline(api);
        if (isStopped) return;
        api.listenMqtt((err, event) => {
          if (isStopped) return;
          if (err) { emitLog('Listener err: ' + err.message, true); return; }
          handleEvent(api, event).catch(e => emitLog('Handler: ' + e.message, true));
        });
      }, 5000);
    });
  } catch (e) {
    emitLog('Login threw: ' + e.message, true);
    retryCount++;
    if (retryCount < MAX_RETRIES && !isStopped) {
      setTimeout(() => initializeBot(cookies), 15000);
    } else {
      retryCount = 0;
    }
  }
}

// ================= EVENT HANDLER =================
async function handleEvent(api, event) {
  if (!event || isStopped) return;

  if (event.logMessageType === 'log:thread-name') return handleThreadNameChange(api, event);
  if (event.logMessageType === 'log:user-nickname') return handleNicknameChange(api, event);
  if (event.logMessageType === 'log:subscribe') return handleUserJoined(api, event);

  if (event.type !== 'message' && event.type !== 'message_reply') return;
  if (event.senderID === botID) return;

  const { threadID, senderID, body } = event;
  const txt = (body || '').trim().toLowerCase();
  const admin = isAdmin(senderID);
  const locks = groupLocks[threadID] || {};

  // MSG LOCK
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
        await api.sendMessage(`🚫 User kicked.`, threadID);
        delete spamCount[threadID][senderID];
      }
    } catch (e) { emitLog('msglock err: ' + e.message, true); }
    return;
  }

  // SPAM LOCK
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

  const now = Date.now();
  if (lastReply[senderID] && now - lastReply[senderID] < 1200) return;
  lastReply[senderID] = now;

  // PREFIX COMMANDS
  const usedPrefix = PREFIXES.find(p => txt.startsWith(p));
  if (usedPrefix) {
    const parts = txt.slice(1).split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    if (cmd === 'help' || cmd === 'menu') return sendHelp(api, threadID);

    const ADMIN_CMDS = ['fyt','lockname','locknick','msglock','spamlock','unlock','reset','stats','broadcast'];
    if (ADMIN_CMDS.includes(cmd) && !admin) {
      let name = 'User';
      try { const u = await api.getUserInfo(senderID); name = u?.[senderID]?.name || name; } catch {}
      return api.sendMessage({
        body: `@${name} ❌ 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐈𝐎𝐍 𝐃𝐄𝐍𝐈𝐄𝐃!\nYe command sirf 𝐀𝐃𝐌𝐈𝐍 use kar sakta hai 🔒${SIGNATURE}`,
        mentions: [{ tag: `@${name}`, id: senderID }]
      }, threadID);
    }

    if (admin) {
      if (cmd === 'reset') { userData = {}; return api.sendMessage('✅ XP reset.' + SIGNATURE, threadID); }
      if (cmd === 'stats') return api.sendMessage(`📊 Users: ${Object.keys(userData).length}${SIGNATURE}`, threadID);
      if (cmd === 'broadcast') {
        const msg = args.join(' ');
        if (!msg) return api.sendMessage(`Usage: ${prefix}broadcast <msg>`, threadID);
        try {
          const threads = await api.getThreadList(50, null, ['GROUP']);
          let sent = 0;
          for (const t of threads) {
            try { await api.sendMessage(`📢 ${msg}${SIGNATURE}`, t.threadID); sent++; } catch {}
            await new Promise(r => setTimeout(r, 300));
          }
          return api.sendMessage(`✅ Sent to ${sent} groups.${SIGNATURE}`, threadID);
        } catch (e) { return api.sendMessage('Err: ' + e.message, threadID); }
      }
      if (cmd === 'fyt') {
        const sub = args[0];
        if (sub === 'on') {
          const info = await api.getThreadInfo(threadID).catch(() => null);
          const cur = info?.threadName || '';
          const nicks = {};
          if (info?.nicknames) for (const u in info.nicknames) nicks[u] = info.nicknames[u];
          groupLocks[threadID] = { name: cur, nicknames: nicks, msgLock: true, spamLock: true, fyt: true };
          return api.sendMessage(
            `🔐 𝐅𝐘𝐓 𝐎𝐍\n• Name locked: "${cur}"\n• Nicknames locked\n• Msg locker ON\n• Spam locker ON${SIGNATURE}`,
            threadID
          );
        }
        if (sub === 'off') {
          delete groupLocks[threadID];
          return api.sendMessage(`🔓 𝐅𝐘𝐓 𝐎𝐅𝐅 — sab unlock.${SIGNATURE}`, threadID);
        }
        return api.sendMessage(`Usage: ${prefix}fyt on/off`, threadID);
      }
      if (cmd === 'lockname') {
        const sub = args[0];
        if (sub === 'on') {
          const name = args.slice(1).join(' ').trim();
          if (!name) return api.sendMessage(`Usage: ${prefix}lockname on <name>`, threadID);
          groupLocks[threadID] = groupLocks[threadID] || { nicknames: {} };
          groupLocks[threadID].name = name;
          try { await api.setTitle(name, threadID); } catch {}
          return api.sendMessage(`🔒 Group name locked: "${name}"${SIGNATURE}`, threadID);
        }
        if (sub === 'off') {
          if (groupLocks[threadID]) groupLocks[threadID].name = null;
          return api.sendMessage(`🔓 Name unlocked.${SIGNATURE}`, threadID);
        }
      }
      if (cmd === 'locknick') {
        const sub = args[0];
        if (sub === 'on') {
          const nick = args.slice(1).join(' ').trim();
          if (!nick) return api.sendMessage(`Usage: ${prefix}locknick on <nick>`, threadID);
          try {
            const info = await api.getThreadInfo(threadID);
            const ids = info.participantIDs || [];
            groupLocks[threadID] = groupLocks[threadID] || { nicknames: {} };
            let done = 0;
            for (const uid of ids) {
              if (String(uid) === String(adminID)) continue;
              groupLocks[threadID].nicknames[uid] = nick;
              try { await api.changeNickname(nick, threadID, uid); done++; } catch {}
              await new Promise(r => setTimeout(r, 200));
            }
            return api.sendMessage(`🔒 Nickname locked: "${nick}"\n✅ ${done} users updated.${SIGNATURE}`, threadID);
          } catch (e) { emitLog('locknick err: ' + e.message, true); }
        }
        if (sub === 'off') {
          if (groupLocks[threadID]) groupLocks[threadID].nicknames = {};
          return api.sendMessage(`🔓 Nicknames unlocked.${SIGNATURE}`, threadID);
        }
      }
      if (cmd === 'msglock') {
        const sub = args[0];
        groupLocks[threadID] = groupLocks[threadID] || { nicknames: {} };
        if (sub === 'on') { groupLocks[threadID].msgLock = true; spamCount[threadID] = {}; return api.sendMessage(`🔒 Msg locker ON.${SIGNATURE}`, threadID); }
        if (sub === 'off') { groupLocks[threadID].msgLock = false; return api.sendMessage(`🔓 Msg locker OFF — sab msg kar sakte hai.${SIGNATURE}`, threadID); }
      }
      if (cmd === 'spamlock') {
        const sub = args[0];
        groupLocks[threadID] = groupLocks[threadID] || { nicknames: {} };
        if (sub === 'on') { groupLocks[threadID].spamLock = true; spamCount[threadID] = {}; return api.sendMessage(`🔒 Spam locker ON.${SIGNATURE}`, threadID); }
        if (sub === 'off') { groupLocks[threadID].spamLock = false; return api.sendMessage(`🔓 Spam locker OFF.${SIGNATURE}`, threadID); }
      }
      if (cmd === 'unlock' && args[0] === 'all') {
        delete groupLocks[threadID]; delete spamCount[threadID];
        return api.sendMessage(`🔓 Sab unlock.${SIGNATURE}`, threadID);
      }
    }
  }

  // NO-PREFIX FUN
  if (txt.includes('shayari') || txt.includes('shayri') || txt.includes('sher')) {
    return api.sendMessage(await buildReply(api, event, rand(SHAYARI)), threadID);
  }
  if (txt.includes('joke') || txt.includes('jokes') || txt.includes('hasao')) {
    return api.sendMessage(await buildReply(api, event, rand(JOKES)), threadID);
  }
  if (txt.includes('flirt') || txt.includes('flirting')) {
    return api.sendMessage(await buildReply(api, event, rand(FLIRT_REPLIES)), threadID);
  }
  if (txt === 'dp' || txt === 'profile' || txt.includes('mera dp') || txt.includes('my dp')) {
    let info = null;
    try { info = (await api.getUserInfo(senderID))?.[senderID]; } catch {}
    const name = info?.name || `User-${senderID}`;
    const profileUrl = info?.profileUrl || `https://www.facebook.com/${senderID}`;
    const bio = info?.bio || 'Bio nahi hai 😅';
    const ud = getUser(senderID);
    const body =
`@${name} ye teri DP 😍

🔗 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 : ${profileUrl}
📝 𝐁𝐢𝐨 : ${bio}

╭─❰ 📊 STATS ❱─╮
│ 🎖️ Level : ${ud.level}
│ ⚡ XP : ${ud.xp}
╰─────────────╯
${SIGNATURE}
━━━━━━━━━━━━━━━━━`;
    const msg = { body, mentions: [{ tag: `@${name}`, id: senderID }] };
    if (info?.profileUrl) { try { msg.attachment = info.profileUrl; } catch {} }
    return api.sendMessage(msg, threadID);
  }
  if (txt === 'couple' || txt.startsWith('couple ')) {
    let name1 = null, name2 = null;
    const mentions = event.mentions || {};
    const mentionIDs = Object.keys(mentions);
    if (mentionIDs.length >= 2) {
      try {
        const i1 = (await api.getUserInfo(mentionIDs[0]))?.[mentionIDs[0]];
        const i2 = (await api.getUserInfo(mentionIDs[1]))?.[mentionIDs[1]];
        name1 = i1?.name; name2 = i2?.name;
      } catch {}
    } else if (mentionIDs.length === 1) {
      try {
        const i1 = (await api.getUserInfo(senderID))?.[senderID];
        const i2 = (await api.getUserInfo(mentionIDs[0]))?.[mentionIDs[0]];
        name1 = i1?.name; name2 = i2?.name;
      } catch {}
    } else if (event.messageReply) {
      try {
        const i1 = (await api.getUserInfo(senderID))?.[senderID];
        const i2 = (await api.getUserInfo(event.messageReply.senderID))?.[event.messageReply.senderID];
        name1 = i1?.name; name2 = i2?.name;
      } catch {}
    } else {
      const rest = body.slice(7).trim();
      if (rest.includes('|')) {
        const [a, b] = rest.split('|').map(s => s.trim());
        name1 = a; name2 = b;
      }
    }
    if (!name1 || !name2) {
      return api.sendMessage(
        `💑 𝐂𝐨𝐮𝐩𝐥𝐞 𝐏𝐡𝐨𝐭𝐨\n\n` +
        `Reply karke "couple" likho\n` +
        `Ya @mention @mention karke likho\n` +
        `Ya likho: couple Name1 | Name2${SIGNATURE}`,
        threadID
      );
    }
    try {
      const imgUrl = await generateCoupleImage(name1, name2);
      if (!imgUrl) return api.sendMessage(`❌ Photo nahi ban payi.${SIGNATURE}`, threadID);
      return api.sendMessage({
        body: `💑 ${name1} ❤️ ${name2}\n\nCute couple photo ready! 🥰${SIGNATURE}`,
        attachment: imgUrl
      }, threadID);
    } catch (e) {
      emitLog('couple err: ' + e.message, true);
      return api.sendMessage(`❌ Error: ${e.message}${SIGNATURE}`, threadID);
    }
  }
  const autoReply = matchAuto(txt);
  if (autoReply) return api.sendMessage(await buildReply(api, event, autoReply), threadID);
  if (hasFlirt(txt)) return api.sendMessage(await buildReply(api, event, rand(FLIRT_REPLIES)), threadID);
  return;
}

// ================= LOG HANDLERS =================
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
    await api.sendMessage({
      body: `@${name} 🔒 group name locked tha, wapas set kar diya!${SIGNATURE}`,
      mentions: [{ tag: `@${name}`, id: authorID }]
    }, threadID);
  } catch (e) { emitLog('name revert err: ' + e.message, true); }
}

async function handleNicknameChange(api, event) {
  const { threadID, authorID, participantID } = event;
  const newNick = event.logMessageData?.nickname;
  const locks = groupLocks[threadID];
  if (!locks) return;
  if (String(authorID) === String(adminID)) return;
  if (String(participantID) === String(botID) && newNick !== BOT_NAME) {
    try { await api.changeNickname(BOT_NAME, threadID, botID); } catch {}
    return;
  }
  const locked = locks.nicknames?.[participantID];
  if (locked && newNick !== locked) {
    try { await api.changeNickname(locked, threadID, participantID); } catch {}
  }
}

async function handleUserJoined(api, event) {
  const { threadID, logMessageData } = event;
  const added = logMessageData?.addedParticipants || [];
  const locks = groupLocks[threadID] || {};
  for (const p of added) {
    if (String(p.userFbId) === String(botID)) {
      try { await api.changeNickname(BOT_NAME, threadID, botID); } catch {}
      await api.sendMessage(STARTUP_MSG, threadID);
    } else {
      const locked = locks.nicknames?.[p.userFbId];
      if (locked) {
        try { await api.changeNickname(locked, threadID, p.userFbId); } catch {}
      }
    }
  }
}

// ================= WEB ROUTES =================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.post('/configure', (req, res) => {
  try {
    let { cookies, adminID: aID, prefix: pfx, botID: bID } = req.body;
    if (typeof cookies === 'string') cookies = JSON.parse(cookies);
    if (!Array.isArray(cookies) || cookies.length === 0)
      return res.status(400).send('❌ Invalid C3C');
    if (!aID) return res.status(400).send('❌ Admin ID required');
    adminID = String(aID).trim();
    prefix = PREFIXES.includes(pfx) ? pfx : '/';
    if (bID) botID = String(bID).trim();
    retryCount = 0; // naye C3C pe retry reset
    isStopped = false;
    emitLog(`Admin:${adminID} Prefix:${prefix} BotID:${botID || 'auto'}`);
    res.send('✅ Configured. Bot starting...');
    initializeBot(cookies);
  } catch (e) {
    emitLog('Config err: ' + e.message, true);
    res.status(400).send('❌ ' + e.message);
  }
});

// ================= STOP BOT =================
app.post('/stop', (req, res) => {
  try {
    if (!botAPI && isStopped) {
      return res.send('⚠️ Bot pehle se band hai.');
    }
    emitLog('🛑 Stopping bot...');
    isStopped = true;
    retryCount = 0;

    try { botAPI && botAPI.stopListening && botAPI.stopListening(); } catch (e) {}
    try { botAPI && botAPI.logout && botAPI.logout(() => {}); } catch (e) {}

    botAPI = null;
    botID = null;
    currentCookies = null;
    userData = {};
    lastReply = {};
    groupLocks = {};
    spamCount = {};

    io.emit('bot-stopped', {});
    io.emit('botlog', '🛑 Bot stopped successfully.');

    res.send('🛑 Bot stopped.');
  } catch (e) {
    emitLog('Stop error: ' + e.message, true);
    res.status(500).send('❌ Stop error: ' + e.message);
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 20018;
server.listen(PORT, () => emitLog(`Server running on port ${PORT} | FCA: ${fcaName}`));
io.on('connection', socket => {
  emitLog('Dashboard connected');
  socket.emit('botlog', `Status: ${botAPI ? 'Running' : (isStopped ? 'Stopped' : 'Not started')}`);
  socket.emit('bot-ready', { botID });
});
