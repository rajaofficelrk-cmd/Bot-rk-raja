// replies.js — RK RAJA MASTI BOT ka saara reply data
// Yaha se shayari, joke, flirt, auto-reply sab aata hai

// ==================================================
// =============== SHAYARI (Hindi + Urdu) ===========
// ==================================================
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
  "Tujhe apna banaana chahta hu,\nTere sang jeevan bitaana chahta hu 💕",
  "Rab se maangi thi ek dua,\nTune diya mujhe khud ko saja 🎀",
  "Zindagi ki kitaab me tu panna hai,\nHar lafz me bas tera hi ranna hai 📖",
  "Khwabon ka shehar basa lu tujhse,\nApni duniya saja lu tujhse 🏙️",
  "Tere sang bitaye har lamha yaadgaar,\nTere bina har din lagta hai bhhaar 💔",
  "Aankhon me teri nami si hai,\nDil me meri kami si hai 🥺",
  "Tera chehra dekhu toh sukoon milta hai,\nTere naam se dil ko noor milta hai ✨",
  "Sitaron se bhi pucha tera pata,\nUnhone kaha dil me hai tera basera 💫",
  "Raat ki tanhai me teri yaad aati hai,\nChand bhi puche tera hi naam sunati hai 🌙"
];

// ==================================================
// =============== JOKES (Hindi + Urdu) =============
// ==================================================
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
  "Ek aadmi ne Google pe pucha: khoobsurat kaise bane? Google: mirror dekhna band kar do 😂"
];

// ==================================================
// =============== FLIRT (Hindi + Urdu) =============
// ==================================================
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
  "Tumhari baahon me sukoon hai, jaan 🫂"
];

// ==================================================
// ======== AUTO REPLIES (No-prefix friendly) =======
// ==================================================
const AUTO_REPLY_RULES = [
  {
    keys: ['hello','hii','hiii','helo','hlo','hey'],
    replies: [
      "Hello babu! 😊 Kya haal hai? Bolo kya hua kuch kaam tha? 💕",
      "Hiii jaan 💗 aagya mai, bolo kya chahiye?",
      "Hello sona 🥰 kaise ho? Kuch kehna tha?",
      "Hi cutie 😘 mai ready hu, bolo kya karna hai?",
      "Hey babu 💕 bolo na kya baat hai?"
    ]
  },
  {
    keys: ['kaise ho','kese ho','kaisi ho','kya haal','kya hal','kaisa hai'],
    replies: [
      "Main toh mast hu babu, tum batao? 💕",
      "Bilkul first class 😎 tum sunao, kya chal raha hai?",
      "Main theek hu jaan, tumhari yaad aa rahi thi 🥰",
      "Ekdam badhiya sona, tumhara kya haal? 😘",
      "Sab changa si jaan 💗 tum batao?"
    ]
  },
  {
    keys: ['kya hua','kya hai','kya hua kuch','kuch kehna','kuch bolna'],
    replies: [
      "Kuch nahi babu, bas tumhari yaad aa rahi thi 💕",
      "Bas aise hi, tum batao kya hua? 😊",
      "Kuch khaas nahi jaan, tum sunao? 💗",
      "Kya hua sona? Batao na mujhe 😘",
      "Kuch nahi jaan, tumhare liye free hu 💕"
    ]
  },
  {
    keys: ['kya kar rahe','kya kr rahe','kya kar rahi','kya kar rhe'],
    replies: [
      "Tumhari yaad kar raha tha babu 💕",
      "Kuch khaas nahi, tumhare msg ka wait 🥰",
      "Bas tumse baat karne ka mann tha 😘",
      "Kuch nahi sona, tum batao? 💗",
      "Tumhare baare me soch raha tha 😌"
    ]
  },
  {
    keys: ['good morning','gm','gud morning','subah'],
    replies: [
      "Good morning jaan ☀️ aaj ka din tumhara ho 💕",
      "Subah bhi roshan ho gayi tumhari yaad se 🌸",
      "GM babu 😘 khana khaya?",
      "Good morning sona 🥰 aaj toh tumhara din hai",
      "Subah bakhair jaan ☀️ kaise ho?"
    ]
  },
  {
    keys: ['good night','gn','gud night','shubh ratri'],
    replies: [
      "Good night jaan 🌙 sapno me aana 💕",
      "GN babu 😘 meetha sapna dekhna",
      "So jao sona, kal milte hai 💗",
      "Good night cutie 🥰 chain se sona",
      "Shubh ratri jaan 🌙 khwabon me milte hai"
    ]
  },
  {
    keys: ['khana khaya','khaana khaya','lunch','dinner','khana'],
    replies: [
      "Nahi babu, tumhare saath khata toh maza aata 🍽️💕",
      "Abhi khaya nahi, tum bolo kya khaya? 😊",
      "Haan jaan khaya, tumne khaya? 🥰",
      "Tumhare haath ka khana khane ka mann hai 😋",
      "Khaya nahi, tumhare intezaar me hu 🍽️"
    ]
  },
  {
    keys: ['bore ho raha','bore ho rahi','boring','bore'],
    replies: [
      "Toh aao baat kare babu 💕 shayari sunau?",
      "Bore ho? Main hu na jaan 😘 'shayari' bol do",
      "Bore kyu ho sona? 'joke' bol do, hasi aa jayegi 😄",
      "Aao baat kare, 'flirt' bol do 🥰",
      "Bore ho toh 'couple' try karo jaan 💑"
    ]
  },
  {
    keys: ['miss kar raha','miss kar rahi','yaad aa rahi','yaad aa raha'],
    replies: [
      "Aww babu 💕 mujhe bhi tumhari bahut yaad aa rahi thi",
      "Main bhi tumhe miss kar raha tha jaan 🥺",
      "Chalo ab toh aa gaya na, baat karo 💗",
      "Itni yaad aati hai toh roz aaya karo sona 🥰",
      "Mujhe bhi yaad thi tumhari jaan 💕"
    ]
  },
  {
    keys: ['thank you','thanks','shukriya','thanku'],
    replies: [
      "Arey koi baat nahi babu 💕 ye toh mera farz hai",
      "Always welcome jaan 😘 tumhare liye toh hum har waqt ready hai",
      "Shukriya mat bolo sona, apne hi ho 🥰",
      "Koi baat nahi jaan, tum khush ho bas 💗"
    ]
  },
  {
    keys: ['bye','goodbye','chalta hu','chalti hu','alvida'],
    replies: [
      "Bye babu 💕 jaldi wapas aana",
      "Chalo jaan, apna khayal rakhna 🥰",
      "Alvida sona, phir milte hai 😘",
      "Bye bye cutie 💗 miss karunga tumhe"
    ]
  }
];

// ==================================================
// ====== DYNAMIC GENERATOR — Hazaaron combos =======
// Har baar call karne pe naya reply dega
// ==================================================

// Shayari ke liye — 2 line ko combine karke naya banata hai
const SHAYARI_LINE1 = [
  "Tere bina ye dil lagta nahi",
  "Teri yaad me khoya rehta hu",
  "Tere naam pe jee raha hu",
  "Teri aankhon me doob gaya hu",
  "Tere ishq me pagal ho gaya",
  "Tera chehra dekhta rahta hu",
  "Tere liye duniya bhula di",
  "Teri baahon me sukoon hai",
  "Tere sang har pal jannat hai",
  "Tujhse milke muskura diya",
  "Tere qadmon me dil rakh diya",
  "Teri hansi meri saans hai",
  "Tera nasha chadhta ja raha",
  "Tere khwabon me kho gaya",
  "Teri zulfon me ulajh gaya",
  "Tere labon ki mithaas chahi",
  "Teri aankhon ka jaadu chal gaya",
  "Tere pyaar ki barish me bheeg gaya",
  "Teri baaton me jaadu sa hai",
  "Tere saath waqt ruk gaya"
];
const SHAYARI_LINE2 = [
  "bas teri hi talash hai 🌸",
  "dil me sirf tera basera 💕",
  "sapne me bhi sirf tu ✨",
  "tere bina kuch nahi 💗",
  "ab toh bas tu hi tu 💘",
  "meri duniya tumse hai 🌍",
  "tere naam ka nasha hai 🍷",
  "tere liye har dua hai 🤲",
  "tere bina soona hai 🌙",
  "teri hansi meri duniya 💫",
  "tere bin kuch accha nahi 🥺",
  "tujhe chahat hai beshumar 💖",
  "tere naam ki roshni hai 🌟",
  "tere pyaar ka sahara hai 🌹",
  "tere saath jeevan hai 💞",
  "tere labon pe jaan hai 💋",
  "tere ishq me fanaa hu 🔥",
  "tere pyaar me kho gaya 🎐",
  "tere bina adhoora hu 💔",
  "tere liye toh kuch bhi 🎁"
];

// Flirt pair generator
const FLIRT_OPEN = [
  "Arre babu 😍","Oye sona 💋","Haan jaan 🥰","Bolo cutie 😘",
  "Oye jaana 💕","Suno jaaneman 💗","Dekho sona 🥺","Aao baby 😏",
  "Haan shona 💖","Oye honey 🍯","Bolo jaanu 💝","Haan sweetheart 🌸"
];
const FLIRT_BODY = [
  "tumhari ek smile pe hum mar mitte hai",
  "tumhara naam lete hi muskaan aa jaati hai",
  "tumse baat karke dil khush ho jata hai",
  "tumhari aankhon me kho jata hu",
  "tumhare baare me sochte rehta hu",
  "tumhari yaad me bechain rehta hu",
  "tumse milke lagta hai jannat mil gayi",
  "tumhare pyaar me pagal ho gaya hu",
  "tumhari baahon me kho jana chahta hu",
  "tumhari har baat dil se lagti hai",
  "tumhare khwabon me khoya rehta hu",
  "tumhari zulfon me ulajhna chahta hu",
  "tumhare labon ki mithaas chakhni hai",
  "tumhari baaton me jaadu hai",
  "tumhare ishq ka nasha chadhta hai"
];
const FLIRT_END = [
  "💕","💗","💖","💘","🥰","😘","😍","❤️","💞","💓","🌹","✨"
];

// ==================================================
// ============== RANDOM HELPERS ====================
// ==================================================
function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ==================================================
// ============== PUBLIC FUNCTIONS ==================
// ==================================================

// Shayari — 200 base + unlimited generated
function getShayari() {
  if (Math.random() < 0.5 && SHAYARI_BASE.length) return rand(SHAYARI_BASE);
  const l1 = rand(SHAYARI_LINE1);
  const l2 = rand(SHAYARI_LINE2);
  return `${l1},\n${l2}`;
}

// Joke — 60 base + duplicate combos
function getJoke() {
  return rand(JOKES_BASE);
}

// Flirt — 100 base + unlimited generated
function getFlirt() {
  if (Math.random() < 0.4 && FLIRT_BASE.length) return rand(FLIRT_BASE);
  const o = rand(FLIRT_OPEN);
  const b = rand(FLIRT_BODY);
  const e = rand(FLIRT_END);
  return `${o} ${b} ${e}`;
}

// Auto reply — keyword match
function getAutoReply(txt) {
  for (const rule of AUTO_REPLY_RULES) {
    for (const k of rule.keys) {
      if (txt.includes(k)) return rand(rule.replies);
    }
  }
  return null;
}

// Flirt word check
const FLIRT_WORDS = [
  'babu','sona','jaan','jaanu','jaana','i love you','love you','pyar',
  'mohabbat','cutie','sweetheart','baby','dear','honey','jaaneman',
  'shona','babu ji','dil','meri jaan','i luv u','love u','babe',
  'jaaneman','janeman'
];
function hasFlirt(txt) {
  return FLIRT_WORDS.some(w => txt.includes(w));
}

// ==================================================
// ================== EXPORTS =======================
// ==================================================
module.exports = {
  getShayari,
  getJoke,
  getFlirt,
  getAutoReply,
  hasFlirt,
  SHAYARI_BASE,
  JOKES_BASE,
  FLIRT_BASE,
  AUTO_REPLY_RULES
};
