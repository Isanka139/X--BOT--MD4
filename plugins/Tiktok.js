const { Sparky } = require("../lib");
const axios = require("axios");

Sparky(
{
    name: "tt",
    alias: ["tt", "ttdl"],
    category: "download",
    desc: "Download TikTok videos"
},
async ({ client, m, args }) => {
    try {

        const url = args.join(" ").trim();

        if (!url) {
            return m.reply(
`📌 *TikTok Downloader*

Usage:
.tiktok <tiktok_url>

Example:
.tiktok https://vt.tiktok.com/xxxxxx/`
            );
        }

        await client.sendMessage(m.jid, {
            react: { text: "📥", key: m.key }
        });

        const { data } = await axios.get(
            `https://apis.xwolf.space/api/download/tiktok`,
            {
                params: {
                    url,
                    key: "wxa_f_684dc23487"
                },
                timeout: 30000
            }
        );

        console.log("TikTok API:", JSON.stringify(data, null, 2));

        const result = data.result || data.data || {};

        const videoUrl =
            result.video_hd ||
            result.video ||
            result.play ||
            result.download ||
            result.download_url ||
            result.nowm;

        if (!videoUrl) {
            return m.reply("❌ Video URL not found from API.");
        }

        const caption = `🎬 *TikTok Downloader*

📝 Title: ${result.title || "No title"}

👤 Author: ${
            typeof result.author === "object"
                ? result.author.nickname
                : result.author || "Unknown"
        }

❤️ Likes: ${result.likes || result.digg_count || "0"}
👁 Views: ${result.views || result.play_count || "0"}

✅ Download Complete`;

        await client.sendMessage(
            m.jid,
            {
                video: {
                    url: videoUrl
                },
                caption
            },
            { quoted: m }
        );

        await client.sendMessage(m.jid, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {

        console.error("TikTok Error:", err.response?.data || err.message);

        await client.sendMessage(m.jid, {
            react: { text: "❌", key: m.key }
        });

        return m.reply(
            `❌ Download Failed\n\n${err.message}`
        );
    }
});
