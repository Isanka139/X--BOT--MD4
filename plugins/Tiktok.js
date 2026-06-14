const { Sparky } = require("../lib");
const axios = require("axios");

Sparky({
    name: "tiktok",
    alias: ["tt", "ttdl", "ටිකටොක්"],
    category: "download",
    fromMe: false,
    desc: "TikTok වීඩියෝ ඩවුන්ලෝඩ් කිරීම"
}, async ({ client, m, args }) => {
    try {
        const input = Array.isArray(args) ? args.join(" ") : String(args || "");
        const url = input.trim();

        if (!url) {
            await client.sendMessage(m.jid, { react: { text: "⚠️", key: m.key } });
            
            const helpMessage = `╭─────────────────────────╮
  ⚠️  *TikTok Downloader*
╰─────────────────────────╯

💡 *Please provide a valid TikTok video link!*
💡 *කරුණාකර නිවැරදි TikTok ලින්ක් එකක් ඇතුලත් කරන්න!*

──────────────
📌 *Usage / භාවිතය:*
  *.tiktok [tiktok_video_url]*

ℹ️ *Example / උදාහරණ:*
  • _.tiktok https://vm.tiktok.com/xxxxxx/_

──────────────
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘A-𝐌𝐃 💎`;
            return await m.reply(helpMessage);
        }

        // 1. ඩවුන්ලෝඩ් වෙන්න පටන් ගන්නා විට 📥 React එක දැමීම
        await client.sendMessage(m.jid, { react: { text: "📥", key: m.key } });

        // ඔයා ලබාදුන් නව API Endpoint එක
        const apiUrl = `https://apis.xwolf.space/api/download/tiktok?url=${encodeURIComponent(url)}&key=wxa_f_684dc23487`;
        
        const response = await axios.get(apiUrl);
        const resData = response.data;

        // API එකෙන් එන දත්ත වල 'result' හෝ 'data' කොටස වෙන් කර ගැනීම
        const videoData = resData.result || resData.data || resData;

        // වීඩියෝ ලින්ක් එක තිබේදැයි පරික්ෂා කිරීම (xwolf API එකේ සාමාන්‍යයෙන් play/hd_play හෝ video ලෙස එයි)
        const videoUrl = videoData.play || videoData.video || videoData.download_url || videoData.video_url;

        if (!videoUrl) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply("❌ *වීඩියෝව සෙවීමේදී දෝෂයක් සිදු විය. ලින්ක් එක නිවැරදිදැයි පරීක්ෂා කරන්න.*");
        }

        // 2. වීඩියෝව ලැබුණු පසු 🔄 React එක දැමීම
        await client.sendMessage(m.jid, { react: { text: "🔄", key: m.key } });

        // Statistics දත්ත ලබා ගැනීම
        const title = videoData.title || videoData.description || "TikTok Video";
        const author = videoData.author?.nickname || videoData.author || "Unknown";
        
        // Likes, Views සහ Date (නැතිනම් 0 හෝ Unknown ලෙස පෙන්වයි)
        const likes = videoData.digg_count || videoData.likes || videoData.statistics?.digg_count || "0";
        const views = videoData.play_count || videoData.views || videoData.statistics?.play_count || "0";
        const uploadDate = videoData.create_time || videoData.upload_date || "Unknown";

        const captionMessage = `╭─────────────────────────╮
  🎬  *TIKTOK DOWNLOADER*
╰─────────────────────────╯

  📝 *Title :* └── _${title}_
  👤 *Author :* └── _${author}_

──────────────
📊 *STATISTICS / විස්තර:*

  ❤️ *Likes :* └── _${likes}_
  👁️ *Views :* └── _${views}_
  📅 *Uploaded :* └── _${uploadDate}_

──────────────
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        // 3. වීඩියෝව සහ කැප්ෂන් එක යැවීම
        await client.sendMessage(m.jid, { 
            video: { url: videoUrl }, 
            caption: captionMessage 
        }, { quoted: m });

        // 4. සාර්ථකව යවා අවසන් වූ පසු ✅ React එක දැමීම
        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.log("TikTok download error:", err);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        await m.reply("❌ *වීඩියෝව බාගත කිරීමේදී පද්ධති දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.*");
    }
});
