const { Sparky, isPublic } = require("../lib");

// --- 1. HELP / MENU COMMAND ---
Sparky({
    name: "help",
    alias: ["me"], // .menu ගැහුවමත් මේකම වැඩ කරන්න alias එකක් දැම්මා
    category: "main",
    fromMe: isPublic,
    desc: "Show bot help menu with buttons"
}, async ({ m, client }) => { // client object එක අවශ්‍ය විය හැක
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
┃ 💎 Why Choose Us?
┃ ─────────────
┃ ✅ Fast Response
┃ ✅ High Quality Service
┃ ✅ Easy To Use
┃ ✅ 24/7 Available
┃
╰━━━━━━━━━━━━━━⬣`;

        // බොත්තම් (Buttons) ඇතුළත් කරන කොටස
        const buttonMessage = {
            text: helpText,
            footer: "💎 X-KADIYA-MD 💎",
            buttons: [
                { buttonId: '.ai', buttonText: { displayText: '🤖 AI Assistant' }, type: 1 },
                { buttonId: '.song', buttonText: { displayText: '🎵 Search Song' }, type: 1 },
                { buttonId: '.ping', buttonText: { displayText: '⚡ Check Speed' }, type: 1 }
            ],
            headerType: 1
        };

        // බටන් මැසේජ් එකක් විදිහට යැවීම
        await client.sendMessage(m.chat, buttonMessage, { quoted: m });

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});

// --- 2. PING COMMAND WITH BUTTONS ---
Sparky({
    name: "ping",
    category: "main",
    fromMe: isPublic,
    desc: "Check bot speed"
}, async ({ m, client }) => {
    try {
        const start = new Date().getTime();
        const msg = await m.reply("Testing Speed... ⏳");
        const end = new Date().getTime();
        const responseTime = (end - start);

        const pingText = `⚡ *Pong!* \n\nResponse Speed: *${responseTime}ms*`;

        const pingButtons = {
            text: pingText,
            footer: "💎 X-KADIYA-MD 💎",
            buttons: [
                { buttonId: '.menu', buttonText: { displayText: '📜 Main Menu' }, type: 1 },
                { buttonId: '.owner', buttonText: { displayText: '📞 Contact Owner' }, type: 1 }
            ],
            headerType: 1
        };

        // පරණ මැසේජ් එක මකලා බටන් එක යැවීම හෝ අලුතින්ම යැවීම
        await client.sendMessage(m.chat, pingButtons, { quoted: m });

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});
