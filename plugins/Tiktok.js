const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

Sparky(
  {
    name: "tt",
    fromMe: isPublic,
    category: "downloader",
    desc: "TikTok downloader (HD only)",
  },
  async ({ m, client, args }) => {
    let text = args.trim();

    const url = text.match(/(https?:\/\/[^\s]+)/)?.[0]?.replace(/[)\].,]+$/, "");

    if (!url) {
      return client.sendMessage(
        m.jid,
        { text: "❌ Usage: .tt <tiktok url>" },
        { quoted: m }
      );
    }

    if (!/(tiktok\.com|vt\.tiktok\.com)/.test(url)) {
      return client.sendMessage(
        m.jid,
        { text: "❌ Invalid TikTok URL" },
        { quoted: m }
      );
    }

    await m.react("⏳");

    try {
      const { data } = await axios.get(
        "https://api.zanta-mini.store/api/tiktok",
        {
          params: {
            apiKey: "zanta_6xeM2XzKaDSDKLwRhOP85mYv",
            url,
          },
          httpsAgent,
          timeout: 20000,
        }
      );

      console.log("API RESPONSE:", JSON.stringify(data, null, 2));

      const res = data?.result?.data || data?.data?.result || data?.result || data?.data;

      if (!res) throw new Error("No video found from API");

      const videoUrl = res?.hdplay || res?.play || res?.url;

      if (!videoUrl) throw new Error("Video URL not found");

      await m.react("⬇️");

      const stream = await axios.get(videoUrl, {
        responseType: "arraybuffer",
        httpsAgent,
        timeout: 30000,
      });

      const buffer = Buffer.from(stream.data);

      const caption = `
🎬 *TikTok Downloader (HD)*

👤 User : @${res.author?.unique_id || "unknown"}
📝 Name : ${res.author?.nickname || "unknown"}

🎚 Quality : HD
⏱ Duration : ${res.duration || 0}s

❤️ Likes : ${res.like_count || 0}
💬 Comments : ${res.comment_count || 0}
👀 Views : ${res.play_count || 0}

📥 Downloaded Successfully
`;

      await client.sendMessage(
        m.jid,
        {
          video: buffer,
          caption,
        },
        { quoted: m }
      );

      await m.react("✅");
    } catch (error) {
      await m.react("❌");
      console.error("TikTok error:", error);

      await client.sendMessage(
        m.jid,
        {
          text: `❌ Error: ${error.message}`,
        },
        { quoted: m }
      );
    }
  }
);
