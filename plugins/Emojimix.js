const axios = require("axios");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

// Emoji extractor (safe Unicode emojis)
function extractEmojis(text) {
    const regex = /[\p{Extended_Pictographic}]/gu;
    return text.match(regex);
}

// Sticker creator
async function createSticker(buffer) {
    try {
        const sticker = new Sticker(buffer, {
            pack: "Emoji Kitchen",
            author: "X-KADIYA MD",
            type: StickerTypes.FULL,
            quality: 60
        });

        return await sticker.toBuffer();
    } catch (err) {
        console.error("Sticker Error:", err);
        return null;
    }
}

module.exports = {
    name: "emix",
    aliases: ["emojimix", "mix"],
    category: "fun",
    desc: "Mix two emojis into a sticker",

    async execute(sock, m, args) {

        const footer = `
━━━━━━━━━━━━━━━
❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀 𝐌𝐃 💎
━━━━━━━━━━━━━━━`;

        try {
            let emoji1, emoji2;

            const input = args.join(" ").trim();

            // format: 😍+🔥
            if (input.includes("+")) {
                [emoji1, emoji2] = input.split("+").map(v => v.trim());
            } 
            else {
                const emojis = extractEmojis(input);

                if (emojis && emojis.length >= 2) {
                    emoji1 = emojis[0];
                    emoji2 = emojis[1];
                } else {
                    emoji1 = args[0];
                    emoji2 = args[1];
                }
            }

            // ❌ FIXED ERROR HANDLING
            if (!emoji1 || !emoji2) {

                await sock.sendMessage(m.key.remoteJid, {
                    react: { text: "❓", key: m.key }
                });

                return await sock.sendMessage(
                    m.key.remoteJid,
                    {
                        text: `❌ *Emoji Mix Usage Error*

ඔබ ඉමෝජි 2ක් ලබා දිය යුතුය.

📌 *Correct Usage:*
• .emix 😍 🔥
• .emix 😍+🔥
• .mix ❤️ 🐱

💡 Example:
.emix 🤖 💀

${footer}`
                    },
                    { quoted: m }
                );
            }

            await sock.sendMessage(m.key.remoteJid, {
                react: { text: "⏳", key: m.key }
            });

            const url = `https://emojik.vercel.app/s/${encodeURIComponent(
                emoji1 + emoji2
            )}?size=512`;

            const response = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 10000,
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });

            if (!response.data || response.data.length < 100) {
                throw new Error("API returned invalid image");
            }

            const stickerBuffer = await createSticker(response.data);

            if (!stickerBuffer) {
                throw new Error("Sticker conversion failed");
            }

            await sock.sendMessage(
                m.key.remoteJid,
                { sticker: stickerBuffer },
                { quoted: m }
            );

            await sock.sendMessage(m.key.remoteJid, {
                react: { text: "✅", key: m.key }
            });

        } catch (err) {
            console.error("Emix Error:", err);

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    text: `❌ *Emoji Mix Failed*

• Emoji pair not supported
• API error or timeout
• Invalid emoji combination

Try another combo.${footer}`
                },
                { quoted: m }
            );

            await sock.sendMessage(m.key.remoteJid, {
                react: { text: "❌", key: m.key }
            });
        }
    }
};
