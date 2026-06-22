const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const config = require("../config");

global.modapk_sessions = global.modapk_sessions || {};

Sparky({
    name: "modapk",
    alias: ["apkmod", "hackapk"],
    category: "download",
    fromMe: isPublic,
    desc: "ඕනෑම ඇන්ඩ්‍රොයිඩ් ක්‍රීඩාවක හෝ ඇප් එකක Mod APK සංස්කරණ සොයා ගැනීම සහ බාගත කිරීම"
}, async ({ client, m, args }) => {
    try {
        const botName = config.BOT_INFO?.split(";")[0] || "X-KADIYA-MD";
        const prefix = m.prefix || ".";
        const apiKey = 'zan_w8lSd1pK_t79f2pa52p';
        
        let inputQuery = "";
        if (args) {
            inputQuery = Array.isArray(args) ? args.join(" ").trim() : args.toString().trim();
        }
        if (!inputQuery && m.quoted && m.quoted.text) inputQuery = m.quoted.text.trim();

        // -------------------------------------------------------------
        // APK එක බාගත කරගන්නා කොටස (.modapk file <number>)
        // -------------------------------------------------------------
        if (inputQuery.toLowerCase().startsWith("file")) {
            const numIndex = parseInt(inputQuery.replace(/file/i, "").trim()) - 1;
            const session = global.modapk_sessions[m.sender];

            if (!session || !session.links || !session.links[numIndex]) {
                await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
                return await m.reply("❌ කරුණාකර ප්‍රථමයෙන් ඇප් එකක් සර්ච් කර ලබාගත් ලැයිස්තුවේ ඇති වලංගු අංකයක් ලබාදෙන්න.");
            }

            const selectedApp = session.links[numIndex];
            const targetUrl = selectedApp.link || selectedApp.url || selectedApp.download_link;

            if (!targetUrl) {
                await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
                return await m.reply("❌ මෙම ඇප් එක සඳහා බාගත කිරීමේ මූලාශ්‍ර ලින්ක් එකක් සොයාගත නොහැකි විය.");
            }

            const downloadApiUrl = `https://api.zanta-mini.store/api/modapk/dl?apiKey=${apiKey}&url=${encodeURIComponent(targetUrl)}`;

            await client.sendMessage(m.jid, { react: { text: "📥", key: m.key } });
            await m.reply(`⏳ *ඔබ තෝරාගත් "${selectedApp.title || 'App'}" (Large File) APK එක සර්වර් එක හරහා සෘජුවම WhatsApp වෙත Stream වෙමින් පවතී. කරුණාකර රැඳී සිටින්න...*`);

            try {
                // [FIX] - RAM එක පිරීම වැලැක්වීමට arraybuffer වෙනුවට stream එකක් ලෙස දත්ත ලබාගැනීම
                const responseStream = await axios({
                    method: 'get',
                    url: downloadApiUrl,
                    responseType: 'stream', // Stream එකක් ලෙස දත්ත ලබාගන්නවා
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                // කෙලින්ම Stream එක WhatsApp document එකට Pass කිරීම (No RAM issues, No 0.3KB bugs)
                await client.sendMessage(m.jid, {
                    document: responseStream.data, 
                    mimetype: 'application/vnd.android.package-archive',
                    fileName: `${(selectedApp.title || "ModApp").replace(/[^a-zA-Z0-9]/g, "_")}_X_KADIYA.apk`,
                    caption: `📦 *${selectedApp.title || 'Mod App'}* Mod APK\n\n> Powered by ${botName}`
                }, { quoted: m });
                
                await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });
                return;
            } catch (dlErr) {
                console.error("APK Stream upload error:", dlErr.message);
                await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
                return await m.reply(`❌ *WhatsApp හරහා ෆයිල් එක එවීමට නොහැකි විය!* (මෙය සර්වර් එකෙහි ඇති බාධාවක් විය හැක).\n\n🔗 *නමුත් ඔබට මෙම ලින්ක් එකෙන් කෙලින්ම බාගත කරගත හැක:*\n${downloadApiUrl}`);
            }
        }

        // -------------------------------------------------------------
        // ප්‍රධාන සර්ච් ක්‍රියාවලිය (Main Search Logic)
        // -------------------------------------------------------------
        if (!inputQuery) {
            await client.sendMessage(m.jid, { react: { text: "⚠️", key: m.key } });
            return await m.reply(`*⚠️ කරුණාකර ඇප් එකේ හෝ ගේම් එකේ නම ලබාදෙන්න!*\n\n*භාවිතය:* \n${prefix}modapk Hill Climb Racing`);
        }

        await client.sendMessage(m.jid, { react: { text: "🔍", key: m.key } });
        await m.reply(`🔍 *"${inputQuery}" සඳහා Mod APK සංස්කරණ සොයමින් පවතිනවා...*`);

        const apiUrl = `https://api.zanta-mini.store/api/modapk/search?apiKey=${apiKey}&url=${encodeURIComponent(inputQuery)}`;

        const response = await axios.get(apiUrl);
        const resData = response.data;

        let results = [];
        if (Array.isArray(resData)) {
            results = resData;
        } else if (resData && Array.isArray(resData.results)) {
            results = resData.results;
        } else if (resData && resData.result && Array.isArray(resData.result)) {
            results = resData.result;
        }

        if (results.length === 0) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply(`❌ *කණගාටුයි, එම නමින් කිසිදු Mod APK එකක් සොයාගැනීමට නොහැකි විය.*`);
        }

        global.modapk_sessions[m.sender] = {
            query: inputQuery,
            links: results
        };

        let apkText = "";
        const maxResults = Math.min(results.length, 5);

        for (let i = 0; i < maxResults; i++) {
            const apk = results[i];
            apkText += `📍 *${i + 1}. ${apk.title || apk.name || "Unknown App"}*\n`;
            if (apk.size) apkText += `ℹ️ *Size:* ${apk.size} | `;
            if (apk.version) apkText += `📌 *Version:* ${apk.version}\n`;
            apkText += `📥 *Download Command:* \`\`\`${prefix}modapk file ${i + 1}\`\`\`\n\n`;
        }

        const status = `
╭───────────────◉
│ *🤖 MOD APK DOWNLOADER*
├───────────────◉
│✨ *Search:* ${inputQuery.toUpperCase()}
│📥 *Status:* Premium Mod Links Found!
╰────────────────◉

*📥 AVAILABLE MOD LIST:*
${apkText}
> ${botName} WhatsApp Bot

*💡 බාගත කරගන්නේ කෙසේද?*
ඉහත ලැයිස්තුවේ ඔබට අවශ්‍ය ඇප් එකට යටින් ඇති \`📥 Download Command\` එක (උදා: \`${prefix}modapk file 1\`) ක්ලික් කර Copy කරගෙන චැට් එකට යවන්න (Send කරන්න).

• _*ඔබගේ සේවාව සදහා X KADIYA MD සැමවිටම සූදානම්.❤️‍🩹*_
`;

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });
        await m.reply(status);

    } catch (err) {
        console.error("❌ ModAPK Error:", err);
        try { await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } }); } catch {}
        await m.reply("❌ *Mod APK සෙවීමේදී දෝෂයක් ඇතිවිය:* " + err.message);
    }
});

