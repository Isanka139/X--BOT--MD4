const { Sparky, isPublic } = require("../lib");

// --- 1. MAIN HELP / MENU COMMAND ---
Sparky({
    name: "help",
    alias: ["menu"],
    category: "main",
    fromMe: isPublic,
    desc: "Show bot help menu"
}, async ({ m }) => {
    try {
        const helpText = `╭━━━〔 ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎 〕━━━⬣
┃
┃ 👋 Welcome to X-KADIYA-MD Bot
┃
┃ 🚀 Our Services
┃ ─────────────
┃ 🌐 Image To URL
┃ 📥 Media Downloader
┃ 🎵 Song Search
┃ 🤖 AI Chat Assistant
┃ 🛠️ Useful Tools
┃
┃ 📌 Available Commands
┃ 💡 (මෙම පණිවිඩයට අදාළ අංකය රිප්ලයි කරන්න)
┃ ─────────────
┃ [1] ➜ Image to URL (.tourl)
┃ [2] ➜ Chat with AI (.ai)
┃ [3] ➜ Search songs (.song)
┃ [4] ➜ Check Speed (.ping)
┃ [5] ➜ Contact owner (.owner)
┃
┃ 💎 Why Choose Us?
┃ ─────────────
┃ ✅ Fast Response | Easy To Use
┃
╰━━━━━━━━━━━━━━⬣`;

        await m.reply(helpText);

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});

// --- 2. PING COMMAND ---
Sparky({
    name: "speed",
    category: "main",
    fromMe: isPublic,
    desc: "Check bot speed"
}, async ({ m }) => {
    try {
        const start = new Date().getTime();
        const end = new Date().getTime();
        const responseTime = (end - start);

        const pingText = `⚡ *speed!* \n\nResponse Speed: *${responseTime}ms*\n\n💡 Reply *0* to go back to Main Menu.`;
        await m.reply(pingText);

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});


// --- 3. NUMBER BUTTONS LISTENER (අංක වැඩ කරවන කොටස) ---
// මෙමඟින් යූසර් අංකයක් රිප්ලයි කළ විට අදාළ කමාන්ඩ් එක බොටා ලවාම ට්‍රිගර් කරවයි.
Sparky({
    on: "text",
    fromMe: isPublic
}, async ({ m, client }) => {
    try {
        // මැසේජ් එකක් රිප්ලයි එකක්ද සහ ඒකේ අංකයක් තියෙද කියා බලයි
        if (!m.quoted || !m.quoted.text) return;
        
        // රිප්ලයි කරපු මැසේජ් එක අපේ බෝට්ගේ මෙනු එකක්දැයි තහවුරු කරගැනීම
        if (!m.quoted.text.includes("❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃")) return;

        const input = m.text.trim();

        // යූසර් රිප්ලයි කරපු අංකය අනුව අදාළ කමාන්ඩ් එක ක්‍රියාත්මක කිරීම
        if (input === "1") {
            await m.reply(".tourl");
        } else if (input === "2") {
            await m.reply(".ai");
        } else if (input === "3") {
            await m.reply(".song");
        } else if (input === "4") {
            await m.reply(".ping");
        } else if (input === "5") {
            await m.reply(".owner");
        } else if (input === "0") {
            await m.reply(".menu");
        }

    } catch (err) {
        console.error("Listener Error: ", err);
    }
});
