const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DATA = path.join(__dirname, "data");

function load(name) {
    try {
        return JSON.parse(
            fs.readFileSync(path.join(DATA, name), "utf8")
        );
    } catch {
        return [];
    }
}

const replies = load("replies.json");
const jokes = load("jokes.json");
const shayari = load("shayari.json");
const flirt = load("flirt.json");
const commands = load("commands.json");

const users = new Map();

let botRunning = false;

function log(message) {
    console.log(message);
    io.emit("botlog", message);
}

function random(arr) {
    if (!Array.isArray(arr) || !arr.length) return "";
    return arr[Math.floor(Math.random() * arr.length)];
}

function getUser(id) {
    id = String(id || "guest");

    if (!users.has(id)) {
        users.set(id, {
            id,
            name: "RK Raja User",
            xp: 0,
            level: 1,
            messages: 0
        });
    }

    return users.get(id);
}

function addXP(id, amount = 10) {
    const user = getUser(id);

    user.xp += amount;
    user.messages++;

    const required = user.level * 100;

    if (user.xp >= required) {
        user.xp -= required;
        user.level++;

        log(`🎮 ${user.name} reached Level ${user.level}`);
    }

    return user;
}

function processMessage(userId, name, message) {
    const text = String(message || "").trim();
    const lower = text.toLowerCase();

    const user = getUser(userId);
    user.name = name || user.name;

    addXP(userId, 10);

    if (lower === "/help" || lower === "/menu") {
        return commands;
    }

    if (lower === "/ping") {
        return "🏓 Pong! RK RAJA Masti Bot online hai 😎";
    }

    if (lower === "/bot") {
        return "🤖 RK RAJA MASTI BOT\n👑 Deployed By: RK RAJA";
    }

    if (lower === "/owner") {
        return "👑 BOT OWNER: RK RAJA\n💖 Powered by RK RAJA Masti Bot";
    }

    if (lower === "/level" || lower === "/xp") {
        return `🎮 ${user.name}\n⭐ Level: ${user.level}\n✨ XP: ${user.xp}/${user.level * 100}\n💬 Messages: ${user.messages}`;
    }

    if (lower === "/rank") {
        let rank = "🌱 Masti Newbie";

        if (user.level >= 5) rank = "🔥 Masti Pro";
        if (user.level >= 10) rank = "👑 Masti King";
        if (user.level >= 20) rank = "💎 Masti Legend";

        return `👤 ${user.name}\n🏆 Rank: ${rank}\n⭐ Level: ${user.level}`;
    }

    if (lower === "/stats") {
        return `📊 RK RAJA BOT STATS\n\n👥 Users: ${users.size}\n🤖 Status: ${botRunning ? "ONLINE 🟢" : "OFFLINE 🔴"}\n💬 Your Messages: ${user.messages}\n⭐ Level: ${user.level}`;
    }

    if (lower === "/joke") {
        return "😂 " + random(jokes);
    }

    if (lower === "/shayari") {
        return "🌹 " + random(shayari);
    }

    if (lower === "/flirt") {
        return "😘 " + random(flirt);
    }

    if (lower === "/masti") {
        return "😎 " + random(replies);
    }

    if (lower === "/goodmorning") {
        return "🌅 Good Morning " + user.name + " ❤️\nAaj ka din RK RAJA wali masti ke naam! 😎";
    }

    if (lower === "/goodnight") {
        return "🌙 Good Night " + user.name + " ❤️\nSweet dreams aur kal phir masti! 😴";
    }

    if (lower === "/welcome") {
        return `🎉 Welcome ${user.name}!\n🤖 RK RAJA Masti Bot me swagat hai ❤️`;
    }

    if (lower === "/rules") {
        return "📜 MASTI RULES\n1️⃣ Respect rakho\n2️⃣ Spam mat karo\n3️⃣ Masti karo 😎\n4️⃣ Enjoy RK RAJA BOT ❤️";
    }

    if (lower.includes("joke")) {
        return "😂 " + random(jokes);
    }

    if (lower.includes("shayari")) {
        return "🌹 " + random(shayari);
    }

    if (
        lower.includes("hello") ||
        lower.includes("hi") ||
        lower.includes("hii") ||
        lower.includes("hey")
    ) {
        return "👋 Hello " + user.name + " 😎\nRK RAJA Masti Bot yahin hai ❤️";
    }

    if (lower.includes("love")) {
        return "❤️ Love mode activated!\nRK RAJA Masti Bot ke saamne dil sambhal ke 😜";
    }

    if (lower.includes("kaun") && lower.includes("bot")) {
        return "🤖 Main RK RAJA Masti Bot hoon 👑";
    }

    return "😎 " + random(replies);
}

app.get("/api/status", (req, res) => {
    res.json({
        running: botRunning,
        owner: "RK RAJA",
        users: users.size,
        replyCount:
            replies.length +
            jokes.length +
            shayari.length +
            flirt.length
    });
});

app.post("/api/bot/start", (req, res) => {
    botRunning = true;
    log("🟢 RK RAJA Masti Bot started");
    res.json({ ok: true, running: true });
});

app.post("/api/bot/stop", (req, res) => {
    botRunning = false;
    log("🔴 RK RAJA Masti Bot stopped");
    res.json({ ok: true, running: false });
});

app.post("/api/message", (req, res) => {
    if (!botRunning) {
        return res.status(400).json({
            ok: false,
            error: "Bot is OFF"
        });
    }

    const {
        userId,
        name,
        message
    } = req.body;

    const reply = processMessage(
        userId,
        name,
        message
    );

    log(`💬 ${name || userId}: ${message}`);
    log(`🤖 RK RAJA BOT: ${reply}`);

    io.emit("reply", {
        userId,
        name,
        message,
        reply
    });

    res.json({
        ok: true,
        reply
    });
});

app.post("/configure", (req, res) => {
    log("⚙️ Configuration received");

    res.send(
        "RK RAJA Masti Bot configuration saved. " +
        "Account/session credentials are not stored by this demo."
    );
});

io.on("connection", socket => {
    socket.emit("botlog", "🤖 RK RAJA Masti Bot connected");

    socket.on("testMessage", data => {
        if (!botRunning) return;

        const reply = processMessage(
            data.userId || "demo",
            data.name || "Demo User",
            data.message || "hello"
        );

        socket.emit("reply", {
            reply
        });
    });
});

server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════╗
║     RK RAJA MASTI BOT           ║
║     Server running              ║
║     Port: ${PORT}                    ║
╚══════════════════════════════════╝
`);
});
