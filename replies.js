// ============================================================
// replies.js — RK RAJA XWD BOT — Full Reply Database
// 2000+ lines | Hindi + Urdu + English + Bengali + Tamil
// ============================================================

// ============================================================
// LANGUAGE DETECT
// ============================================================
function detectLang(text) {
  const t = String(text || "");
  if (/[\u0900-\u097F]/.test(t)) return "hi";
  if (/[\u0980-\u09FF]/.test(t)) return "bn";
  if (/[\u0B80-\u0BFF]/.test(t)) return "ta";
  if (/[\u0C00-\u0C7F]/.test(t)) return "te";
  if (/[\u0600-\u06FF]/.test(t)) return "ur";
  if (/[\u0A80-\u0AFF]/.test(t)) return "gu";
  if (/[\u0A00-\u0A7F]/.test(t)) return "pa";
  return "en";
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ============================================================
// SHAYARI BASE (200 entries)
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
  "You are the moon to my night,\nThe sun to my day ☀️",
  "Tere sang bitaye pal yaad aate hai,\nTere bina ye din kaise jate hai 💭",
  "Tu mera pehla pyaar hai, tu mera aakhri,\nTere bina ye dil rehta hai udaasi 💙",
  "Dil ki dharkan me tera hi naam,\nMeri saanso me tera hi kaam ❤️",
  "Tere bin ye duniya sooni lagti hai,\nTere saath ye duniya poori lagti hai 🌍",
  "Teri baahon me mera jahaan hai,\nTere khwabon me mera makaan hai 🏠",
  "Tere pyaar ne jeena sikha diya,\nTere ishq ne marna sikha diya 💫",
  "Har pal tera intezaar rehta hai,\nHar lamha tera khayal rehta hai ⏳",
  "Tu mera chand, tu mera suraj,\nTu mera jeevan, tu mera haraj 💝",
  "Tere ishq me fanaa ho gaya,\nTere pyaar me mila khuda 🤲",
  "Zindagi ki har khushi tumse hai,\nZindagi ka har gham tumse hai 💔",
  "Tere bina kuch bhi nahi hai mera,\nTere saath sab kuch hai mera 💕",
  "Dil ke armaan labon pe aa gaye,\nTere liye hum pagal ho gaye 😍",
  "Teri aankhon me apna ghar dekha,\nTeri baahon me apna jahan dekha 🏡",
  "Tere pyaar ne mujhe badal diya,\nTere ishq ne mujhe sanwar diya ✨",
  "Meri har saans teri amanat hai,\nMeri har dhadkan teri mohabbat hai 💓",
  "Tere naam pe likhi har shayari,\nTere liye basi har khushiyari 💫",
  "Tu mera pehla khwab hai,\nTu mera aakhri sawaal hai 🌙",
  "Tere bina ye dil kaise rahega,\nTere bina ye duniya kaise rahegi 💭",
  "Teri baaton me mera sukoon hai,\nTeri yaadon me mera junoon hai 🔥",
  "Tere pyaar ka sahara mil gaya,\nTere ishq ka kinara mil gaya ⚓",
  "Tere labon pe mera naam likha,\nTere dil me mera makaan bana 🏠",
  "Meri har nazar tujhe dekhti hai,\nMeri har khushi tujhe khojti hai 👀",
  "Tere bina ye zindagi adhoori,\nTere saath ye zindagi poori 🌸",
  "Tere ishq me jal raha hu,\nTere pyaar me tar raha hu 🔥",
  "Mera dil kehta hai tujhe paana,\nMeri rooh kehti hai tujhme samaana 💫",
  "Teri aankhon me mera ghar hai,\nTeri baahon me mera jahan hai 🏡",
  "Tu meri roshni, tu mera saaya,\nTu mera jeevan, tu mera aaya 🌟",
  "Tere pyaar ka har pal yaadgaar hai,\nTere bina har pal bhhaar hai ⏳",
  "Meri har dua me tera naam hai,\nMeri har saans me tera kaam hai 🤲",
  "Tere liye chhod di duniya saari,\nTere liye tod di har deewari ❤️",
  "Tu mera aakhri khwab hai,\nTu mera pehla khayal hai 💭",
  "Tere bina ye din kaise katega,\nTere bina ye raat kaise kategi 🌙",
  "Meri har subah teri yaad se shuru,\nMeri har raat teri fikr pe khatam 🌅",
  "Tere ishq me kho jaana chahta hu,\nTere pyaar me mil jaana chahta hu 💘",
  "Tere labon se mithaas churani hai,\nTere dil me ghar banaani hai 💋",
  "Tu meri zindagi ka sabse pyaara hissa,\nTu meri rooh ka sabse gehra rissa 💗",
  "Tere bina ye dil pagal ho jata hai,\nTere bina ye dil tanha ho jata hai 🥺",
  "Meri har khwahish tujhse poori hoti,\nTeri har khwahish mujhse poori hoti 💫",
  "Tere pyaar ka sahara hai mujhe,\nTere ishq ka kinara hai mujhe ⚓",
  "Tere bina ye zindagi khaali hai,\nTere saath ye zindagi pyaari hai 💕",
  "Meri har subah tera naam leti,\nMeri har raat tera khwab dekhti 🌙",
  "Tu mera aakhri khwab hai,\nTu mera pehla pyaar hai 💭",
  "Tere ishq me jal jaana hai,\nTere pyaar me kho jaana hai 🔥",
  "Tere bina ye dil udaas hai,\nTere bina ye dil bebas hai 💔",
  "Meri har khushi tujhse hai,\nMera har gham tujhse hai 🥺",
  "Tere pyaar ne jeena sikha diya,\nTere ishq ne marna sikha diya 💫",
  "Tere bina ye zindagi sooni,\nTere saath ye zindagi poori 🌸",
  "Tu mera chand, tu mera tara,\nTu mera jeevan ka sahara 🌙",
  "Tere ishq me kho jaana,\nTere pyaar me mil jaana 💘",
  "Meri har saans me tera naam,\nMera har dhadkan me tera kaam ❤️",
  "Tere bina ye din nahi katta,\nTere bina ye raat nahi katti 🌙",
  "Tere pyaar ka sahara mila,\nTere ishq ka kinara mila ⚓",
  "Tu meri roshni, tu mera saaya,\nTu mera jeevan, tu mera aaya 🌟"
];

// ============================================================
// SHAYARI LINE COMBINERS (625+ combos)
// ============================================================
const S_L1 = [
  "Tere bina ye dil lagta nahi","Teri yaad me khoya rehta hu","Tere naam pe jee raha hu",
  "Teri aankhon me doob gaya hu","Tere ishq me pagal ho gaya","Tera chehra dekhta rahta hu",
  "Tere liye duniya bhula di","Teri baahon me sukoon hai","Tere sang har pal jannat hai",
  "Tujhse milke muskura diya","Tere qadmon me dil rakh diya","Teri hansi meri saans hai",
  "Tera nasha chadhta ja raha","Tere khwabon me kho gaya","Teri zulfon me ulajh gaya",
  "Tere labon ki mithaas chahi","Teri aankhon ka jaadu chal gaya","Tere pyaar ki barish me bheeg gaya",
  "Teri baaton me jaadu sa hai","Tere saath waqt ruk gaya","Teri yaad dil ko tadpati hai",
  "Tera naam labon pe aata hai","Tere liye har dua hai","Tujhme kho jaana chahta hu",
  "Tere ishq ki aag me jal raha hu"
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
  "tere liye pagal ho gaya 😍"
];

// ============================================================
// JOKES (100 entries)
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
  "Wife: tum mujhe ghumaane kab le jaoge? Husband: sath le jaunga. Wife: kaha? Husband: chhat pe 😂",
  "Ek aadmi ne WhatsApp group banaya, 2 din me 500 message, phir usne khud hi exit kar diya 😂",
  "Ladki: tum mujhe surprise do. Ladka: le lo, surprise — mai tumhara ex hu 😂",
  "Ek aadmi ne apni girlfriend se pucha: tum mujhse pyaar karti ho? GF: kal batao. Aaj mai busy hu 😂",
  "Teacher: beta school aao. Student: sir aaj Sunday hai. Teacher: kya? Mera kal tha exam 😂",
  "Ek aadmi ne pucha: tumhara WhatsApp number kya hai? Ladki: kyu? Aadmi: WhatsApp pe puchna hai 😂",
  "Mummy: beta padhai kar. Beta: mummy mai padh raha hu. Mummy: mobile se padhai? 😂",
  "Ek aadmi ne duniya ka sabse acha joke suna, phir bhi nahi hasa. Kyunki joke uski life thi 😂",
  "Wife: mai tumhe chhod ke chali jaungi. Husband: luggage kaun utaarega 😂",
  "Ek aadmi ne Ferrari ka poster lagaya, bola — beta kamyabi ke liye dekho. Beta: papa ye kaunsi car hai? Aadmi: sapna hai beta 😂",
  "Ek teacher ne pucha: kya tum sabhi question ka jawab jante ho? Student: haan sir. Teacher: kya hai? Student: haan 😂",
  "Ladki: tum mujhe kitna miss karte ho? Ladka: utna jitna mai bill miss karta hu 😂",
  "Ek aadmi ne apni biwi se pucha: tum mujhe kitna pyaar karti ho? Biwi: iPhone se zyada. Aadmi: toh naya dilwa do 😂",
  "Ek ladka pharmacy gaya, bola — ek condom. Pharmacist: kis size ka? Ladka: ekdum next level 😂",
  "Doctor: aapko roz daudna chahiye. Patient: kyu? Doctor: warna mai kaise daudunga 😂",
  "Ek aadmi ne ChatGPT se pucha: mai handsome hu? ChatGPT: mai AI hu, jhooth nahi bolta 😂",
  "Wife: tum mujhe bhool gaye? Husband: bhoola hota toh yaad kyu aata 😂",
  "Ek aadmi ne naukri k liye 100 baar apply kiya, phir usne apni dukaan khol li. Sikka aadmi aage aa gaya 😂",
  "Ek bachhe ne pucha: papa aapki shaadi kab hui? Papa: jab mummy ne haan bola. Bachha: aur aapne? Papa: majboor tha beta 😂",
  "Ek aadmi ne apni biwi ko surprise diya — ghar saaf karke. Biwi: kya hua? Aadmi: kuch nahi, sikhna tha 😂",
  "Ek aadmi ne game khela, 4 ghante baad roya. Mummy: kya hua? Aadmi: level 5 ke baad level 6 nahi ja raha 😂",
  "Ek aadmi ne tumse baat ki, phir tumne reply kiya, ab wo kya sochega? 😂",
  "Ek aadmi ne 1 lakh ki shirt pehni, koi poocha kitne ki? Bola — 1 lakh ki. Sab hasne lage 😂",
  "Ek ladka train me chadha, TC aaya. Ladka: ticket nahi hai. TC: kyu? Ladka: mai tourist hu 😂",
  "Ek aadmi ne apni GF ko rose diya. GF: rose kis liye? Aadmi: chubh jaaye toh bata dena 😂",
  "Ek aadmi ne pucha: WhatsApp kaisa laga? Dost: time waste karta hai. Aadmi: kitne ghante? Dost: 5 ghante 😂",
  "Ek bachhe ne pucha: papa online kitne hote hai? Papa: online 40 lakh. Bachha: phir shop khali kyu? Papa: sab phone pe hai 😂",
  "Ek aadmi ne apni biwi se pucha: kya tum mujhe chhod dogi? Biwi: nahi. Aadmi: toh mobile kyu dekhti ho 😂",
  "Ek aadmi ne mirror me dekha, bola — bhai tu handsome hai. Mirror toot gaya 😂",
  "Ek aadmi ne gym join kiya, 1 din baad chhod diya. Kyunki aaina dikha diya 😂",
  "Ek aadmi ne apni biwi se pucha: mai kaisa hu? Biwi: iPhone se acha. Aadmi: naya dilwa do 😂",
  "Ek aadmi ne 5 rupaye ka pen kharida, likha — Ambani. Pen khatam ho gaya 😂",
  "Ek aadmi ne Instagram pe 1 lakh followers kamaye, phir pata chala — bot hai 😂",
  "Ek aadmi ne apni biwi se kaha: tumhare bina mai jee nahi sakta. Biwi: accha, thoda try karo 😂"
];

// ============================================================
// FLIRT (150 entries)
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
  "Tere bina kuch nahi, tu hi sab kuch 💗",
  "Teri baahon me kho jana chahta hu 💞",
  "Tumhari aankhon me duniya basi hai 🌠",
  "Tere ishq ka nasha chadhta ja raha hai 🍷",
  "Mujhe teri har baat yaad rehti hai 💭",
  "Tumhari smile meri sabse badi kamai hai 💰💗",
  "Tere labon ki mithaas chakhni hai 🍯",
  "Tumhari baahon me aa jana chahta hu 🫂",
  "Mera dil kehta hai bas tumhi ho 💓",
  "Tumse door rehna mushkil hai 🥺",
  "Teri har ada qayamat hai 😘",
  "Tumhare bina kuch maza nahi aata 💔",
  "Tumhari aankhon ke aage sab fizool hai 💫",
  "Meri rooh tumhari hai, jaan bhi teri 💝",
  "Tumhari hansi mere jeevan ki roshni hai ☀️",
  "Tere liye toh hum kuch bhi kar jaaye ❤️",
  "Tumhare khwabon me khoya rahta hu har raat 🌙",
  "Tumhari baahon me sukoon hai, jaan 🫂",
  "Tumhari ek jhalak pe hum marte hai 😍",
  "Tere naam ke bina kuch accha nahi lagta 💕",
  "Tumhari har baat me pyaar hai 💗",
  "Tere liye duniya se lad jaunga ⚔️",
  "Tumhari aankhon me apna ghar dekha 🏠",
  "Meri jaan tum ho, mera chain tum ho 💫",
  "Tere labon pe mera naam likh du 💋",
  "Tumhari baaton me mithaas hai 🍯",
  "Tere ishq me jal jaana chahta hu 🔥",
  "Meri har khushi tumse hai 💗",
  "Tumhare saath jeena chahta hu 🌸",
  "Teri hansi ke liye kuch bhi karunga 💕",
  "Tumhari aankhon ka nasha utar nahi raha 🍷",
  "Tere khwabon me kho jana chahta hu 💭",
  "Meri saanso me tera naam hai 💓",
  "Tumhari baahon me sukoon hai 🌙",
  "Tere pyaar me pagal hu mai 🥰",
  "Tumhari zulfon me ulajhna chahta hu 🌹",
  "Mera dil tumhara hai, jaan bhi tumhari 💝",
  "Tere labon ki mithaas chakhni hai 💋",
  "Tumhari har baat dil se lagti hai 💗",
  "Tere saath har pal jannat hai ✨",
  "Meri zindagi ka tu hi savera hai 🌅",
  "Tumhari nazron me kho jata hu 💫",
  "Tere ishq me fanaa ho gaya 🕊️",
  "Tumhari baahon me dam ghut jaye 🔥",
  "Tere naam pe likhi har shayari 📖",
  "Meri jaan tum ho, mera sukoon tum ho 💗",
  "Tumhari aankhon me khoya rahta hu 😵‍💫",
  "Tere labon pe muskaan bani rahe 😊",
  "Meri zindagi tumhari hai, jaan bhi tumhari 💝",
  "Tumhari har ada pe marta hu 😍",
  "Tere liye toh kuch bhi 🎁",
  "Meri rooh tumhare naam 💕",
  "Tumhari baahon me kho jana chahta hu 🫂",
  "Tere pyaar ka sahara mila hai 🤲",
  "Tumhari baaton me jaadu hai ✨",
  "Mera dil tumse juda hai 💓",
  "Tere bina sab soona hai 🌙"
];

// Flirt combos (4032 combinations)
const F_OPEN = [
  "Arre babu 😍","Oye sona 💋","Haan jaan 🥰","Bolo cutie 😘",
  "Oye jaana 💕","Suno jaaneman 💗","Dekho sona 🥺","Aao baby 😏",
  "Haan shona 💖","Oye honey 🍯","Bolo jaanu 💝","Haan sweetheart 🌸",
  "Arre jaana 🥰","Oye jaanu 💕","Haan babu 😏","Suno sona 💗"
];
const F_BODY = [
  "tumhari ek smile pe hum mar mitte hai","tumhara naam lete hi muskaan aa jaati hai",
  "tumse baat karke dil khush ho jata hai","tumhari aankhon me kho jata hu",
  "tumhare baare me sochte rehta hu","tumhari yaad me bechain rehta hu",
  "tumse milke lagta hai jannat mil gayi","tumhare pyaar me pagal ho gaya hu",
  "tumhari baahon me kho jana chahta hu","tumhari har baat dil se lagti hai",
  "tumhare khwabon me khoya rehta hu","tumhari zulfon me ulajhna chahta hu",
  "tumhare labon ki mithaas chakhni hai","tumhari baaton me jaadu hai",
  "tumhare ishq ka nasha chadhta hai","tumhari hansi meri saans hai",
  "tumse door rehna mushkil hai","tumhari ek jhalak pe hazaro dil qurban"
];
const F_END = [
  "💕","💗","💖","💘","🥰","😘","😍","❤️","💞","💓","🌹","✨","💝","🌸"
];

// ============================================================
// AUTO REPLIES (Multi-language)
// ============================================================
const AUTO = {
  hi: ["Hii jaan 💕","Hello babu 🥰","Hii sona 😘","Heyy cutie 💗","Hii ji ❤️"],
  hello: ["Hello babu 🥰","Hello ji 💕","Hello sona 😘"],
  hii: ["Hiiii jaan 💕🥰","Hiiii babu 😍","Hiiii sona 💗"],
  hiii: ["Hiiii jaan 💕🥰","Hiiii babu 😍","Hiiii sona 💗"],
  hey: ["Heyy babu 🥰","Hey jaan 💕","Hey cutie 😘"],
  heyy: ["Heyy babu 🥰","Hey jaan 💕","Hey cutie 😘"],
  "kese ho": ["Mai mast hu babu 💕 tum batao?","First class 😎 tum sunao","Theek hu sona 🥰","Ekdam badhiya 💗"],
  "kaise ho": ["Mai badhiya hu jaan 😊","Mast hu babu 💕","Theek hu cutie 🥰"],
  "kya haal": ["Haal mast hai babu 💕","Sab badhiya jaan 😊","Achha hai sona 🥰"],
  "i love you": ["I love you too jaan 💝","Aww babu 🥰 mai bhi","Love you too sona 💗","Tumse bahut pyaar karta hu 💕"],
  "love you": ["Love you too jaan 💝","Aww 🥰 mujhe bhi","Sona 💕 same to you"],
  "love u": ["Love u too jaan 💕","Aww babu 🥰","Mai bhi 💗"],
  "i luv u": ["Luv u too sona 💕","Aww cutie 🥰","Mujhe bhi jaan 💗"],
  kiss: ["Muaaah 😘💋","Smooch 💕😘","Aww babu 😘","Mwah 😘 jaan"],
  kisses: ["Muaaah muaaah 😘😘","Kisses 💋💕","Sona 😘 le lo"],
  hug: ["Big hug 🤗💕","Aao jhappi 🫂😘","Hug you too babu 🤗"],
  hugs: ["Hugs and kisses 🤗😘💕","Aao babu jhappi 🤗","Warm hugs sona 🫂"],
  mwah: ["Mwah 💋😘","Aww 😘 mwah tumhe bhi","Mwah mwah jaan 💕"],
  muaah: ["Muaah 💋🥰","Aww babu 😘","Muaah muaah sona 💕"],
  "miss you": ["Awww babu 💕","Miss you too jaan 🥺","Itni yaad aati hai toh roz aaya karo 🥰","Mujhe bhi miss kiya 😘"],
  "missing you": ["Aww babu 💕 same here","Missing you too sona 🥺","Aa jao paas cutie 💗"],
  "yaad aa rahi": ["Aww babu 💕 mujhe bhi","Itni yaad aati hai toh aaya karo 🥰","Hamesha yaad karta hu jaan 😘"],
  "tum handsome": ["Shukriya babu 💕","Aww jaan 🥰 tumhari nazar","Thanks sona 😘 tum bhi cute ho"],
  "tum cute": ["Aww babu 🥰 tum toh sabse cute ho","Shukriya jaan 💕","Thanks cutie 😘"],
  "tum best": ["Shukriya babu 💕","Aww jaan 🥰","Thanks sona 😘 tum bhi best ho"],
  bore: ["Bore ho babu? 🥺 aao baat kare","Kyu bore ho sona? mai hu na 💕","Bolo kya karu jaan 😘","Chalo kuch karte hai 💗"],
  udaas: ["Aww babu 💕 kyu udaas ho?","Udaas mat ho jaan 🥺","Mai hu na tumhare saath 😘","Aao baat kare 💗"],
  sad: ["Kya hua babu 🥺","Sad mat ho jaan 💕","Aaja gale lag 💗"],
  happy: ["Bahut achha laga sunke 💕","Khushi tumhari meri khushi 🥰","Yahi chahiye sona 😘"],
  khush: ["Achha laga sunke 💕","Khush ho toh mai bhi khush 🥰","Best news sona 😘"],
  gussa: ["Aww babu 💕 gussa kyu?","Naraz ho jaan? 🥺","Aao baat kare sona 😘","Mera babu gussa 🥺"],
  naraz: ["Aww jaan 💕 maaf kar do","Naraz mat ho babu 🥺","Mai manata hu sona 😘"],
  "good morning": ["Good morning jaan ☀️","GM babu 🌅 khana khaya?","Subah bakhair sona ☀️💕","GM cutie 🌸"],
  gm: ["GM babu ☀️💕","Good morning jaan 🌅","Subah bakhair sona ☀️"],
  "good night": ["Good night jaan 🌙","GN babu 😴 meetha sapna","So jao sona 💕","Shubh ratri cutie 🌙"],
  gn: ["GN babu 🌙💕","Good night jaan 😴","So jao sona 🌙"],
  "good afternoon": ["Good afternoon babu 🌤️","GA jaan 💕","Afternoon sona 😘"],
  "good evening": ["Good evening babu 🌆","GE jaan 💕","Evening sona 😘"],
  "khana khaya": ["Nahi babu 💕 tumhare saath khata toh maza aata","Haan jaan 😊 tumne khaya?","Abhi nahi sona, tum bolo?"],
  lunch: ["Lunch ho gaya babu 🍽️","Abhi nahi jaan 😋","Haan sona khaya 💕"],
  dinner: ["Dinner ka time babu 🍽️","Kya banaya jaan 😋","Haan sona khaya 💕"],
  chai: ["Chai toh meri jaan ☕💕","Chai pe charcha babu 😌","Chai bolo toh jaan de du ☕😘"],
  coffee: ["Coffee jaan ☕💕","Coffee aur tum 😍","Aao coffee peete hai babu ☕"],
  thanks: ["Arey koi baat nahi 💕","Welcome jaan 😊","Anytime sona 😘"],
  thankyou: ["Welcome jaan 💕","Koi baat nahi babu 😊","Anytime sona 😘"],
  "thank you": ["Arey babu 💕","Welcome jaan 😊","Anytime sona 😘"],
  sorry: ["Koi baat nahi babu 💕","Arey jaan 🥰 sorry mat bolo","Maaf kiya sona 😘"],
  maaf: ["Maaf kiya jaan 💕","Koi baat nahi babu 😊","Chhodo sona 😘"],
  bye: ["Bye babu 💕 jaldi aana","Alvida jaan 🥰","Bye bye sona 😘"],
  "good bye": ["Good bye babu 💕","Bye jaan 🥰","Alvida sona 😘"],
  alvida: ["Alvida jaan 💕","Bye babu 🥰","Tata sona 😘"],
  "kya kar rahe": ["Tumhari yaad kar raha tha 💕","Kuch nahi jaan 🥰","Bas tumse baat karne ka mann tha 😘"],
  "kya kar rahi": ["Tumhari yaad kar rahi 💕","Tumhare msg ka wait 🥰","Bas tumse baat karne ka mann 😘"],
  "kya hua": ["Kuch nahi babu 💕","Bas aise hi jaan 😊","Kuch khaas nahi sona 💗"],
  "kya hai": ["Kuch nahi jaan 💕","Bas tumhari yaad 😊","Kuch khaas nahi babu 💗"],
  "kya kare": ["Bolo na jaan 💕","Kya karna hai babu? 🥰","Batao sona 😘"],
  song: ["Kaunsa song babu? 🎵","Bolo jaan 🎶","Kaunsa gaana sunau sona? 🎤"],
  music: ["Kaunsa music babu? 🎵","Bolo jaan 🎶","Music ka naam likho sona 🎤"],
  "tumhara naam": ["Mera naam RK RAJA XWD hai 💕","RK RAJA XWD jaan 😘","Mai RK RAJA XWD hu sona 🥰"],
  "kaun ho": ["Mai RK RAJA XWD hu babu 💕","RK RAJA XWD jaan 😘"],
  "tumhari age": ["Mai hamesha jawaan hu 😉","Age kya puchte ho jaan 💕","Dil se jawaan hu sona 🥰"],
  single: ["Ab tum aaye ho toh single kaise rahunga 😏","Tumhare liye single hu jaan 😘","Single hu babu 🥰"],
  babu: ["Haan babu 💕 bolo","Kya hua babu 🥰","Bolo na babu 😊"],
  sona: ["Haan sona 💗 bolo","Kya hua sona 🥰","Bolo sona 😘"],
  jaan: ["Haan jaan 💕 bolo","Kya hua jaanu 🥰","Bolo jaan 😘"],
  jaanu: ["Haan jaanu 💕","Kya hua jaan 🥰","Bolo na 😘"],
  cutie: ["Haan cutie 💕","Kya hua cutie 🥰","Bolo cutie 😘"],
  baby: ["Haan baby 💕","Kya hua babe 🥰","Bolo baby 😘"],
  dear: ["Haan dear 💕","Kya hua darling 🥰","Bolo honey 😘"],
  honey: ["Haan honey 🍯💕","Kya hua jaan 🥰","Bolo sona 😘"],
  darling: ["Haan darling 💕","Kya hua jaan 🥰","Bolo sona 😘"],
  sweetheart: ["Haan sweetheart 💕","Kya hua jaan 🥰","Bolo sona 😘"],
  // Devanagari
  "नमस्ते": ["नमस्ते जी 🙏💕","नमस्ते बाबू 🥰","हैलो जान 😘"],
  "कैसे हो": ["मैं मस्त हूँ बाबू 💕","ठीक हूँ जान 🥰","बढ़िया सोना 😘"],
  "क्या हाल": ["हाल मस्त है बाबू 💕","सब बढ़िया जान 😊","अच्छा है सोना 🥰"],
  "आई लव यू": ["आई लव यू टू जान 💝","मैं भी बाबू 🥰","लव यू सोना 💗"],
  "शायरी": ["शायरी सुनो जान 💕","ये लो बाबू 🥰"],
  "गुड मॉर्निंग": ["गुड मॉर्निंग जान ☀️","सुप्रभात बाबू 🌅"],
  "गुड नाइट": ["गुड नाइट जान 🌙","शुभ रात्रि बाबू 😴"],
  "थैंक यू": ["कोई बात नहीं बाबू 💕","वेलकम जान 😊"],
  "सॉरी": ["कोई बात नहीं बाबू 💕","माफ़ किया सोना 😘"],
  // Urdu
  "السلام علیکم": ["وعلیکم السلام جان 🌙💕","سلام جی 🥰","خوش آمدید بابو 😘"],
  "کیسے ہو": ["میں ٹھیک ہوں جان 💕","مست ہوں بابو 🥰"],
  "شکریہ": ["کوئی بات نہیں بابو 💕","خوش آمدید جان 😊"],
  "محبت": ["محبت تو ہے جان 💕","عشق ہے بابو 🥰"],
  // Bengali
  "কেমন আছো": ["আমি ভালো আছি জান 💕","ভালো বাবু 🥰"],
  "ধন্যবাদ": ["কোনো ব্যাপার না বাবু 💕","স্বাগতম জান 😊"],
  // Tamil
  "எப்படி இருக்கிறாய்": ["நான் நலமாக இருக்கிறேன் ஜான் 💕","நல்லா பாபு 🥰"],
  "நன்றி": ["பரவாயில்லை பாபு 💕","வரவேற்பு ஜான் 😊"]
};

// ============================================================
// EMOJI REPLIES
// ============================================================
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
  "😴": ["So jao babu 😴","Good night jaan 🌙"],
  "🍫": ["Chocolate? Mujhe bhi 🍫💕","Sona 🍫😘"],
  "🌸": ["Phool? Mere liye? 🌸💕","Aww sona 🥰"],
  "🌹": ["Rose? Mujhe? 🌹💕","Aww jaan 🥰"]
};

// ============================================================
// WELCOME
// ============================================================
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
  "Chand laaya hai roshni,\nAap laaye ho khushi 💫😍",
  "Dil ki gehrai se swagat hai,\nAap jaise mehman se mehfil saji hai 🌸💕",
  "Aapke aane se roshni aayi,\nAapke aane se khushi aayi 🌟✨",
  "Mehman ban ke aaye ho,\nDil me ghar bana gaye ho 🏠💗",
  "Naya chehra, nayi khushi,\nAapke aane se badhi ye mehfil 💐🎉",
  "Khushiyon ka tohfa laaye ho,\nApni smile se mehka gaye ho 😊💕"
];

const WELCOME_HEADERS = [
  "🎉 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🎉",
  "🌸 𝐒𝐖𝐀𝐆𝐀𝐓 𝐇𝐀𝐈 🌸",
  "💐 𝐊𝐇𝐔𝐒𝐇 𝐀𝐀𝐌𝐃𝐄𝐄𝐃 💐",
  "✨ 𝐍𝐀𝐘𝐄 𝐌𝐄𝐇𝐌𝐀𝐀𝐍 ✨",
  "🌟 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐉𝐀𝐀𝐍 🌟",
  "🥳 𝐒𝐖𝐀𝐆𝐀𝐓 𝐇𝐀𝐈 𝐁𝐀𝐁𝐔 🥳",
  "🎊 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐆𝐑𝐎𝐔𝐏 🎊",
  "💖 𝐒𝐖𝐀𝐆𝐀𝐓 𝐇𝐀𝐈 𝐉𝐀𝐀𝐍 💖",
  "🌺 𝐍𝐀𝐘𝐀 𝐌𝐄𝐌𝐁𝐄𝐑 🌺",
  "💫 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐁𝐀𝐁𝐔 💫"
];

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================
let _lastShayari = -1;
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

let _lastFlirt = -1;
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
  const n = String(text || "").toLowerCase().trim();
  if (!n) return null;
  if (AUTO[n]) return rand(AUTO[n]);
  for (const key of Object.keys(AUTO)) {
    if (key.includes(" ")) {
      if (n.includes(key)) return rand(AUTO[key]);
    }
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
    "Kya hua babu? 💕 batao na","Haan bolo jaan 🥰","Kya kehna chahte ho sona? 😘","Bolo babu, mai sun raha hu 💗"
  ]);
  return null;
}

function getWelcomeShayari() { return rand(WELCOME_SHAYARI); }
function getWelcomeHeader() { return rand(WELCOME_HEADERS); }

module.exports = {
  detectLang,
  SHAYARI_BASE, JOKES_BASE, FLIRT_BASE, AUTO, EMOJI_REPLIES,
  WELCOME_SHAYARI, WELCOME_HEADERS,
  getShayari, getJoke, getFlirt, getAutoReply,
  getWelcomeShayari, getWelcomeHeader, rand
};
