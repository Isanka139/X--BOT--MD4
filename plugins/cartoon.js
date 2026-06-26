const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Cartoon API Configurations
const API_TOKEN = "07CRv4";
const CARTOON_API_BASE = "https://whiteshadow-x-api.onrender.com/api/movie/sinhalacartoo-lk";

// 🧠 තාවකාලික සෙවුම් ප්‍රතිඵල මතක තබා ගැනීමට (Session Storage)
global.cartoonSession = global.cartoonSession || {};

/**
 * 🎨 සිංහල හඬකැවූ කාටූන් සෙවීම සහ බාගත කිරීමේ ප්‍රධාන පද්ධතිය
 */
async function coreCartoonDownloader({ m, client, args }) {
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") await m.reply(text);
            else await client.sendMessage(m.jid, { text }, { quoted: m });
        } catch (e) {
            console.error("[KADIYA-MD CARTOON] Text reply failed:", e.message);
        }
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        // 1. අංකයක් ඇතුළත් කර එපිසෝඩ් එකක් තෝරාගෙන ඇතිදැයි පරීක්ෂා කිරීම
        if (textInput && !isNaN(textInput) && global.cartoonSession[m.sender]) {
            const index = parseInt(textInput) - 1;
            const session = global.cartoonSession[m.sender];
            
            if (index < 0 || index >= session.results.length) {
                return await sendMsg("❌ *Invalid Number:* කරුණාකර ලැයිස්තුවේ ඇති නිවැරදි අංකයක් ලබා දෙන්න.");
            }

            const selectedCartoon = session.results[index];
            delete global.cartoonSession[m.sender]; // Session එක Clear කිරීම

            try { if (typeof m.react === "function") await m.react("📥"); } catch {}
            await sendMsg(`📥 *"${selectedCartoon.title}"*\n_බාගත කිරීමේ ලින්ක් එක සේවාදායකයෙන් ලබා ගනිමින් පවතී..._`);

            // Fetching Download Link from Movie API
            try {
                const dlResponse = await axios.get(`${CARTOON_API_BASE}?type=download&url=${encodeURIComponent(selectedCartoon.link || selectedCartoon.url)}&apitoken=${API_TOKEN}`, { timeout: 45000 });
                
                let dlData = dlResponse.data;
                if (typeof dlData === "string") dlData = JSON.parse(dlData);

                let resObj = dlData.result || dlData.data || dlData;
                let downloadUrl = resObj?.download_url || resObj?.downloadUrl || resObj?.url || resObj?.link;

                if (!downloadUrl || typeof downloadUrl === "object") {
                    return await sendMsg("❌ *Error:* මෙම කාටූන් එක සඳහා බාගත කිරීමේ ලින්ක් එකක් සේවාදායකයෙන් හමු නොවීය.");
                }

                // වීඩියෝව සෘජුවම WhatsApp වෙත යැවීම
                await sendMsg(`✨ *_👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥_ Cartoon System* ✨\n\n📌 *Title:* ${selectedCartoon.title}\n🚀 *Status:* Uploading Video...`);
                
                await client.sendMessage(
                    m.jid,
                    {
                        video: { url: downloadUrl },
                        mimetype: "video/mp4",
                        caption: `🎬 *${selectedCartoon.title}*\n\n_Powered by Kadiya-X-MD_`
                    },
                    { quoted: m }
                );
                
                try { if (typeof m.react === "function") await m.react("✅"); } catch {}
            } catch (dlErr) {
                console.error("[KADIYA-MD CARTOON] Download API Error:", dlErr.message);
                await sendMsg("❌ *Error:* සේවාදායකයේ ඇති වූ දෝෂයක් හේතුවෙන් වීඩියෝව බාගත කිරීමට නොහැකි විය.");
            }
            return;
        }

        // 2. සාමාන්‍ය සෙවුම් ක්‍රියාවලිය (කාටූන් එකක නම ලබා දුන් විට)
        if (!textInput) {
            return await sendMsg("🎨 කරුණාකර සොයන්න අවශ්‍ය කාටූන් එකේ නම ලබා දෙන්න.\n\n💡 උදා: `.cartoon avatar` හෝ `.sinhalacartoon ben 10`");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`🔍 _Searching sinhalacartoon.lk for: "${textInput}"..._`);

        const searchResponse = await axios.get(`${CARTOON_API_BASE}?type=search&q=${encodeURIComponent(textInput)}&apitoken=${API_TOKEN}`, { timeout: 20000 });
        
        let searchData = searchResponse.data;
        if (typeof searchData === "string") searchData = JSON.parse(searchData);

        let results = searchData.result || searchData.results || searchData.data;

        if (!results || !Array.isArray(results) || results.length === 0) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* ඔබ ඇතුළත් කළ නමට ගැලපෙන කිසිදු සිංහල කාටූන් එකක් හමු නොවීය.");
        }

        // පරිශීලකයාට තේරීම සඳහා ලැයිස්තුව සකස් කිරීම
        let responseText = `✨ *_👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥_ 𝘾𝘼𝙍𝙏𝙊𝙊𝙉 𝙎𝙀𝘼𝙍𝘾𝙃* ✨\n\n🔍 ප්‍රතිඵල *"${textInput}"* සඳහා:\n\n`;
        
        results.slice(0, 15).forEach((item, i) => {
            responseText += `${i + 1}. 📌 *${item.title}*\n`;
        });

        responseText += `\n💡 *දැනුම්දීම:* ඔබට බාගත කර ගැනීමට අවශ්‍ය කාටූන් එකෙහි *අංකය* පමණක් reply කරන්න. (උදා: 1)`;

        // යූසර්ගේ සෙවුම් දත්ත මතකයේ තබා ගැනීම
        global.cartoonSession[m.sender] = {
            results: results.slice(0, 15),
            time: Date.now()
        };

        await sendMsg(responseText);
        try { if (typeof m.react === "function") await m.react("👀"); } catch {}

    } catch (globalError) {
        console.error("[KADIYA-MD CARTOON] CRITICAL GLOBAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Kadiya-MD Cartoon Internal Error:* ${globalError.message}`);
    }
}

// 🎧 Commands ලියාපදිංචි කිරීම
Sparky({
    name: "cartoon",
    fromMe: isPublic,
    category: "download",
    desc: "Search and download Sinhala dubbed cartoons from sinhalacartoon.lk"
}, coreCartoonDownloader);

