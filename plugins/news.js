// commands/news.js
const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const config = require("../config");

Sparky({
    name: "news",
    alias: ["පුවත්", "breaking", "n"],
    category: "news",
    fromMe: isPublic,
    desc: "ලංකාවේ අලුත්ම පුවත් ලබා ගැනීම"
}, async ({ client, m, args }) => {
    try {
        const botName = config.BOT_INFO?.split(";")[0] || "SADEW-MINI";
        await client.sendMessage(m.jid, { text: "📥 පුවත් යාවත්කාලීන කරමින් පවතී..." }, { quoted: m });

        // විශ්වාසවන්ත Google News RSS හරහා දත්ත ලබා ගැනීම
        const response = await axios.get("https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=Sri+Lanka&hl=si&gl=LK&ceid=LK:si");

        const newsData = response.data?.items;

        if (!newsData || newsData.length === 0) {
            return await m.reply("❌ මේ වෙලාවේ පුවත් ලබාගැනීමට නොහැකි විය.");
        }

        const topNews = newsData.slice(0, 5);
        
        let menuStatus = `╭───────────────◉\n│ *📰 ${botName} NEWS HUB*\n├───────────────◉\n`;
        topNews.forEach((item, index) => {
            menuStatus += `│ *${index + 1}️⃣ ${item.title.substring(0, 40)}...*\n`;
        });
        menuStatus += `╰────────────────◉\n\n*පුවතක අංකය (1-5) reply කරන්න.*`;

        const sentMsg = await client.sendMessage(m.jid, {
            image: { url: topNews[0].thumbnail || "https://res.cloudinary.com/dqlh378fb/image/upload/v1780800370/zanta_media_uploads/y2qrw8srsw1v4dsu5wxv.jpg" },
            caption: menuStatus
        }, { quoted: m });

        // Reply ලබා ගැනීම
        const filter = (msg) => msg.key.remoteJid === m.jid && ["1","2","3","4","5"].includes(msg.message?.conversation || msg.message?.extendedTextMessage?.text || "");
        
        const replyMsg = await new Promise((resolve) => {
            const handler = (chatUpdate) => {
                const msg = chatUpdate.messages?.[0];
                if (filter(msg)) {
                    client.ev.off("messages.upsert", handler);
                    resolve(msg);
                }
            };
            client.ev.on("messages.upsert", handler);
            setTimeout(() => { client.ev.off("messages.upsert", handler); resolve(null); }, 30000);
        });

        if (replyMsg) {
            const idx = parseInt(replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text) - 1;
            const news = topNews[idx];
            await client.sendMessage(m.jid, { text: `📰 *${news.title}*\n\n${news.description}\n\n🔗 ${news.link}` }, { quoted: replyMsg });
        }

    } catch (err) {
        await m.reply("❌ පුවත් සේවාව තාවකාලිකව විසන්ධි වී ඇත.");
    }
});

