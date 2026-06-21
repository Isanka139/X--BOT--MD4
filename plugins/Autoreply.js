const { Sparky, isPublic } = require("../lib");
const fs = require("fs");
const path = require("path");

// 📂 ප්ලගින් එක තියෙන තැනම ආරක්ෂිතව ෆයිල් එක හදමු
const DATA_FILE = path.join(__dirname, "autoreplies_v2.json");

// 🧠 Memory cache
let autoReplies = [];

// -------------------------
// LOAD DATA (දත්ත කියවීම)
// -------------------------
function loadData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
            autoReplies = [];
            return;
        }
        const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
        if (!fileContent.trim()) {
            autoReplies = [];
        } else {
            autoReplies = JSON.parse(fileContent);
        }
    } catch (err) {
        console.error("❌ [AutoReply] Load error:", err);
        // Error එකක් ආවොත් පරණ දත්ත මැකෙන්න නොදී බේරගන්නවා
    }
}

// -------------------------
// SAVE DATA (දත්ත සුරැකීම)
// -------------------------
function saveData() {
    try {
        const dataToSave = JSON.stringify(autoReplies, null, 2);
        fs.writeFileSync(DATA_FILE, dataToSave, "utf-8");
    } catch (err) {
        console.error("❌ [AutoReply] Save error:", err);
    }
}

// Start වෙද්දීම load කරගන්නවා
loadData();

// ======================================================
// ➕ ADD AUTO REPLY (OWNER ONLY)
// ======================================================
Sparky({
    name: "addreply",
    alias: ["ar"],
    category: "tools",
    fromMe: true, // දැන් Command locked වෙන්නේ නැහැ, ඔයාට විතරක් වැඩ කරයි
    desc: "Add auto reply keyword"
}, async ({ m, text }) => {
    try {
        let inputBody = text || m.text || m.body || "";
        
        if (inputBody.startsWith(".")) {
            inputBody = inputBody.replace(/^\.\w+\s+/, "");
        }

        const input = inputBody.trim();

        if (!input.includes("|")) {
            return m.reply("❌ Usage:\n.addreply keyword|message");
        }

        const parts = input.split("|");
        const keyword = parts[0].trim().toLowerCase();
        const reply = parts.slice(1).join("|").trim();

        if (!keyword || !reply) {
            return m.reply("❌ Keyword or reply missing!");
        }

        loadData(); // අලුත්ම දත්ත කියවනවා
        
        const exists = autoReplies.find(r => r.keyword === keyword);
        if (exists) {
            return m.reply("⚠️ This keyword already exists!");
        }

        autoReplies.push({
            keyword,
            reply,
            createdAt: Date.now()
        });

        saveData(); // සුරැකීම සිදු කරනවා

        return m.reply(
            `✅ Auto reply saved!\n\n🔑 Keyword: ${keyword}\n💬 Reply: ${reply}`
        );

    } catch (err) {
        console.error("AddReply Error:", err);
        m.reply("❌ Error adding reply: " + err.message);
    }
});


// ======================================================
// 🗑️ DELETE AUTO REPLY (OWNER ONLY)
// ======================================================
Sparky({
    name: "delreply",
    alias: ["dr"],
    category: "tools",
    fromMe: true, // Owner Only
    desc: "Delete auto reply keyword"
}, async ({ m, text }) => {
    try {
        let inputKey = text || m.text || m.body || "";
        if (inputKey.startsWith(".")) {
            inputKey = inputKey.replace(/^\.\w+\s+/, "");
        }

        const key = inputKey.trim().toLowerCase();

        if (!key) {
            return m.reply("❌ Usage:\n.delreply keyword");
        }

        loadData();
        const before = autoReplies.length;
        autoReplies = autoReplies.filter(r => r.keyword !== key);

        if (before === autoReplies.length) {
            return m.reply("❌ Keyword not found!");
        }

        saveData();
        return m.reply(`🗑️ Deleted auto reply for: ${key}`);

    } catch (err) {
        console.error("DelReply Error:", err);
        m.reply("❌ Error deleting reply");
    }
});


// ======================================================
// 📜 LIST AUTO REPLIES (OWNER ONLY)
// ======================================================
Sparky({
    name: "listreply",
    alias: ["lr"],
    category: "tools",
    fromMe: true, // Owner Only
    desc: "Show all auto replies"
}, async ({ m }) => {
    try {
        loadData();

        if (!autoReplies.length) {
            return m.reply("📭 No auto replies found!");
        }

        let msg = "📌 *AUTO REPLIES LIST*\n\n";
        autoReplies.forEach((r, i) => {
            msg += `${i + 1}. 🔑 *${r.keyword}* ➜ 💬 ${r.reply}\n\n`;
        });

        return m.reply(msg);

    } catch (err) {
        console.error("ListReply Error:", err);
        m.reply("❌ Error fetching list");
    }
});


// ======================================================
// 🤖 AUTO REPLY LISTENER
// ======================================================
Sparky({
    on: "text",
    fromMe: isPublic
}, async ({ m }) => {
    try {
        const rawText = m.body || m.text || "";
        const msg = rawText.toLowerCase().trim();
        
        if (!msg || msg.startsWith(".")) return;

        loadData(); // හැම වෙලේම අලුත්ම දත්ත update කරගන්නවා

        // Exact match
        let rule = autoReplies.find(r => msg === r.keyword);

        // Partial match
        if (!rule) {
            rule = autoReplies.find(r => msg.includes(r.keyword));
        }

        if (rule) {
            return await m.reply(rule.reply);
        }

    } catch (err) {
        console.error("AutoReply Listener Error:", err);
    }
});

