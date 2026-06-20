const axios = require("axios");
const { isPublic } = require("../lib"); // 👈 isPublic require කරලා නැත්නම් මේක අනිවාර්යයෙන්ම ඕනේ

// ======================================================
// 🎨 AI IMAGE GENERATOR (MULTI STYLE) - FIXED VERSION
// ======================================================
Sparky({
    name: "imagine",
    alias: ["genimg", "draw"],
    category: "tools",
    fromMe: isPublic,
    desc: "Generate AI Images with multiple styles"
}, async ({ m, text }) => {
    try {
        const input = (text || m.text || m.body || "").trim();

        // .imagine command එක අයින් කිරීම (අවශ්‍ය නම්)
        let cleanInput = input;
        if (cleanInput.startsWith(".")) {
            cleanInput = cleanInput.replace(/^\.\w+\s+/, "");
        }

        if (!cleanInput) {
            return m.reply(
                "❌ කරුණාකර prompt එකක් දෙන්න!\n\n💡 Example:\n.imagine anime a girl in forest\n.imagine cyberpunk city"
            );
        }

        // =========================
        // 🎯 STYLE DETECTION
        // =========================
        let style = "oil-painting"; // default style
        let promptText = cleanInput;

        const styleMap = {
            anime: "anime",
            realistic: "realistic",
            cyberpunk: "cyberpunk",
            oil: "oil-painting",
            painting: "oil-painting"
        };

        const firstWord = cleanInput.split(" ")[0].toLowerCase();

        if (styleMap[firstWord]) {
            style = styleMap[firstWord];
            promptText = cleanInput.split(" ").slice(1).join(" ");
        }

        if (!promptText.trim()) {
            return m.reply("❌ Style එකෙන් පස්සේ prompt එක දෙන්න!");
        }

        await m.reply(`🎨 *Generating ${style} image... කරුණාකර මොහොතක් රැඳී සිටින්න.*`);

        const apiKey = "wxa_f_21e17ba43b"; // ඔයාගේ API Key එක

        // 🛠️ FIXED: ratio එක 1%3A1 ලෙස URL encode කර ඇත
        const apiUrl = `https://apis.xwolf.space/api/ai/tools/style-transfer?prompt=${encodeURIComponent(promptText)}&style=${encodeURIComponent(style)}&ratio=1%3A1&key=${apiKey}`;

        console.log("📡 API URL:", apiUrl);

        const response = await axios.get(apiUrl, { timeout: 45000 }); // Image generation වලට සරලව වැඩි වෙලාවක් යන නිසා timeout එක 45s කලා
        const data = response?.data;

        console.log("📦 API RESPONSE:", data);

        // =========================
        // 🧠 SMART RESULT HANDLING
        // =========================
        let imageUrl = null;
        if (data && data.status === true && data.result) {
            imageUrl = data.result;
        } else if (data && data.result) {
            imageUrl = data.result;
        }

        if (!imageUrl) {
            return m.reply(
                "❌ Image generate කරන්න බැරි වුණා.\n\n📦 API Response:\n" +
                JSON.stringify(data, null, 2)
            );
        }

        const caption =
            `✨ *AI Generated Image*\n\n` +
            `🎭 *Style:* ${style}\n` +
            `📝 *Prompt:* ${promptText}`;

        // Sparky Framework එකේ image යවන නිවැරදිම විදිහ
        return await m.send(imageUrl, { caption }, "image", m);

    } catch (err) {
        console.error("❌ ERROR:", err);

        return m.reply(
            "❌ Error occurred:\n" +
            (err.response?.data
                ? JSON.stringify(err.response.data, null, 2)
                : err.message || "Unknown error")
        );
    }
});
