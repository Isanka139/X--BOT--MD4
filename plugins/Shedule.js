const { Sparky, isPublic } = require("../lib");
const cron = require("node-cron");

// Schedule කරපු මැසේජ් මතක තබා ගැනීමට
global.scheduledJobs = global.scheduledJobs || {};

Sparky({
    name: "time",
    alias: ["schedule", "sched", "sm"],
    category: "utility",
    fromMe: isPublic,
    desc: "Automated Message Scheduling System (Stable Fast Mode)"
}, async ({ client, m, args }) => {

    const quoted = m.quoted;
    const imageUrl = "https://files.catbox.moe/8gd2kj.jpg";

    const argsArray = Array.isArray(args) ? args : (args ? args.split(" ") : []);

    if (argsArray.length === 0) {
        const menuText = `
⏰ *Fast Message Schedule Menu*

*⚡ ඉක්මන් ක්‍රමය (Fast Format):*
.time [YYYY.MM.DD] [HH:MM] [නම්බර්/current] [පණිවිඩය]

_Examples:_
→ වෙනත් අංකයකට/ගෘෘප් එකකට යවන්න:
.time 2026.06.09 18:30 94763353368 Hi check this

→ දැනට ඉන්න Chat එකට යවන්න:
.time 2026.06.09 18:30 current Hi all

*📋 ලැයිස්තුව බැලීමට:*
.time list

---
💡 *සැලකිය යුතුයි:* * දිනය සදහා තිත (.) ද වෙලාව සදහා (:) ද භාවිත කරන්න.
* වෙලාව පැය 24 ක්‍රමයට (24-Hour Format) ලබා දිය යුතුය.
* මැසේජ් එක ශ්‍රී ලංකාවේ වේලාවට (\`Asia/Colombo\`) ක්‍රියාත්මක වේ.

Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎
        `;

        return client.sendMessage(m.jid, {
            image: { url: imageUrl },
            caption: menuText
        }, { quoted: m });
    }

    if (argsArray[0] === "list") {
        const jobs = Object.keys(global.scheduledJobs).filter(key => key.startsWith(m.jid));
        if (jobs.length === 0) return m.reply("📅 දැනට මෙම Chat එක සඳහා කිසිදු පණිවිඩයක් Schedule කර නොමැත.");

        let listText = "📝 *Scheduled Messages List:*\n\n";
        jobs.forEach((jobId, index) => {
            listText += `${index + 1}. ID: \`${jobId.split("_")[1]}\` - Active 🟢\n`;
        });
        return m.reply(listText);
    }

    try {
        let cronTime;
        let targetJid = m.jid; 
        let textMessage = "";
        let displayTime = "";

        const externalAdReply = {
            title: "Automated Schedule System",
            body: "Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎",
            thumbnailUrl: imageUrl,
            sourceUrl: "https://whatsapp.com",
            mediaType: 1
        };

        if (argsArray.length < 3 && !quoted) {
            return m.reply("❌ වැරදි Format එකක්. උදා: `.time 2026.06.09 17:45 94763353368 ඔයාගේ මැසේජ් එක`");
        }

        const dateInput = argsArray[0]; 
        const timeInput = argsArray[1]; 
        const targetInput = argsArray[2]; 
        
        textMessage = argsArray.slice(3).join(" "); 

        const [year, month, day] = dateInput.split(".").map(Number);
        const [hour, minute] = timeInput.split(":").map(Number);

        if (!year || !month || !day || hour === undefined || minute === undefined) {
            return m.reply("❌ දිනය හෝ වෙලාව වලංගු නැත. (නිවැරදි ක්‍රමය: YYYY.MM.DD HH:MM)");
        }

        if (targetInput && targetInput.toLowerCase() !== "current") {
            let cleanNum = targetInput.replace(/\D/g, "");
            if (targetInput.endsWith("@g.us")) {
                targetJid = targetInput.trim();
            } else {
                targetJid = `${cleanNum}@s.whatsapp.net`;
            }
        }

        cronTime = `${minute} ${hour} ${day} ${month} *`;
        displayTime = `${dateInput} දින වෙලාව ${timeInput} ට`;

        if (!textMessage && !quoted) {
            return m.reply("❌ කරුණාකර යැවිය යුතු පණිවිඩය ඇතුළත් කරන්න හෝ පණිවිඩයක් Quote කරන්න.");
        }

        const jobId = `${m.jid}_${Date.now()}`;
        await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });

        global.scheduledJobs[jobId] = cron.schedule(cronTime, async () => {
            try {
                // මෙතනදී relayMessage වෙනුවට වඩාත් ස්ථාවර sendMessage ක්‍රමය භාවිත කර ඇත
                if (quoted) {
                    // Quoted message එකක් තිබේ නම් එය forward (copy) කිරීමක් සිදු කරයි
                    await client.sendMessage(targetJid, { forward: m.quoted.fakeObj }, { quoted: m.quoted.fakeObj });
                    
                    // අමතරව text එකක් තිබුනොත් එය වෙනම යවයි (Error නොවී පැහැදිලිව ලැබීමට)
                    if (textMessage) {
                        await client.sendMessage(targetJid, {
                            text: textMessage,
                            contextInfo: { externalAdReply }
                        });
                    }
                } else {
                    // සාමාන්‍ය Text මැසේජ් එකක් නම් කෙලින්ම යැවීම
                    await client.sendMessage(targetJid, {
                        text: textMessage,
                        contextInfo: { externalAdReply }
                    });
                }

                await client.sendMessage(m.jid, {
                    text: `✅ *Schedule Message Delivered!*\n\nඔබ විසින් *${displayTime}* ට සකසන ලද පණිවිඩය සාර්ථකව ලැබී ඇත.`
                });

            } catch (err) {
                console.error("Scheduling Execution Error:", err);
            } finally {
                if (global.scheduledJobs[jobId]) {
                    global.scheduledJobs[jobId].stop();
                    delete global.scheduledJobs[jobId];
                }
            }
        }, {
            scheduled: true,
            timezone: "Asia/Colombo"
        });

        const successText = `
╭━━━〔 SCHEDULE SUCCESS 〕━━━⬣
┃ ⏳ Time : ${displayTime}
┃ 📅 Target : ${targetJid.split("@")[0]}
┃ 👁️ Mode : Fast & Stable Mode
┃ 💎 Status : Armed & Ready
╰━━━━━━━━━━━━━━━━━━⬣

Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        return client.sendMessage(m.jid, {
            image: { url: imageUrl },
            caption: successText
        }, { quoted: m });

    } catch (e) {
        console.log(e);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ Error:\n${e.message}`);
    }
});

