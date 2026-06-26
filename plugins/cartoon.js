const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// 🌐 WhiteShadow Cartoon API Configurations
const API_TOKEN = "07CRv4";
const CARTOON_API_BASE = "https://whiteshadow-x-api.onrender.com/api/movie/sinhalacartoo-lk";

// 🧠 User Session Tracker
global.cartoonSession = global.cartoonSession || {};

/**
 * 🛠️ 200% SAFE JSON PARSER
 * API එකෙන් මොන ව්‍යුහයකින් දත්ත ආවත් ඒක පිරිසිදු Object එකක් බවට පත් කරයි.
 */
function safeParseJson(data) {
    let parsed = data;
    while (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch (e) {
            break;
        }
    }
    return parsed;
}

/**
 * 📥 ULTRA STABLE VIDEO DOWNLOADER & STREAMER
 */
async function handleCartoonDownload(m, client, selectedIndex) {
    const session = global.cartoonSession[m.sender];
    const index = selectedIndex - 1;

    if (index < 0 || index >= session.results.length) {
        return await client.sendMessage(m.jid, { text: "❌ *Invalid Number:* කරුණාකර ලැයිස්තුවේ ඇති නිවැරදි අංකයක් ලබා දෙන්න." }, { quoted: m });
    }

    const selectedCartoon = session.results[index];
    delete global.cartoonSession[m.sender]; // Session Clear

    try { if (typeof m.react === "function") await m.react("📥"); } catch {}
    
    const statusMsg = await client.sendMessage(m.jid, { 
        text: `📥 *"${selectedCartoon.title}"*\n\n_සර්වර් එකෙන් ලින්ක් එක ලබා ගනිමින් පවතී. කරුණාකර රැඳී සිටින්න..._` 
    }, { quoted: m });

    try {
        // 1. API Request එක සඳහා ඉහළ Timeout එකක් (තත්පර 90ක්) ලබා දීම
        const dlResponse = await axios.get(`${CARTOON_API_BASE}?type=download&url=${encodeURIComponent(selectedCartoon.link || selectedCartoon.url)}&apitoken=${API_TOKEN}`, { timeout: 90000 });
        
        const dlData = safeParseJson(dlResponse.data);
        
        // 2. සර්වර් එකෙන් එන්න පුළුවන් හැම Key එකක්ම Check කිරීම (Multi-Key Extractor)
        let resObj = dlData?.result || dlData?.data || dlData;
        let downloadUrl = resObj?.download_url || resObj?.downloadUrl || resObj?.url || resObj?.link;

        // සැබෑ ලින්ක් එකක්දැයි තහවුරු කර ගැනීම
        if (!downloadUrl || typeof downloadUrl !== "string" || !downloadUrl.startsWith("http")) {
            throw new Error("නියමිත බාගත කිරීමේ ලින්ක් එකක් සේවාදායකයෙන් හමු නොවීය.");
        }

        // 3. වීඩියෝව සෘජුවම යැවීමට පෙර, status එක අප්ඩේට් කිරීම
        try {
            await client.sendMessage(m.jid, { text: "🚀 _වීඩියෝ දත්ත සාර්ථකව ලැබුණා! දැන් WhatsApp වෙත අප්ලෝඩ් වෙමින් පවතී..._" }, { quoted: statusMsg });
        } catch {}

        const cleanFileName = selectedCartoon.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 50) + ".mp4";

        // 4. STABLE BUFFER METHOD (සෘජු URL එක WhatsApp එකට දීමේදී සිදුවන බිඳවැටීම් 100% වළකයි)
        const videoBufferStream = await axios({
            method: 'get',
            url: downloadUrl.trim(),
            responseType: 'stream',
            timeout: 120000 // ලොකු ෆයිල් වලට සරිලන සේ තත්පර 120ක් දීම
        });

        // 🎬 වීඩියෝව සාර්ථකව WhatsApp වෙත මුදා හැරීම
        await client.sendMessage(
            m.jid,
            {
                video: videoBufferStream.data, // Stream දත්ත කෙලින්ම පාස් කිරීම
                mimetype: "video/mp4",
                caption: `✨ *👑 𝙓-𝘽𝙊𝙏-𝙈𝘿 𝘾𝘼𝙍𝙏𝙊𝙊𝙉 👑* ✨\n\n📌 *Title:* ${selectedCartoon.title}\n\n_Powered by Kadiya-X-MD_`,
                fileName: cleanFileName
            },
            { quoted: m }
        );

        try { if (typeof m.react === "function") await m.react("✅"); } catch {}

    } catch (dlErr) {
        console.error("[KADIYA-MD CARTOON CRITICAL DL ERROR]:", dlErr);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        
        // Error එක විස්තරාත්මකව යූසර්ට පෙන්වීම (Fixing the blind spot)
        await client.sendMessage(m.jid, { 
            text: `❌ *Kadiya-MD System Error:* බාගත කිරීම අසාර්ථක විය.\n💡 *හේතුව:* ${dlErr.message || "සේවාදායකයේ තදබදයක් හෝ ලින්ක් එක බිඳ වැටීමකි."}` 
        }, { quoted: m });
    }
}

/**
 * 🎨 1. ප්‍රධාන සෙවුම් කමාන්ඩ් එක (.cartoon <නම>)
 */
Sparky({
    name: "cartoon",
    fromMe: isPublic,
    category: "download",
    desc: "Search and download Sinhala dubbed cartoons."
}, async ({ m, client, args }) => {
    
    const sendMsg = async (text) => {
        try { await client.sendMessage(m.jid, { text }, { quoted: m }); } catch (e) {}
    };

    try {
        let textInput = Array.isArray(args) ? args.join(" ").trim() : String(args || "").trim();
        textInput = textInput || m.quoted?.text || "";

        // කමාන්ඩ් එක සමඟම අංකය දුන්නොත් ක්‍රියාත්මක වන කොටස
        if (textInput && !isNaN(textInput) && global.cartoonSession[m.sender]) {
            return await handleCartoonDownload(m, client, parseInt(textInput));
        }

        if (!textInput) {
            return await sendMsg("🎨 *X-BOT-MD CARTOON SYSTEM*\n\nකරුණාකර සෙවිය යුතු කාටූන් එකේ නම ලබා දෙන්න.\n\n💡 _උදා: .cartoon avatar_");
        }

        try { if (typeof m.react === "function") await m.react("🔎"); } catch {}
        await sendMsg(`🔍 _Searching sinhalacartoon.lk for: "${textInput}"..._`);

        const searchResponse = await axios.get(`${CARTOON_API_BASE}?type=search&q=${encodeURIComponent(textInput)}&apitoken=${API_TOKEN}`, { timeout: 20000 });
        
        const searchData = safeParseJson(searchResponse.data);
        let results = searchData?.result || searchData?.results || searchData?.data;

        if (!results || !Array.isArray(results) || results.length === 0) {
            try { if (typeof m.react === "function") await m.react("❌"); } catch {}
            return await sendMsg("❌ *Error:* ඔබ ඇතුළත් කළ නමට ගැලපෙන කිසිදු සිංහල කාටූන් එකක් හමු නොවීය.");
        }

        // ප්‍රතිඵල ලැයිස්තුව සකස් කිරීම
        let responseText = `✨ *_👑𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿🔥_ 𝘾𝘼𝙍𝙏𝙊𝙊𝙉 𝙎𝙀𝘼𝙍𝘾𝙃* ✨\n\n🔍 ප්‍රතිඵල *"${textInput}"* සඳහා:\n\n`;
        
        results.slice(0, 15).forEach((item, i) => {
            responseText += `${i + 1}. 📌 *${item.title}*\n`;
        });

        responseText += `\n💡 *බාගත කර ගැනීමට:* මෙම මැසේජ් එකට රිප්ලයි (Reply) කර අවශ්‍ය කාටූන් එකෙහි *අංකය පමණක්* යවන්න. (උදා: 1)`;

        global.cartoonSession[m.sender] = {
            results: results.slice(0, 15),
            time: Date.now()
        };

        await sendMsg(responseText);
        try { if (typeof m.react === "function") await m.react("👀"); } catch {}

    } catch (globalError) {
        console.error("[KADIYA-MD CARTOON GLOBAL ERROR]:", globalError);
        try { if (typeof m.react === "function") await m.react("❌"); } catch {}
        await sendMsg(`❌ *Internal Error:* ${globalError.message}`);
    }
});


/**
 * 🧠 2. Context Listener (අංකය පමණක් රිප්ලයි කළ විට ක්‍රියාත්මක වන කොටස)
 */
Sparky({
    on: "text", 
    fromMe: false
}, async ({ m, client }) => {
    try {
        if (!global.cartoonSession || !global.cartoonSession[m.sender]) return;

        const replyText = m.body ? m.body.trim() : "";
        if (!replyText || isNaN(replyText)) return;

        const selectedNumber = parseInt(replyText);
        
        // Session Valid Time: Minutes 5
        if (Date.now() - global.cartoonSession[m.sender].time > 300000) {
            delete global.cartoonSession[m.sender];
            return;
        }

        await handleCartoonDownload(m, client, selectedNumber);

    } catch (err) {
        console.error("[CARTOON LISTENER ERROR]:", err.message);
    }
});
