const { Sparky, isPublic } = require("../lib");
const fs = require("fs");
const path = require("path");

// 📂 JSON file path
const DATA_FILE = path.join(__dirname, "../database/autoreplies.json");

// 🧠 Load data from file
let autoReplies = [];

function loadData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        }
        autoReplies = JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (err) {
        console.error("Load error:", err);
        autoReplies = [];
    }
}

// 💾 Save data to file
function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(autoReplies, null, 2));
    } catch (err) {
        console.error("Save error:", err);
    }
}

// load on start
loadData();


// --- ADD REPLY ---
Sparky({
    name: "addreply",
    alias: ["ar"],
    category: "tools",
    fromMe: isPublic,
    desc: "Add auto reply keyword"
}, async ({ m, text }) => {
    try {
        const data = text.split(" ").slice(1).join(" ");

        if (!data.includes("|")) {
            return m.reply("❌ Format:\n.addreply keyword|message");
        }

        const [keyword, reply] = data.split("|").map(v => v.trim());

        if (!keyword || !reply) {
            return m.reply("❌ Invalid format!");
        }

        // check duplicate
        const exists = autoReplies.find(r => r.keyword === keyword.toLowerCase());
        if (exists) {
            return m.reply("⚠️ This keyword already exists!");
        }

        autoReplies.push({
            keyword: keyword.toLowerCase(),
            reply
        });

        saveData();

        return m.reply(
            `✅ Saved permanently!\n\n🔑 Keyword: ${keyword}\n💬 Reply: ${reply}`
        );

    } catch (err) {
        console.error(err);
        m.reply("❌ Error adding reply");
    }
});


// --- DELETE REPLY ---
Sparky({
    name: "delreply",
    alias: ["dr"],
    category: "tools",
    fromMe: isPublic,
    desc: "Delete auto reply keyword"
}, async ({ m, text }) => {
    try {
        const key = text.split(" ").slice(1).join(" ").toLowerCase();

        if (!key) {
            return m.reply("❌ Usage:\n.delreply keyword");
        }

        const before = autoReplies.length;

        autoReplies = autoReplies.filter(r => r.keyword !== key);

        if (before === autoReplies.length) {
            return m.reply("❌ Keyword not found!");
        }

        saveData();

        return m.reply(`🗑️ Deleted permanently: ${key}`);

    } catch (err) {
        console.error(err);
        m.reply("❌ Error deleting reply");
    }
});


// --- AUTO REPLY LISTENER ---
Sparky({
    on: "text",
    fromMe: isPublic
}, async ({ m, text }) => {
    try {
        if (!text) return;

        const msg = text.toLowerCase();

        for (const rule of autoReplies) {
            if (msg.includes(rule.keyword)) {
                return await m.reply(rule.reply);
            }
        }

    } catch (err) {
        console.error("AutoReply Error:", err);
    }
});
