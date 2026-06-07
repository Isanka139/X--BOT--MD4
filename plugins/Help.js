const { Sparky, isPublic } = require("../lib");

Sparky({
    name: "help",
    category: "main",
    fromMe: isPublic,
    desc: "Show bot help menu"
}, async ({ m }) => {
    try {

        const helpText = `
╭━━━〔 ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎 〕━━━⬣
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
┃ ─────────────
┃ .tourl     ➜ Convert image to URL
┃ .ai        ➜ Chat with AI
┃ .song      ➜ Search songs
┃ .menu      ➜ Full command list
┃ .owner     ➜ Contact owner
┃
┃ 💎 Why Choose Us?
┃ ─────────────
┃ ✅ Fast Response
┃ ✅ High Quality Service
┃ ✅ Easy To Use
┃ ✅ 24/7 Available
┃
┃ 📞 Support
┃ ─────────────
┃ Need Help?
┃ Contact: wa.me/94763353368
┃
╰━━━━━━━━━━━━━━⬣
        `;

        await m.reply(helpText);

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});
