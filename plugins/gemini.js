const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Gemini AI API Configuration
const API_TOKEN = "07CRv4";
const GEMINI_API_URL = "https://whiteshadow-x-api.onrender.com/api/ai/gemini";

/**
 * 🤖 Professional Gemini AI Chat Plugin
 */
Sparky({
    name: "gemini",
    fromMe: isPublic,
    category: "ai",
    desc: "Chat with Gemini Artificial Intelligence."
}, async ({ m, client, args }) => {
    
    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") {
                await m.reply(text);
            } else {
                await client.sendMessage(m.jid, { text }, { quoted: m });
            }
        } catch (e) {
            console.error("[X-BOT-MD AI] Reply failed:", e.message);
        }
    };

    try {
        // පරිශීලකයා ඇතුළත් කළ ප්‍රශ්නය ලබා ගැනීම (Text Input or Replied Text)
        let query = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        query = query || m.quoted?.text || "";

        // ප්‍රශ්නයක් ඇතුළත් කර නොමැති නම්
        if (!query) {
            return await sendMsg("🤖 *X-BOT-MD GEMINI AI*\n\nකරුණාකර AI එකෙන් ඇසීමට අවශ්‍ය ප්‍රශ්නය ලබා දෙන්න.\n\n💡 _උදා: .gemini ලෝකයේ දිගම ගඟ කුමක්ද?_");
        }

        // Reaction: Thinking 🧠
        try { if (typeof m.react === "function") await m.react("🧠"); } catch {}

        // 🚀 Fetching Response from WhiteShadow Gemini API
        const response = await axios.get(`${GEMINI_API_URL}?q=${encodeURIComponent(query)}&apitoken=${API_TOKEN}`, { timeout: 30000 });

        // API එකෙන් ලැබෙන දත්ත පරීක්ෂා කිරීම
        // සාමාන්‍ยයෙන් WhiteShadow API වල ප්‍රතිචාරය res.data.result හෝ res.data.responce තුළ පවතී
        let aiResult = response.data?.result || response.data?.responce || response.data?.response;

        if (!aiResult && response.data?.success && response.data?.data) {
            aiResult = response.data.data;
        }

        if (!aiResult) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *AI Error:* සේවාදායකයෙන් නිසි පිළිතුරක් ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        // Success Reaction & Sending Reply ✅
        try { if (typeof m.react === "function") await m.react("✨"); } catch {}
        
        const formattedResponse = `✨ *👑 𝙂𝙀𝙈𝙄𝙉𝙄 𝘼𝙄 𝘼𝙎𝙎𝙄𝙎𝙏𝘼𝙉𝙏 👑* ✨\n\n${aiResult}\n\n_Powered by X-Bot-MD_`;
        await sendMsg(formattedResponse);

    } catch (error) {
        console.error("[X-BOT-MD AI] CRITICAL ERROR:", error);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        
        if (error.response?.status === 403 || error.response?.status === 401) {
            await sendMsg("❌ *API Error:* ඔබේ API Token එක වලංගු නැත (Invalid Token).");
        } else {
            await sendMsg(`❌ *AI Internal Error:* ${error.message}`);
        }
    }
});
