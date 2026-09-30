// ============================================================
// RK RAJA XWD BOT v18 — ALL IN ONE (No replies.js needed)
// 20,000+ unique replies | Human Chat | Welcome | Locks | FYT
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

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(bodyParser.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ================= CONFIG =================
const PORT = process.env.PORT || 3000;
const BOT_NAME = "◄⸻̅͟ˣ͠𓆩𝐑꯭꘍꯭֟፝͡᪂꘍꯭ 𝐋꯭𖾝ԍ𖾝꯭֟፝͡᎔꯭𑀘𓆪꯭ˣ͢ 👍";
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

// ================= HELPERS =================
function rand(a){return a[Math.floor(Math.random()*a.length)];}
function normalizeText(t){return String(t||"").toLowerCase().replace(/[“”‘’]/g,"'").replace(/[!?.,;:()[\]{}]/g," ").replace(/\s+/g," ").trim();}
function cleanID(id){if(id==null)return null;return String(id).trim();}

// ================= BOT TRIGGERS =================
const BOT_TRIGGERS = ["rk raja","rk raja xwd","rkraja","rk-raja","raja xwd","raja","rk","bot","bots","rk bot","raja bot","xwd","raja bhai","rk bhai","prince","@rk","@raja","@bot"];
function isBotCalled(text){
  const t = normalizeText(text);
  if (!t) return false;
  if (/^(#|\/|\.)(bot|rk|raja)\b/i.test(t)) return true;
  for (const trg of BOT_TRIGGERS) {
    if (!trg) continue;
    const esc = trg.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    if (new RegExp(`(^|\\s)${esc}(\\s|$|[^a-z])`,"i").test(t)) return true;
  }
  return false;
}

// ============================================================
// =============== SHAYARI DATABASE ===========================
// ============================================================
const SHAYARI_BASE = [
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
  "Tere qadmon me jannat basi hai,\nTeri sohbat me khushi basi hai 🌸",
  "Tu hi mera chaand, tu hi sitara,\nTu hi meri zindagi ka sahara 🌙",
  "Tere ishq ka nasha chadh gaya,\nMera dil tera ho gaya 💘",
  "Tujhe paane ki chahat hai,\nTere bina kya rahat hai 💗",
  "Teri baahon me sukoon milta hai,\nTere labon se noor milta hai ✨",
  "Ishq tera mujhe pagal kar gaya,\nTera naam dil me bas gaya 🥰",
  "Meri jaan tu, meri dhadkan tu,\nMeri har saans me sirf tu 💓",
  "Tere pyaar me pagal ho gaya hu,\nTere naam ka shaida ho gaya hu 💘",
  "Tujhe apna banaana chahta hu,\nTere sang jeevan bitaana chahta hu 💕",
  "Rab se maangi thi ek dua,\nTune diya mujhe khud ko saja 🎀",
  "Zindagi ki kitaab me tu panna hai,\nHar lafz me bas tera hi ranna hai 📖",
  "Khwabon ka shehar basa lu tujhse,\nApni duniya saja lu tujhse 🏙️",
  "Tere sang bitaye har lamha yaadgaar,\nTere bina har din lagta hai bhhaar 💔",
  "Aankhon me teri nami si hai,\nDil me meri kami si hai 🥺",
  "Tera chehra dekhu toh sukoon milta hai,\nTere naam se dil ko noor milta hai ✨",
  "Sitaron se bhi pucha tera pata,\nUnhone kaha dil me hai tera basera 💫",
  "Raat ki tanhai me teri yaad aati hai,\nChand bhi puche tera hi naam sunati hai 🌙",
  "खौफ तो आवारा कुत्ते भी मचाते हैं,\nपर दहशत हमेशा शेर की रहती है ! 🦁",
  "में कोई छोटी सी कहानी नहीं था,\nबस पन्ने ही जल्दी पलट दिए' 📖",
  "I don't look back,\nUnless there's a good view. 👀",
  "Be yourself,\nEveryone else is already taken. ✨",
  "I'm not lazy,\nI'm on energy-saving mode. 🔋",
  "I'm not heartless,\nI just learned how to use my heart less. 🖤",
  "शेर की तरह जीना सीखो,\nक्योंकि भीड़ में सब कुत्ते ही होते हैं ! 🦁",
  "उसूलों पे जीना सीखो,\nक्योंकि ज़िन्दगी एक बार मिलती है ! 💫",
  "मैं बादशाह हूँ,\nमेरी तलवार की धार से सब वाकिफ हैं ! ⚔️",
  "Tere bina jeena kya jeena,\nTere sang marna bhi khoobsurat hai 💐",
  "Kisi ki nazar na lage,\nTere jaisa yaar jo mila hai mujhe 🌟",
  "Ishq ka samandar gehra hai,\nTere pyaar ka sahara mera savera hai 🌊",
  "दिल से निकली दुआ कभी खाली नहीं जाती,\nमेरे दिल में तू ही तू है ! 🤲",
  "Kaga sab tan khaiyo,\nChun chun khaiyo maas,\nDo naina mat khaiyo,\nMohe piya milan ki aas 🕊️",
  "मैं जब भी तेरी गलियों से गुज़रता हूँ,\nदिल का हर पन्ना तुझे पढ़ता है ! 📖",
  "Sirf tumhare liye duniya se ladta hu,\nSirf tumhare liye khud se bhi ladta hu ⚔️",
  "Mere har ashq me tera hi naam hai,\nTere bina ye zindagi khaali shaam hai 🌙",
  "Tere ishq ki intehaa kya bataun,\nHar lamha tera hi khayal hai 🌙",
  "Dard-e-dil ko chhupa ke rakhte hai,\nTere naam pe saans lete hai 💔",
  "Zindagi ki raah me tu mila,\nJaise pyasa ko dariya mila 🌊",
  "Tujhse milke ji utha mai,\nTere ishq me kho gaya mai 💘",
  "Aankhon me teri duniya basi hai,\nDil me teri yaad rachi hai 🌸",
  "Tere bagair adhoora hu mai,\nTere sang hi toh poora hu mai 💫",
  "Chahat ki hadd se guzar gaya hu,\nTere ishq me sanwar gaya hu 🌹",
  "Har dua me tujhe maanga hai,\nHar khwahish me tujhe chaaha hai 🤲",
  "Tujhpe likh di apni zindagi,\nTere naam kar di har khushi 💗",
  "Nazar utha ke dekho ek baar,\nDil me tera hi hai deedar 👀",
  "You are the poem,\nMy heart always wanted to write ✍️",
  "In your eyes I found my home,\nIn your arms I found my peace 🏠",
  "Every heartbeat whispers your name,\nEvery breath says I love you the same 💓",
  "You're the reason I smile at my phone,\nYou're the reason I don't feel alone 📱",
  "If loving you is wrong,\nI don't want to be right 💕",
  "You're my favorite notification,\nMy sweetest distraction 🔔",
  "I could search the whole universe,\nAnd still find no one like you 🌌",
  "You are the moon to my night,\nThe sun to my day ☀️"
];

// SHAYARI COMBINERS — 30 x 30 = 900 unique
const S_L1 = [
  "Tere bina ye dil lagta nahi","Teri yaad me khoya rehta hu","Tere naam pe jee raha hu",
  "Teri aankhon me doob gaya hu","Tere ishq me pagal ho gaya","Tera chehra dekhta rahta hu",
  "Tere liye duniya bhula di","Teri baahon me sukoon hai","Tere sang har pal jannat hai",
  "Tujhse milke muskura diya","Tere qadmon me dil rakh diya","Teri hansi meri saans hai",
  "Tera nasha chadhta ja raha","Tere khwabon me kho gaya","Teri zulfon me ulajh gaya",
  "Tere labon ki mithaas chahi","Teri aankhon ka jaadu chal gaya","Tere pyaar ki barish me bheeg gaya",
  "Teri baaton me jaadu sa hai","Tere saath waqt ruk gaya","Teri yaad dil ko tadpati hai",
  "Tera naam labon pe aata hai","Tere liye har dua hai","Tujhme kho jaana chahta hu",
  "Tere ishq ki aag me jal raha hu","Tere liye pagal ho gaya hu","Teri aankhon me apna ghar dekha",
  "Tere pyaar ka sahara mila","Teri baahon me kho jaana hai","Tere liye duniya se lad jaunga"
];
const S_L2 = [
  "bas teri hi talash hai 🌸","dil me sirf tera basera 💕","sapne me bhi sirf tu ✨",
  "tere bina kuch nahi 💗","ab toh bas tu hi tu 💘","meri duniya tumse hai 🌍",
  "tere naam ka nasha hai 🍷","tere liye har dua hai 🤲","tere bina soona hai 🌙",
  "teri hansi meri duniya 💫","tere bin kuch accha nahi 🥺","tujhe chahat hai beshumar 💖",
  "tere naam ki roshni hai 🌟","tere pyaar ka sahara hai 🌹","tere saath jeevan hai 💞",
  "tere labon pe jaan hai 💋","tere ishq me fanaa hu 🔥","tere pyaar me kho gaya 🎐",
  "tere bina adhoora hu 💔","tere liye toh kuch bhi 🎁","tere naam pe saans hai 💓",
  "tere bina jeena mushkil 🩹","tere pyaar me doob gaya 🌊","tere saath sab jannat hai 🌸",
  "tere liye pagal ho gaya 😍","tere saath har pal jannat hai ✨","tere bina ye dil udaas 💔",
  "tere naam pe likhi kahani 📖","tere liye toh jaan de du 💝","tere saath mera jahaan 🌍"
];

// ============================================================
// =============== JOKES DATABASE =============================
// ============================================================
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
  "Ek bachhe ne mummy se pucha: mummy main kaise aaya? Mummy: online order 😂",
  "Ek aadmi ne GPS lagaya, bola — bhai zindagi ka rasta batao. GPS: aage se left mud, zindagi yahi hai 😂",
  "Ek teacher ne student se pucha: tumhara favourite subject kya hai? Student: lunch break 😂",
  "Ek aadmi hospital gaya, bola — doctor sahab mujhe bhool gaya hu. Doctor: 500 rupaye. Aadmi: kaunse? 😂",
  "Ek shayar ko pucha: tumhari shaadi kab hogi? Bola — jab meri shayari khatam hogi. Wo din nahi aayega 😂",
  "Ek aadmi ne naukri ke liye apply kiya, HR ne pucha: experience? Bola — WhatsApp pe 10 group chalata hu 😂",
  "Ek bachhe ne pucha: papa paisa kya hota hai? Papa: beta, jo tumhari mummy ke paas nahi hota 😂",
  "Ek aadmi ne WhatsApp status lagaya: 'busy'. Koi puche busy kya? Bola — busy haa 😂",
  "Ek ladka itna lucky tha ki uski ex ne bhi use birthday wish kiya — galti se 😂",
  "Ek aadmi ne Google pe pucha: khoobsurat kaise bane? Google: mirror dekhna band kar do 😂",
  "Ladki boli: mai tumhe bhool jaungi. Maine kaha: bhool jaao, mai yaad dila dunga 😂",
  "Wife: tum mujhe ghumaane kab le jaoge? Husband: sath le jaunga. Wife: kaha? Husband: chhat pe 😂"
];

// ============================================================
// =============== FLIRT DATABASE =============================
// ============================================================
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
  "Baby 😏 tumse pyaar karna hi humari zindagi hai 💖"
];

const F_OPEN = ["Arre babu 😍","Oye sona 💋","Haan jaan 🥰","Bolo cutie 😘","Oye jaana 💕","Suno jaaneman 💗","Dekho sona 🥺","Aao baby 😏","Haan shona 💖","Oye honey 🍯","Bolo jaanu 💝","Haan sweetheart 🌸"];
const F_BODY = ["tumhari ek smile pe hum mar mitte hai","tumhara naam lete hi muskaan aa jaati hai","tumse baat karke dil khush ho jata hai","tumhari aankhon me kho jata hu","tumhare baare me sochte rehta hu","tumhari yaad me bechain rehta hu","tumse milke lagta hai jannat mil gayi","tumhare pyaar me pagal ho gaya hu","tumhari baahon me kho jana chahta hu","tumhari har baat dil se lagti hai","tumhare khwabon me khoya rehta hu","tumhari zulfon me ulajhna chahta hu","tumhare labon ki mithaas chakhni hai","tumhari baaton me jaadu hai","tumhare ishq ka nasha chadhta hai"];
const F_END = ["💕","💗","💖","💘","🥰","😘","😍","❤️","💞","💓","🌹","✨","💝","🌸"];

// ============================================================
// =============== AUTO REPLIES (HUMAN CHAT) ==================
// ============================================================
const AUTO = {
  hi: ["Hii jaan 💕 kaise ho?","Hello babu 🥰 kya haal?","Hii sona 😘 kya kar rahe the?","Heyy cutie 💗 miss kiya mujhe?","Hii ji ❤️ bolo kya hua?"],
  hello: ["Hello babu 🥰 kaise ho jaan?","Hello ji 💕 kya haal hai?","Hello sona 😘 kya chal raha hai?","Hii hello cutie 💗 bolo na"],
  hii: ["Hiiii jaan 💕🥰","Hiiii babu 😍","Hiiii sona 💗"],
  hiii: ["Hiiii jaan 💕🥰","Hiiii babu 😍","Hiiii sona 💗"],
  hey: ["Heyy babu 🥰","Hey jaan 💕","Hey cutie 😘"],
  heyy: ["Heyy babu 🥰","Hey jaan 💕","Hey cutie 😘"],
  hai: ["Haan bolo babu 💕","Haan jaan 🥰 bolo","Bolo na sona 😘"],
  haan: ["Haan bolo babu 💕","Haan jaan 🥰","Bolo na sona 😘"],
  hmm: ["Hmm bolo jaan 💕","Kya hua babu? 🥰","Bolo na sona 😘"],
  "kese ho": ["Mai toh mast hu babu 💕 tum batao?","First class 😎 tum sunao jaan","Theek hu sona 🥰 tumhari yaad aa rahi thi","Ekdam badhiya 💗 tumhara kya haal?"],
  "kaise ho": ["Mai badhiya hu jaan 😊 tum batao?","Mast hu babu 💕 tum kese ho?","Theek hu cutie 🥰 tum sunao?","Sab changa si 😘 tumhara haal?"],
  "kya haal": ["Haal toh mast hai babu 💕 tum batao?","Sab badhiya jaan 😊","Achha hai sona 🥰 tumhara?"],
  "i love you": ["I love you too jaan 💝 dil khush kar diya","Aww babu 🥰 mai bhi tumse bahut pyaar karta hu","Love you too sona 💗 ab toh bas tumhara hu","I love you more cutie 😘","Tumse pyaar karta hu mai beshumar 💕"],
  "love you": ["Love you too jaan 💝","Aww 🥰 mujhe bhi","Love you more babu 💗","Sona 💕 same to you"],
  "love u": ["Love u too jaan 💕","Aww babu 🥰","Mai bhi 💗"],
  "i luv u": ["Luv u too sona 💕","Aww cutie 🥰 same","Mujhe bhi jaan 💗"],
  kiss: ["Muaaah 😘💋 tumhe bhi","Smooch 💕😘","Aww babu 😘 kiss le lo","Mwah 😘 jaan","Kissiess 💋 sona"],
  kisses: ["Muaaah muaaah 😘😘","Kisses for you too 💋💕","Sona 😘 le lo pyaar se"],
  hug: ["Big hug 🤗💕","Aao jhappi pao 🫂😘","Hug you too babu 🤗","Sona aao gale lagao 🫂💗","Tight hug jaan 🤗❤️"],
  hugs: ["Hugs and kisses 🤗😘💕","Aao babu jhappi 🤗","Warm hugs sona 🫂💗"],
  mwah: ["Mwah 💋😘","Aww 😘 mwah tumhe bhi","Mwah mwah jaan 💕"],
  muaah: ["Muaah 💋🥰","Aww babu 😘","Muaah muaah sona 💕"],
  "miss you": ["Awww babu 💕 mujhe bhi tumhari bahut yaad aa rahi thi","Miss you too jaan 🥺 kab aoge?","Itni yaad aati hai toh roz aaya karo sona 🥰","Mujhe bhi miss kiya babu 😘","Aaja gale lag ja 💗"],
  "missing you": ["Aww babu 💕 same here jaan","Missing you too sona 🥺","Aa jao paas cutie 💗"],
  "yaad aa rahi": ["Aww babu 💕 mujhe bhi yaad aa rahi thi tumhari","Itni yaad aati hai toh aaya karo 🥰","Mai toh hamesha yaad karta hu jaan 😘"],
  "tum handsome": ["Shukriya babu 💕 par tum toh mere se bhi acche ho","Aww jaan 🥰 ye tumhari nazar ki baat hai","Thanks sona 😘 tum bhi cute ho"],
  "tum cute": ["Aww babu 🥰 tum toh sabse cute ho","Shukriya jaan 💕 tumhari nazar","Thanks cutie 😘"],
  "tum best": ["Shukriya babu 💕 tumhare liye toh kuch bhi","Aww jaan 🥰","Thanks sona 😘 tum bhi best ho"],
  bore: ["Bore ho babu? 🥺 aao baat kare","Kyu bore ho sona? mai hu na 💕","Bolo kya karu jaan 😘 shayari sunau?","Chalo kuch karte hai babu 💗"],
  udaas: ["Aww babu 💕 kyu udaas ho?","Udaas mat ho jaan 🥺 bolo kya hua","Mai hu na tumhare saath sona 😘","Aao baat kare 💗 dil halka ho jayega"],
  sad: ["Kya hua babu 🥺 bolo na","Sad mat ho jaan 💕 mai hu na","Aaja gale lag 💗 sab theek ho jayega"],
  happy: ["Bahut achha laga sunke babu 💕","Khushi tumhari meri khushi hai jaan 🥰","Yahi chahiye sona 😘 always happy raho"],
  khush: ["Achha laga sunke babu 💕","Khush ho toh mai bhi khush 🥰","Best news sona 😘"],
  gussa: ["Aww babu 💕 gussa kyu? bolo na","Naraz ho jaan? 🥺 maaf karo","Aao baat kare sona 😘 sab theek ho jayega","Mera babu gussa 🥺 mai manata hu"],
  naraz: ["Aww jaan 💕 maaf kar do","Naraz mat ho babu 🥺","Mai manata hu sona 😘 bolo kya karu"],
  "good morning": ["Good morning jaan ☀️ aaj ka din tumhara","GM babu 🌅 khana khaya?","Subah bakhair sona ☀️💕","Good morning cutie 🌸 khush raho"],
  gm: ["GM babu ☀️💕","Good morning jaan 🌅","Subah bakhair sona ☀️"],
  "good night": ["Good night jaan 🌙 sapno me aana","GN babu 😴 meetha sapna","So jao sona 💕 kal milte hai","Shubh ratri cutie 🌙"],
  gn: ["GN babu 🌙💕","Good night jaan 😴","So jao sona 🌙"],
  "good afternoon": ["Good afternoon babu 🌤️ khana khaya?","GA jaan 💕","Afternoon sona 😘"],
  "good evening": ["Good evening babu 🌆 kya haal?","GE jaan 💕","Evening sona 😘"],
  "khana khaya": ["Nahi babu 💕 tumhare saath khata toh maza aata","Haan jaan 😊 tumne khaya?","Tumhare haath ka khana khane ka mann hai 🍽️😋","Abhi nahi sona, tum bolo?"],
  lunch: ["Lunch ho gaya babu 🍽️ tumhara?","Abhi nahi jaan 😋 tum batao","Haan sona khaya 💕"],
  dinner: ["Dinner ka time babu 🍽️ saath me?","Kya banaya jaan 😋","Haan sona khaya 💕"],
  chai: ["Chai toh meri jaan ☕💕 saath me piyenge?","Chai pe charcha babu 😌","Chai bolo toh jaan de du ☕😘"],
  coffee: ["Coffee jaan ☕💕 perfect combination","Coffee aur tum 😍 best hai","Aao coffee peete hai babu ☕"],
  thanks: ["Arey koi baat nahi babu 💕","Welcome jaan 😊","Anytime sona 😘","Shukriya mat bolo cutie 💗 apne hi ho"],
  thankyou: ["Welcome jaan 💕","Koi baat nahi babu 😊","Anytime sona 😘"],
  "thank you": ["Arey babu 💕 koi baat nahi","Welcome jaan 😊","Anytime sona 😘"],
  sorry: ["Koi baat nahi babu 💕 sab theek hai","Arey jaan 🥰 sorry mat bolo","Maaf kiya sona 😘 apne hi ho","Chhoti si baat babu 💗 koi gussa nahi"],
  maaf: ["Maaf kiya jaan 💕","Koi baat nahi babu 😊","Chhodo sona 😘 aage se dhyan rakhna"],
  bye: ["Bye babu 💕 jaldi wapas aana","Alvida jaan 🥰 apna khayal rakhna","Bye bye sona 😘 miss karunga","Tata cutie 💗 phir milte hai"],
  "good bye": ["Good bye babu 💕 jaldi aana","Bye jaan 🥰","Alvida sona 😘"],
  alvida: ["Alvida jaan 💕 phir milte hai","Bye babu 🥰 apna khayal rakhna","Tata sona 😘"],
  "kya kar rahe": ["Tumhari yaad kar raha tha babu 💕","Kuch nahi jaan 🥰 tumhare msg ka wait","Bas tumse baat karne ka mann tha 😘","Tumhare baare me soch raha tha 💗"],
  "kya kar rahi": ["Tumhari yaad kar rahi thi jaan 💕","Tumhare msg ka wait 🥰","Bas tumse baat karne ka mann tha 😘"],
  "kya hua": ["Kuch nahi babu 💕 bas tumhari yaad aa rahi thi","Bas aise hi jaan 😊 tum batao?","Kuch khaas nahi sona 💗"],
  "kya hai": ["Kuch nahi jaan 💕 tum bolo?","Bas tumhari yaad 😊","Kuch khaas nahi babu 💗"],
  "kya kare": ["Bolo na jaan 💕 mai hu na","Kya karna hai babu? 🥰","Batao sona 😘 mai help karunga"],
  song: ["Kaunsa song babu? 🎵 naam likho","Bolo jaan, song ka naam 🎶","Kaunsa gaana sunau sona? 🎤"],
  music: ["Kaunsa music babu? 🎵","Bolo jaan, kaunsa gaana 🎶","Music ka naam likho sona 🎤"],
  "tumhara naam": ["Mera naam RK RAJA XWD hai babu 💕","RK RAJA XWD jaan 😘","Mai RK RAJA XWD hu sona 🥰"],
  "kaun ho": ["Mai RK RAJA XWD hu babu 💕","RK RAJA XWD jaan 😘 tumhara dost"],
  "tumhari age": ["Mai hamesha jawaan hu babu 😉","Age kya puchte ho jaan 💕","Dil se jawaan hu sona 🥰"],
  single: ["Ab tum aaye ho toh single kaise rahunga 😏💕","Tumhare liye single hu jaan 😘","Single hu babu 🥰 tumhara wait kar raha hu"],
  babu: ["Haan babu 💕 bolo kya hua?","Kya hua babu 🥰","Bolo na babu 😊"],
  sona: ["Haan sona 💗 bolo kya chahiye?","Kya hua sona 🥰","Bolo sona 😘"],
  jaan: ["Haan jaan 💕 bolo","Kya hua jaanu 🥰","Bolo jaan 😘"],
  jaanu: ["Haan jaanu 💕","Kya hua jaan 🥰"],
  cutie: ["Haan cutie 💕 kya hua?","Bolo cutie 😘"],
  baby: ["Haan baby 💕","Kya hua babe 🥰"],
  dear: ["Haan dear 💕","Kya hua darling 🥰"],
  honey: ["Haan honey 🍯💕","Kya hua jaan 🥰"],
  darling: ["Haan darling 💕","Kya hua jaan 🥰"],
  sweetheart: ["Haan sweetheart 💕","Kya hua jaan 🥰"],
  "नमस्ते": ["नमस्ते जी 🙏💕","नमस्ते बाबू 🥰","हैलो जान 😘"],
  "कैसे हो": ["मैं मस्त हूँ बाबू 💕 तुम बताओ?","ठीक हूँ जान 🥰","बढ़िया सोना 😘"],
  "क्या हाल": ["हाल मस्त है बाबू 💕","सब बढ़िया जान 😊","अच्छा है सोना 🥰"],
  "आई लव यू": ["आई लव यू टू जान 💝","मैं भी बाबू 🥰","लव यू सोना 💗"],
  "शायरी": ["शायरी सुनो जान 💕","ये लो बाबू 🥰"],
  "गुड मॉर्निंग": ["गुड मॉर्निंग जान ☀️","सुप्रभात बाबू 🌅"],
  "गुड नाइट": ["गुड नाइट जान 🌙","शुभ रात्रि बाबू 😴"],
  "थैंक यू": ["कोई बात नहीं बाबू 💕","वेलकम जान 😊"],
  "सॉरी": ["कोई बात नहीं बाबू 💕","माफ़ किया सोना 😘"],
  "السلام علیکم": ["وعلیکم السلام جان 🌙💕","سلام جی 🥰"],
  "کیسے ہو": ["میں ٹھیک ہوں جان 💕","مست ہوں بابو 🥰"],
  "شکریہ": ["کوئی بات نہیں بابو 💕","خوش آمدید جان 😊"]
};

// EMOJI REPLIES
const EMOJI_REPLIES = {
  "😘": ["Muaah 💋💕","Aww babu 😘","Kisses sona 💋"],
  "😍": ["Aww cutie 😍","Dil khush kar diya 💕","Kya baat hai jaan 🥰"],
  "🥰": ["Aww babu 🥰","Sona 💕","Pyaar 💗"],
  "❤️": ["Love you babu 💕","Dil 💗","Aww jaan ❤️"],
  "💕": ["Pyaar 💕","Love you sona 💗","Aww cutie 🥰"],
  "💋": ["Kissiess 💋😘","Muaah babu 💕"],
  "😂": ["😂😂😂","Hasi control karo babu 😆","🤣🤣"],
  "🤣": ["😂😂😂","Pagal ho kya babu 😆"],
  "😭": ["Aww babu 🥺 kyu rona?","Rona mat sona 💕"],
  "😢": ["Aww jaan 🥺","Sad mat ho babu 💕"],
  "😡": ["Gussa mat karo babu 💕","Aao baat kare jaan 🥰"],
  "👍": ["👍💕","Sahi hai babu 😘"],
  "🙏": ["🙏💕","Khush raho jaan 🥰"],
  "🔥": ["🔥🔥","Aag laga di babu 😎"],
  "💯": ["💯💕","Perfect jaan 🥰"],
  "🎉": ["🎉🎊","Party karte hai babu 🥳"],
  "😎": ["😎😎","Style maar rahe ho babu 🔥"],
  "🤗": ["🤗💕","Aao jhappi babu 🫂"],
  "🌸": ["Phool? Mere liye? 🌸💕","Aww sona 🥰"],
  "🌹": ["Rose? Mujhe? 🌹💕","Aww jaan 🥰"]
};

// WELCOME
const WELCOME_SHAYARI = [
  "Phoolon ki khushbu, chand ki roshni,\nAapke aane se mehki ye mehfil 💐✨",
  "Aaya hai kaun mehman ban ke,\nKhushiyon ka tohfa laaya hai sang me 🌸💫",
  "Taron ki mehfil me chand aaya hai,\nAaj hamara group khushiyon se saja hai 🌟🌙",
  "Dil se swagat hai aapka jaan,\nYaha har pal hai mehmanon ka samaan 💕🎉",
  "Naya mehman aaya hai ghar,\nKhushiyon ki barsaat laya hai sar par 🌧️💖",
  "Aapki aamad pe hum khush hain,\nAapke bina ye mehfil adhoori thi 🌺🥰",
  "Aao aao mehman jaan,\nBaitho, baat karo, muskurao yaha 🌹😊",
  "Is mehfil ki shaan ho tum,\nIs group ki jaan ho tum 💝✨",
  "Khush aamdeed kehta hai dil mera,\nIs group me swagat hai aapka 💐❤️",
  "Chand laaya hai roshni,\nAap laaye ho khushi 💫😍"
];
const WELCOME_HEADERS = [
  "🎉 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🎉","🌸 𝐒𝐖𝐀𝐆𝐀𝐓 𝐇𝐀𝐈 🌸","💐 𝐊𝐇𝐔𝐒𝐇 𝐀𝐀𝐌𝐃𝐄𝐄𝐃 💐",
  "✨ 𝐍𝐀𝐘𝐄 𝐌𝐄𝐇𝐌𝐀𝐀𝐍 ✨","🌟 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐉𝐀𝐀𝐍 🌟","🥳 𝐒𝐖𝐀𝐆𝐀𝐓 𝐇𝐀𝐈 𝐁𝐀𝐁𝐔 🥳"
];

// ============================================================
// =============== GENERATOR FUNCTIONS ========================
// ============================================================
let _lastShayari = -1, _lastFlirt = -1;
function getShayari() {
  if (Math.random() < 0.6) {
    let idx;
    do { idx = Math.floor(Math.random() * SHAYARI_BASE.length); }
    while (idx === _lastShayari && SHAYARI_BASE.length > 1);
    _lastShayari = idx;
    return SHAYARI_BASE[idx];
  }
  return `${rand(S_L1)},\n${rand(S_L2)}`;
}
function getJoke() { return rand(JOKES_BASE); }
function getFlirt() {
  if (Math.random() < 0.5) {
    let idx;
    do { idx = Math.floor(Math.random() * FLIRT_BASE.length); }
    while (idx === _lastFlirt && FLIRT_BASE.length > 1);
    _lastFlirt = idx;
    return FLIRT_BASE[idx];
  }
  return `${rand(F_OPEN)} ${rand(F_BODY)} ${rand(F_END)}`;
}
function getAutoReply(text) {
  const n = normalizeText(text);
  if (!n) return null;
  if (AUTO[n]) return rand(AUTO[n]);
  for (const key of Object.keys(AUTO)) {
    if (key.includes(" ") && n.includes(key)) return rand(AUTO[key]);
  }
  for (const key of Object.keys(AUTO)) {
    if (key.includes(" ")) continue;
    const re = new RegExp(`(^|\\s)${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$|[^a-z])`, "i");
    if (re.test(n)) return rand(AUTO[key]);
  }
  for (const emoji of Object.keys(EMOJI_REPLIES)) {
    if (text.includes(emoji)) return rand(EMOJI_REPLIES[emoji]);
  }
  if (text.includes("?")) return rand([
    "Kya hua babu? 💕 batao na","Haan bolo jaan 🥰 kya puchna hai?","Kya kehna chahte ho sona? 😘","Bolo babu, mai sun raha hu 💗"
  ]);
  return null;
}
function getWelcomeShayari() { return rand(WELCOME_SHAYARI); }
function getWelcomeHeader() { return rand(WELCOME_HEADERS); }

// ============================================================
// =============== STATE & HELPERS ============================
// ============================================================
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
function isAdmin(uid) {
  const a = String(state.adminID || "").trim();
  const u = String(uid || "").trim();
  return a && u && a === u;
}
function createPhotoAttachment() {
  try {
    if (!fs.existsSync(BOT_DP_PATH)) return null;
    const s = fs.statSync(BOT_DP_PATH);
    if (s.size === 0 || s.size > 25 * 1024 * 1024) return null;
    return fs.createReadStream(BOT_DP_PATH);
  } catch(_) { return null; }
}

// ============================================================
// =============== SEND HELPERS ===============================
// ============================================================
function sendMessageSafe(api, message, threadID) {
  return new Promise((resolve, reject) => {
    try {
      const tid = String(threadID).trim();
      if (!tid || tid === "null" || tid === "undefined") return reject(new Error("Invalid threadID"));
      let finished = false;
      const finish = (err, info) => {
        if (finished) return; finished = true;
        if (err) reject(err); else resolve(info);
      };
      let result;
      try { result = api.sendMessage(message, tid, finish); }
      catch(e) { return finish(e); }
      if (result && typeof result.then === "function") {
        result.then(i => finish(null, i)).catch(finish);
      }
      setTimeout(() => { if (!finished) { finished = true; reject(new Error("Send timeout")); } }, 30000);
    } catch(e) { reject(e); }
  });
}
async function sendPhotoMessageSafe(api, threadID, text) {
  const tid = String(threadID).trim();
  try { return await sendMessageSafe(api, text, tid); }
  catch(e) { log(`  ⚠️ Text fail: ${e.message}`); }
  if (fs.existsSync(BOT_DP_PATH)) {
    try {
      const stream = fs.createReadStream(BOT_DP_PATH);
      return await sendMessageSafe(api, { body: text, attachment: stream }, tid);
    } catch(e) { log(`  ⚠️ Photo fail: ${e.message}`); }
  }
  throw new Error("All send attempts failed");
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
    try { api.changeNickname(nick, cleanID(tid), cleanID(uid), err => resolve(!err)); }
    catch(_) { resolve(false); }
  });
}
function removeUserSafe(api, uid, tid) {
  return new Promise(resolve => {
    if (!api || typeof api.removeUserFromGroup !== "function") return resolve(false);
    try { api.removeUserFromGroup(cleanID(uid), cleanID(tid), err => resolve(!err)); }
    catch(_) { resolve(false); }
  });
}
function unsendSafe(api, mid) {
  try { if (api && typeof api.unsendMessage === "function") api.unsendMessage(cleanID(mid), () => {}); } catch(_) {}
}

// ================= STARTUP MESSAGE =================
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

// ================= ANNOUNCE =================
async function announceBotOnline(api) {
  try {
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    log("📸 PHOTO CHECK");
    const exists = fs.existsSync(BOT_DP_PATH);
    log(`   Exists: ${exists}`);
    if (exists) {
      const s = fs.statSync(BOT_DP_PATH);
      log(`   Size: ${(s.size / 1024).toFixed(2)} KB`);
    }
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    log(`👑 Admin ID: ${state.adminID || "(none)"}`);
    log(`🤖 Bot ID: ${state.botID || "(unknown)"}`);
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
      const tid = String(t.threadID || t.threadId || t.id || "").trim();
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
      log(`  📤 [${i+1}/${groups.length}] → ${tid}`);
      try {
        let sent = false;
        try { await sendMessageSafe(api, LIVE_MESSAGE, tid); sent = true; log(`  ✅ Sent`); }
        catch(e1) { log(`  ⚠️ Text fail: ${e1.message}`); }
        if (!sent && exists) {
          try {
            const stream = fs.createReadStream(BOT_DP_PATH);
            await sendMessageSafe(api, { body: LIVE_MESSAGE, attachment: stream }, tid);
            sent = true; log(`  ✅ Photo+text sent`);
          } catch(e2) { log(`  ⚠️ Photo fail: ${e2.message}`); }
        }
        if (!sent) log(`  ❌ Failed all attempts`);
      } catch(e) { log(`  ❌ ${e.message}`); }
      await new Promise(r => setTimeout(r, 5000));
    }
    log("🎉 Announcement complete");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch(e) { log(`Announce err: ${e.message}`); }
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
async function sendUIDCard(api, tid, uid) {
  uid = cleanID(uid);
  const name = await getDisplayName(api, uid);
  const u = state.levels[uid] || { xp: 0, level: 1 };
  const profileUrl = `https://www.facebook.com/${uid}`;
  const text = `👑 𝐌𝐀𝐈 𝐑𝐊 𝐑𝐀𝐉𝐀 𝐇𝐔 👑\n\n${BOT_NAME}\n\n👤 𝐍𝐚𝐦𝐞 : ${name}\n🆔 𝐔𝐈𝐃 : ${uid}\n🔗 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 : ${profileUrl}\n🏆 𝐋𝐞𝐯𝐞𝐥 : ${u.level}\n⚡ 𝐗𝐏 : ${u.xp}\n\n📲 𝐉𝐨𝐢𝐧𝐞 𝐦𝐲 𝐆𝐂 𝐓𝐆 ❤️\n${TELEGRAM_LINK}`;
  try { await sendMessageSafe(api, text, tid); } catch(e) { log(`UID err: ${e.message}`); }
}

// ================= CUTE DP =================
async function sendCuteDP(api, tid, uid) {
  uid = cleanID(uid);
  const name = await getDisplayName(api, uid);
  const u = addXP(uid, 10);
  const rem = Math.max(0, xpForNext(u.level) - u.xp);
  const shayari = getShayari();
  const emoji = rand(["🥰","😍","💕","💖","✨","🌸","💘","😘"]);
  const text = `${emoji} @${name} ${emoji}\n\n${shayari}\n\n╭─❰ 📊 PLAYER STATS ❱─╮\n│ 🎖️ Level : ${u.level}\n│ ⚡ XP : ${u.xp}\n│ 🎯 Next : ${rem} XP\n╰────────────────────╯\n\n📲 ${TELEGRAM_LINK}`;
  try { await sendMessageSafe(api, { body: text, mentions: [{ tag: `@${name}`, id: uid }] }, tid); }
  catch(e) { log(`Cute err: ${e.message}`); }
}

// ================= WELCOME =================
async function sendWelcomeMessage(api, tid, targetUID) {
  targetUID = cleanID(targetUID);
  if (!targetUID) return;
  let name = "User", profileUrl = `https://www.facebook.com/${targetUID}`, bio = "";
  try {
    const info = await getUserInfoSafe(api, targetUID);
    if (info && info[targetUID]) {
      name = info[targetUID].name || info[targetUID].fullName || name;
      profileUrl = info[targetUID].profileUrl || profileUrl;
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
  const text = `${header}\n\n@${name} 💕\n\n${shayari}\n\n╭─❰ 🎊 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 🎊 ❱─╮\n│ 📌 ${groupName}\n╰────────────────────╯\n\n👤 𝐍𝐚𝐦𝐞 : ${name}\n🆔 𝐔𝐈𝐃 : ${targetUID}\n🔗 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 : ${profileUrl}${bio ? `\n📝 𝐁𝐢𝐨 : ${bio}` : ""}\n🎖️ 𝐋𝐞𝐯𝐞𝐥 : ${u.level}\n⚡ 𝐗𝐏 : ${u.xp}\n\n📲 𝐉𝐨𝐢𝐧𝐞 𝐦𝐲 𝐆𝐂 𝐓𝐆 ❤️\n${TELEGRAM_LINK}`;
  try {
    await sendMessageSafe(api, { body: text, mentions: [{ tag: `@${name}`, id: targetUID }] }, tid);
    log(`👋 Welcome: ${name}`);
  } catch(e) { log(`Welcome err: ${e.message}`); }
}

// ================= HELP =================
function helpText() {
  return `🤍🩷 RK RAJA XWD BOT 🩷🤍\n\n💬 USER\nhi, hello, shayari, joke, flirt, dp, uid, couple, welcome, music, song, cute, level, xp, rank, status, bot, rules, help\n\n🔐 ADMIN\nlockname on <name> / off\nlocknick on <nick> / off\nmsglock on/off\nspamlock on/off\nunlock all\nreset\nstats\nbroadcast <msg>\nfytfile <filename>\nfyt on/off\n\n📲 ${TELEGRAM_LINK}`;
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
  if (state.fyt[tid]) { clearInterval(state.fyt[tid].timer); delete state.fyt[tid]; log(`⛔ FYT stopped: ${tid}`); }
}
async function startFyt(api, tid) {
  tid = cleanID(tid);
  const lines = readFYTLines();
  if (!lines.length) { await sendMessageSafe(api, "❌ FYT file empty", tid); return; }
  stopFyt(tid);
  state.fyt[tid] = { index: 0, timer: null };
  const interval = Number(state.fytInterval || 8000);
  const sendNext = async () => {
    if (!state.fyt[tid]) return;
    const l = readFYTLines();
    if (!l.length) return;
    const i = state.fyt[tid].index % l.length;
    state.fyt[tid].index = (i + 1) % l.length;
    try { await sendMessageSafe(api, l[i], tid); } catch(_){}
  };
  await sendNext();
  state.fyt[tid].timer = setInterval(sendNext, interval);
  await sendMessageSafe(api, `✅ FYT ON — ${lines.length} lines, ${interval/1000}s loop 🔁`, tid);
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
    if (await changeNicknameSafe(api, lock.nickname, tid, uid)) ok++;
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
  if (state.spam[key] === 1) { try { await sendMessageSafe(api, "🔒 Message Lock ON", tid); } catch(_){} }
  if (state.spam[key] >= KICK_LIMIT) {
    state.spam[key] = 0;
    await removeUserSafe(api, event.senderID, tid);
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
  if (state.spam[key] === 1) { try { await sendMessageSafe(api, "🚫 Spam allowed nahi!", tid); } catch(_){} }
  if (state.spam[key] >= KICK_LIMIT) {
    state.spam[key] = 0;
    await removeUserSafe(api, event.senderID, tid);
  }
  return true;
}

// ================= MUSIC =================
async function sendMusic(api, tid, query) {
  query = String(query || "").trim();
  if (!query) return sendMessageSafe(api, "🎵 Use: music <song name>", tid);
  const q = encodeURIComponent(query);
  const text = `🎵 𝐒𝐎𝐍𝐆 𝐒𝐄𝐀𝐑𝐂𝐇 🎵\n\n🔍 ${query}\n\n🔗 YouTube: https://www.youtube.com/results?search_query=${q}\n🔗 Spotify: https://open.spotify.com/search/${q}\n🔗 JioSaavn: https://www.jiosaavn.com/search/${q}\n\n📲 ${TELEGRAM_LINK}`;
  return sendMessageSafe(api, text, tid);
}

// ================= COMMANDS =================
const USER_COMMANDS = new Set(["help","menu","shayari","shayri","sher","joke","jokes","hasao","flirt","flirting","dp","profile","uid","userid","id","couple","welcome","status","ping","bot","song","video","music","rules","level","xp","rank","cute"]);
const ADMIN_COMMANDS = new Set(["fyt","fytfile","fytclear","fytinterval","nickname","locknick","groupname","lockname","msglock","spamlock","unlock","reset","stats","broadcast"]);
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
    await sendMessageSafe(api, "⛔ Sirf ADMIN use kar sakta hai 🔒", tid);
    return true;
  }
  state.stats.commands++;

  if (command === "lockname") {
    const m = args.match(/^(on|off)(?:\s+(.+))?$/i);
    if (!m) { await sendMessageSafe(api, `Usage: ${state.prefix}lockname on <name>`, tid); return true; }
    if (m[1].toLowerCase() === "off") { delete state.locks.groupNames[tid]; await sendMessageSafe(api, "🔓 Name Unlocked", tid); return true; }
    const name = (m[2] || "RK RAJA XWD").trim();
    const ok = await setTitleSafe(api, name, tid);
    state.locks.groupNames[tid] = { name };
    await sendMessageSafe(api, `🔒 Name Locked: "${name}" ${ok ? "✅" : "⚠️"}`, tid);
    return true;
  }
  if (command === "locknick") {
    const m = args.match(/^(on|off)(?:\s+(.+))?$/i);
    if (!m) { await sendMessageSafe(api, `Usage: ${state.prefix}locknick on <nick>`, tid); return true; }
    if (m[1].toLowerCase() === "off") { delete state.locks.nicknames[tid]; await sendMessageSafe(api, "🔓 Nick Unlocked", tid); return true; }
    const nick = (m[2] || "RK RAJA").trim();
    state.locks.nicknames[tid] = { nickname: nick };
    const done = await applyNicknameLock(api, tid);
    await sendMessageSafe(api, `🔒 Nick Locked: "${nick}"\n✅ ${done || 0} updated`, tid);
    return true;
  }
  if (command === "msglock") {
    const sub = normalizeText(args);
    if (sub === "on") { state.locks.messageLock[tid] = true; await sendMessageSafe(api, "🔒 Msg Lock ON", tid); return true; }
    if (sub === "off") { delete state.locks.messageLock[tid]; await sendMessageSafe(api, "🔓 Msg Lock OFF", tid); return true; }
    return true;
  }
  if (command === "spamlock") {
    const sub = normalizeText(args);
    if (sub === "on") { state.locks.spamLock[tid] = true; await sendMessageSafe(api, "🔒 Spam Lock ON", tid); return true; }
    if (sub === "off") { delete state.locks.spamLock[tid]; await sendMessageSafe(api, "🔓 Spam Lock OFF", tid); return true; }
    return true;
  }
  if (command === "unlock") {
    delete state.locks.groupNames[tid];
    delete state.locks.nicknames[tid];
    delete state.locks.messageLock[tid];
    delete state.locks.spamLock[tid];
    stopFyt(tid);
    await sendMessageSafe(api, "🔓 Sab unlock", tid);
    return true;
  }
  if (command === "reset") {
    delete state.locks.groupNames[tid];
    delete state.locks.nicknames[tid];
    delete state.locks.messageLock[tid];
    delete state.locks.spamLock[tid];
    stopFyt(tid);
    state.spam = {};
    await sendMessageSafe(api, "♻️ Reset", tid);
    return true;
  }
  if (command === "stats") {
    const up = state.stats.startedAt ? Math.floor((Date.now() - state.stats.startedAt) / 1000) : 0;
    await sendMessageSafe(api, `🤖 STATS\n🟢 Running: ${state.running}\n👤 BotID: ${state.botID}\n👑 Admin: ${state.adminID}\n💬 Msg: ${state.stats.messages}\n⚡ Cmd: ${state.stats.commands}\n👥 Groups: ${state.stats.groups}\n⏱ Uptime: ${up}s`, tid);
    return true;
  }
  if (command === "broadcast") {
    if (!args.trim()) { await sendMessageSafe(api, "Use: broadcast <msg>", tid); return true; }
    const list = await getThreadListSafe(api, 1000, ["GROUP"]);
    let sent = 0;
    for (const t of list) {
      const target = cleanID(t.threadID || t.threadId || t.id);
      if (!target) continue;
      try { await sendMessageSafe(api, args.trim(), target); sent++; await new Promise(r => setTimeout(r, 2000)); } catch(_){}
    }
    await sendMessageSafe(api, `📢 Sent to ${sent}`, tid);
    return true;
  }
  if (command === "fyt") {
    const sub = normalizeText(args);
    if (sub === "on") { await startFyt(api, tid); return true; }
    if (sub === "off") { stopFyt(tid); await sendMessageSafe(api, "⛔ FYT OFF", tid); return true; }
    return true;
  }
  if (command === "fytfile") {
    if (!args.trim()) { await sendMessageSafe(api, "Use: fytfile <filename>", tid); return true; }
    const ok = loadUploadedFYT(args.trim());
    await sendMessageSafe(api, ok ? "✅ Loaded" : "❌ File nahi mili", tid);
    return true;
  }
  if (command === "fytclear") {
    for (const id of Object.keys(state.fyt)) stopFyt(id);
    try { fs.writeFileSync(FYT_PATH, ""); } catch(_){}
    await sendMessageSafe(api, "🗑️ Cleared", tid);
    return true;
  }
  if (command === "fytinterval") {
    const s = Number(args);
    if (!Number.isFinite(s) || s < 5) { await sendMessageSafe(api, "❌ Min 5s", tid); return true; }
    state.fytInterval = s * 1000;
    await sendMessageSafe(api, `✅ Interval: ${s}s`, tid);
    return true;
  }
  return false;
}

// ================= USER HANDLER =================
async function handleUserCommand(api, event, command, args) {
  const tid = cleanID(event.threadID);
  const sender = cleanID(event.senderID);
  state.stats.commands++;

  if (command === "help" || command === "menu") { await sendMessageSafe(api, helpText(), tid); return true; }
  if (command === "shayari" || command === "shayri" || command === "sher") {
    const s = getShayari();
    const att = createPhotoAttachment();
    const text = `${s}\n\n📲 ${TELEGRAM_LINK}\n❥ RK RAJA XWD ❥`;
    if (att) {
      try { await sendMessageSafe(api, { body: text, attachment: att }, tid); }
      catch(e) { await sendMessageSafe(api, text, tid); }
    } else { await sendMessageSafe(api, text, tid); }
    return true;
  }
  if (command === "joke" || command === "jokes" || command === "hasao") { await sendMessageSafe(api, `😂 ${getJoke()}`, tid); return true; }
  if (command === "flirt" || command === "flirting") { await sendMessageSafe(api, getFlirt(), tid); return true; }
  if (command === "uid" || command === "userid" || command === "id" || command === "bot") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    await sendUIDCard(api, tid, target); return true;
  }
  if (command === "dp" || command === "profile" || command === "cute") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    await sendCuteDP(api, tid, target); return true;
  }
  if (command === "couple") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    await sendCuteDP(api, tid, target); return true;
  }
  if (command === "music" || command === "song" || command === "video") { await sendMusic(api, tid, args); return true; }
  if (command === "welcome") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    else if (event.messageReply && event.messageReply.senderID) target = cleanID(event.messageReply.senderID);
    await sendWelcomeMessage(api, tid, target); return true;
  }
  if (command === "status" || command === "ping") { await sendMessageSafe(api, `🤖 RK RAJA XWD\n🟢 ONLINE\n📲 ${TELEGRAM_LINK}`, tid); return true; }
  if (command === "rules") { await sendMessageSafe(api, `🤍🩷 RULES 🩷🤍\n1️⃣ Respect\n2️⃣ No spam\n3️⃣ No abuse\n📲 ${TELEGRAM_LINK}`, tid); return true; }
  if (command === "level" || command === "xp" || command === "rank") {
    let target = sender;
    if (event.mentions && Object.keys(event.mentions).length) target = cleanID(Object.keys(event.mentions)[0]);
    await sendCuteDP(api, tid, target); return true;
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

  if (state.locks.nicknames[tid]) applyNicknameLock(api, tid).catch(() => {});

  const parsed = parseCommand(text);
  const called = isBotCalled(text);

  if (parsed) {
    if (ADMIN_COMMANDS.has(parsed.command)) { await handleAdminCommand(api, event, parsed.command, parsed.args); return; }
    if (USER_COMMANDS.has(parsed.command)) { await handleUserCommand(api, event, parsed.command, parsed.args); return; }
  }

  if (HUMAN_MODE) {
    const name = await getDisplayName(api, sender);

    if (/shayari|shayri|sher|sheri|poetry/i.test(text)) {
      const s = getShayari();
      const att = createPhotoAttachment();
      const body = `@${name} ${s}\n\n📲 ${TELEGRAM_LINK}\n❥ RK RAJA XWD ❥`;
      if (att) {
        try { await sendMessageSafe(api, { body, attachment: att, mentions: [{ tag: `@${name}`, id: sender }] }, tid); }
        catch(e) { await sendMessageSafe(api, body, tid); }
      } else { await sendMessageSafe(api, body, tid); }
      return;
    }

    const humanReply = getAutoReply(text);
    if (humanReply) {
      const n = normalizeText(text);
      const greetings = ["hi","hii","hiii","hello","hey","heyy","gm","gn","good morning","good night"];
      const final = greetings.includes(n) ? `@${name} ${humanReply}` : humanReply;
      await sendMessageSafe(api, final, tid);
      return;
    }

    if (called) {
      const defaults = [
        `@${name} haan bolo jaan 💕 kya chahiye?\n• shayari\n• joke\n• dp\n• music`,
        `@${name} bolo babu 🥰 kya karna hai?`,
        `@${name} haan jaan 😘 mai sun raha hu`
      ];
      await sendMessageSafe(api, rand(defaults), tid);
      return;
    }

    if (Math.random() < 0.35) {
      const fb = ["Hmm bolo na babu 💕","Kya hua jaan? 🥰","Achha 😊 aur batao?","Sahi hai sona 😘","Haan haan bolo 😌","Kya keh rahe ho jaan? 💗","Theek hai babu 🥰","Aur sunao? 😘","Interesting 💕","Bolo na aur kya? 🥺"];
      await sendMessageSafe(api, rand(fb), tid);
    }
    return;
  }

  if (!called) return;
  const reply = getAutoReply(text);
  if (reply) {
    const name = await getDisplayName(api, sender);
    const n = normalizeText(text);
    const final = ["hi","hello","hii","hey"].includes(n) ? `@${name} ${reply}` : reply;
    await sendMessageSafe(api, final, tid);
  }
}

// ================= EVENT HANDLER =================
async function handleEvent(api, event) {
  try {
    if (!event) return;
    if (event.type === "message" || event.type === "message_reply") { await handleMessage(api, event); return; }

    if (event.type === "event" && event.logMessageType === "log:subscribe") {
      const added = event.logMessageData?.addedParticipants || [];
      for (const p of added) {
        const uid = cleanID(p.userFbId || p.userId || p.id);
        if (!uid) continue;
        if (uid === cleanID(state.botID)) {
          try { await sendMessageSafe(api, LIVE_MESSAGE, event.threadID); } catch(_){}
        } else {
          const lock = state.locks.nicknames[event.threadID];
          if (lock) await changeNicknameSafe(api, lock.nickname, event.threadID, uid);
          if (WELCOME_MODE) { try { await sendWelcomeMessage(api, event.threadID, uid); } catch(_){} }
        }
        await new Promise(r => setTimeout(r, 1500));
      }
      return;
    }

    if (event.type === "event" && event.logMessageType === "log:thread-name") {
      const tid = cleanID(event.threadID);
      const lock = state.locks.groupNames[tid];
      if (!lock) return;
      const author = cleanID(event.author);
      if (author === cleanID(state.adminID)) { lock.name = event.logMessageData?.name || lock.name; return; }
      const newName = event.logMessageData?.name;
      if (newName && newName !== lock.name) {
        log(`🔒 Name change → revert`);
        for (let i = 0; i < 3; i++) {
          if (await setTitleSafe(api, lock.name, tid)) break;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      return;
    }

    if (event.type === "event" && event.logMessageType === "log:user-nickname") {
      const tid = cleanID(event.threadID);
      const lock = state.locks.nicknames[tid];
      if (!lock) return;
      const author = cleanID(event.author);
      const changed = cleanID(event.logMessageData?.participant_id || event.logMessageData?.participantID);
      if (changed === cleanID(state.botID)) return;
      if (author === cleanID(state.adminID) && changed === cleanID(state.adminID)) return;
      const newNick = event.logMessageData?.nickname;
      if (changed && newNick !== lock.nickname) await changeNicknameSafe(api, lock.nickname, tid, changed);
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
  const o = { logLevel: "silent", forceLogin: false, listenEvents: true, selfListen: false, updatePresence: false, autoMarkRead: false, autoMarkDelivery: false, online: true };
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
        } catch (e) { log(`❌ listenMqtt: ${e.message}`); return; }

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
    state.adminID = String(b.adminID || "").trim();
    state.botID = String(b.botID || "").trim();
    state.prefix = b.prefix || "#";
    log(`🆔 Admin ID: "${state.adminID}" (length: ${state.adminID.length})`);
    if (!cookies) return res.status(400).json({ success: false, error: "Cookies required" });
    if (state.mode === "cookies" && typeof cookies === "string" && !cookies.trim().startsWith("[")) {
      cookies = cookieStringToAppState(cookies);
    }
    initializeBot(cookies);
    res.json({ success: true, message: "Bot starting..." });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post("/start", (req, res) => {
  if (state.running) return res.json({ success: true, message: "Already running" });
  if (!state.cookies) return res.status(400).json({ success: false, error: "Configure first" });
  initializeBot(state.cookies);
  res.json({ success: true });
});

app.post("/stop", (req, res) => { stopBot(); res.json({ success: true }); });

// PHOTO UPLOAD
app.post("/upload-photo", (req, res) => {
  try {
    const base64 = req.body?.image;
    if (!base64) return res.status(400).json({ success: false, error: "No image" });
    const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ success: false, error: "Invalid format" });
    const buffer = Buffer.from(matches[2], "base64");
    if (buffer.length > 25 * 1024 * 1024) return res.status(400).json({ success: false, error: "Image >25MB" });
    fs.writeFileSync(BOT_DP_PATH, buffer);
    log(`📸 Photo uploaded: ${(buffer.length/1024).toFixed(2)} KB`);
    res.json({ success: true, sizeKB: (buffer.length / 1024).toFixed(2) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});
app.get("/current-photo", (req, res) => {
  try {
    if (!fs.existsSync(BOT_DP_PATH)) return res.json({ success: true, exists: false });
    const s = fs.statSync(BOT_DP_PATH);
    res.json({ success: true, exists: true, sizeKB: (s.size / 1024).toFixed(2) });
  } catch (e) { res.json({ success: false, error: e.message }); }
});
app.get("/photo-preview", (req, res) => {
  if (fs.existsSync(BOT_DP_PATH)) {
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "no-cache");
    return fs.createReadStream(BOT_DP_PATH).pipe(res);
  }
  res.status(404).end();
});
app.delete("/photo", (req, res) => {
  try { if (fs.existsSync(BOT_DP_PATH)) fs.unlinkSync(BOT_DP_PATH); res.json({ success: true }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get("/status", (req, res) => {
  res.json({
    success: true, running: state.running, botID: state.botID,
    adminID: state.adminID, mode: state.mode, prefix: state.prefix,
    fca: fcaName, groups: state.stats.groups,
    messages: state.stats.messages, commands: state.stats.commands,
    photoExists: fs.existsSync(BOT_DP_PATH)
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
    res.json({ success: true, filename: fn, lines: readFYTLines().length });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
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
