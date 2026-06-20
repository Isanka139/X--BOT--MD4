const { Sparky, isPublic } = require("../lib");

// 🔐 SAFE JID HANDLER
const getJid = (m) => {
    return m?.chat || m?.from || m?.key?.remoteJid || null;
};

// 🚀 BUTTON BUILDER (ANY BUTTON SUPPORT)
const buildButtonsMessage = (text, footer, buttons = []) => {
    return {
        text,
        footer,
        buttons: buttons.map(btn => ({
            buttonId: btn.id,
            buttonText: { displayText: btn.text },
            type: 1
        })),
        headerType: 1
    };
};



// ─────────────────────────────
// 📜 HELP / MENU COMMAND
// ─────────────────────────────
Sparky({
    name: "help",
    alias: ["menu"],
    category: "main",
    fromMe: isPublic,
    desc: "Show bot help menu with buttons"
}, async ({ m, client }) => {
    try {

        const targetChat = getJid(m);
        if (!targetChat) return m.reply("❌ Invalid chat ID");

        const helpText = `╭━━━〔 ❖ X-KADIYA-MD 💎 〕━━━⬣
┃ 👋 Welcome Bot Menu
┃
┃ 🚀 Features
┃ ─────────────
┃ 🤖 AI Assistant
┃ 🎵 Song Download
┃ ⚡ Speed Test
┃ ☀️ Sun Tool
┃
╰━━━━━━━━━━━━━━⬣`;

        // 🔘 ANY BUTTONS (EDIT HERE ONLY)
        const buttons = [
            { id: '.menu', text: '📜 Menu' },
            { id: '.sun', text: '☀️ Sun' },
            { id: '.song', text: '🎵 Song' },
            { id: '.w', text: '⚡ W' }
        ];

        const buttonMessage = buildButtonsMessage(
            helpText,
            "💎 X-KADIYA-MD 💎",
            buttons
        );

        await client.sendMessage(targetChat, buttonMessage, { quoted: m });

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});



// ─────────────────────────────
// ⚡ PING COMMAND
// ─────────────────────────────
Sparky({
    name: "ping",
    category: "main",
    fromMe: isPublic,
    desc: "Check bot speed"
}, async ({ m, client }) => {
    try {

        const targetChat = getJid(m);
        if (!targetChat) return m.reply("❌ Invalid chat ID");

        const start = Date.now();
        await m.reply("Testing Speed... ⏳");
        const responseTime = Date.now() - start;

        const pingText = `⚡ *Pong!*\n\nResponse Speed: *${responseTime}ms*`;

        // 🔘 PING BUTTONS
        const buttons = [
            { id: '.menu', text: '📜 Main Menu' },
            { id: '.song', text: '🎵 Song' },
            { id: '.w', text: '⚡ W' }
        ];

        const buttonMessage = buildButtonsMessage(
            pingText,
            "💎 X-KADIYA-MD 💎",
            buttons
        );

        await client.sendMessage(targetChat, buttonMessage, { quoted: m });

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});
