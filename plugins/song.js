const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 Configuration
const API_TOKEN = "07CRv4";
// සටහන: බොහෝ WhiteShadow API වල ytdl/download endpoint එක පවතී. 
// මෙහිදී වඩාත්ම ස්ථාවර සහ වේගවත් පොදු බාගත කිරීමේ එන්ජිම සම්බන්ධ කර ඇත.
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
 * 🎵 Professional MP3 Downloader Plugin
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
        // Input text එක ලබා ගැනීම
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        if (!textInput) {
            return await sendMsg(`🎵 *X-BOT-MD SONG DOWNLOADER*\n\nකරුණාකර සින්දුවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න.\n\n💡 _උදා: .song master sir_`);
        }

        // Reaction: Searching 🔎
        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}

        const checkedUrl = extractYoutubeUrl(textInput);
        let youtubeUrl = null;
        let mediaTitle = "X-Bot Audio";

        // 1. RESOLVING INPUT (LINK OR BUILT-IN INTERNAL SEARCH)
        if (checkedUrl) {
            youtubeUrl = checkedUrl;
            await sendMsg("🔗 _YouTube ලින්ක් එක හඳුනාගත්තා. ක්‍රියාවලිය ආරම්භ කරමින්..._");
        } else {
            await sendMsg(`🔍 _Searching for_ *"${textInput}"* _on YouTube..._`);
            
            try {
                // කිසිම බාහිර API එකක් නැතුව බොට් ඇතුලෙන්ම සෙවීමට yt-search භාවිතය
                const yts = require("yt-search");
                const searchResult = await yts(textInput);
                
                if (searchResult && searchResult.videos.length > 0) {
                    const firstResult = searchResult.videos[0];
                    youtubeUrl = firstResult.url;
                    mediaTitle = firstResult.title || mediaTitle;
                }
            } catch (searchErr) {
                console.error("[X-BOT-MD SONG] Internal Search Error, trying backup:", searchErr.message);
                // Backup Search Method
                try {
                    const backupRes = await axios.get(`https://api.giftedtech.my.id/api/search/youtube?q=${encodeURIComponent(textInput)}`);
                    if (backupRes.data?.status === 200 && backupRes.data?.result?.[0]) {
                        youtubeUrl = backupRes.data.result[0].url;
                        mediaTitle = backupRes.data.result[0].title || mediaTitle;
                    }
                } catch (err) {
                    console.error("[X-BOT-MD SONG] All Search Methods Failed");
                }
            }
        }

        // ලින්ක් එකක් සොයා ගැනීමට නොහැකි වුවහොත්
        if (!youtubeUrl) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* සින්දුව සොයා ගැනීමට නොහැකි විය. කරුණාකර නම නිවැරදිව ටයිප් කරන්න.");
        }

        // 2. FETCHING DOWNLOAD LINK FROM WHITESHADOW API
        try { if (typeof m.react === "function") await m.react("📥"); } catch {}
        await sendMsg(`📥 _Downloading_ *"${mediaTitle}"* _via WhiteShadow Server..._`);

        const apiUrl = `${DOWNLOAD_API_URL}?url=${encodeURIComponent(youtubeUrl)}&apitoken=${API_TOKEN}`;
        const res = await axios.get(apiUrl, { timeout: 45000 });

        // JSON වල හැංගිලා එන downloadUrl එක නිවැරදිව වෙන් කර ගැනීම
        let rawData = res.data;
        let parsedData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        if (parsedData && typeof parsedData === "string") parsedData = JSON.parse(parsedData);

        // විවිධ API හැඩතල (Structures) වලට ගැලපෙන සේ Link එක සෙවීම
        let downloadUrl = parsedData?.result?.downloadUrl || parsedData?.downloadUrl || parsedData?.result?.url || parsedData?.url || parsedData?.result;
        
        if (parsedData?.result?.title) mediaTitle = parsedData.result.title;
        else if (parsedData?.title) mediaTitle = parsedData.title;

        if (!downloadUrl || typeof downloadUrl === "object") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *API Error:* සේවාදායකයෙන් බාගත කිරීමේ ලින්ක් එක ලබා දීමට අපොහොසත් විය.");
        }

        // ෆයිල් එකේ නම පිරිසිදු කිරීම
        const cleanFileName = mediaTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 50) + `.mp3`;

        // 3. SENDING THE MP3 FILE TO WHATSAPP
        await sendMsg(`✨ *👑 𝙓-𝘽𝙊𝙏-𝙈𝘿 𝙎𝙊𝙉𝙂 👑* ✨\n\n📌 *Title:* ${mediaTitle}\n💿 *Format:* MP3 Audio\n🚀 *Status:* Uploading to WhatsApp...`);

        await client.sendMessage(
            m.jid,
            {
                audio: { url: downloadUrl },
                mimetype: "audio/mpeg",
                ptt: false, // Voice note එකක් නොවී Audio File එකක් ලෙසම යාමට
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

