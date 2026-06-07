const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const FormData = require("form-data");

const API_KEY = process.env.DEEPAI_API_KEY;

Sparky({
    name: "cartoon",
    alias: ["toon", "toonify", "anime"],
    category: "ai",
    fromMe: isPublic,
    desc: "Convert your photos into cartoon style using AI"
}, async ({ client, m }) => {

    try {
        // 1. Message එක image එකක්ද කියලා check කිරීම (Caption හෝ Reply)
        const hasImage = m.image || (m.quoted && m.quoted.image);

        if (!hasImage) {
            await client.sendMessage(m.jid, {
                react: { text: "❌", key: m.key }
            });
            return await m.reply("🖼️ කරුණාකර Photo එකක Caption එක ලෙස හෝ Photo එකකට Reply කරලා .cartoon භාවිතා කරන්න.");
        }

        await client.sendMessage(m.jid, {
            react: { text: "⏳", key: m.key }
        });

        // 2. Image එක download කරගැනීම
        const buffer = m.image ? await m.download() : await m.quoted.download();

        const form = new FormData();
        form.append("image", buffer, {
            filename: "image.jpg"
        });

        // 3. DeepAI Toonify API එකට image එක යැවීම
        const response = await axios.post(
            "https://api.deepai.org/api/toonify",
            form,
            {
                headers: {
                    "api-key": API_KEY,
                    ...form.getHeaders()
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 60000
            }
        );

        if (!response.data.output_url) {
            throw new Error("No output image returned");
        }

        // 4. Cartoon වුණු image එක download කරගැනීම
        const cartoonImage = await axios.get(
            response.data.output_url,
            { responseType: "arraybuffer" }
        );

        await client.sendMessage(m.jid, {
            react: { text: "✅", key: m.key }
        });

        // 5. Cartoon photo එක Caption එකත් සමඟ reply එකක් විදිහට යැවීම
        await client.sendMessage(
            m.jid,
            {
                image: Buffer.from(cartoonImage.data),
                caption: `✨ *AI CARTOON GENERATOR*

🎨 Photo Converted to Cartoon Successfully
🚀 Engine: DeepAI Toonify

💡 *විශේෂ උපදෙස:* *මෙම සේවාව වඩාත් සාර්ථකව ක්‍රියාත්මක වන්නේ මිනිස් මුහුණු (Human Faces) පැහැදිලිව පෙනෙන ඡායාරූප සඳහා පමණි.*

❖ Powered By X-KADIYA-MD 💎`
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        await client.sendMessage(m.jid, {
            react: { text: "⚠️", key: m.key }
        });
        return await m.reply("⚠️ Cartoon conversion failed. Make sure the photo has a clear face and try again.");
    }
});

