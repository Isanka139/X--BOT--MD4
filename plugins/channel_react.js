const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "WhatsApp Channels සඳහා ප්‍රතිචාර දැක්වීම.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        if (!text || text.trim() === "") {
            return await m.reply(`ℹ️ *Pro Channel React පද්ධතිය* ℹ️\n\n` +
                `*භාවිතය:* .creact [චැනල් ලින්ක් එක] [ඉමෝජිය]\n` +
                `*උදාහරණ:* .creact https://whatsapp.com/channel/0029Vb69K9665yDEFt3DRR0D 🔥`);
        }

        let parts = text.trim().split(/\s+/);
        let channelLink = parts[0];
        let emoji = parts[1] || '❤️';

        if (!channelLink.includes('whatsapp.com/channel/')) {
            return await m.reply('❌ කරුණාකර වලංගු WhatsApp Channel සබැඳියක් ඇතුළත් කරන්න.');
        }

        await m.reply('🔄 නාලිකා දත්ත පරීක්ෂා කරමින් පවතිනවා...');

        // ලින්ක් එකෙන් invite කේතය වෙන් කර ගැනීම
        let inviteCode = channelLink.split('channel/')[1].split('/')[0];

        // 1. චැනල් එකේ අනන්‍යතාවය (JID) ලබා ගැනීම
        let queryResult = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) {
            return await m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය. පුද්ගලික හෝ වැරදි සබැඳියක් විය හැක.');
        }
        
        let channelJid = queryResult.id;

        // 2. චැනල් එකේ තියෙන අලුත්ම පෝස්ට් එක බොටාගේ මැසේජ් ලිස්ට් එකට ලෝඩ් කර ගැනීම
        let messages = await client.fetchMessagesFromNewsletter({ jid: channelJid, count: 1 }).catch(() => null);
        if (!messages || messages.length === 0) {
            return await m.reply('❌ මෙම නාලිකාව තුළ කිසිදු පණිවිඩයක් සොයා ගැනීමට නොහැකි විය.');
        }

        let targetMessage = messages[0];
        let messageId = targetMessage.id;

        // 3. 🛡️ ක්‍රෑෂ් ප්‍රෝටෙක්ෂන් රියැක්ෂන් ක්‍රමවේද 3ම එකවර ක්‍රියාත්මක කිරීම
        let reacted = false;

        // ක්‍රමය A
        try {
            await client.sendMessage(channelJid, {
                react: {
                    text: emoji,
                    key: { remoteJid: channelJid, id: messageId, fromMe: false }
                }
            });
            reacted = true;
        } catch (e) {}

        // ක්‍රමය B (Fallback)
        if (!reacted) {
            try {
                await client.relayMessage(channelJid, {
                    reactionMessage: {
                        text: emoji,
                        messageId: messageId,
                        key: { remoteJid: channelJid, fromMe: false, id: messageId }
                    }
                }, { messageId: client.generateMessageID() });
                reacted = true;
            } catch (e) {}
        }

        // ක්‍රමය C (Direct JID Injection)
        if (!reacted) {
            try {
                await client.sendMessage(m.jid, {
                    react: {
                        text: emoji,
                        key: targetMessage.key
                    }
                });
                reacted = true;
            } catch (e) {}
        }

        if (reacted) {
            return await m.reply(`✅ *ප්‍රතිචාරය සාර්ථකව යවන ලදී!*\n\n• නාලිකාව: ${queryResult.name}\n• ඉමෝජිය: ${emoji}`);
        } else {
            return await m.reply(`❌ බොට් සර්වර් එක මඟින් ප්‍රතිචාර දැක්වීම ප්‍රතික්ෂේප කළා. (ඔබේ වට්සැප් ගිණුමට මෙම චැනල් එකේ රියැක්ට් කිරීමට අවසර නැති විය හැක)`);
        }

    } catch (globalError) {
        return await m.reply(`❌ දෝෂයක් සිදු විය: ${globalError.message}`);
    }
});
