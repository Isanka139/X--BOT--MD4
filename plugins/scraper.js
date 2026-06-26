const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Web Scraper API & Token
const API_TOKEN = "07CRv4";
const SCRAPER_API_URL = "https://whiteshadow-x-api.onrender.com/api/tools/web-scraper";

/**
 * 🌐 වෙබ් අඩවි ලින්ක් එකක් නිවැරදිව වෙන්කර හඳුනාගන්නා ශ්‍රිතය
 */
function extractUrl(text) {
    const regex = /(https?:\/\/[^\s?#]+)/i;
    const match = String(text || "").match(regex);
    return match ? match[0].trim() : null;
}

/**
 * 🔍 වෙබ් අඩවි වල දත්ත සූරාගැනීම සිදුකරන ප්‍රධාන සිස්ටම් එක
 */
async function coreWebScraper({ m, client, args }) {
    // 🛡️ Fail-Safe Text Message Sender
    const sendMsg = async (text) => {
        try {
            if (typeof m.reply === "function") {
                await m.reply(text);
            } else {
                await client.sendMessage(m.jid, { text }, { quoted: m });
            }
        } catch (e) {
            console.error("[KADIYA-MD SCRAPER] Text reply failed:", e.message);
            try {
                await client.sendMessage(m.jid, { text });
            } catch (err) {
                console.error("[KADIYA-MD SCRAPER] Completely failed to send text:", err.message);
            }
        }
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        const targetUrl = extractUrl(textInput);

        if (!targetUrl) {
            return await sendMsg("🌐 *කරුණාකර වලංගු වෙබ් අඩවි ලින්ක් (URL) එකක් ලබා දෙන්න.*\n\n💡 උදා: `.scraper https://tokcomment.com` හෝ `.webscrape <link>`");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`🔍 _Scraping metadata from:_ \n*${targetUrl}* \n\n_Please wait..._`);
        console.log("[KADIYA-MD SCRAPER] Triggering API for URL:", targetUrl);

        let scraperData = null;

        try {
            const response = await axios.get(`${SCRAPER_API_URL}?url=${encodeURIComponent(targetUrl)}&apitoken=${API_TOKEN}`, { timeout: 30000 });
            
            let resData = response.data;
            while (typeof resData === "string") {
                resData = JSON.parse(resData);
            }

            // WhiteShadow API වල සාමාන්‍යයෙන් result හෝ data ලෙස ප්‍රතිඵල ලැබේ
            scraperData = resData.result || resData.data || resData;
        } catch (apiErr) {
            console.error("[KADIYA-MD SCRAPER] API Request Error:", apiErr.message);
        }

        if (!scraperData || typeof scraperData !== "object") {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* එම වෙබ් අඩවියේ දත්ත සූරා ගැනීමට (Scrape) අපොහොසත් විය. ලින්ක් එක නිවැරදිදැයි නැවත පරීක්ෂා කරන්න.");
        }

        // 📝 ලැබුණු දත්ත ලස්සනට සකස් කිරීම
        const title = scraperData.title || "නොදනී";
        const description = scraperData.description || "විස්තරයක් ලබා දී නොමැත.";
        const keywords = scraperData.keywords || "ලබා දී නොමැත.";
        const ogTitle = scraperData.ogTitle || scraperData.og_title || "නොදනී";
        const ogDesc = scraperData.ogDescription || scraperData.og_description || "ලබා දී නොමැත.";
        const siteImage = scraperData.image || scraperData.ogImage || scraperData.og_image || "";

        let responseMessage = `✨ *_👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥_ Web Scraper* ✨\n\n`;
        responseMessage += `🔗 *Target URL:* ${targetUrl}\n\n`;
        responseMessage += `📌 *Title:* ${title}\n\n`;
        responseMessage += `📝 *Description:* ${description}\n\n`;
        responseMessage += `🔑 *Keywords:* ${keywords}\n\n`;
        responseMessage += `🌐 *OpenGraph Title:* ${ogTitle}\n`;
        responseMessage += `📄 *OpenGraph Desc:* ${ogDesc}\n\n`;
        responseMessage += `🚀 _Scraped via ~*👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥*~_`;

        try { if (typeof m.react === "function") await m.react("📥"); } catch {}

        // 🖼️ වෙබ් අඩවියේ ප්‍රධාන Image එකක් (Thumbnail) ඇත්නම් එය සමඟ මැසේජ් එක යැවීම
        if (siteImage && siteImage.startsWith("http")) {
            await client.sendMessage(
                m.jid,
                {
                    image: { url: siteImage },
                    caption: responseMessage
                },
                { quoted: m }
            );
        } else {
            // Image එකක් නොමැති නම් සාමාන්‍ย Text එකක් ලෙස යැවීම
            await sendMsg(responseMessage);
        }

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (globalError) {
        console.error("[KADIYA-MD SCRAPER] CRITICAL GLOBAL ERROR:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Kadiya-MD Scraper Internal Error:* ${globalError.message}`);
    }
}

// 🎧 Commands ලියාපදිංචි කිරීම (ඔයාගේ ක්‍රමයටම තුනම වැඩ කරයි)


Sparky({
    name: "webscrape",
    fromMe: isPublic,
    category: "tools",
    desc: "Extract meta-tags, descriptions, and thumbnails from any website link."
}, coreWebScraper);
