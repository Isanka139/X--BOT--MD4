const { Sparky, isPublic } = require("../lib");

Sparky({
    name: "fwd",
    alias: ["forward", "fv", "sf"],
    category: "utility",
    fromMe: isPublic,
    desc: "Advanced Forward System"
}, async ({ client, m, args }) => {

    const quoted = m.quoted;

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
        `);
    }

    try {

        let mode = "normal";
        let targetInput;
        let caption = "";

        if (args[0] === "doc" || args[0] === "cc") {
            mode = args[0];
            targetInput = args[1];
            caption = args.slice(2).join(" ");
        } else {
            targetInput = args[0];
            caption = args.slice(1).join(" ");
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

        await client.sendMessage(
            m.jid,
            {
                react: {
                    text: "📤",
                    key: m.key
                }
            }
        );

        let success = 0;

        for (const jid of targets) {

            if (mode === "doc") {

                const buffer = await quoted.download();

                await client.sendMessage(jid, {
                    document: buffer,
                    mimetype:
                        quoted.mimetype ||
                        "application/octet-stream",
                    fileName:
                        quoted.fileName ||
                        `file_${Date.now()}`
                });

                success++;
                continue;
            }

            if (
                mode === "cc" &&
                caption &&
                quoted.message
            ) {

                const msgType =
                    Object.keys(quoted.message)[0];

                const copied = JSON.parse(
                    JSON.stringify(quoted)
                );

                if (
                    copied.message[msgType]
                ) {

                    copied.message[msgType].caption =
                        caption;

                    await client.copyNForward(
                        jid,
                        copied,
                        true,
                        {
                            readViewOnce: true
                        }
                    );

                    success++;
                    continue;
                }
            }

            await client.copyNForward(
                jid,
                quoted,
                true,
                {
                    readViewOnce: true
                }
            );

            success++;
        }

        await client.sendMessage(
            m.jid,
            {
                react: {
                    text: "✅",
                    key: m.key
                }
            }
        );

        return m.reply(`
╭━━━〔 FORWARD SUCCESS 〕━━━⬣
┃ 📤 Sent : ${success}
┃ 🚀 Mode : ${mode.toUpperCase()}
┃ 👁️ ViewOnce : Bypassed
┃ 💎 Quality : Original
╰━━━━━━━━━━━━━━━━━━⬣
        `);

    } catch (e) {

        console.log(e);

        await client.sendMessage(
            m.jid,
            {
                react: {
                    text: "❌",
                    key: m.key
                }
            }
        );

        return m.reply(
            `❌ Error:\n${e.message}`
        );
    }
});
