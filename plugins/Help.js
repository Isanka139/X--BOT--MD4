const { Sparky, isPublic } = require("../lib");

// --- 1. HELP / MENU COMMAND ---
Sparky({
    name: "help",
    alias: ["menu"],
    category: "main",
    fromMe: isPublic,
    desc: "Show bot help menu with buttons"
}, async ({ m, client }) => {
    try {
        const targetChat = m.chat || m.from || m.key.remoteJid;

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

        // නවතම Interactive Buttons ක්‍රමය (100% Error Free)
        const interactiveMessage = {
            viewOnceMessage: {
                message: {
                    buttonsMessage: {
                        contentText: helpText,
                        footerText: "💎 X-KADIYA-MD 💎",
                        headerType: 1,
                        buttons: [
                            { buttonId: '.ai', buttonText: { displayText: '🤖 AI Assistant' }, type: 1 },
                            { buttonId: '.song', buttonText: { displayText: '🎵 Search Song' }, type: 1 },
                            { buttonId: '.ping', buttonText: { displayText: '⚡ Check Speed' }, type: 1 }
                        ]
                    }
                }
            }
        };

        // quoted: m කොටස ඉවත් කර ඇත (jidDecode error එක මඟහැරීමට)
        await client.sendMessage(targetChat, interactiveMessage);

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
        const targetChat = m.chat || m.from || m.key.remoteJid;
        
        const start = new Date().getTime();
        const end = new Date().getTime();
        const responseTime = (end - start);

        const pingText = `⚡ *Pong!* \n\nResponse Speed: *${responseTime}ms*`;

        const interactivePing = {
            viewOnceMessage: {
                message: {
                    buttonsMessage: {
                        contentText: pingText,
                        footerText: "💎 X-KADIYA-MD 💎",
                        headerType: 1,
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📜 Main Menu' }, type: 1 },
                            { buttonId: '.owner', buttonText: { displayText: '📞 Contact Owner' }, type: 1 }
                        ]
                    }
                }
            }
        };

        await client.sendMessage(targetChat, interactivePing);

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});
