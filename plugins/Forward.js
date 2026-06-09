const { Sparky, isPublic } = require("../lib");

Sparky({
    name: "fwd",
    alias: ["forward", "fv", "sf"],
    category: "utility",
    fromMe: isPublic,
    desc: "Advanced Forward System"
}, async ({ client, m, args }) => {

    const quoted = m.quoted;
    const imageUrl = "https://files.catbox.moe/8gd2kj.jpg";

    if (!quoted) {
        return m.reply(`
📤 *Forward Menu*

.fwd
→ Save to yourself

.fwd 9477xxxxxxx
→ Forward to number

.fwd 1203@g.us
→ Forward to group

.fwd doc 9477xxxxxxx
→ Send as document

.fwd cc 9477xxxxxxx New Caption
→ Forward with new caption

.fwd 9477xxxxxxx,9478xxxxxxx
→ Multi Forward

---

💡 *මෙම ප්ලගිනයෙන් (Plugin) ඔබට ලැබෙන ප්‍රයෝජන:*

* 👁️ **ViewOnce Bypass:** "එක් වරක් පමණක් බැලිය හැකි" (View Once) ලෙස එවා ඇති ඡායාරූප හෝ වීඩියෝ සාමාන්‍ය ආකාරයෙන් ඕනෑම අයෙකුට Forward කිරීමට මෙයින් හැකියාව ලැබේ.
* 🚀 **Multi Forwarding:** කොමා ( , ) ලකුණ මඟින් වෙන් කර එකවර දුරකථන අංක හෝ ගෘෘප් කිහිපයකට පණිවිඩ යැවිය හැක.
* 📁 **Media to Document:** ඕනෑම Photo එකක් හෝ Video එකක් Quality එක අඩු නොවී Document (.doc) එකක් ලෙස Forward කළ හැක.
* ✍️ **Custom Caption:** මුල් පණිවිඩයේ ඇති Caption එක වෙනස් කර ඔබ කැමති අලුත් Caption එකක් සමඟ Forward කිරීමට හැකියාව ඇත.

Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎
        `);
    }

    try {
        let mode = "normal";
        let targetInput;
        let caption = "";

        // args එක String එකක් නම් Array එකක් බවට පත් කරගැනීම
        const argsArray = Array.isArray(args) ? args : (args ? args.split(" ") : []);

        if (argsArray[0] === "doc" || argsArray[0] === "cc") {
            mode = argsArray[0];
            targetInput = argsArray[1];
            caption = argsArray.slice(2).join(" ");
        } else {
            targetInput = argsArray[0];
            caption = argsArray.slice(1).join(" ");
        }

        if (!targetInput)
            targetInput = m.sender.split("@")[0];

        const targets = targetInput
            .split(",")
            .map(x => x.trim())
            .filter(Boolean)
            .map(x => {
                if (x.endsWith("@g.us")) return x;
                x = x.replace(/\D/g, "");
                return `${x}@s.whatsapp.net`;
            });

        if (targets.length === 0) {
            return m.reply("❌ වලංගු දුරකථන අංකයක් හෝ Group ID එකක් ඇතුළත් කරන්න.");
        }

        await client.sendMessage(m.jid, { react: { text: "📤", key: m.key } });

        let success = 0;

        for (const jid of targets) {

            // --- 1. DOCUMENT MODE (.fwd doc) ---
            if (mode === "doc") {
                if (!quoted.download) {
                    await m.reply("❌ මෙය මාධ්‍ය (Media) ගොනුවක් නොවේ. Document ලෙස යැවිය නොහැක.");
                    continue;
                }

                const buffer = await quoted.download();
                await client.sendMessage(jid, {
                    document: buffer,
                    mimetype: quoted.mimetype || "application/octet-stream",
                    fileName: quoted.fileName || `file_${Date.now()}`,
                    contextInfo: {
                        externalAdReply: {
                            title: "Advanced Forward System",
                            body: "Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎",
                            thumbnailUrl: imageUrl,
                            sourceUrl: "https://whatsapp.com",
                            mediaType: 1
                        }
                    }
                });

                success++;
                continue;
            }

            // --- 2. CAPTION CHANGE MODE (.fwd cc) ---
            if (mode === "cc" && caption && quoted.message) {
                const msgType = Object.keys(quoted.message)[0];
                const copied = JSON.parse(JSON.stringify(quoted.message));

                if (copied[msgType]) {
                    if (copied[msgType].caption !== undefined || msgType === "imageMessage" || msgType === "videoMessage") {
                        copied[msgType].caption = caption;
                    }
                    
                    if (copied[msgType].viewOnce) {
                        copied[msgType].viewOnce = false;
                    }

                    // ContextInfo එකතු කිරීම
                    copied[msgType].contextInfo = {
                        ...copied[msgType].contextInfo,
                        externalAdReply: {
                            title: "Advanced Forward System",
                            body: "Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎",
                            thumbnailUrl: imageUrl,
                            sourceUrl: "https://whatsapp.com",
                            mediaType: 1
                        }
                    };

                    await client.sendMessage(jid, { forward: { key: m.quoted.key, message: copied } });
                    success++;
                    continue;
                }
            }

