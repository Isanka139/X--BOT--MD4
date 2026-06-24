const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow API Configurations
const API_TOKEN = "07CRv4";
const SEARCH_API_URL = "https://whiteshadow-x-api.onrender.com/api/search/youtube";
const DOWNLOAD_API_URL = "https://whiteshadow-x-api.onrender.com/api/download/ytmp3"; 

/**
 * 📱 YouTube URL Extraction Utility
 */
function extractYoutubeUrl(text) {
    const regex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[^\s?#]+)/i;
    const match = String(text || "").match(regex);
    return match ? match[0].trim() : null;
}

/**
 * 🎵 Professional MP3 Downloader Plugin (Deep Object Search Fixed)
 */
Sparky({
    name: "song",
    fromMe: isPublic,
    category: "download",
    desc: "Download MP3 Songs easily via WhiteShadow Engine."
}, async ({ m, client, args }) => {
    
    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") await m.reply(text);
            else await client.sendMessage(m.jid, { text }, { quoted: m });
        } catch (e) {
            console.error("[X-BOT-MD SONG] Message failed:", e.message);
        }
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg(`🎵 *X-BOT-MD SONG DOWNLOADER*\n\nකරුණාකර සින්දුවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න.\n\n💡 _උදා: .song malsara_`);
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}

        let youtubeUrl = extractYoutubeUrl(textInput);
        let mediaTitle = "X-Bot Audio";

        // 1. YouTube ලින්ක් එකක් නොවේ නම් WhiteShadow Search API එකෙන් සෙවීම
        if (!youtubeUrl) {
            await sendMsg(`🔍 _Searching for_ *"${textInput}"* _on YouTube..._`);
            
            try {
                const searchRes = await axios.get(`${SEARCH_API_URL}?q=${encodeURIComponent(textInput)}&apitoken=${API_TOKEN}`, { timeout: 20000 });
                
                let searchData = searchRes.data;
                while (typeof searchData === "string") {
                    searchData = JSON.parse(searchData);
                }

                // 🛠️ BULLETPROOF SEARCH PARSER (JSON ව්‍යුහය කොහොම ආවත් ලින්ක් එක සොයා ගැනීම)
                let results = searchData.results || searchData.result || searchData.data || searchData;
                
                if (Array.isArray(results) && results.length > 0) {
                    youtubeUrl = results[0].url || results[0].link || results[0].videoUrl;
                    mediaTitle = results[0].title || mediaTitle;
                } else if (results && typeof results === "object") {
                    // Array එකක් නොවී සෘජුවම Object එකක් ලෙස ප්‍රතිඵල ආවොත්
                    if (Array.isArray(results.results) && results.results[0]) {
                        youtubeUrl = results.results[0].url || results.results[0].link;
                        mediaTitle = results.results[0].title || mediaTitle;
                    } else {
                        youtubeUrl = results.url || results.link || results.videoUrl;
                        mediaTitle = results.title || mediaTitle;
                    }
                }
            } catch (searchErr) {
                console.error("[X-BOT-MD SONG] WhiteShadow Search API failed:", searchErr.message);
            }
        }

        // සින්දුව හෝ ලින්ක් එක සොයා ගැනීමට නොහැකි වුවහොත්
        if (!youtubeUrl || typeof youtubeUrl === "object") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* සින්දුව සොයා ගැනීමට නොහැකි විය. කරුණාකර නම වෙනත් ආකාරයකට ටයිප් කරන්න.");
        }

        // 2. WhiteShadow Downloader API එකෙන් MP3 Link එක ලබා ගැනීම
        try { if (typeof m.react === "function") await m.react("📥"); } catch {}
        await sendMsg(`📥 *"${mediaTitle}"* _බාගත කරමින් පවතී. කරුණාකර රැඳී සිටින්න..._`);

        const downloadRes = await axios.get(`${DOWNLOAD_API_URL}?url=${encodeURIComponent(youtubeUrl)}&apitoken=${API_TOKEN}`, { timeout: 45000 });

        let dlData = downloadRes.data;
        while (typeof dlData === "string") {
            dlData = JSON.parse(dlData);
        }

        // JSON එක ඇතුළේ ඇති download ලින්ක් එක නිවැරදිව ලබා ගැනීම
        let downloadUrl = dlData?.result?.downloadUrl || dlData?.downloadUrl || dlData?.result?.url || dlData?.url || dlData?.result;
        
        if (dlData?.result?.title) mediaTitle = dlData.result.title;
        else if (dlData?.title) mediaTitle = dlData.title;

        // ලින්ක් එක නොමැති නම් වැරැද්දක් පෙන්වීම
        if (!downloadUrl || typeof downloadUrl === "object") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *API Error:* සේවාදායකයෙන් බාගත කිරීමේ ලින්ක් එක ලබා දීමට අපොහොසත් විය. පසුව උත්සාහ කරන්න.");
        }

        const cleanFileName = mediaTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 50) + `.mp3`;

        // 3. සින්දුව සෘජුවම MP3 Audio එකක් ලෙස WhatsApp වෙත යැවීම
        await sendMsg(`✨ *👑 𝙓-𝘽𝙊𝙏-𝙈𝘿 𝙎𝙊𝙉𝙂 👑* ✨\n\n📌 *Title:* ${mediaTitle}\n\n🚀 _Uploading to WhatsApp..._`);

        await client.sendMessage(
            m.jid,
            {
                audio: { url: downloadUrl },
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: cleanFileName
            },
            { quoted: m }
        );

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (globalError) {
        console.error("[X-BOT-MD SONG] CRITICAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Song Downloader Error:* ${globalError.message}`);
    }
});

